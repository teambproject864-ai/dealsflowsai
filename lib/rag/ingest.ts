import { db } from "@/lib/firebase-admin";
import { hfEmbed } from "@/lib/huggingface";
import { logVectorMetric } from "@/lib/vector-monitor";
import { v4 as uuidv4 } from "uuid";
import { chunkText } from "./chunking";
import { parseDocument } from "./parsers";
import { ragUpsertChunks, ragDeleteChunks } from "./vector";
import type { RagChunk, RagChunkMetadata, RagDocument } from "./types";

const DOCS_COLLECTION = "rag_documents";
const CHUNKS_COLLECTION = "rag_chunks";

function envNum(name: string, fallback: number) {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

async function audit(type: string, payload: Record<string, any>) {
  try {
    await db.collection("audit_logs").add({
      type,
      ...payload,
      createdAt: new Date().toISOString(),
      createdAtMs: Date.now(),
    });
  } catch (e) {
    console.error("audit_failed", e);
  }
}

async function withRetry<T>(fn: () => Promise<T>, attempts: number) {
  let lastErr: any = null;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const backoff = Math.min(8000, Math.round(500 * Math.pow(2, i)));
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw lastErr;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const idx = cursor;
      cursor += 1;
      results[idx] = await fn(items[idx], idx);
    }
  }

  const workers = Array.from({ length: Math.max(1, concurrency) }, () => worker());
  await Promise.all(workers);
  return results;
}

export async function ingestDocument(args: {
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
  source?: string;
}) {
  if (!db) throw new Error("firestore_unavailable");

  const docId = uuidv4();
  const nowIso = new Date().toISOString();
  const nowMs = Date.now();

  const doc: RagDocument = {
    id: docId,
    name: args.fileName || "Document",
    mimeType: args.mimeType || "application/octet-stream",
    sizeBytes: args.bytes.length,
    createdAt: nowIso,
    createdAtMs: nowMs,
    status: "processing",
    source: args.source || "upload",
  };

  const docRef = db.collection(DOCS_COLLECTION).doc(docId);
  await docRef.set(doc);

  await audit("rag_ingest_start", {
    docId,
    name: doc.name,
    mimeType: doc.mimeType,
    sizeBytes: doc.sizeBytes,
  });

  try {
    const parsed = await parseDocument({
      mimeType: doc.mimeType,
      fileName: doc.name,
      bytes: args.bytes,
    });

    const chunkChars = envNum("RAG_CHUNK_CHARS", 1200);
    const overlapChars = envNum("RAG_OVERLAP_CHARS", 200);

    const chunks = chunkText(parsed.text, { chunkChars, overlapChars });
    if (!chunks.length) throw new Error("empty_document");

    const chunkDocs: RagChunk[] = chunks.map((c, idx) => ({
      id: `${docId}:${idx}`,
      docId,
      chunkIndex: idx,
      text: c.text,
      charStart: c.charStart,
      charEnd: c.charEnd,
      createdAt: nowIso,
      createdAtMs: nowMs,
    }));

    const batchSize = 450;
    for (let i = 0; i < chunkDocs.length; i += batchSize) {
      const batch = db.batch();
      for (const ch of chunkDocs.slice(i, i + batchSize)) {
        batch.set(db.collection(CHUNKS_COLLECTION).doc(ch.id), ch);
      }
      await batch.commit();
    }

    const embedStart = Date.now();
    const embedConcurrency = envNum("RAG_EMBED_CONCURRENCY", 5);
    const records = await mapWithConcurrency(chunkDocs, embedConcurrency, async (ch) => {
      const values = await withRetry(() => hfEmbed(ch.text), 3);
      return {
        id: ch.id,
        values,
        metadata: {
          type: "rag_chunk",
          docId,
          docName: doc.name,
          mimeType: doc.mimeType,
          chunkIndex: ch.chunkIndex,
          textPreview: ch.text.slice(0, 2000),
          charStart: ch.charStart,
          charEnd: ch.charEnd,
          createdAt: nowIso,
        },
      } as { id: string; values: number[]; metadata: RagChunkMetadata };
    });

    logVectorMetric({
      operation: "rag_embed_all",
      duration: Date.now() - embedStart,
      success: true,
      metadata: { docId, chunks: chunkDocs.length },
    });

    const upsertStart = Date.now();
    const pineconeBatch = envNum("RAG_PINECONE_BATCH", 100);
    for (let i = 0; i < records.length; i += pineconeBatch) {
      const slice = records.slice(i, i + pineconeBatch);
      await withRetry(() => ragUpsertChunks({ records: slice }), 3);
    }
    logVectorMetric({
      operation: "rag_upsert",
      duration: Date.now() - upsertStart,
      success: true,
      metadata: { docId, chunks: chunkDocs.length },
    });

    await docRef.update({ status: "ready", chunkCount: chunkDocs.length });
    await audit("rag_ingest_success", { docId, chunkCount: chunkDocs.length, detectedType: parsed.detectedType });

    return { docId, chunkCount: chunkDocs.length };
  } catch (e: any) {
    const msg = e?.message || "ingest_failed";
    await docRef.update({ status: "failed", error: msg });
    await audit("rag_ingest_failed", { docId, error: msg });
    
    // Rollback: Clean up any written Firestore chunks and Pinecone vectors
    try {
      console.log(`[ingest.ts] Ingestion failed. Starting rollback for document ${docId}...`);
      
      const chunksSnapshot = await db.collection(CHUNKS_COLLECTION).where("docId", "==", docId).get();
      if (!chunksSnapshot.empty) {
        const batch = db.batch();
        const ids: string[] = [];
        chunksSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
          ids.push(doc.id);
        });
        await batch.commit();
        console.log(`[ingest.ts] Deleted ${ids.length} chunks from Firestore.`);
        
        if (ids.length > 0) {
          await ragDeleteChunks({ ids });
          console.log(`[ingest.ts] Deleted ${ids.length} vectors from Pinecone.`);
        }
      }
    } catch (cleanupErr: any) {
      console.error("[ingest.ts] Failed to clean up half-ingested RAG resources:", cleanupErr);
    }

    throw new Error(msg);
  }
}

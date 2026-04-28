import { db } from "@/lib/firebase-admin";
import { logVectorMetric } from "@/lib/vector-monitor";
import { ragQuery } from "./vector";
import type { RagSearchHit } from "./types";

const CHUNKS_COLLECTION = "rag_chunks";

export async function searchRag(args: {
  query: string;
  topK: number;
  minScore?: number;
  docIds?: string[];
  queryFn?: typeof ragQuery;
  fetchChunkText?: (chunkId: string) => Promise<string | null>;
}): Promise<RagSearchHit[]> {
  const start = Date.now();

  const queryFn = args.queryFn || ragQuery;
  const res = await queryFn({
    query: args.query,
    topK: args.topK,
    docIds: args.docIds,
  });

  const matches = (res.matches || []).filter((m: any) => {
    if (!args.minScore) return true;
    return typeof m.score === "number" && m.score >= args.minScore;
  });

  const fetchChunkText =
    args.fetchChunkText ||
    (async (chunkId: string) => {
      if (!db) return null;
      const chunkDoc = await db.collection(CHUNKS_COLLECTION).doc(chunkId).get();
      const ch = chunkDoc.exists ? (chunkDoc.data() as any) : null;
      return ch?.text ? String(ch.text) : null;
    });

  const docs = await Promise.all(
    matches.map(async (m: any) => {
      const meta = (m.metadata || {}) as any;
      const id = String(m.id || "");
      const text = await fetchChunkText(id);

      return {
        docId: String(meta.docId || ""),
        docName: String(meta.docName || "Document"),
        mimeType: String(meta.mimeType || "application/octet-stream"),
        chunkIndex: Number(meta.chunkIndex || 0),
        score: Number(m.score || 0),
        text: String(text || meta.textPreview || ""),
        charStart: Number(meta.charStart || 0),
        charEnd: Number(meta.charEnd || 0),
      } satisfies RagSearchHit;
    })
  );

  logVectorMetric({
    operation: "rag_search",
    duration: Date.now() - start,
    success: true,
    metadata: { topK: args.topK, returned: docs.length },
  });

  return docs;
}

import { getPineconeIndex } from "@/lib/pinecone";
import { hfEmbed } from "@/lib/huggingface";
import type { RagChunkMetadata } from "./types";

const DEFAULT_NAMESPACE = "rag";

export async function ragEmbed(text: string) {
  return hfEmbed(text);
}

export async function ragUpsertChunks(args: {
  namespace?: string;
  records: Array<{ id: string; values: number[]; metadata: RagChunkMetadata }>;
}) {
  const index = await getPineconeIndex();
  if (!index) throw new Error("pinecone_unavailable");
  const ns = args.namespace || DEFAULT_NAMESPACE;
  // @ts-ignore
  await index.namespace(ns).upsert({ records: args.records });
}

export async function ragQuery(args: {
  namespace?: string;
  query: string;
  topK: number;
  docIds?: string[];
}) {
  const index = await getPineconeIndex();
  if (!index) throw new Error("pinecone_unavailable");

  const ns = args.namespace || DEFAULT_NAMESPACE;
  const vector = await ragEmbed(args.query);

  const filter: any = { type: { $eq: "rag_chunk" } };
  if (args.docIds && args.docIds.length) {
    filter.docId = { $in: args.docIds };
  }

  // @ts-ignore
  const res = await index.namespace(ns).query({
    vector,
    topK: args.topK,
    includeMetadata: true,
    filter,
  });

  return res;
}


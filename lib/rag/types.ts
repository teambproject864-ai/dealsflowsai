export type RagDocument = {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  createdAtMs: number;
  status: "processing" | "ready" | "failed";
  error?: string;
  chunkCount?: number;
  source?: string;
};

export type RagChunk = {
  id: string;
  docId: string;
  chunkIndex: number;
  text: string;
  charStart: number;
  charEnd: number;
  createdAt: string;
  createdAtMs: number;
};

export type RagChunkMetadata = {
  type: "rag_chunk";
  docId: string;
  docName: string;
  mimeType: string;
  chunkIndex: number;
  textPreview: string;
  charStart: number;
  charEnd: number;
  createdAt: string;
};

export type RagSearchHit = {
  docId: string;
  docName: string;
  mimeType: string;
  chunkIndex: number;
  score: number;
  text: string;
  charStart: number;
  charEnd: number;
};

export type RagAnswer = {
  answer: string;
  sources: Array<{
    docId: string;
    docName: string;
    chunkIndex: number;
    score: number;
  }>;
};


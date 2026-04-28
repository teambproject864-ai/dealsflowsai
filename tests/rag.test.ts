import assert from "assert";
import { chunkText } from "@/lib/rag/chunking";
import { parseDocument } from "@/lib/rag/parsers";
import { searchRag } from "@/lib/rag/search";
import { answerWithRag } from "@/lib/rag/qa";
import { nvChatCompletionStream } from "@/lib/nvidia";

export async function testRagChunkingOverlap() {
  const text = Array.from({ length: 2000 }, (_, i) => String(i % 10)).join("");
  const chunks = chunkText(text, { chunkChars: 500, overlapChars: 100 });
  assert.ok(chunks.length >= 4);
  for (let i = 1; i < chunks.length; i += 1) {
    assert.ok(chunks[i].charStart < chunks[i - 1].charEnd);
  }
}

export async function testRagParseTxt() {
  const bytes = new TextEncoder().encode("Hello world\nSecond line");
  const parsed = await parseDocument({ mimeType: "text/plain", fileName: "a.txt", bytes });
  assert.equal(parsed.detectedType, "txt");
  assert.ok(parsed.text.includes("Hello world"));
}

export async function testRagSearchMappingWithStubs() {
  const hits = await searchRag({
    query: "pricing",
    topK: 3,
    queryFn: async () =>
      ({
        matches: [
          {
            id: "doc1:0",
            score: 0.9,
            metadata: {
              type: "rag_chunk",
              docId: "doc1",
              docName: "Doc 1",
              mimeType: "text/plain",
              chunkIndex: 0,
              textPreview: "Preview",
              charStart: 0,
              charEnd: 10,
              createdAt: new Date().toISOString(),
            },
          },
        ],
      } as any),
    fetchChunkText: async () => "Full chunk text",
  });

  assert.equal(hits.length, 1);
  assert.equal(hits[0].docId, "doc1");
  assert.equal(hits[0].chunkIndex, 0);
  assert.equal(hits[0].text, "Full chunk text");
}

export async function testRagAnswerUsesStubInfer() {
  const result = await answerWithRag({
    question: "What is the policy?",
    hits: [
      {
        docId: "d1",
        docName: "Policy",
        mimeType: "text/plain",
        chunkIndex: 2,
        score: 0.88,
        text: "The policy is X.",
        charStart: 0,
        charEnd: 10,
      },
    ],
    infer: async () => "Answer: X [d1:2]",
  });

  assert.ok(result.answer.includes("[d1:2]"));
  assert.equal(result.sources.length, 1);
  assert.equal(result.sources[0].docId, "d1");
}

export async function testRagAnswerUsesNvidiaProviderWithStubbedFetch() {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({
        choices: [{ message: { content: "Answer from NVIDIA [d1:2]" } }],
      }),
    } as any;
  }) as any;

  process.env.NVIDIA_API_KEY = "nvapi_test";

  const result = await answerWithRag({
    question: "What is the policy?",
    hits: [
      {
        docId: "d1",
        docName: "Policy",
        mimeType: "text/plain",
        chunkIndex: 2,
        score: 0.88,
        text: "The policy is X.",
        charStart: 0,
        charEnd: 10,
      },
    ],
    provider: "nvidia",
    model: "google/gemma-4-31b-it",
  });

  globalThis.fetch = originalFetch;

  assert.ok(result.answer.includes("NVIDIA"));
 }

export async function testNvidiaChatCompletionStreamParsesTokens() {
  const originalFetch = globalThis.fetch;

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(
        encoder.encode(
          `data: {"choices":[{"delta":{"content":"Hel"}}]}\n\n` +
            `data: {"choices":[{"delta":{"content":"lo"}}]}\n\n` +
            `data: [DONE]\n\n`
        )
      );
      controller.close();
    },
  });

  globalThis.fetch = (async () => {
    return { ok: true, status: 200, statusText: "OK", body } as any;
  }) as any;

  process.env.NVIDIA_API_KEY = "nvapi_test";

  const out: string[] = [];
  for await (const t of nvChatCompletionStream({
    model: "google/gemma-4-31b-it",
    messages: [{ role: "user", content: "hi" }],
  })) {
    out.push(t);
  }

  globalThis.fetch = originalFetch;

  assert.equal(out.join(""), "Hello");
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { searchRag, answerWithRag, answerWithRagStream } from "@/lib/rag";
import { TTLCache } from "@/lib/rag/cache";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  question: z.string().min(1),
  topK: z.number().int().min(1).max(20).default(8),
  minScore: z.number().min(0).max(1).optional(),
  docIds: z.array(z.string().min(1)).optional(),
  provider: z.enum(["huggingface", "nvidia"]).optional(),
  model: z.string().min(1).optional(),
  stream: z.boolean().optional(),
});

const answerCache = new TTLCache<any>(Number(process.env.RAG_CACHE_TTL_MS || 15000), 200);

export async function POST(req: Request) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;
  try {
    const raw = await req.json();
    const body = bodySchema.parse(raw);
    if (!body.stream) {
      const key = JSON.stringify(body);
      const cached = answerCache.get(key);
      if (cached) return NextResponse.json({ success: true, ...cached, cached: true });

      const hits = await searchRag({
        query: body.question,
        topK: body.topK,
        minScore: body.minScore,
        docIds: body.docIds,
      });

      const result = await answerWithRag({
        question: body.question,
        hits,
        provider: body.provider,
        model: body.model,
      });
      const payload = { answer: result.answer, sources: result.sources, hits };
      answerCache.set(key, payload);
      return NextResponse.json({ success: true, ...payload, cached: false });
    }

    const hits = await searchRag({
      query: body.question,
      topK: body.topK,
      minScore: body.minScore,
      docIds: body.docIds,
    });

    const sources = hits.map((h) => ({
      docId: h.docId,
      docName: h.docName,
      chunkIndex: h.chunkIndex,
      score: h.score,
    }));

    const encoder = new TextEncoder();
    const upstream = new AbortController();
    const onReqAbort = () => upstream.abort();
    if (req.signal.aborted) upstream.abort();
    req.signal.addEventListener("abort", onReqAbort, { once: true });

    const sse = new ReadableStream<Uint8Array>({
      start(controller) {
        const send = (event: string, data: any) => {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        };

        let answer = "";
        const ping = setInterval(() => {
          send("ping", { t: Date.now() });
        }, 15000);

        (async () => {
          try {
            send("start", { sources, hits });
            for await (const token of answerWithRagStream({
              question: body.question,
              hits,
              provider: body.provider,
              model: body.model,
              signal: upstream.signal,
            })) {
              answer += token;
              send("token", { token });
            }
            send("end", { answer: answer.trim(), sources });
          } catch (e: any) {
            send("error", { error: e?.message || "ask_stream_failed" });
          } finally {
            clearInterval(ping);
            req.signal.removeEventListener("abort", onReqAbort);
            controller.close();
          }
        })();
      },
      cancel() {
        upstream.abort();
      },
    });

    return new Response(sse, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500;
    return NextResponse.json({ success: false, error: e?.message || "ask_failed" }, { status });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { searchRag } from "@/lib/rag";
import { TTLCache } from "@/lib/rag/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  query: z.string().min(1),
  topK: z.number().int().min(1).max(20).default(8),
  minScore: z.number().min(0).max(1).optional(),
  docIds: z.array(z.string().min(1)).optional(),
});

const cache = new TTLCache<any>(Number(process.env.RAG_CACHE_TTL_MS || 15000), 200);

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const body = bodySchema.parse(raw);
    const key = JSON.stringify(body);
    const cached = cache.get(key);
    if (cached) return NextResponse.json({ success: true, hits: cached, cached: true });

    const hits = await searchRag(body);
    cache.set(key, hits);
    return NextResponse.json({ success: true, hits, cached: false });
  } catch (e: any) {
    const status = e?.name === "ZodError" ? 400 : 500;
    return NextResponse.json({ success: false, error: e?.message || "search_failed" }, { status });
  }
}


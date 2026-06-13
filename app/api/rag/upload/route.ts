import { NextResponse } from "next/server";
import { ingestDocument } from "@/lib/rag";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES_DEFAULT = 15 * 1024 * 1024;

function envNum(name: string, fallback: number) {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export async function POST(req: Request) {
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "Missing file" }, { status: 400 });
    }

    const maxBytes = envNum("RAG_MAX_UPLOAD_BYTES", MAX_BYTES_DEFAULT);
    if (file.size > maxBytes) {
      return NextResponse.json(
        { success: false, error: `File too large. Max ${maxBytes} bytes.` },
        { status: 413 }
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const fileName = String(form.get("name") || file.name || "Document");
    const mimeType = file.type || "application/octet-stream";

    const result = await ingestDocument({
      fileName,
      mimeType,
      bytes,
      source: "upload",
    });

    return NextResponse.json({ success: true, ...result });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "upload_failed" },
      { status: 500 }
    );
  }
}


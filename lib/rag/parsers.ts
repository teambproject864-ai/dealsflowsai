export type ParsedDocument = {
  text: string;
  detectedType: "pdf" | "docx" | "txt" | "unknown";
};

function decodeUtf8(bytes: Uint8Array) {
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

export async function parseDocument(args: {
  mimeType: string;
  fileName?: string;
  bytes: Uint8Array;
}): Promise<ParsedDocument> {
  const mime = (args.mimeType || "").toLowerCase();
  const name = (args.fileName || "").toLowerCase();

  const isPdf = mime.includes("pdf") || name.endsWith(".pdf");
  const isDocx =
    mime.includes("officedocument.wordprocessingml.document") || name.endsWith(".docx");
  const isTxt =
    mime.startsWith("text/") ||
    name.endsWith(".txt") ||
    name.endsWith(".md") ||
    name.endsWith(".csv");

  if (isPdf) {
    const mod = await import("pdf-parse");
    const pdfParse = (mod as any).default || (mod as any);
    const res = await pdfParse(Buffer.from(args.bytes));
    return { text: String(res?.text || "").trim(), detectedType: "pdf" };
  }

  if (isDocx) {
    const mod = await import("mammoth");
    const mammoth = (mod as any).default || (mod as any);
    const res = await mammoth.extractRawText({ buffer: Buffer.from(args.bytes) });
    return { text: String(res?.value || "").trim(), detectedType: "docx" };
  }

  if (isTxt) {
    return { text: decodeUtf8(args.bytes).trim(), detectedType: "txt" };
  }

  return { text: decodeUtf8(args.bytes).trim(), detectedType: "unknown" };
}


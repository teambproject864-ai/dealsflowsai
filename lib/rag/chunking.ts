type ChunkOptions = {
  chunkChars: number;
  overlapChars: number;
};

export type TextChunk = {
  text: string;
  charStart: number;
  charEnd: number;
};

function normalizeText(input: string) {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function chunkText(raw: string, opts: ChunkOptions): TextChunk[] {
  const text = normalizeText(raw);
  if (!text) return [];

  const chunkChars = clamp(Math.floor(opts.chunkChars), 200, 10000);
  const overlapChars = clamp(Math.floor(opts.overlapChars), 0, chunkChars - 1);

  const chunks: TextChunk[] = [];
  let cursor = 0;
  while (cursor < text.length) {
    const end = Math.min(text.length, cursor + chunkChars);
    let sliceEnd = end;

    if (end < text.length) {
      const window = text.slice(cursor, end);
      const lastBreak =
        Math.max(
          window.lastIndexOf("\n\n"),
          window.lastIndexOf("\n"),
          window.lastIndexOf(". "),
          window.lastIndexOf("? "),
          window.lastIndexOf("! ")
        );
      if (lastBreak > Math.floor(chunkChars * 0.5)) {
        sliceEnd = cursor + lastBreak + 1;
      }
    }

    const chunkText = text.slice(cursor, sliceEnd).trim();
    if (chunkText) {
      chunks.push({ text: chunkText, charStart: cursor, charEnd: sliceEnd });
    }

    if (sliceEnd >= text.length) break;
    cursor = Math.max(0, sliceEnd - overlapChars);
  }

  return chunks;
}


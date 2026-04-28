import { chunkText } from "@/lib/rag/chunking";

function ms(n: number) {
  return `${n.toFixed(1)}ms`;
}

async function main() {
  const big = Array.from({ length: 250_000 }, (_, i) => (i % 80 === 0 ? "\n" : "a")).join("");

  const t0 = performance.now();
  const chunks = chunkText(big, { chunkChars: 1200, overlapChars: 200 });
  const t1 = performance.now();

  const totalChars = chunks.reduce((acc, c) => acc + c.text.length, 0);
  const avg = totalChars / Math.max(1, chunks.length);

  process.stdout.write(`chunks=${chunks.length}\n`);
  process.stdout.write(`chunking_time=${ms(t1 - t0)}\n`);
  process.stdout.write(`avg_chunk_chars=${avg.toFixed(0)}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


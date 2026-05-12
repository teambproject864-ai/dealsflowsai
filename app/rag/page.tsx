"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MODEL_REGISTRY } from "@/lib/model-registry";

type RagSource = {
  docId: string;
  docName: string;
  chunkIndex: number;
  score: number;
};

type RagHit = {
  docId: string;
  docName: string;
  mimeType: string;
  chunkIndex: number;
  score: number;
  text: string;
  charStart: number;
  charEnd: number;
};

function parseSseBlock(block: string) {
  const lines = block.split("\n");
  let event = "message";
  const dataLines: string[] = [];
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("event:")) event = line.slice("event:".length).trim();
    if (line.startsWith("data:")) dataLines.push(line.slice("data:".length).trimStart());
  }
  return { event, data: dataLines.join("\n") };
}

export default function RagPage() {
  const [question, setQuestion] = useState("Summarize the key product capabilities.");
  const [provider, setProvider] = useState<"nvidia" | "huggingface">("nvidia");
  const [model, setModel] = useState(MODEL_REGISTRY.nvidia[0].id);
  const [topK, setTopK] = useState(6);

  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<RagSource[]>([]);
  const [hits, setHits] = useState<RagHit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  async function runAskStream() {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setAnswer("");
    setSources([]);
    setHits([]);
    setError(null);
    setIsStreaming(true);

    try {
      const res = await fetch("/api/rag/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          topK,
          provider,
          model: provider === "nvidia" ? model : undefined,
          stream: true,
        }),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || res.statusText || "ask_failed");
      }
      if (!res.body) throw new Error("stream_missing_body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) buf += decoder.decode(value, { stream: true });
        buf = buf.replace(/\r\n/g, "\n");

        while (true) {
          const sep = buf.indexOf("\n\n");
          if (sep === -1) break;
          const block = buf.slice(0, sep);
          buf = buf.slice(sep + 2);

          const { event, data } = parseSseBlock(block);
          if (!data) continue;

          let payload: any = null;
          try {
            payload = JSON.parse(data);
          } catch {
            payload = null;
          }

          if (event === "start") {
            setSources(Array.isArray(payload?.sources) ? payload.sources : []);
            setHits(Array.isArray(payload?.hits) ? payload.hits : []);
          } else if (event === "token") {
            const token = typeof payload?.token === "string" ? payload.token : "";
            if (token) setAnswer((prev) => prev + token);
          } else if (event === "end") {
            const final = typeof payload?.answer === "string" ? payload.answer : "";
            if (final) setAnswer(final);
          } else if (event === "error") {
            throw new Error(payload?.error || "ask_stream_failed");
          }
        }
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") setError(e?.message || "ask_stream_failed");
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">RAG Ask (Streaming)</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-white/10 bg-black/30 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Query</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Question</label>
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="min-h-[110px] bg-white/5 border-white/10"
                placeholder="Ask a question..."
                disabled={isStreaming}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-300">Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as any)}
                  className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white"
                  disabled={isStreaming}
                >
                  <option value="nvidia">nvidia</option>
                  <option value="huggingface">huggingface</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-300">Model (NVIDIA)</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white"
                  disabled={isStreaming || provider !== "nvidia"}
                >
                  {MODEL_REGISTRY.nvidia.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-300">TopK</label>
                <Input
                  type="number"
                  value={topK}
                  onChange={(e) => setTopK(Number(e.target.value || 6))}
                  className="bg-white/5 border-white/10"
                  min={1}
                  max={20}
                  disabled={isStreaming}
                />
              </div>
            </div>

            <Button
              onClick={runAskStream}
              disabled={isStreaming || !question.trim()}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              {isStreaming ? "Streaming..." : "Ask (stream)"}
            </Button>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/30 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Answer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="min-h-[160px] whitespace-pre-wrap rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-gray-200">
              {answer || (isStreaming ? "..." : "Ask a question to see the streamed response.")}
            </div>

            {sources.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-300">Sources</div>
                <div className="flex flex-wrap gap-2">
                  {sources.map((s) => (
                    <Badge key={`${s.docId}:${s.chunkIndex}`} variant="secondary" className="bg-white/10 text-gray-200">
                      {s.docName} [{s.docId}:{s.chunkIndex}] {s.score.toFixed(2)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {hits.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-300">Retrieved</div>
                <div className="space-y-2">
                  {hits.slice(0, 4).map((h) => (
                    <div
                      key={`${h.docId}:${h.chunkIndex}:${h.score}`}
                      className="rounded-lg border border-white/10 bg-white/5 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-medium text-white">
                          {h.docName} <span className="text-gray-400">[{h.docId}:{h.chunkIndex}]</span>
                        </div>
                        <div className="text-[11px] text-gray-400">{h.score.toFixed(3)}</div>
                      </div>
                      <div className="mt-2 line-clamp-4 text-xs text-gray-300 whitespace-pre-wrap">
                        {h.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type NvMessage = { role: "system" | "user" | "assistant"; content: string };

function envStr(name: string) {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : null;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function withRetry<T>(fn: () => Promise<T>, attempts: number) {
  let lastErr: any = null;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const backoff = Math.min(8000, Math.round(600 * Math.pow(2, i)));
      if (i < attempts - 1) await sleep(backoff);
    }
  }
  throw lastErr;
}

function mergeAbortSignals(signals: Array<AbortSignal | undefined>): AbortSignal | undefined {
  const active = signals.filter(Boolean) as AbortSignal[];
  if (!active.length) return undefined;
  if (active.length === 1) return active[0];

  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort();
  for (const s of active) {
    if (s.aborted) {
      ctrl.abort();
      break;
    }
    s.addEventListener("abort", onAbort, { once: true });
  }
  return ctrl.signal;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  signal?: AbortSignal
) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const merged = mergeAbortSignals([ctrl.signal, signal]);
    return await fetch(url, { ...init, signal: merged });
  } finally {
    clearTimeout(t);
  }
}

export async function nvChatCompletion(args: {
  model: string;
  messages: NvMessage[];
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
}): Promise<string> {
  const apiKey = envStr("NVIDIA_API_KEY");
  if (!apiKey) throw new Error("NVIDIA_API_KEY is missing");

  const url = "https://integrate.api.nvidia.com/v1/chat/completions";
  const timeoutMs = args.timeoutMs ?? 30000;

  const payload = {
    model: args.model,
    messages: args.messages,
    max_tokens: args.maxTokens ?? 1024,
    temperature: args.temperature ?? 0.2,
    top_p: args.topP ?? 0.95,
    stream: false,
  };

  return withRetry(async () => {
    const res = await fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      },
      timeoutMs,
      args.signal
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = (data as any)?.error?.message || (data as any)?.message || res.statusText;
      throw new Error(`nvidia_chat_failed:${res.status}:${msg}`);
    }

    const content = (data as any)?.choices?.[0]?.message?.content;
    if (!content) throw new Error("nvidia_chat_empty");
    return String(content);
  }, 3);
}

export async function* nvChatCompletionStream(args: {
  model: string;
  messages: NvMessage[];
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
}): AsyncGenerator<string> {
  const apiKey = envStr("NVIDIA_API_KEY");
  if (!apiKey) throw new Error("NVIDIA_API_KEY is missing");

  const url = "https://integrate.api.nvidia.com/v1/chat/completions";
  const timeoutMs = args.timeoutMs ?? 45000;

  const payload = {
    model: args.model,
    messages: args.messages,
    max_tokens: args.maxTokens ?? 1024,
    temperature: args.temperature ?? 0.2,
    top_p: args.topP ?? 0.95,
    stream: true,
  };

  const res = await withRetry(async () => {
    const r = await fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(payload),
      },
      timeoutMs,
      args.signal
    );

    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      const msg = (data as any)?.error?.message || (data as any)?.message || r.statusText;
      throw new Error(`nvidia_chat_stream_failed:${r.status}:${msg}`);
    }
    if (!r.body) throw new Error("nvidia_chat_stream_no_body");
    return r;
  }, 2);

  const reader = res.body!.getReader();
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

      const dataLines = block
        .split("\n")
        .map((l) => l.trimEnd())
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.replace(/^data:\s?/, ""));

      if (!dataLines.length) continue;
      const dataStr = dataLines.join("\n").trim();
      if (!dataStr) continue;
      if (dataStr === "[DONE]") return;

      let parsed: any = null;
      try {
        parsed = JSON.parse(dataStr);
      } catch {
        parsed = null;
      }

      const delta =
        parsed?.choices?.[0]?.delta?.content ??
        parsed?.choices?.[0]?.message?.content ??
        parsed?.choices?.[0]?.text;

      if (typeof delta === "string" && delta.length) {
        yield delta;
      }
    }
  }
}

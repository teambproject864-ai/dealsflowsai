import OpenAI from "openai";

type NvMessage = { role: "system" | "user" | "assistant"; content: string };

const DEFAULT_MODEL = "deepseek-ai/deepseek-v4-pro";

function envStr(name: string) {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : null;
}

function getClient() {
  const apiKey = envStr("NVIDIA_API_KEY");
  if (!apiKey) throw new Error("NVIDIA_API_KEY is missing");
  
  return new OpenAI({
    baseURL: "https://integrate.api.nvidia.com/v1",
    apiKey: apiKey,
  });
}

export async function nvInfer(
  prompt: string,
  systemPrompt: string,
  options: any = {}
): Promise<string> {
  const client = getClient();
  
  const completion = await client.chat.completions.create({
    model: options.model || DEFAULT_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    temperature: options.temperature ?? 1,
    top_p: options.top_p ?? 0.95,
    max_tokens: options.max_tokens ?? 16384,
    extra_body: {
      chat_template_kwargs: { thinking: false },
      ...options.extra_body
    },
  } as any);

  return completion.choices[0]?.message?.content || "";
}

export async function nvInferJSON(
  prompt: string,
  systemPrompt: string,
  options: any = {}
): Promise<any> {
  const jsonSystem = `${systemPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No explanation, no markdown, no backticks. Raw JSON only. Ensure no trailing commas.`;
  const result = await nvInfer(prompt, jsonSystem, {
    ...options,
    temperature: 0.2, // Lower temperature for JSON reliability
  });

  const stripFences = (t: string) => t.replace(/```json\s*|```/gi, "").trim();
  const cleaned = stripFences(result);
  
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to parse Nvidia JSON response:", err);
    console.log("Raw response:", result);
    throw new Error("Invalid JSON response from Nvidia API");
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
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
  const client = getClient();

  const completion = await client.chat.completions.create({
    model: args.model || DEFAULT_MODEL,
    messages: args.messages as any,
    max_tokens: args.maxTokens ?? 1024,
    temperature: args.temperature ?? 0.2,
    top_p: args.topP ?? 0.95,
    stream: false,
    extra_body: {
      chat_template_kwargs: { thinking: false }
    }
  } as any);

  return completion.choices[0]?.message?.content || "";
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
  const client = getClient();

  const stream = await client.chat.completions.create({
    model: args.model || DEFAULT_MODEL,
    messages: args.messages as any,
    max_tokens: args.maxTokens ?? 1024,
    temperature: args.temperature ?? 0.2,
    top_p: args.topP ?? 0.95,
    stream: true,
    extra_body: {
      chat_template_kwargs: { thinking: false }
    }
  } as any);

  for await (const chunk of (stream as any)) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

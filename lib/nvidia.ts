import OpenAI from "openai";

type NvMessage = { role: "system" | "user" | "assistant"; content: string };

const DEFAULT_MODEL = "nvidia/nemotron-3-ultra-550b-a55b";
const FALLBACK_MODELS = [
  "mistralai/mistral-large-2407",
  "meta/llama-3.1-70b-instruct",
  "google/gemma-2-27b-it"
];

interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  durationMs?: number;
  modelUsed: string;
}

const performanceHistory: PerformanceMetrics[] = [];

function envStr(name: string) {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : null;
}

function getClient() {
  const apiKey = envStr("NVIDIA_API_KEY");
  if (!apiKey) {
    throw new Error("NVIDIA_API_KEY is missing. Please configure it in your environment variables.");
  }
  
  return new OpenAI({
    baseURL: "https://integrate.api.nvidia.com/v1",
    apiKey: apiKey,
    dangerouslyAllowBrowser: false,
    timeout: 90000, // Increased to 90 seconds for large models
  });
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Exponential backoff with jitter
function getRetryDelay(attempt: number, baseDelay = 1000) {
  const jitter = Math.random() * 0.5;
  return Math.floor(baseDelay * Math.pow(2, attempt) * (1 + jitter));
}

export async function nvInfer(
  prompt: string,
  systemPrompt: string,
  options: any = {}
): Promise<string> {
  if (!prompt?.trim()) {
    throw new Error("Prompt is required for Nvidia inference");
  }

  const client = getClient();
  const startTime = Date.now();
  
  let lastError: any;
  const modelsToTry = [options.model || DEFAULT_MODEL, ...FALLBACK_MODELS].filter((m, i, arr) => arr.indexOf(m) === i); // Remove duplicates
  
    for (let attempt = 0; attempt < modelsToTry.length; attempt++) {
      const model = modelsToTry[attempt];
      try {
        console.log(`[nvidia.ts] Attempting inference with model: ${model} (attempt ${attempt + 1}/${modelsToTry.length})`);
        
        // Prepare base parameters
        const params: any = {
          model,
          messages: [
            { role: "system", content: systemPrompt || "You are a helpful AI assistant." },
            { role: "user", content: prompt },
          ],
          temperature: options.temperature ?? 0.7,
          top_p: options.top_p ?? 0.95,
          max_tokens: options.max_tokens ?? 4096,
        };

        // Only add extra_body for specific models or if explicitly provided in options
        // Some models like Llama 3.1 8B on NIM fail with extra_body
        if (model.includes("nemotron") || options.forceExtraBody) {
          params.extra_body = {
            "chat_template_kwargs": { "enable_thinking": false },
            ...options.extra_body
          };
        }

        const completion = await client.chat.completions.create(params);

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from Nvidia API");
      }

      // Record performance metrics
      const endTime = Date.now();
      const durationMs = endTime - startTime;
      performanceHistory.push({
        startTime,
        endTime,
        durationMs,
        modelUsed: model
      });
      console.log(`[nvidia.ts] Inference successful with model: ${model}, duration: ${durationMs}ms`);
      return content;
    } catch (error: any) {
      lastError = error;
      console.error(`[nvidia.ts] Inference failed with model ${model}:`, error);
      
      if (attempt < modelsToTry.length - 1) {
        const delay = getRetryDelay(attempt);
        console.log(`[nvidia.ts] Retrying with next model in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw new Error(`Nvidia API error: All models failed. Last error: ${lastError?.message || "Unknown error"}`);
}

export async function nvInferJSON(
  prompt: string,
  systemPrompt: string,
  options: any = {}
): Promise<any> {
  const jsonSystem = `${systemPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No explanation, no markdown, no backticks. Raw JSON only. Ensure no trailing commas.`;
  const result = await nvInfer(prompt, jsonSystem, {
    ...options,
    temperature: 0.2,
    max_tokens: 4096, // Shorter for JSON to be faster
  });

  const stripFences = (t: string) => t.replace(/```json\s*|```/gi, "").trim();
  let cleaned = stripFences(result);
  
  // Try to fix common JSON issues
  cleaned = cleaned.replace(/,(\s*[}\]])/g, "$1"); // Remove trailing commas
  
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("[nvidia.ts] Failed to parse JSON response:", err);
    console.log("[nvidia.ts] Raw response:", result);
    console.log("[nvidia.ts] Cleaned response:", cleaned);
    throw new Error("Invalid JSON response from Nvidia API");
  }
}

export function getPerformanceHistory() {
  return [...performanceHistory]; // Return a copy to avoid mutation
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

  try {
    const completion = await client.chat.completions.create({
      model: args.model || DEFAULT_MODEL,
      messages: args.messages as any,
      max_tokens: args.maxTokens ?? 1024,
      temperature: args.temperature ?? 0.2,
      top_p: args.topP ?? 0.95,
      stream: false,
    } as any);

    return completion.choices[0]?.message?.content || "";
  } catch (error: any) {
    console.error("[nvidia.ts] nvChatCompletion failed:", error);
    throw new Error(`Nvidia chat completion error: ${error.message}`);
  }
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

  try {
    const stream = await client.chat.completions.create({
      model: args.model || DEFAULT_MODEL,
      messages: args.messages as any,
      max_tokens: args.maxTokens ?? 1024,
      temperature: args.temperature ?? 0.2,
      top_p: args.topP ?? 0.95,
      stream: true,
    } as any);

    for await (const chunk of (stream as any)) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error: any) {
    console.error("[nvidia.ts] nvChatCompletionStream failed:", error);
    throw new Error(`Nvidia stream error: ${error.message}`);
  }
}


import { HfInference } from '@huggingface/inference';

const PRIMARY_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3';
const FALLBACK_MODELS = [
  'mistralai/Mistral-7B-Instruct-v0.2',
  'HuggingFaceH4/zephyr-7b-beta',
  'meta-llama/Llama-3-8B-Instruct',
  'Qwen/Qwen2.5-7B-Instruct',
  'google/diffusiongemma-26B-A4B-it'
];
const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

export async function hfInfer( 
  prompt: string, 
  systemPrompt: string, 
  options = {} 
): Promise<string> { 
  const hfToken = (process.env.HUGGINGFACE_API_TOKEN || process.env.HUGGINGFACE_API_KEY || "").trim();
  if (!hfToken) {
    console.warn("HUGGINGFACE_API_KEY is missing or empty.");
    return "AI Analysis is currently unavailable due to missing API configuration.";
  }
  const hf = new HfInference(hfToken);

  const tryModel = async (model: string) => { 
    console.log(`[huggingface.ts] Trying model: ${model}`);
    const res = await hf.chatCompletion({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      max_tokens: 1024,
      temperature: 0.7,
      top_p: 0.9,
      ...options
    });
    const content = res.choices[0]?.message?.content || '';
    if (!content) {
      throw new Error(`Model ${model} returned empty content`);
    }
    console.log(`[huggingface.ts] Success with model: ${model}`);
    return content;
  };

  // Try primary model first, then all fallbacks
  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let lastError: any;
  
  for (const model of modelsToTry) {
    try {
      return await tryModel(model);
    } catch (err) {
      lastError = err;
      console.warn(`Hugging Face model ${model} failed, trying next...`, err);
    }
  }
  
  console.error(`Hugging Face API Error: All models failed`, lastError);
  throw new Error(`AI Analysis Service Error: All models failed`);
}

export async function hfInferJSON( 
  prompt: string, 
  systemPrompt: string,
  options: any = {}
): Promise<any> { 
  const jsonSystem = `${systemPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No explanation, no markdown, no backticks. Raw JSON only. Ensure no trailing commas.`; 
  const jsonOpts: any = { ...options, temperature: 0.2, max_tokens: 1600 };
  const jsonFixerSystem = `You fix invalid JSON. Return ONLY valid JSON. No markdown, no backticks, no explanation. Do not add commentary.`;

  const stripFences = (t: string) => t.replace(/```json\s*|```/gi, "").trim();

  const extractBalancedJson = (t: string) => {
    const s = t.trim();
    const firstObj = s.indexOf("{");
    const firstArr = s.indexOf("[");
    if (firstObj === -1 && firstArr === -1) return null;
    const start =
      firstObj !== -1 && firstArr !== -1 ? Math.min(firstObj, firstArr) : (firstObj !== -1 ? firstObj : firstArr);
    const open = s[start];
    const close = open === "{" ? "}" : "]";
    const stack: string[] = [];
    let inString = false;
    let escape = false;

    for (let i = start; i < s.length; i++) {
      const ch = s[i];
      if (inString) {
        if (escape) {
          escape = false;
          continue;
        }
        if (ch === "\\") {
          escape = true;
          continue;
        }
        if (ch === '"') inString = false;
        continue;
      }

      if (ch === '"') {
        inString = true;
        continue;
      }

      if (ch === "{" || ch === "[") {
        stack.push(ch);
        continue;
      }

      if (ch === "}" || ch === "]") {
        const last = stack[stack.length - 1];
        if ((ch === "}" && last === "{") || (ch === "]" && last === "[")) {
          stack.pop();
          if (stack.length === 0 && ch === close) {
            return s.slice(start, i + 1);
          }
        }
      }
    }

    return null;
  };

  const extractJsonCandidate = (t: string) => {
    const s = t.trim();
    const balanced = extractBalancedJson(s);
    if (balanced) return balanced;
    const firstObj = s.indexOf("{");
    const lastObj = s.lastIndexOf("}");
    const firstArr = s.indexOf("[");
    const lastArr = s.lastIndexOf("]");

    const obj =
      firstObj !== -1 && lastObj !== -1 && lastObj > firstObj ? s.slice(firstObj, lastObj + 1) : null;
    const arr =
      firstArr !== -1 && lastArr !== -1 && lastArr > firstArr ? s.slice(firstArr, lastArr + 1) : null;

    if (arr && (!obj || firstArr < firstObj)) return arr;
    return obj || arr || s;
  };

  const repairJson = (t: string) => {
    let s = t;
    s = s.replace(/[\u201C\u201D\u2033]/g, '"').replace(/[\u2018\u2019\u2032]/g, "'");
    s = s.replace(/\uFEFF/g, "");
    s = s.replace(/\r\n/g, "\n");
    s = s.replace(/,\s*([}\]])/g, "$1");
    s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
    return s.trim();
  };

  const parseLenient = (rawText: string) => {
    const cleaned = stripFences(rawText);
    const candidate = extractJsonCandidate(cleaned);
    const repaired = repairJson(candidate);

    try {
      return JSON.parse(repaired);
    } catch (e: any) {
      const msg = e?.message || "json_parse_failed";
      throw new Error(`hf_json_parse_failed:${msg}`);
    }
  };

  let raw1 = "";
  try {
    raw1 = await hfInfer(prompt, jsonSystem, jsonOpts);
    return parseLenient(raw1);
  } catch (e1) {
    const candidate = repairJson(extractJsonCandidate(stripFences(String(raw1 || ""))));
    const clipped = candidate.length > 6000 ? candidate.slice(0, 6000) : candidate;
    try {
      const repairPrompt = clipped
        ? `Fix this invalid JSON and return corrected JSON only:\n${clipped}`
        : `Return the JSON again, ensuring it is strictly valid JSON (no trailing commas).`;
      const raw2 = await hfInfer(repairPrompt, jsonFixerSystem, { ...jsonOpts, temperature: 0, max_tokens: 1600 });
      return parseLenient(raw2);
    } catch (e2) {
      const raw3 = await hfInfer(prompt, jsonSystem, { ...jsonOpts, temperature: 0, max_tokens: 1800 });
      return parseLenient(raw3);
    }
  }
} 

export async function hfEmbed(text: string): Promise<number[]> {
  const hfToken = (process.env.HUGGINGFACE_API_TOKEN || process.env.HUGGINGFACE_API_KEY || "").trim();
  if (!hfToken) {
    console.warn("HUGGINGFACE_API_KEY is missing, returning empty embedding.");
    return new Array(384).fill(0);
  }
  const hf = new HfInference(hfToken);
  
  try {
    const res = await hf.featureExtraction({
      model: EMBEDDING_MODEL,
      inputs: text,
    });
    // Ensure it's a flat array of numbers. HuggingFace might return number[] or number[][]
    if (Array.isArray(res)) {
      if (Array.isArray(res[0])) {
        return res[0] as number[];
      }
      return res as number[];
    }
    return [];
  } catch (err) {
    console.error('Embedding generation failed:', err);
    return new Array(384).fill(0);
  }
}

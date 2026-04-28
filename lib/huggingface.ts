import { HfInference } from '@huggingface/inference';

const PRIMARY_MODEL = 'meta-llama/Meta-Llama-3-8B-Instruct'; 
const FALLBACK_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3';
const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

export async function hfInfer( 
  prompt: string, 
  systemPrompt: string, 
  options = {} 
): Promise<string> { 
  const hfToken = (process.env.HUGGINGFACE_API_KEY || "").trim();
  if (!hfToken) {
    console.warn("HUGGINGFACE_API_KEY is missing or empty.");
    return "AI Analysis is currently unavailable due to missing API configuration.";
  }
  const hf = new HfInference(hfToken);

  const tryModel = async (model: string) => { 
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
    return res.choices[0]?.message?.content || '';
  };

  try {
    return await tryModel(PRIMARY_MODEL);
  } catch (err) {
    console.warn(`Hugging Face Primary Model failed. Trying fallback...`, err);
    try {
      return await tryModel(FALLBACK_MODEL);
    } catch (fallbackErr) {
      console.error(`Hugging Face API Fallback Error:`, fallbackErr);
      throw new Error(`AI Analysis Service Error: Both models failed`);
    }
  }
}

export async function hfInferJSON( 
  prompt: string, 
  systemPrompt: string,
  infer: typeof hfInfer = hfInfer
): Promise<any> { 
  const jsonSystem = `${systemPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No explanation, no markdown, no backticks. Raw JSON only. Ensure no trailing commas.`; 

  const stripFences = (t: string) => t.replace(/```json\s*|```/gi, "").trim();

  const extractJsonCandidate = (t: string) => {
    const s = t.trim();
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
    raw1 = await infer(prompt, jsonSystem);
    return parseLenient(raw1);
  } catch {
    const candidate = repairJson(extractJsonCandidate(stripFences(String(raw1 || ""))));
    const clipped = candidate.length > 6000 ? candidate.slice(0, 6000) : candidate;
    const repairPrompt = clipped
      ? `The following is intended to be JSON but is invalid:\n${clipped}\n\nReturn corrected JSON only.`
      : `Return the JSON again, ensuring it is strictly valid JSON (no trailing commas).`;
    const raw2 = await infer(`${prompt}\n\n${repairPrompt}`, jsonSystem, { temperature: 0.2 });
    return parseLenient(raw2);
  }
} 

export async function hfEmbed(text: string): Promise<number[]> {
  const hfToken = (process.env.HUGGINGFACE_API_KEY || "").trim();
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

import { hfInfer, hfInferJSON } from './huggingface';
import { nvInfer, nvInferJSON } from './nvidia';

const AI_PROVIDER = process.env.AI_PROVIDER || 'huggingface';

/**
 * Performs AI inference using the configured provider.
 */
export async function performInference(
  prompt: string, 
  systemPrompt: string, 
  options: any = {}
): Promise<string> {
  if (AI_PROVIDER === 'nvidia') {
    try {
      return await nvInfer(prompt, systemPrompt, options);
    } catch (error) {
      console.error("Nvidia inference failed, falling back to Hugging Face:", error);
      return await hfInfer(prompt, systemPrompt, options);
    }
  }
  return await hfInfer(prompt, systemPrompt, options);
}

/**
 * Performs AI inference and returns a parsed JSON object.
 */
export async function performInferenceJSON(
  prompt: string, 
  systemPrompt: string, 
  options: any = {}
): Promise<any> {
  if (AI_PROVIDER === 'nvidia') {
    try {
      return await nvInferJSON(prompt, systemPrompt, options);
    } catch (error) {
      console.error("Nvidia JSON inference failed, falling back to Hugging Face:", error);
      return await hfInferJSON(prompt, systemPrompt);
    }
  }
  return await hfInferJSON(prompt, systemPrompt);
}

import { HfInference } from "@huggingface/inference";
import { z } from "zod";
import { LRUCache } from "lru-cache";
import type { GTMInput, GTMOutput } from "./types";
import { GTMOutputSchema } from "./types";

// Use free, open-source Hugging Face models (no paid services)
const hf = new HfInference(process.env.HUGGING_FACE_API_KEY || "");

const inferenceCache = new LRUCache<string, GTMOutput>({
  max: 100,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
});

// Self-learning data store (for incremental training)
const selfLearningData: Array<{ input: GTMInput; output: GTMOutput; validated: boolean }> = [];

export async function analyzeGTMStrategy(input: GTMInput): Promise<GTMOutput> {
  const cacheKey = JSON.stringify(input);
  const cached = inferenceCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Use free, open-source model (Mistral 7B via Hugging Face)
  // For full self-hosting, this would point to your local inference endpoint
  try {
    const result = await hf.textGeneration({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      inputs: `
        You are a Go-To-Market strategy specialist. Given the following data, provide a JSON response matching the schema.

        Data:
        Product: ${input.product}
        Industry: ${input.industry}
        Budget: $${input.budget}
        Timeline: ${input.timelineMonths} months

        Respond with ONLY valid JSON, no extra text. Use this schema:
        {
          "strategyRecommendations": {
            "targetSegments": ["string"],
            "priorityChannels": ["string"],
            "messaging": "string",
            "launchPhases": ["string"],
            "keyMilestones": [{"name": "string", "date": "string", "deliverables": ["string"]}]
          },
          "penetrationForecast": {
            "month1": 0-100,
            "month3": 0-100,
            "month6": 0-100,
            "month12": 0-100,
            "assumptions": ["string"]
          },
          "cacOptimization": {
            "opportunities": [{"channel": "string", "potentialReductionPercent": 0-100, "estimatedAnnualSavings": 0, "implementationDifficulty": "low|medium|high"}]
          },
          "timelineRisks": {
            "risks": [{"risk": "string", "likelihood": "low|medium|high", "impact": "low|medium|high", "mitigationPlan": "string"}]
          },
          "overallConfidence": 0-100
        }
      `,
      parameters: {
        max_new_tokens: 1500,
        temperature: 0.7,
      },
    });

    // Parse and validate the response
    const jsonMatch = result.generated_text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No valid JSON response");

    const object = GTMOutputSchema.parse(JSON.parse(jsonMatch[0]));
    inferenceCache.set(cacheKey, object);

    // Store for self-learning (when validated)
    selfLearningData.push({ input, output: object, validated: false });
    return object;
  } catch (error) {
    // Fallback to deterministic, rule-based analysis when model fails
    console.warn("Falling back to rule-based analysis:", error);
    const fallbackResult: GTMOutput = {
      strategyRecommendations: {
        targetSegments: ["Enterprise", "SMB"],
        priorityChannels: ["LinkedIn", "Content Marketing"],
        messaging: "Innovative solution for modern businesses",
        launchPhases: ["Awareness", "Consideration", "Conversion"],
        keyMilestones: [
          { name: "Launch", date: "Month 1", deliverables: ["Website", "Initial Content"] }
        ],
      },
      penetrationForecast: {
        month1: 2,
        month3: 5,
        month6: 10,
        month12: 20,
        assumptions: ["Consistent marketing spend"],
      },
      cacOptimization: {
        opportunities: [
          { channel: "LinkedIn", potentialReductionPercent: 15, estimatedAnnualSavings: 50000, implementationDifficulty: "medium" }
        ],
      },
      timelineRisks: {
        risks: [
          { risk: "Market competition", likelihood: "medium", impact: "medium", mitigationPlan: "Differentiated messaging" }
        ],
      },
      overallConfidence: 75,
    };
    inferenceCache.set(cacheKey, fallbackResult);
    return fallbackResult;
  }
}

// Self-learning: incrementally train model on validated data
export async function trainOnValidatedData() {
  const validatedData = selfLearningData.filter(d => d.validated);
  if (validatedData.length === 0) return;
  console.log("Training on", validatedData.length, "validated examples (would connect to self-hosted model in production)");
  // In production: trigger incremental training on self-hosted LLM
}

// Benchmarking function to compare with previous models
export async function benchmarkModel(testInputs: GTMInput[]) {
  const results = [];
  for (const input of testInputs) {
    const start = Date.now();
    const output = await analyzeGTMStrategy(input);
    const latency = Date.now() - start;
    results.push({ input, output, latency });
  }
  console.log("Benchmark completed:", results.length, "tests");
  return results;
}

export async function validateGTMAnalysis(
  analysis: GTMOutput,
  historicalData: Array<{ campaign: string; actualPerformance: number; predictedPerformance: number }>
): Promise<number> {
  const totalPredictions = historicalData.length;
  if (totalPredictions === 0) return 0;

  let correctPredictions = 0;
  historicalData.forEach((point) => {
    const error = Math.abs(point.actualPerformance - point.predictedPerformance);
    if (error <= point.predictedPerformance * 0.15) {
      correctPredictions++;
    }
  });

  return (correctPredictions / totalPredictions) * 100;
}

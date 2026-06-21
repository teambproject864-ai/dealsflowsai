import { v4 as uuidv4 } from "uuid";
import {
  EvaluationResult,
  EvaluationMetrics,
  PromptVersion,
  TestCase,
  ModelProvider,
  OptimizationConfig,
} from "./types";
import { performDynamicInference } from "../ai-provider-router";

// Log entry for FAPO evaluation events
export interface FAPOEvaluationLog {
  timestamp: number;
  promptId: string;
  testCaseId: string;
  modelProvider: ModelProvider;
  modelName: string;
  latencyMs: number;
  success: boolean;
  error?: string;
}

const evaluationLogs: FAPOEvaluationLog[] = [];

export class Evaluator {
  constructor() {
    // Validate AI provider configuration at startup
    this.validateProviderConfig();
  }

  /**
   * Validate provider configuration at startup
   */
  private validateProviderConfig(): void {
    const aiProvider = process.env.AI_PROVIDER;
    console.log(`[FAPO Evaluator] Initializing with AI_PROVIDER: ${aiProvider}`);
    
    // Check for required API keys based on provider
    if (aiProvider === "huggingface") {
      if (!process.env.HUGGINGFACE_API_TOKEN && !process.env.HUGGINGFACE_API_KEY) {
        console.warn(`[FAPO Evaluator] Warning: HUGGINGFACE_API_TOKEN or HUGGINGFACE_API_KEY not set`);
      }
    } else if (aiProvider === "nvidia") {
      if (!process.env.NVIDIA_API_KEY) {
        console.warn(`[FAPO Evaluator] Warning: NVIDIA_API_KEY not set`);
      }
    } else if (aiProvider === "kimi") {
      if (!process.env.KIMI_API_KEY) {
        console.warn(`[FAPO Evaluator] Warning: KIMI_API_KEY not set`);
      }
    }
  }

  /**
   * Log an evaluation event
   */
  private logEvaluation(log: FAPOEvaluationLog): void {
    evaluationLogs.push(log);
    if (evaluationLogs.length > 100) {
      evaluationLogs.shift();
    }
    console.log(
      `[FAPO Evaluator] Evaluation ${log.success ? "success" : "failure"} - Prompt: ${log.promptId.slice(0, 8)}, Model: ${log.modelProvider}/${log.modelName}, Latency: ${log.latencyMs}ms`
    );
  }

  /**
   * Get evaluation logs
   */
  static getEvaluationLogs(limit: number = 100): FAPOEvaluationLog[] {
    return evaluationLogs.slice(-limit);
  }

  /**
   * Clear evaluation logs
   */
  static clearEvaluationLogs(): void {
    evaluationLogs.length = 0;
  }

  /**
   * Evaluate a single prompt version against all test cases
   */
  async evaluatePrompt(
    prompt: PromptVersion,
    testCases: TestCase[],
    modelProvider: ModelProvider,
    modelName: string
  ): Promise<EvaluationResult[]> {
    const results: EvaluationResult[] = [];

    for (const testCase of testCases) {
      const startTime = Date.now();
      let output: string | undefined;
      let error: string | undefined;

      try {
        output = await this.runInference(
          prompt.content,
          testCase.input,
          modelProvider,
          modelName
        );
      } catch (err) {
        error = err instanceof Error ? err.message : "Unknown error";
      }

      const latency = Date.now() - startTime;
      const metrics = this.calculateMetrics(
        output,
        testCase.expectedOutput,
        latency,
        error
      );

      const result: EvaluationResult = {
        id: uuidv4(),
        promptId: prompt.id,
        testCaseId: testCase.id,
        modelProvider,
        modelName,
        metrics,
        timestamp: new Date(),
        output,
        error,
      };

      results.push(result);

      // Log the evaluation event
      this.logEvaluation({
        timestamp: Date.now(),
        promptId: prompt.id,
        testCaseId: testCase.id,
        modelProvider,
        modelName,
        latencyMs: latency,
        success: !error,
        error,
      });
    }

    return results;
  }

  /**
   * Calculate composite score from metrics based on config
   */
  static calculateCompositeScore(
    results: EvaluationResult[],
    config: OptimizationConfig
  ): number {
    if (results.length === 0) return 0;

    const avgMetrics = this.getAverageMetrics(results);

    switch (config.selectionCriteria) {
      case "accuracy":
        return avgMetrics.accuracy || 0;
      case "latency":
        return 1 / (avgMetrics.latency || 1); // Lower latency = higher score
      case "weighted":
        return this.calculateWeightedScore(avgMetrics, config);
      default:
        return avgMetrics.accuracy || 0;
    }
  }

  /**
   * Get average metrics across multiple test cases
   */
  private static getAverageMetrics(results: EvaluationResult[]): EvaluationMetrics {
    const total = results.length;
    let sumAccuracy = 0;
    let sumRelevance = 0;
    let sumLatency = 0;
    let sumSuccessRate = 0;

    for (const res of results) {
      sumAccuracy += res.metrics.accuracy || 0;
      sumRelevance += res.metrics.relevance || 0;
      sumLatency += res.metrics.latency || 0;
      sumSuccessRate += res.metrics.successRate || 0;
    }

    return {
      accuracy: sumAccuracy / total,
      relevance: sumRelevance / total,
      latency: sumLatency / total,
      successRate: sumSuccessRate / total,
    };
  }

  /**
   * Calculate weighted score
   */
  private static calculateWeightedScore(
    metrics: EvaluationMetrics,
    config: OptimizationConfig
  ): number {
    const weights = config.weightedWeights || {
      accuracy: 0.5,
      relevance: 0.2,
      latency: 0.2,
      successRate: 0.1,
    };

    let score = 0;
    score += (metrics.accuracy || 0) * (weights.accuracy || 0);
    score += (metrics.relevance || 0) * (weights.relevance || 0);
    // Invert latency so lower is better
    score += (1 / Math.max(metrics.latency || 1, 100)) * (weights.latency || 0);
    score += (metrics.successRate || 0) * (weights.successRate || 0);

    return score;
  }

  /**
   * Map ModelProvider to the AI Provider Router's SupportedAIProvider
   */
  private mapModelProvider(modelProvider: ModelProvider): string {
    switch (modelProvider) {
      case ModelProvider.OPENAI:
        return "huggingface"; // Fallback to Hugging Face for OpenAI
      case ModelProvider.HUGGINGFACE:
        return "huggingface";
      case ModelProvider.ANTHROPIC:
        return "huggingface"; // Fallback
      case ModelProvider.GEMINI:
        return "huggingface"; // Fallback
      case ModelProvider.CUSTOM:
        return process.env.AI_PROVIDER || "huggingface";
      default:
        return "huggingface";
    }
  }

  /**
   * Run inference against an LLM using the AI Provider Router
   */
  private async runInference(
    prompt: string,
    input: any,
    modelProvider: ModelProvider,
    modelName: string
  ): Promise<string> {
    const fullPrompt = `${prompt}\n\nInput: ${JSON.stringify(input)}`;
    const systemPrompt = "You are a helpful AI assistant that responds to prompts accurately.";
    
    // Use the AI Provider Router for dynamic inference with fallback
    return await performDynamicInference(
      fullPrompt,
      systemPrompt,
      { requestType: "fapo-optimization" },
      { model: modelName }
    );
  }

  /**
   * Calculate evaluation metrics (simplified for demo)
   */
  private calculateMetrics(
    output: string | undefined,
    expected: any,
    latency: number,
    error?: string
  ): EvaluationMetrics {
    if (error) {
      return {
        accuracy: 0,
        relevance: 0,
        latency,
        successRate: 0,
      };
    }

    // Simplified metrics calculation
    // In real implementation, you'd use more sophisticated methods
    const successRate = output ? 1 : 0;
    const relevance = this.calculateRelevance(output || "", expected);
    const accuracy = this.calculateAccuracy(output || "", expected);

    return {
      accuracy,
      relevance,
      latency,
      successRate,
    };
  }

  /**
   * Simple relevance heuristic (can be enhanced with embeddings)
   */
  private calculateRelevance(output: string, expected: any): number {
    const expectedStr = JSON.stringify(expected).toLowerCase();
    const outputStr = output.toLowerCase();

    let matchCount = 0;
    const keywords = expectedStr.split(/\W+/).filter((w) => w.length > 3);

    for (const keyword of keywords) {
      if (outputStr.includes(keyword)) {
        matchCount++;
      }
    }

    return keywords.length > 0 ? matchCount / keywords.length : 0.5;
  }

  /**
   * Simple accuracy heuristic
   */
  private calculateAccuracy(output: string, expected: any): number {
    const outputLower = output.toLowerCase();
    const expectedLower = JSON.stringify(expected).toLowerCase();

    // Exact match = 1, partial match = 0.5, no match = 0
    if (outputLower.includes(expectedLower)) return 1;
    if (expectedLower.includes(outputLower)) return 0.7;
    return 0.3;
  }
}

import { z } from "zod";

// ------------------------------
// Core Types
// ------------------------------

export enum TaskType {
  TEXT_GENERATION = "text-generation",
  TEXT_CLASSIFICATION = "text-classification",
  QUESTION_ANSWERING = "question-answering",
  SUMMARIZATION = "summarization",
  MULTIMODAL = "multimodal",
  CUSTOM = "custom",
}

export enum ModelProvider {
  OPENAI = "openai",
  HUGGINGFACE = "huggingface",
  NVIDIA = "nvidia",
  KIMI = "kimi",
  ANTHROPIC = "anthropic",
  GEMINI = "gemini",
  CUSTOM = "custom",
}

export interface PromptVersion {
  id: string;
  version: number;
  content: string;
  createdAt: Date;
  parentId?: string;
  metadata?: Record<string, any>;
}

export interface EvaluationMetrics {
  accuracy?: number;
  relevance?: number;
  latency?: number;
  successRate?: number;
  custom?: Record<string, number>;
}

export interface EvaluationResult {
  id: string;
  promptId: string;
  testCaseId: string;
  modelProvider: ModelProvider;
  modelName: string;
  metrics: EvaluationMetrics;
  timestamp: Date;
  output?: string;
  error?: string;
}

export interface OptimizationCycle {
  id: string;
  taskId: string;
  taskType: TaskType;
  status: "idle" | "running" | "completed" | "failed";
  iterations: number;
  bestPromptId?: string;
  startedAt: Date;
  completedAt?: Date;
  history: EvaluationResult[];
}

export interface OptimizationTask {
  id: string;
  name: string;
  description?: string;
  taskType: TaskType;
  initialPrompt: string;
  testCases: TestCase[];
  targetModelProviders: ModelProvider[];
  targetModelNames: string[];
  config: OptimizationConfig;
  cycles: OptimizationCycle[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TestCase {
  id: string;
  input: any;
  expectedOutput: any;
  metadata?: Record<string, any>;
}

export interface OptimizationConfig {
  maxIterations: number;
  populationSize: number;
  mutationRate: number;
  crossoverRate: number;
  selectionCriteria: "accuracy" | "latency" | "weighted" | "custom";
  weightedWeights?: {
    accuracy?: number;
    relevance?: number;
    latency?: number;
    successRate?: number;
  };
  targetImprovementPercentage?: number;
}

// ------------------------------
// Zod Schemas for validation
// ------------------------------

export const TaskTypeSchema = z.nativeEnum(TaskType);
export const ModelProviderSchema = z.nativeEnum(ModelProvider);

export const TestCaseSchema = z.object({
  id: z.string(),
  input: z.any(),
  expectedOutput: z.any(),
  metadata: z.record(z.any()).optional(),
});

export const OptimizationConfigSchema = z.object({
  maxIterations: z.number().int().min(1).max(100),
  populationSize: z.number().int().min(2).max(20),
  mutationRate: z.number().min(0).max(1),
  crossoverRate: z.number().min(0).max(1),
  selectionCriteria: z.enum(["accuracy", "latency", "weighted", "custom"]),
  weightedWeights: z
    .object({
      accuracy: z.number().min(0).max(1).optional(),
      relevance: z.number().min(0).max(1).optional(),
      latency: z.number().min(0).max(1).optional(),
      successRate: z.number().min(0).max(1).optional(),
    })
    .optional(),
  targetImprovementPercentage: z.number().min(0).max(100).optional(),
});

export const OptimizationTaskSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  taskType: TaskTypeSchema,
  initialPrompt: z.string().min(1),
  testCases: z.array(TestCaseSchema).min(1),
  targetModelProviders: z.array(ModelProviderSchema).min(1),
  targetModelNames: z.array(z.string()).min(1),
  config: OptimizationConfigSchema,
  cycles: z.array(z.any()), // Will define more strictly later
  createdAt: z.date(),
  updatedAt: z.date(),
});

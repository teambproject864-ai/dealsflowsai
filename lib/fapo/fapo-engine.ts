import { v4 as uuidv4 } from "uuid";
import {
  OptimizationTask,
  OptimizationCycle,
  PromptVersion,
  EvaluationResult,
} from "./types";
import { PromptGenerator } from "./prompt-generator";
import { Evaluator } from "./evaluator";

export class FAPOEngine {
  private evaluator: Evaluator;

  constructor() {
    this.evaluator = new Evaluator();
  }

  /**
   * Start a new optimization cycle
   */
  async runOptimization(task: OptimizationTask): Promise<OptimizationCycle> {
    const cycle: OptimizationCycle = {
      id: uuidv4(),
      taskId: task.id,
      taskType: task.taskType,
      status: "running",
      iterations: 0,
      startedAt: new Date(),
      history: [],
    };

    try {
      let currentPopulation = PromptGenerator.generateInitialPopulation(
        task.initialPrompt,
        task.config
      );
      let bestScore = 0;
      let bestPromptId: string | undefined;

      for (let i = 0; i < task.config.maxIterations; i++) {
        cycle.iterations = i + 1;

        // Evaluate entire population
        const evaluationPromises: Promise<{
          prompt: PromptVersion;
          results: EvaluationResult[];
          score: number;
        }>[] = [];

        for (const prompt of currentPopulation) {
          for (const provider of task.targetModelProviders) {
            for (const modelName of task.targetModelNames) {
              evaluationPromises.push(
                (async () => {
                  const results = await this.evaluator.evaluatePrompt(
                    prompt,
                    task.testCases,
                    provider,
                    modelName
                  );
                  const score = Evaluator.calculateCompositeScore(
                    results,
                    task.config
                  );
                  return { prompt, results, score };
                })()
              );
            }
          }
        }

        const evaluationResults = await Promise.all(evaluationPromises);

        // Aggregate results
        const promptScores: { [key: string]: number } = {};
        for (const { prompt, results, score } of evaluationResults) {
          cycle.history.push(...results);
          if (!promptScores[prompt.id] || score > promptScores[prompt.id]) {
            promptScores[prompt.id] = score;
          }

          // Update best prompt
          if (score > bestScore) {
            bestScore = score;
            bestPromptId = prompt.id;
          }
        }

        // Evolve population for next iteration
        currentPopulation = PromptGenerator.evolvePopulation(
          currentPopulation,
          promptScores,
          task.config
        );

        // Check if target improvement is reached
        if (
          task.config.targetImprovementPercentage &&
          bestScore >= task.config.targetImprovementPercentage / 100
        ) {
          break;
        }
      }

      cycle.status = "completed";
      cycle.completedAt = new Date();
      cycle.bestPromptId = bestPromptId;
    } catch (error) {
      cycle.status = "failed";
      cycle.completedAt = new Date();
      console.error("FAPO optimization failed:", error);
    }

    return cycle;
  }

  /**
   * Get the best prompt from a cycle
   */
  getBestPrompt(
    cycle: OptimizationCycle,
    population: PromptVersion[]
  ): PromptVersion | undefined {
    if (!cycle.bestPromptId) return undefined;
    return population.find((p) => p.id === cycle.bestPromptId);
  }
}

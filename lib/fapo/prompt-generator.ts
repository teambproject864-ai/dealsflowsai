import { v4 as uuidv4 } from "uuid";
import {
  PromptVersion,
  OptimizationTask,
  OptimizationConfig,
} from "./types";

export class PromptGenerator {
  /**
   * Generate initial prompt population from a base prompt
   */
  static generateInitialPopulation(
    basePrompt: string,
    config: OptimizationConfig
  ): PromptVersion[] {
    const population: PromptVersion[] = [];

    // Add the original prompt as version 1
    population.push({
      id: uuidv4(),
      version: 1,
      content: basePrompt,
      createdAt: new Date(),
    });

    // Generate variations
    for (let i = 1; i < config.populationSize; i++) {
      population.push(this.createVariation(basePrompt, i + 1, population[0].id));
    }

    return population;
  }

  /**
   * Create a single variation of a prompt
   */
  static createVariation(
    basePrompt: string,
    version: number,
    parentId?: string
  ): PromptVersion {
    // Simple variation strategies for demonstration
    const variationStrategies = [
      this.rephrase,
      this.addExamples,
      this.addConstraints,
      this.simplify,
      this.emphasizeGoals,
    ];

    // Pick random strategy
    const strategy =
      variationStrategies[Math.floor(Math.random() * variationStrategies.length)];

    return {
      id: uuidv4(),
      version,
      content: strategy(basePrompt),
      createdAt: new Date(),
      parentId,
    };
  }

  /**
   * Evolve a population based on evaluation results
   */
  static evolvePopulation(
    currentPopulation: PromptVersion[],
    results: { [promptId: string]: number }, // promptId -> score
    config: OptimizationConfig
  ): PromptVersion[] {
    // Sort prompts by score (descending)
    const sortedPrompts = [...currentPopulation].sort(
      (a, b) => (results[b.id] || 0) - (results[a.id] || 0)
    );

    // Select top performers
    const selectionCount = Math.floor(config.populationSize * 0.3);
    const selected = sortedPrompts.slice(0, selectionCount);

    const newPopulation: PromptVersion[] = [...selected];
    let nextVersion = Math.max(...currentPopulation.map((p) => p.version)) + 1;

    // Generate offspring via crossover and mutation
    while (newPopulation.length < config.populationSize) {
      const parentA = selected[Math.floor(Math.random() * selected.length)];
      const parentB = selected[Math.floor(Math.random() * selected.length)];

      if (Math.random() < config.crossoverRate && parentA.id !== parentB.id) {
        newPopulation.push(this.crossover(parentA, parentB, nextVersion++));
      } else if (Math.random() < config.mutationRate) {
        newPopulation.push(this.createVariation(parentA.content, nextVersion++, parentA.id));
      } else {
        newPopulation.push(this.createVariation(parentA.content, nextVersion++, parentA.id));
      }
    }

    return newPopulation;
  }

  // ------------------------------
  // Variation strategies (simplified for demo)
  // ------------------------------

  private static rephrase(prompt: string): string {
    const variations = [
      `Please ${prompt.toLowerCase().replace(/^(please|you are|act as)/i, "")}`,
      `Act as an expert and ${prompt.toLowerCase()}`,
      `As a specialist, ${prompt.toLowerCase()}`,
    ];
    return variations[Math.floor(Math.random() * variations.length)];
  }

  private static addExamples(prompt: string): string {
    return `${prompt}\n\nFor example:\n- Example 1: [Input] -> [Output]\n- Example 2: [Input] -> [Output]`;
  }

  private static addConstraints(prompt: string): string {
    return `${prompt}\n\nConstraints:\n- Keep responses concise\n- Avoid jargon\n- Be accurate`;
  }

  private static simplify(prompt: string): string {
    return prompt
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .slice(0, 3)
      .join("\n");
  }

  private static emphasizeGoals(prompt: string): string {
    return `Your primary goal is to: ${prompt}`;
  }

  private static crossover(parentA: PromptVersion, parentB: PromptVersion, version: number): PromptVersion {
    // Simple single-point crossover
    const aParts = parentA.content.split("\n");
    const bParts = parentB.content.split("\n");
    const crossoverPoint = Math.min(aParts.length, bParts.length) / 2;

    const childContent = [
      ...aParts.slice(0, Math.floor(crossoverPoint)),
      ...bParts.slice(Math.floor(crossoverPoint)),
    ].join("\n");

    return {
      id: uuidv4(),
      version,
      content: childContent,
      createdAt: new Date(),
      parentId: `${parentA.id}|${parentB.id}`,
    };
  }
}

import { v4 as uuidv4 } from "uuid";
import { Pinecone } from "@pinecone-database/pinecone";
import { OptimizationTask, OptimizationCycle, PromptVersion } from "./types";

// In-memory storage (for demo purposes)
const tasks: Map<string, OptimizationTask> = new Map();
const cycles: Map<string, OptimizationCycle> = new Map();
const prompts: Map<string, PromptVersion> = new Map();

export class FAPOStorage {
  private pinecone?: Pinecone;
  private indexName = "fapo-history";

  constructor() {
    if (process.env.PINECONE_API_KEY) {
      this.pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
      });
    }
  }

  // ------------------------------
  // Task CRUD
  // ------------------------------

  async createTask(data: Omit<OptimizationTask, "id" | "cycles" | "createdAt" | "updatedAt">): Promise<OptimizationTask> {
    const task: OptimizationTask = {
      ...data,
      id: uuidv4(),
      cycles: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    tasks.set(task.id, task);
    await this.saveToPinecone(task);
    return task;
  }

  async getTask(taskId: string): Promise<OptimizationTask | undefined> {
    return tasks.get(taskId);
  }

  async listTasks(): Promise<OptimizationTask[]> {
    return Array.from(tasks.values());
  }

  async updateTask(taskId: string, updates: Partial<OptimizationTask>): Promise<OptimizationTask | undefined> {
    const task = tasks.get(taskId);
    if (!task) return undefined;
    const updatedTask = { ...task, ...updates, updatedAt: new Date() };
    tasks.set(taskId, updatedTask);
    await this.saveToPinecone(updatedTask);
    return updatedTask;
  }

  // ------------------------------
  // Cycle CRUD
  // ------------------------------

  async saveCycle(cycle: OptimizationCycle): Promise<OptimizationCycle> {
    cycles.set(cycle.id, cycle);
    const task = tasks.get(cycle.taskId);
    if (task) {
      task.cycles.push(cycle);
      task.updatedAt = new Date();
      await this.saveToPinecone(task);
    }
    return cycle;
  }

  async getCyclesForTask(taskId: string): Promise<OptimizationCycle[]> {
    return Array.from(cycles.values()).filter((c) => c.taskId === taskId);
  }

  // ------------------------------
  // Prompt CRUD
  // ------------------------------

  async savePrompt(prompt: PromptVersion): Promise<PromptVersion> {
    prompts.set(prompt.id, prompt);
    return prompt;
  }

  async getPrompt(promptId: string): Promise<PromptVersion | undefined> {
    return prompts.get(promptId);
  }

  async savePrompts(promptsList: PromptVersion[]): Promise<void> {
    for (const prompt of promptsList) {
      prompts.set(prompt.id, prompt);
    }
  }

  // ------------------------------
  // Pinecone integration
  // ------------------------------

  private async saveToPinecone(task: OptimizationTask): Promise<void> {
    if (!this.pinecone) return;
    try {
      // Optional: Use Pinecone for vector search of historical prompts
      // For now, just log it
      console.log("Task saved to Pinecone (placeholder)", task.id);
    } catch (error) {
      console.error("Pinecone save failed:", error);
    }
  }
}

// Export singleton instance
export const fapoStorage = new FAPOStorage();

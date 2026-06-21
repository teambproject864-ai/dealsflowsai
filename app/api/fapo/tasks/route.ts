import { NextRequest, NextResponse } from "next/server";
import { v4 } from "uuid";
import { fapoStorage } from "@/lib/fapo/storage";
import { TaskType, ModelProvider } from "@/lib/fapo/types";

export async function GET() {
  try {
    const tasks = await fapoStorage.listTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const testCases = body.testCases.map((tc: any) => ({
      ...tc,
      id: tc.id || v4(),
    }));

    const newTask = await fapoStorage.createTask({
      name: body.name,
      description: body.description,
      taskType: body.taskType || TaskType.TEXT_GENERATION,
      initialPrompt: body.initialPrompt,
      testCases,
      targetModelProviders: body.targetModelProviders || [ModelProvider.HUGGINGFACE],
      targetModelNames: body.targetModelNames || ["mistralai/Mistral-7B-Instruct-v0.3"],
      config: {
        maxIterations: body.config?.maxIterations || 5,
        populationSize: body.config?.populationSize || 5,
        mutationRate: body.config?.mutationRate || 0.3,
        crossoverRate: body.config?.crossoverRate || 0.5,
        selectionCriteria: body.config?.selectionCriteria || "accuracy",
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { fapoStorage } from "@/lib/fapo/storage";
import { FAPOEngine } from "@/lib/fapo/fapo-engine";
import { PromptGenerator } from "@/lib/fapo/prompt-generator";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const task = await fapoStorage.getTask(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const engine = new FAPOEngine();
    const cycle = await engine.runOptimization(task);
    await fapoStorage.saveCycle(cycle);

    return NextResponse.json(cycle);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Optimization failed" },
      { status: 500 }
    );
  }
}

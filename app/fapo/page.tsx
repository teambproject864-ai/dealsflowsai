"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Play,
  TrendingUp,
  Clock,
  CheckCircle2,
  Target,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { TaskType, ModelProvider, OptimizationTask } from "@/lib/fapo/types";

export default function FAPOPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<OptimizationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingTask, setCreatingTask] = useState(false);
  const [optimizing, setOptimizing] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    initialPrompt: "",
    taskType: TaskType.TEXT_GENERATION,
    testCases: [{ id: "1", input: "", expectedOutput: "" }],
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/fapo/tasks");
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/fapo/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTask,
          config: {
            maxIterations: 5,
            populationSize: 5,
            mutationRate: 0.3,
            crossoverRate: 0.5,
            selectionCriteria: "accuracy",
          },
        }),
      });
      const data = await res.json();
      setTasks([...tasks, data]);
      setCreatingTask(false);
      setNewTask({
        name: "",
        description: "",
        initialPrompt: "",
        taskType: TaskType.TEXT_GENERATION,
        testCases: [{ id: "1", input: "", expectedOutput: "" }],
      });
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleOptimize = async (taskId: string) => {
    setOptimizing(taskId);
    try {
      await fetch(`/api/fapo/tasks/${taskId}/optimize`, {
        method: "POST",
      });
      await fetchTasks();
    } catch (error) {
      console.error("Optimization failed:", error);
    } finally {
      setOptimizing(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#060612] text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/6 border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <h1 className="text-4xl font-bold mb-2">
            Fully Autonomous Prompt Optimization (FAPO)
          </h1>
          <p className="text-slate-400 text-lg">
            Continuously improve your prompts with automated evaluation and
            iterative refinement
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setCreatingTask(true)}
            className="bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Optimization Task
          </Button>
        </div>

        {/* Create Task Form */}
        {creatingTask && (
          <Card className="mb-8 border border-white/15 bg-[#070718]">
            <CardHeader>
              <CardTitle>Create New Optimization Task</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTask} className="space-y-6">
                <div>
                  <Label>Task Name</Label>
                  <Input
                    value={newTask.name}
                    onChange={(e) =>
                      setNewTask({ ...newTask, name: e.target.value })
                    }
                    placeholder="e.g., Customer Email Generator"
                    className="mt-1 bg-white/5 border-white/10"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                    placeholder="Describe the task..."
                    className="mt-1 bg-white/5 border-white/10"
                  />
                </div>

                <div>
                  <Label>Task Type</Label>
                  <Select
                    value={newTask.taskType}
                    onValueChange={(val) =>
                      setNewTask({
                        ...newTask,
                        taskType: val as TaskType,
                      })
                    }
                  >
                    <SelectTrigger className="mt-1 bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#070718] border-white/15">
                      {Object.values(TaskType).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Initial Prompt</Label>
                  <Textarea
                    value={newTask.initialPrompt}
                    onChange={(e) =>
                      setNewTask({ ...newTask, initialPrompt: e.target.value })
                    }
                    placeholder="Your initial prompt here..."
                    className="mt-1 bg-white/5 border-white/10 min-h-[150px]"
                  />
                </div>

                <div>
                  <Label>Test Cases</Label>
                  {newTask.testCases.map((tc, idx) => (
                    <div key={tc.id} className="mt-2 space-y-2 p-4 border border-white/10 rounded-xl">
                      <Input
                        placeholder="Input"
                        value={tc.input}
                        onChange={(e) => {
                          const updated = [...newTask.testCases];
                          updated[idx].input = e.target.value;
                          setNewTask({ ...newTask, testCases: updated });
                        }}
                        className="bg-white/5 border-white/10"
                      />
                      <Input
                        placeholder="Expected Output"
                        value={tc.expectedOutput}
                        onChange={(e) => {
                          const updated = [...newTask.testCases];
                          updated[idx].expectedOutput = e.target.value;
                          setNewTask({ ...newTask, testCases: updated });
                        }}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2"
                    onClick={() =>
                      setNewTask({
                        ...newTask,
                        testCases: [
                          ...newTask.testCases,
                          {
                            id: String(newTask.testCases.length + 1),
                            input: "",
                            expectedOutput: "",
                          },
                        ],
                      })
                    }
                  >
                    Add Test Case
                  </Button>
                </div>

                <div className="flex gap-4">
                  <Button type="submit">Create Task</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreatingTask(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tasks List */}
        <div className="grid gap-6">
          {loading ? (
            <div>Loading...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No optimization tasks yet. Create one to get started!
            </div>
          ) : (
            tasks.map((task) => (
              <Card
                key={task.id}
                className="border border-white/15 bg-[#070718]"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {task.name}
                      </h3>
                      {task.description && (
                        <p className="text-slate-400 mb-4">
                          {task.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-teal-400" />
                          {task.taskType}
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-cyan-400" />
                          {task.cycles.length} cycles
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          {task.testCases.length} test cases
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleOptimize(task.id)}
                      disabled={!!optimizing}
                      className="bg-gradient-to-r from-emerald-600 to-teal-500"
                    >
                      {optimizing === task.id ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Optimizing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Optimization
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Cycles */}
                  {task.cycles.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <h4 className="text-lg font-semibold mb-4">
                        Optimization Cycles
                      </h4>
                      <div className="space-y-3">
                        {task.cycles.map((cycle) => (
                          <div
                            key={cycle.id}
                            className="p-4 rounded-xl border border-white/10"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-semibold">
                                  Cycle {cycle.iterations}
                                </span>
                                <span
                                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                    cycle.status === "completed"
                                      ? "bg-emerald-500/20 text-emerald-300"
                                      : cycle.status === "running"
                                      ? "bg-yellow-500/20 text-yellow-300"
                                      : "bg-red-500/20 text-red-300"
                                  }`}
                                >
                                  {cycle.status}
                                </span>
                              </div>
                              <span className="text-sm text-slate-400">
                                {new Date(
                                  cycle.startedAt
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

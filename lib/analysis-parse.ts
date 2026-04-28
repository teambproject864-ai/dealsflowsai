import { z } from "zod";
import type { AnalysisResult } from "./types";

const painPointSchema = z.object({
  title: z.string(),
  severity: z.enum(["critical", "high", "medium", "low"]),
  description: z.string(),
});

const analysisSchema = z.object({
  healthScore: z.number().min(0).max(100),
  executiveSummary: z.string(),
  painPoints: z.array(painPointSchema).min(1),
  missedRevenue: z.array(
    z.object({
      label: z.string(),
      estimate: z.string(),
      detail: z.string(),
    })
  ),
  stackGaps: z.array(z.string()),
  solutions: z.array(
    z.object({
      painPoint: z.string(),
      solution: z.string(),
      expectedOutcome: z.string(),
      roiEstimate: z.string(),
      beforeAfter: z.object({
        before: z.string(),
        after: z.string(),
      }),
    })
  ),
});

export function stripJsonFence(raw: string): string {
  let t = raw.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  return t.trim();
}

export function parseAnalysisJson(raw: string): AnalysisResult {
  const cleaned = stripJsonFence(raw);
  const parsed: unknown = JSON.parse(cleaned);
  return analysisSchema.parse(parsed) as unknown as AnalysisResult;
}

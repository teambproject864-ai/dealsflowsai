"use client";

import { motion } from "framer-motion";
import type { SolutionMapping } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SolutionCards({ solutions }: { solutions: SolutionMapping[] }) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {solutions.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="h-full border-white/10 bg-white/5 overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/[0.02] pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/20">
                  Pain Point
                </Badge>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ArrowRight className="h-4 w-4" />
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    Dealflow.ai Solution
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
                <h3 className="font-semibold text-white text-sm sm:text-base leading-tight">
                  {s.painPoint}
                </h3>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-emerald-400 text-sm sm:text-base leading-tight">
                  {s.solution}
                </h3>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-violet-300/70 mb-1">
                    Expected Outcome
                  </p>
                  <p className="text-sm font-medium text-white">{s.expectedOutcome}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/70 mb-1">
                    ROI Estimate
                  </p>
                  <p className="text-sm font-medium text-emerald-400">{s.roiEstimate}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-3 w-3 text-red-400" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-400/70">
                      Before
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {s.beforeAfter.before}
                  </p>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/70">
                      After
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {s.beforeAfter.after}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

export function HowDealflowWorks({ companyName }: { companyName: string }) {
  const steps = [
    {
      title: "AI Analysis & Strategy",
      body: `Our models analyzed ${companyName}'s data to map specific pain points to proven Dealflow.ai solutions.`,
    },
    {
      title: "Stack Integration",
      body: `Connect your CRM and sales data to get a unified view of ${companyName}'s entire growth engine.`,
    },
    {
      title: "Automated Orchestration",
      body: "Deploy AI agents that handle lead scoring, personalized follow-ups, and meeting scheduling automatically.",
    },
    {
      title: "Continuous Optimization",
      body: "Real-time performance tracking and iterative AI learning to maximize your ROI every single day.",
    },
  ];

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">How Dealflow.ai Works</h2>
        <p className="mt-2 text-muted-foreground">Four steps to transforming your sales and marketing</p>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <div key={i} className="relative space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-xl font-bold text-white shadow-lg shadow-violet-600/20">
              {i + 1}
            </div>
            <h3 className="font-semibold text-white">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-6 left-12 w-full h-[2px] bg-gradient-to-r from-violet-600/50 to-transparent -z-10" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

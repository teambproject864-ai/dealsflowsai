"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import type { AnalysisResult, IntakeFormData } from "@/lib/types";
import { HealthGauge } from "@/components/HealthGauge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, TrendingUp, AlertCircle, Layers } from "lucide-react";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get("leadId");
  
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>("");

  useEffect(() => {
    if (!leadId) {
      router.replace("/");
      return;
    }

    async function fetchData() {
      try {
        // First, get the lead data from an API (or directly from Firebase if we had a client SDK setup for it)
        // Since we don't have a direct get lead API, let's assume we might need one or we can use the one we just created
        // Actually, let's create a simple API to get lead data or just use the analysis API which will handle it.
        
        // For Phase 1, we'll call /api/analyze which will fetch the lead from Firebase Admin, analyze it, and save the analysis.
        // We need to pass the leadId to it.
        
        // But wait, the analysis API needs the companyData too in the user's snippet.
        // Let's check the user's snippet for api/analyze/route.ts again.
        // It takes { leadId, companyData }.
        
        // If we don't have companyData here, we might need to fetch the lead first.
        // Let's add a simple GET /api/leads/[id] route or just fetch it in the analyze route if companyData is missing.
        
        // I'll update the analyze route to fetch the lead if companyData is not provided.
        
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId }),
        });
        
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "Analysis failed");
        }
        
        setAnalysis(data);
        // We might want to fetch the lead name separately or return it from the analysis API
        // I'll update the analysis API to return the company name.
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [leadId, router]);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center py-20 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="mb-8 rounded-full border-2 border-dashed border-violet-500/40 p-6"
        >
          <Sparkles className="h-10 w-10 text-violet-400" />
        </motion.div>
        <h2 className="text-xl font-semibold sm:text-2xl text-white">
          Our AI is analyzing your company...
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Mapping pains, stack gaps, and revenue upside.
        </p>
        <div className="mt-8 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
            initial={{ width: "5%" }}
            animate={{ width: "95%" }}
            transition={{ duration: 15, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <Card className="mx-auto max-w-lg border-red-500/30 bg-black/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Analysis unavailable
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Back to intake</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Health Score */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-violet-300">Company Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <HealthGauge score={analysis.healthScore} />
          </CardContent>
        </Card>

        {/* Missed Revenue */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-violet-300">Missed Revenue Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="py-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-red-500/10 p-3">
                <TrendingUp className="h-8 w-8 text-red-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Revenue Leakage</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Estimated impact areas based on your current GTM process.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {analysis.missedRevenue.map((m, i) => (
                <div key={i} className="rounded-xl border border-white/5 bg-black/20 p-4">
                  <p className="text-xs font-semibold text-white">{m.label}</p>
                  <p className="mt-1 text-sm font-bold text-emerald-300">{m.estimate}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{m.detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pain Points */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-violet-300">Key Pain Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {analysis.painPoints.map((point, i) => (
                <div key={i} className="rounded-lg border border-white/5 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-white">{point.title}</h4>
                    <Badge variant={point.severity}>{point.severity}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{point.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stack Gaps */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-violet-300">Stack Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.stackGaps.map((gap, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  {gap}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-6">
        <Button asChild size="lg" className="bg-violet-600 hover:bg-violet-700 h-12 px-8">
          <Link href={`/solutions?analysisId=${analysis.analysisId}`}>
            See How Dealflow.ai Solves This
            <Sparkles className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function AnalysisDashboard() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

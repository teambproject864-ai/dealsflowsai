"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SolutionCards, HowDealflowWorks } from "@/components/SolutionCards";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";

function SolutionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const analysisId = searchParams.get("analysisId");
  
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!analysisId) {
      router.replace("/");
      return;
    }

    async function fetchAnalysis() {
      try {
        // We need an API to fetch analysis by ID. Let's assume we'll create one.
        const res = await fetch(`/api/analysis/${analysisId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch analysis");
        setAnalysis(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [analysisId, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
        <p className="mt-4 text-muted-foreground">Loading your tailored solutions...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/">Back to intake</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Your Dealflow.ai Roadmap
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Tailored solutions mapped to your company&apos;s unique challenges.
        </p>
      </header>

      <div className="space-y-16">
        <section>
          <div className="mb-8 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-400" />
            <h2 className="text-xl font-semibold text-white">Tailored Solutions & Expected Results</h2>
          </div>
          <SolutionCards solutions={analysis.solutions} />
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-8 md:p-12">
          <HowDealflowWorks companyName={analysis.companyName || "your company"} />
        </section>

        <div className="flex flex-col items-center justify-center gap-6 py-10">
          <h2 className="text-2xl font-bold text-white text-center">
            Ready to accelerate your growth?
          </h2>
          <Button asChild size="lg" className="bg-violet-600 hover:bg-violet-700 h-14 px-10 text-lg">
            <Link href={`/book-demo?analysisId=${analysisId}`}>
              Book Your Free Demo Call
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SolutionsPage() {
  return (
    <main className="min-h-screen pb-20">
      <div className="mx-auto max-w-6xl px-4 pt-16 sm:pt-24">
        <Suspense fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
          </div>
        }>
          <SolutionsContent />
        </Suspense>
      </div>
    </main>
  );
}

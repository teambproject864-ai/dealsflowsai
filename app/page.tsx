"use client";

import { AnalysisDashboard } from "@/components/AnalysisDashboard";
import { FlowProgress } from "@/components/FlowProgress";
import { IntakeForm } from "@/components/IntakeForm";
import { Loader2, Zap, Plus, BarChart3, Users, Settings, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { trackEvent } from "@/lib/analytics";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const leadId = searchParams.get("leadId");

  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white">
      <div className="pb-20">
        {leadId ? (
          <>
            <FlowProgress current={1} />
            <div className="mx-auto max-w-6xl px-4 pt-10 sm:pt-14">
              <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white">Analysis Results</h1>
                  <p className="text-gray-400 mt-2">Deep-dive into your GTM optimization strategies.</p>
                </div>
                <Button asChild variant="outline" className="border-white/10">
                  <Link href="/">
                    <Plus className="h-4 w-4 mr-2" />
                    New Analysis
                  </Link>
                </Button>
              </header>
              <AnalysisDashboard />
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-7xl px-4 pt-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
                  <BarChart3 className="h-3.5 w-3.5" />
                  GTM Dashboard
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
                  Welcome to Dealflow.ai
                </h1>
                <p className="text-xl text-gray-400 leading-relaxed max-w-xl">
                  You&apos;re now at the command center of your AI-driven sales orchestration. Start a new analysis to optimize your pipeline.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Button asChild size="lg" className="bg-violet-600 hover:bg-violet-700 h-14 px-8 rounded-2xl font-bold text-lg shadow-lg shadow-violet-600/20">
                    <Link href="/#intake">
                      Start New Analysis
                      <Plus className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Total Analyzed', value: '12', icon: BarChart3, color: 'text-blue-400' },
                  { label: 'Active Agents', value: '3', icon: Zap, color: 'text-violet-400' },
                  { label: 'Team Members', value: '8', icon: Users, color: 'text-emerald-400' },
                  { label: 'Integrations', value: '4', icon: Settings, color: 'text-amber-400' },
                ].map((stat) => (
                  <div key={stat.label} className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-all">
                    <stat.icon className={`h-6 w-6 mb-4 ${stat.color}`} />
                    <p className="text-2xl font-black text-white">{stat.value}</p>
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Intake Section */}
            <div id="intake" className="mt-32 scroll-mt-24 max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">Company Intake</h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                  Complete this 2-minute form to receive your custom AI analysis.
                </p>
              </div>
              <div className="relative">
                <IntakeForm />
                
                {/* Visual Accent */}
                <div className="absolute -top-12 -left-12 w-64 h-64 bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
              </div>
              
              <div className="mt-12 text-center">
                <p className="text-sm text-gray-500">
                  Prefer a live walkthrough?{" "}
                  <Link href="/book-demo" className="text-violet-400 hover:underline">
                    Book a demo →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-violet-500" /></div>}>
      <HomeContent />
    </Suspense>
  );
}

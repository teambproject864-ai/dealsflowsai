"use client";

import { AnalysisDashboard } from "@/components/AnalysisDashboard";
import { FlowProgress } from "@/components/FlowProgress";
import { IntakeForm } from "@/components/IntakeForm";
import { BookMeetingModal } from "@/components/BookMeetingModal";
import { Loader2, Zap, Plus, BarChart3, Users, Settings, ArrowRight, TrendingUp, AlertTriangle, CheckCircle2, Target, Calendar, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { loadLeadContext, saveLeadContext } from "@/lib/lead-context";

function LeadAnalysis({ leadId }: { leadId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leadData, setLeadData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const cached = loadLeadContext();
        if (cached?.analysis) {
          setLeadData(cached.form);
          setAnalysis(cached.analysis);
          setLoading(false);
          return;
        }

        const leadRes = await fetch(`/api/leads/${leadId}`);
        if (!leadRes.ok) throw new Error("Failed to fetch lead");
        const leadResult = await leadRes.json();
        if (leadResult.success) {
          setLeadData(leadResult);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load analysis");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [leadId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
        <p className="mt-4 text-muted-foreground animate-pulse">Generating AI analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-white">Failed to load analysis</h2>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-6">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Lead Info Card */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <Target className="text-violet-500" />
            {leadData?.companyName || "Company Analysis"}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Contact</p>
            <p className="text-white font-medium">{leadData?.contactName}</p>
            <div className="flex items-center gap-2 mt-1 text-gray-400 text-sm">
              <Mail className="h-3 w-3" />
              <span>{leadData?.contactEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Phone className="h-3 w-3" />
              <span>{leadData?.contactPhone}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Company Details</p>
            <p className="text-white">{leadData?.industry}</p>
            <p className="text-gray-400 text-sm">{leadData?.companySize} employees</p>
            <p className="text-gray-400 text-sm">Revenue: {leadData?.revenue}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">GTM Motion</p>
            <p className="text-white">{leadData?.targetAudience}</p>
            <p className="text-gray-400 text-sm">{leadData?.monthlyLeads} monthly leads</p>
            <p className="text-gray-400 text-sm">Sales cycle: {leadData?.salesCycle}</p>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Health Score */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Health Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-6xl font-black text-violet-400">{analysis.healthScore || 0}</div>
                  <p className="text-gray-400 mt-2">out of 100</p>
                </div>
                <div className="flex-1">
                  <Progress value={analysis.healthScore || 0} className="h-4 bg-white/10" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Executive Summary */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed">{analysis.executiveSummary}</p>
            </CardContent>
          </Card>

          {/* Pain Points & Solutions Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Pain Points */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="text-amber-500 h-5 w-5" />
                  Pain Points
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.painPoints?.map((pain: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-white">{pain.title}</h4>
                      <Badge className={
                        pain.severity === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        pain.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                        pain.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                        'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }>
                        {pain.severity}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm">{pain.description}</p>
                  </div>
                )) || <p className="text-gray-500">No pain points identified</p>}
              </CardContent>
            </Card>

            {/* Solutions */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-500 h-5 w-5" />
                  Proposed Solutions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.solutions?.map((sol: any, i: number) => (
                  <div key={i} className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <h4 className="font-semibold text-white mb-2">{sol.painPoint}</h4>
                    <p className="text-gray-300 text-sm mb-2">{sol.solution}</p>
                    <p className="text-emerald-400 text-sm font-medium">Expected: {sol.expectedOutcome}</p>
                  </div>
                )) || <p className="text-gray-500">No solutions proposed</p>}
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="text-center py-8">
            <Button onClick={() => setIsModalOpen(true)} size="lg" className="bg-violet-600 hover:bg-violet-700 px-12 h-14 rounded-2xl font-bold text-lg shadow-lg shadow-violet-600/20">
              Book a Meeting with AI Agent
              <Calendar className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <BookMeetingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} leadId={leadId} />
        </>
      )}

      {!analysis && (
        <div className="text-center py-20">
          <p className="text-gray-400">Analysis is being generated. Please refresh the page in a few moments.</p>
        </div>
      )}
    </div>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const leadId = searchParams.get("leadId");
  const initialIntakeStep = parseInt(searchParams.get("step") || "0", 10);

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
              <LeadAnalysis leadId={leadId} />
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
                <IntakeForm initialStep={initialIntakeStep} />
                
                {/* Visual Accent */}
                <div className="absolute -top-12 -left-12 w-64 h-64 bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
              </div>
              
              <div className="mt-12 text-center">
                <p className="text-sm text-gray-500">
                  Prefer a live walkthrough?{" "}
                  <Link href="/?step=5#intake" className="text-violet-400 hover:underline">
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

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, TrendingUp, AlertCircle, CheckCircle2, FileText, Calendar, Mail, Phone, ExternalLink, User } from "lucide-react";

function CallSummaryContent() {
  const router = useRouter();
  const params = useParams();
  const callId = params.callId;
  
  const [call, setCall] = useState<any>(null);
  const [lead, setLead] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!callId) return;

    async function fetchData() {
      try {
        const res = await fetch(`/api/calls/${callId}`);
        const callData = await res.json();
        setCall(callData);
        
        const leadRes = await fetch(`/api/leads/${callData.leadId}`);
        const leadData = await leadRes.json();
        setLead(leadData);

        const analysisRes = await fetch(`/api/analysis/${callData.analysisId}`);
        const analysisData = await analysisRes.json();
        setAnalysis(analysisData);

        // Fetch post-call summary if it exists
        const summaryRes = await fetch(`/api/meeting/summary?callId=${callId}`);
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      } catch (e) {
        console.error("Error fetching summary data:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [callId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 space-y-12 bg-[#0A0F1E] text-white">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-12">
        <div className="space-y-4">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 text-xs uppercase tracking-widest font-bold">
            Call Summary Available
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Meeting with {lead?.companyName}
          </h1>
          <div className="flex flex-wrap gap-6 text-sm text-gray-400 font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-violet-400" />
              {new Date(call?.scheduledAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-violet-400" />
              {lead?.contactName}
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-violet-400" />
              {call?.dealProbability}% Probability
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="border-white/10 hover:bg-white/5 h-12 px-6">
            <Mail className="mr-2 h-4 w-4" />
            Resend Email
          </Button>
          <Button className="bg-violet-600 hover:bg-violet-700 h-12 px-8 shadow-lg shadow-violet-600/20">
            Download PDF
          </Button>
        </div>
      </header>

      <div className="grid gap-10 md:grid-cols-[1fr,320px]">
        <div className="space-y-12">
          {/* Executive Summary Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <FileText className="h-4 w-4 text-violet-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Executive Summary</h2>
            </div>
            <div className="prose prose-invert prose-sm max-w-none leading-relaxed text-gray-300 bg-white/5 border border-white/10 rounded-2xl p-8">
              {summary?.content || "No detailed summary generated yet."}
            </div>
          </section>

          {/* Key Pain Points & Solutions Mapping */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Solution Mapping Recap</h2>
            </div>
            <div className="grid gap-6">
              {analysis?.solutions?.map((sol: any, i: number) => (
                <div key={i} className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.04]">
                  <div className="grid md:grid-cols-[1fr,auto,1fr] items-center gap-6">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-red-400/70">Pain Point</p>
                      <p className="text-sm font-semibold text-white leading-tight">{sol.painPoint}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600/10 text-violet-400">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/70">Solution</p>
                      <p className="text-sm font-semibold text-emerald-400 leading-tight">{sol.solution}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <Card className="border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-violet-300">Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-white/5 p-2 border border-white/10">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Contact Name</p>
                  <p className="text-sm text-white font-semibold">{lead?.contactName}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-white/5 p-2 border border-white/10">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Email Address</p>
                  <p className="text-sm text-white font-semibold break-all">{lead?.contactEmail}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-white/5 p-2 border border-white/10">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Phone Number</p>
                  <p className="text-sm text-white font-semibold">{lead?.contactPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl overflow-hidden">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-violet-300">Deal Intelligence</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs text-muted-foreground font-medium">Closing Probability</p>
                  <p className="text-xs font-bold text-emerald-400">{call?.dealProbability}%</p>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${call?.dealProbability}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-violet-600 to-emerald-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Deal Status</p>
                <Badge className="bg-violet-500/10 text-violet-400 border-none px-3 py-1 text-xs font-bold capitalize">
                  {call?.dealStatus || 'In Progress'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Button asChild variant="outline" className="w-full border-white/10 hover:bg-white/5 h-12 text-gray-400">
            <Link href={`/ai-agent-call?callId=${callId}`}>
              View Full Transcript
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}

export default function SummaryPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1E]">
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
        </div>
      }>
        <CallSummaryContent />
      </Suspense>
    </main>
  );
}

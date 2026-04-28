"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Zap, User, Video, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

type TranscriptSegment = {
  speaker: string;
  text: string;
  timestamp: string;
};

type Note = {
  timestamp: string;
  description?: string;
  objection?: string;
  response?: string;
  signal?: string;
};

function LiveCallDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callId = searchParams.get("callId");
  
  const [call, setCall] = useState<any>(null);
  const [lead, setLead] = useState<any>(null);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [notes, setNotes] = useState<any>({
    buyingSignals: [],
    objections: [],
    keyMoments: []
  });
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!callId) return;

    // In a real app, use Firebase onSnapshot for real-time updates
    // For this implementation, we'll poll for updates
    async function fetchCall() {
      const res = await fetch(`/api/calls/${callId}`);
      const data = await res.json();
      setCall(data);
      
      if (data.leadId) {
        const lRes = await fetch(`/api/leads/${data.leadId}`);
        const lData = await lRes.json();
        setLead(lData);
      }
      setLoading(false);
    }

    async function fetchTranscript() {
      const res = await fetch(`/api/meeting/transcript?callId=${callId}`);
      const data = await res.json();
      if (data.segments) setTranscript(data.segments);
    }

    async function fetchNotes() {
      const res = await fetch(`/api/meeting/notes?callId=${callId}`);
      const data = await res.json();
      if (data) setNotes(data);
    }

    async function fetchMemories() {
      const res = await fetch(`/api/meeting/memories?callId=${callId}`);
      const data = await res.json();
      if (data.memories) setMemories(data.memories);
    }

    fetchCall();
    const tInterval = setInterval(fetchTranscript, 2000);
    const nInterval = setInterval(fetchNotes, 5000);
    const mInterval = setInterval(fetchMemories, 10000);

    return () => {
      clearInterval(tInterval);
      clearInterval(nInterval);
      clearInterval(mInterval);
    };
  }, [callId]);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="grid h-screen grid-cols-[1fr,400px] overflow-hidden bg-[#0A0F1E] text-white">
      {/* Left: Main View */}
      <div className="flex flex-col border-r border-white/5">
        <header className="flex items-center justify-between border-b border-white/5 bg-black/20 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 border border-violet-500/30">
              <Video className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Live Call: {call?.agentPersona}</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active · Call in Progress
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Deal Probability</p>
              <p className="text-xl font-bold text-emerald-400">{call?.dealProbability || 0}%</p>
            </div>
            <div className="h-10 w-[1px] bg-white/10" />
            <Badge variant="outline" className="border-violet-500/50 bg-violet-500/10 text-violet-400 capitalize">
              {call?.currentStage || 'Intro'}
            </Badge>
          </div>
        </header>

        <div className="grid flex-1 grid-rows-[1fr,250px] overflow-hidden">
          {/* Transcript View */}
          <div className="relative overflow-hidden p-6" ref={transcriptRef}>
            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {transcript.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${s.speaker?.toLowerCase().includes('alex') || s.speaker?.toLowerCase().includes('sam') || s.speaker?.toLowerCase().includes('jordan') || s.speaker?.toLowerCase().includes('casey') ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {s.speaker}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50">
                        {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      s.speaker?.toLowerCase().includes('alex') || s.speaker?.toLowerCase().includes('sam') || s.speaker?.toLowerCase().includes('jordan') || s.speaker?.toLowerCase().includes('casey')
                        ? 'bg-violet-600/20 border border-violet-500/30 text-white'
                        : 'bg-white/5 border border-white/10 text-gray-300'
                    }`}>
                      {s.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Bar: Action Items / Objections */}
          <div className="border-t border-white/5 bg-black/40 p-6 backdrop-blur-xl overflow-hidden grid grid-cols-2 gap-6">
            <div className="space-y-4 overflow-hidden flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-widest text-violet-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Objections Detected
              </h3>
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-3">
                  {notes.objections?.map((o: any, i: number) => (
                    <div key={i} className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 space-y-2">
                      <p className="text-xs font-medium text-white italic">&quot;{o.objection}&quot;</p>
                      <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                        <CheckCircle2 className="h-3 w-3" />
                        AI Handled
                      </div>
                    </div>
                  ))}
                  {!notes.objections?.length && (
                    <p className="text-xs text-muted-foreground italic">No objections raised yet.</p>
                  )}
                </div>
              </ScrollArea>
            </div>
            <div className="space-y-4 overflow-hidden flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Buying Signals
              </h3>
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-3">
                  {notes.buyingSignals?.map((s: any, i: number) => (
                    <div key={i} className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                      <p className="text-xs font-medium text-white">{s.signal}</p>
                    </div>
                  ))}
                  {!notes.buyingSignals?.length && (
                    <p className="text-xs text-muted-foreground italic">Listening for buying signals...</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Agent Status & Control */}
      <div className="flex flex-col bg-black/20 backdrop-blur-md">
        <header className="px-6 py-6 border-b border-white/5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Agent Brain Status</h2>
        </header>
        <div className="p-6 space-y-8 flex-1 overflow-y-auto">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-violet-400">Current Strategy</h3>
              <Badge variant="secondary" className="bg-violet-500/10 text-violet-400 border-none text-[10px]">
                {call?.currentStage || 'Discovery'}
              </Badge>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed bg-white/5 rounded-xl p-4 border border-white/5">
              Focusing on quantifying the ROI for the marketing automation layer. Identifying potential blockers in the technical stack integration.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-violet-400">MemPalace (Agent Memory)</h3>
            <div className="space-y-3">
              {memories.map((m, i) => (
                <div key={i} className="bg-white/5 p-3 rounded-lg border border-white/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[8px] uppercase tracking-widest border-violet-500/30 text-violet-300">
                      {m.category}
                    </Badge>
                    <span className="text-[8px] text-muted-foreground">Imp: {m.importance}</span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">{m.content}</p>
                </div>
              ))}
              {!memories.length && (
                <p className="text-[11px] text-muted-foreground italic">No memories yet...</p>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-violet-400">AI Note Structure</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-gray-400 bg-white/5 p-3 rounded-lg border border-white/5">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                Qualified Need: {lead?.monthlyLeads} leads/mo
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400 bg-white/5 p-3 rounded-lg border border-white/5">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                Budget: Verified in Range
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400 bg-white/5 p-3 rounded-lg border border-white/5">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                Decision Maker: {lead?.contactName}
              </div>
            </div>
          </section>
        </div>
        
        <div className="p-6 border-t border-white/5 space-y-4">
          <Button className="w-full bg-red-600 hover:bg-red-700 h-12 text-white border-none">
            End Live Call Session
          </Button>
          <p className="text-[10px] text-center text-muted-foreground">
            Ending the session will stop the Recall.ai bot and trigger the post-call summary distribution.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LiveCallDashboard() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0A0F1E]">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
      </div>
    }>
      <LiveCallDashboardContent />
    </Suspense>
  );
}

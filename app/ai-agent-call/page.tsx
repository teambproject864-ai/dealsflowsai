"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AgentChat } from "@/components/AgentChat";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Phone,
  PhoneOff,
  Clock,
  User,
  Bot,
  Activity,
  AlertCircle,
} from "lucide-react";
import { IconLogOut } from "@/components/gtm/GtmIcons";

/**
 * Premium Voice Call Monitor Dashboard
 */
function VoiceCallMonitor({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let pollInterval: any;
    
    async function fetchStatus() {
      try {
        const res = await fetch(`/api/custom-voice/status?sessionId=${sessionId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch call status");
        }
        const data = await res.json();
        if (data.success && data.session) {
          setSession(data.session);
          setError(null);
          
          if (data.session.status === "completed" || data.session.status === "failed") {
            clearInterval(pollInterval);
          }
        }
      } catch (err: any) {
        console.error("Error polling call status:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
    pollInterval = setInterval(fetchStatus, 2000);

    return () => clearInterval(pollInterval);
  }, [sessionId]);

  useEffect(() => {
    if (!session || session.status !== "in-progress") return;

    const start = session.startedAt ? new Date(session.startedAt).getTime() : Date.now();
    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((Date.now() - start) / 1000));
      setDuration(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const getDisplayDuration = () => {
    if (session?.status === "completed" && session.endedAt && session.startedAt) {
      const diff = Math.max(0, Math.floor((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 1000));
      return formatTime(diff);
    }
    return formatTime(duration);
  };

  const handleEndCall = () => {
    router.push("/");
  };

  if (loading && !session) {
    return (
      <div className="flex h-[calc(100vh-60px)] flex-col items-center justify-center text-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
        <p className="mt-4 text-muted-foreground text-sm">Loading call details...</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="flex h-[calc(100vh-60px)] flex-col items-center justify-center text-center px-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-lg font-semibold">Error Loading Session</h3>
        <p className="mt-2 text-muted-foreground text-sm max-w-md">{error}</p>
        <Button className="mt-6 bg-teal-600 hover:bg-teal-700" onClick={() => router.push("/")}>Back to Dashboard</Button>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    initiated: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    ringing: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    "in-progress": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    completed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    failed: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const statusLabels: Record<string, string> = {
    initiated: "Initiating...",
    ringing: "Ringing",
    "in-progress": "Active Call",
    completed: "Finished",
    failed: "Failed",
  };

  const status = session?.status || "initiated";

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-60px)]">
      {/* Left panel: status and metrics */}
      <div className="lg:col-span-5 border-r border-white/10 flex flex-col items-center justify-center p-8 bg-black/10 backdrop-blur-md overflow-y-auto">
        <div className="w-full max-w-sm flex flex-col items-center">
          {/* Pulsing visualizer */}
          <div className="relative flex items-center justify-center mb-8">
            {status === "in-progress" && (
              <>
                <div className="absolute w-48 h-48 rounded-full bg-teal-500/10 animate-ping" />
                <div className="absolute w-40 h-40 rounded-full bg-teal-500/25 animate-pulse" />
              </>
            )}
            {status === "ringing" && (
              <div className="absolute w-40 h-40 rounded-full bg-amber-500/10 animate-pulse" />
            )}
            <div className={`w-32 h-32 rounded-full border-2 flex items-center justify-center bg-slate-900 shadow-2xl relative z-10 ${
              status === "in-progress" ? "border-teal-500/80 shadow-teal-500/10" :
              status === "ringing" ? "border-amber-500/80 shadow-amber-500/10" : "border-white/20"
            }`}>
              {status === "completed" ? (
                <PhoneOff className="h-12 w-12 text-gray-400" />
              ) : (
                <Phone className={`h-12 w-12 ${status === "in-progress" ? "text-teal-400 animate-bounce" : "text-amber-400"}`} />
              )}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center tracking-tight">{session?.agentName || "AI Agent"}</h2>
          <p className="text-sm text-muted-foreground mt-1">Autonomous Revenue Representative</p>

          <div className="flex gap-3 mt-4 items-center">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColors[status] || "border-white/10"}`}>
              {statusLabels[status] || status}
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border border-white/10 bg-white/5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{getDisplayDuration()}</span>
            </div>
          </div>

          {/* Metadata Cards */}
          <div className="w-full mt-10 space-y-4">
            <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">Target Phone</span>
              <span className="text-sm font-mono tracking-wide">{session?.toPhone || "N/A"}</span>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">Call Framework</span>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                &quot;{session?.callFramework || "Direct Sales & Revenue Discovery"}&quot;
              </p>
            </div>
          </div>

          {status !== "completed" && status !== "failed" ? (
            <Button
              onClick={handleEndCall}
              variant="destructive"
              className="mt-10 w-full py-6 rounded-xl font-semibold shadow-lg shadow-red-500/10 hover:shadow-red-500/20"
            >
              <PhoneOff className="mr-2 h-4 w-4" /> End Monitor
            </Button>
          ) : (
            <Button
              onClick={handleEndCall}
              className="mt-10 w-full py-6 rounded-xl font-semibold bg-teal-600 hover:bg-teal-700 shadow-lg"
            >
              Return Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Right panel: live transcript */}
      <div className="lg:col-span-7 flex flex-col h-full bg-[#0A0C16]">
        {/* Transcript Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className={`h-4 w-4 text-teal-400 ${status === "in-progress" ? "animate-pulse" : ""}`} />
            <h3 className="font-semibold text-sm">Live Call Transcript</h3>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {session?.transcript?.length || 0} turn(s)
          </span>
        </div>

        {/* Scrollable messages area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col justify-start">
          {session?.transcript && session.transcript.length > 0 ? (
            session.transcript.map((turn: any, i: number) => {
              const isAgent = turn.role === "agent";
              return (
                <div key={i} className={`flex items-start gap-3.5 max-w-[85%] ${isAgent ? "self-start" : "self-end flex-row-reverse"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${
                    isAgent ? "bg-teal-500/15 border-teal-500/30 text-teal-400" : "bg-purple-500/15 border-purple-500/30 text-purple-400"
                  }`}>
                    {isAgent ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  
                  <div className={`p-4 rounded-2xl relative shadow-md ${
                    isAgent 
                      ? "bg-slate-900 border border-white/5 rounded-tl-none text-slate-100" 
                      : "bg-teal-950/40 border border-teal-500/20 rounded-tr-none text-teal-50"
                  }`}>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">
                      {isAgent ? session.agentName : "Customer"}
                    </span>
                    <p className="text-sm leading-relaxed">{turn.text}</p>
                    {turn.timestamp && (
                      <span className="text-[9px] text-muted-foreground/60 block mt-2 text-right">
                        {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <Activity className="h-10 w-10 text-muted-foreground/30 animate-pulse mb-3" />
              <p className="text-sm text-muted-foreground">Waiting for call to connect...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AiAgentCallContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const callId = searchParams.get("callId");
  const sessionId = searchParams.get("sessionId") || (callId?.startsWith("cvc-") ? callId : null);

  const [call, setCall] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);

  // If this is a custom voice agent call session, bypass normal text chat and render the voice monitor
  useEffect(() => {
    if (sessionId) {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId || !callId) {
      return;
    }

    async function fetchCallData() {
      try {
        const res = await fetch(`/api/calls/${callId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch call data");
        setCall(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchCallData();
  }, [callId, sessionId, router]);

  useEffect(() => {
    if (sessionId || !callId) return;

    const heartbeat = () => {
      fetch("/api/calls/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId }),
        keepalive: true,
      }).catch(() => {});
    };

    heartbeat();
    const interval = setInterval(heartbeat, 15000);

    const onBeforeUnload = () => {
      try {
        const body = JSON.stringify({ callId });
        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/calls/end", new Blob([body], { type: "application/json" }));
        } else {
          fetch("/api/calls/end", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
            keepalive: true,
          }).catch(() => {});
        }
      } catch {}
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", onBeforeUnload);
      fetch("/api/calls/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId }),
        keepalive: true,
      }).catch(() => {});
    };
  }, [callId, sessionId]);

  const handleEnd = async () => {
    if (!callId || ending) return;
    setEnding(true);
    try {
      await fetch("/api/calls/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId }),
      });
    } finally {
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
        <p className="mt-4 text-muted-foreground">Connecting to your AI Agent...</p>
      </div>
    );
  }

  // If voice call session monitoring, render voice dashboard
  if (sessionId) {
    return (
      <div className="h-screen flex flex-col bg-[#0A0F1E] text-white">
        <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md">
          <div className="text-xs text-muted-foreground font-bold tracking-wider">
            DealFlow.AI — Interactive Call Monitor
          </div>
          <Button
            variant="outline"
            className="border-white/10 hover:bg-white/5 text-xs h-8"
            onClick={() => router.push("/")}
          >
            Dashboard
          </Button>
        </div>
        <VoiceCallMonitor sessionId={sessionId} />
      </div>
    );
  }

  if (error || !call) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h2 className="text-xl font-semibold text-white">Connection Error</h2>
        <p className="mt-2 text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0A0F1E] text-white">
      <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md">
        <div className="text-xs text-muted-foreground">
          {call?.callMode === "immediate" ? "Immediate Call" : "Scheduled Call"}
        </div>
        <Button
          variant="outline"
          className="border-white/10 hover:bg-white/5"
          onClick={handleEnd}
          disabled={ending}
        >
          {ending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ending...
            </>
          ) : (
            <>
              <IconLogOut className="mr-2 h-4 w-4" />
              End Session
            </>
          )}
        </Button>
      </div>
      <AgentChat callId={callId!} />
    </div>
  );
}

export default function AiAgentCallPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
      </div>
    }>
      <AiAgentCallContent />
    </Suspense>
  );
}


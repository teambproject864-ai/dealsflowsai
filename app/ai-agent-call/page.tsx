"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AgentChat } from "@/components/AgentChat";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";

function AiAgentCallContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callId = searchParams.get("callId");
  
  const [call, setCall] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    if (!callId) {
      router.replace("/");
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
  }, [callId, router]);

  useEffect(() => {
    if (!callId) return;

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
  }, [callId]);

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
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
        <p className="mt-4 text-muted-foreground">Connecting to your AI Agent...</p>
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
              <LogOut className="mr-2 h-4 w-4" />
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
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
      </div>
    }>
      <AiAgentCallContent />
    </Suspense>
  );
}

"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase-client";
import { doc, onSnapshot } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Loader2, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle, 
  Monitor,
  LogOut,
  Send,
  FileText
} from "lucide-react";

function LiveContent() {
  const searchParams = useSearchParams();
  const callId = searchParams.get("callId");

  const [call, setCall] = useState<any>(null);
  const [transcript, setTranscript] = useState<any>(null);
  const [notes, setNotes] = useState<any>(null);
  const [navUrl, setNavUrl] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!callId) return;

    const unsubCall = onSnapshot(doc(db, "calls", callId), (d) => setCall(d.data()));
    const unsubTranscript = onSnapshot(doc(db, "transcripts", callId), (d) => {
      setTranscript(d.data());
      // Auto scroll to bottom
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }, 100);
    });
    const unsubNotes = onSnapshot(doc(db, "notes", callId), (d) => setNotes(d.data()));

    return () => {
      unsubCall();
      unsubTranscript();
      unsubNotes();
    };
  }, [callId]);

  const handleNavigate = async () => {
    if (!navUrl) return;
    setIsNavigating(true);
    try {
      await fetch("/api/agent/screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId, url: navUrl }),
      });
      setNavUrl("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsNavigating(false);
    }
  };

  const handleEndCall = async () => {
    if (!confirm("Are you sure you want to end the call?")) return;
    try {
      await fetch("/api/meeting/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (!call) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Top Header Stats */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-white border-b shadow-sm">
        <Card className="p-3 border-none bg-blue-50">
          <label className="text-[10px] uppercase font-bold text-blue-600 block mb-1">Agent Persona</label>
          <p className="font-bold text-lg capitalize">{call.agentPersona || "Alex"}</p>
        </Card>
        <Card className="p-3 border-none bg-purple-50">
          <label className="text-[10px] uppercase font-bold text-purple-600 block mb-1">Current Stage</label>
          <Badge className="capitalize font-bold">{call.currentStage || "Intro"}</Badge>
        </Card>
        <Card className="p-3 border-none bg-green-50">
          <label className="text-[10px] uppercase font-bold text-green-600 block mb-1">Deal Probability</label>
          <p className={`font-black text-xl ${
            call.dealProbability > 70 ? "text-green-600" : 
            call.dealProbability > 40 ? "text-yellow-600" : "text-red-600"
          }`}>
            {call.dealProbability || 50}%
          </p>
        </Card>
        <Card className="p-3 border-none bg-slate-100">
          <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Deal Status</label>
          <p className="font-bold text-lg capitalize">{call.dealStatus || "Interested"}</p>
        </Card>
      </div>

      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Main Transcript Feed */}
        <div className="flex-[2] flex flex-col bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h2 className="font-bold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Live Transcript
            </h2>
            <Badge variant="outline" className="animate-pulse bg-green-50 text-green-700 border-green-200">
              Live Monitoring
            </Badge>
          </div>
          
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {transcript?.segments?.map((s: any, i: number) => {
                const isAgent = ['Alex', 'Sam', 'Jordan', 'Casey'].some(name => s.speaker?.includes(name));
                return (
                  <div key={i} className={`flex flex-col ${isAgent ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground">{s.speaker}</span>
                      <span className="text-[10px] text-muted-foreground opacity-50">
                        {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                      isAgent 
                        ? "bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20" 
                        : "bg-slate-100 text-slate-800 rounded-tl-none"
                    }`}>
                      {s.text}
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Right Sidebar */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Buying Signals */}
          <Card className="p-4 flex flex-col h-[30%] overflow-hidden border-green-100 bg-green-50/30">
            <h3 className="text-xs font-black uppercase text-green-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-3 h-3" />
              Buying Signals
            </h3>
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {notes?.buyingSignals?.map((sig: any, i: number) => (
                  <div key={i} className="bg-white p-2 rounded border border-green-200 text-xs text-green-800 shadow-sm">
                    {sig.signal}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Objections */}
          <Card className="p-4 flex flex-col h-[30%] overflow-hidden border-yellow-100 bg-yellow-50/30">
            <h3 className="text-xs font-black uppercase text-yellow-700 mb-3 flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              Objections Detected
            </h3>
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {notes?.objections?.map((obj: any, i: number) => (
                  <div key={i} className="bg-white p-2 rounded border border-yellow-200 text-xs text-yellow-800 shadow-sm">
                    <p className="font-bold mb-1 italic">&quot;{obj.objection}&quot;</p>
                    <p className="opacity-70 text-[10px]">Response: {obj.response}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          {/* Manual Controls */}
          <Card className="p-4 flex-1 border-slate-200 shadow-lg">
            <h3 className="text-xs font-black uppercase text-slate-700 mb-4 flex items-center gap-2">
              <Monitor className="w-3 h-3" />
              Agent Controls
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input 
                  placeholder="Navigate screen to URL..." 
                  className="text-xs h-8"
                  value={navUrl}
                  onChange={(e) => setNavUrl(e.target.value)}
                />
                <Button size="sm" variant="outline" className="h-8" onClick={handleNavigate} disabled={isNavigating}>
                  {isNavigating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                </Button>
              </div>
              <Button variant="outline" className="w-full justify-start text-xs h-9 gap-2" onClick={() => window.open(`/meeting-agent/summary/${callId}`, '_blank')}>
                <FileText className="w-3 h-3" />
                View Summary Page
              </Button>
              <Button 
                variant="destructive" 
                className="w-full justify-start text-xs h-9 gap-2 bg-red-600 hover:bg-red-700"
                onClick={handleEndCall}
              >
                <LogOut className="w-3 h-3" />
                End Call Gracefully
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function LiveDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LiveContent />
    </Suspense>
  );
}

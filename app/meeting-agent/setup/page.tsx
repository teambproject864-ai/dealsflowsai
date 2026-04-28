"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase-client";
import { doc, getDoc } from "firebase/firestore";
import { PERSONAS } from "@/prompts/personas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2 } from "lucide-react";

function SetupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callId = searchParams.get("callId");

  const [callData, setCallData] = useState<any>(null);
  const [leadData, setLeadData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState("alex");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!callId) return;

    async function fetchData() {
      try {
        const callDoc = await getDoc(doc(db, "calls", callId!));
        if (callDoc.exists()) {
          const cData = callDoc.data();
          setCallData(cData);
          const lDoc = await getDoc(doc(db, "leads", cData.leadId));
          if (lDoc.exists()) setLeadData(lDoc.data());
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [callId]);

  const handleActivate = async () => {
    if (!meetingUrl) return alert("Please enter a meeting URL");
    setIsActivating(true);

    try {
      const createRes = await fetch("/api/meeting/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId, meetingUrl, personaKey: selectedPersona }),
      });

      if (!createRes.ok) throw new Error("Failed to create meeting bot");

      await fetch("/api/notifications/pre-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId }),
      });

      setSuccess(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-6 text-center">
        <Card className="p-12 border-2 border-green-500/20 bg-green-50/50">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Agent Activated!</h1>
          <p className="text-muted-foreground mb-8">
            The briefing has been sent to {leadData?.contactName}. Your AI agent is ready to join the call.
          </p>
          <Button onClick={() => router.push(`/meeting-agent/live?callId=${callId}`)} size="lg" className="w-full">
            Go to Live Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Configure AI Meeting Agent</h1>
        <p className="text-xl text-muted-foreground">
          Setup the AI persona and meeting details for {leadData?.companyName}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-6">Select Agent Persona</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(PERSONAS).map(([key, p]) => (
                <Card
                  key={key}
                  onClick={() => setSelectedPersona(key)}
                  className={`p-6 cursor-pointer transition-all border-2 ${
                    selectedPersona === key ? "border-primary bg-primary/5" : "hover:border-primary/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{p.name}</h3>
                      <p className="text-sm text-primary font-medium">{p.role}</p>
                    </div>
                    {selectedPersona === key && <Badge variant="default">Selected</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {key === "alex" && "Warm, consultative, relationship-focused. Best for discovery."}
                    {key === "sam" && "Technical, precise, implementation-focused. Best for technical deep-dives."}
                    {key === "jordan" && "Authoritative, executive-level, strategic. Best for enterprise deals."}
                    {key === "casey" && "Friendly, deal-oriented, negotiation-focused. Best for closing."}
                  </p>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Meeting Details</h2>
            <Card className="p-6">
              <div className="space-y-4">
                <label className="text-sm font-medium">Meeting URL (Zoom, Google Meet, or Teams)</label>
                <Input
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Your AI agent will join this link 1-2 minutes after activation.
                </p>
              </div>
            </Card>
          </section>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-slate-50 border-none">
            <h3 className="font-bold mb-4 uppercase text-xs tracking-wider text-muted-foreground">Lead Context</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Company</label>
                <p className="font-semibold">{leadData?.companyName}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Lead ID</label>
                <p className="font-mono text-[10px] break-all">{callData?.leadId}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Analysis ID</label>
                <p className="font-mono text-[10px] break-all">{callData?.analysisId}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Challenges</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {leadData?.challenges?.map((c: string) => (
                    <Badge key={c} variant="secondary" className="text-[10px]">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Button
            onClick={handleActivate}
            disabled={isActivating || !meetingUrl}
            className="w-full h-16 text-lg font-bold shadow-xl shadow-primary/20"
          >
            {isActivating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Activating...
              </>
            ) : (
              "Activate AI Agent"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MeetingAgentSetupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SetupContent />
    </Suspense>
  );
}

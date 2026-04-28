"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookingWidget } from "@/components/BookingWidget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, Info, PhoneCall, Zap } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AnalysisResult } from "@/lib/types";

type ImmediateAvailability = {
  available: boolean;
  message: string;
  activeImmediateCount: number;
  maxImmediateCalls: number;
  estimatedWaitMinutes: number;
};

function BookDemoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const analysisId = searchParams.get("analysisId");
  const skipMode = !analysisId;

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skipAiAgent, setSkipAiAgent] = useState(true);
  const [meetingType, setMeetingType] = useState<"calendly" | "cal" | "other">("cal");
  const [customMeetingUrl, setCustomMeetingUrl] = useState("");
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);
  const [isStartingImmediateCall, setIsStartingImmediateCall] = useState(false);
  const [availability, setAvailability] = useState<ImmediateAvailability | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(true);
  const [directCompanyName, setDirectCompanyName] = useState("");
  const [directName, setDirectName] = useState("");
  const [directEmail, setDirectEmail] = useState("");

  useEffect(() => {
    if (!analysisId) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const res = await fetch(`/api/analysis/${analysisId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch analysis");
        setAnalysis(data);
        
        const leadRes = await fetch(`/api/leads/${data.leadId}`);
        const leadData = await leadRes.json();
        if (!leadRes.ok) throw new Error(leadData.error || "Failed to fetch lead");
        setLead(leadData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [analysisId, router]);

  useEffect(() => {
    let mounted = true;

    async function fetchAvailability() {
      try {
        if (mounted) setCheckingAvailability(true);
        const res = await fetch("/api/calls/availability", { cache: "no-store" });
        const data = await res.json();
        if (mounted && res.ok && data.success) {
          setAvailability({
            available: !!data.available,
            message: data.message || "",
            activeImmediateCount: Number(data.activeImmediateCount || 0),
            maxImmediateCalls: Number(data.maxImmediateCalls || 0),
            estimatedWaitMinutes: Number(data.estimatedWaitMinutes || 0),
          });
        }
      } catch (e) {
        console.error("Availability check failed:", e);
      } finally {
        if (mounted) setCheckingAvailability(false);
      }
    }

    fetchAvailability();
    const interval = setInterval(fetchAvailability, 12000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleCustomMeetingSubmit = async () => {
    if (!customMeetingUrl) return alert("Please enter a meeting URL");
    setIsSubmittingCustom(true);
    try {
      const createLeadIfNeeded = async () => {
        if (analysis?.leadId) return analysis.leadId;
        const leadRes = await fetch("/api/leads/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: directCompanyName.trim() || "Prospect",
            contactName: directName.trim() || "Guest",
            contactEmail: directEmail.trim(),
            contactPhone: "",
            source: "skip_intake_manual_link",
          }),
        });
        const leadData = await leadRes.json().catch(() => ({}));
        if (!leadRes.ok || !leadData?.leadId) {
          throw new Error(leadData?.error || "lead_create_failed");
        }
        return String(leadData.leadId);
      };

      const leadId = await createLeadIfNeeded();
      const res = await fetch("/api/calls/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          analysisId: analysisId || "",
          meetingUrl: customMeetingUrl,
          scheduledAt: new Date().toISOString(),
          guests: ["praneethburada@gmail.com", "praneeth@growstack.ai", "teambproject864@gmail.com"],
        }),
      });
      const data = await res.json();
      if (data.callId) {
        if (skipAiAgent) {
          router.push(`/`);
        } else {
          router.push(`/ai-agent-call?callId=${data.callId}`);
        }
      }
    } catch (err) {
      console.error("Error creating custom call:", err);
      alert("Failed to create call session.");
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  const handleStartImmediateCall = async () => {
    if (!analysisId || !analysis?.leadId) return;
    setIsStartingImmediateCall(true);
    try {
      const res = await fetch("/api/calls/immediate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: analysis.leadId,
          analysisId,
          personaKey: "praneeth_assist",
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || "No immediate slots available right now.");
        return;
      }

      if (skipAiAgent) {
        router.push("/");
      } else {
        router.push(`/ai-agent-call?callId=${data.callId}`);
      }
    } catch (err) {
      console.error("Error starting immediate call:", err);
      alert("Unable to start an immediate call right now. Please try again.");
    } finally {
      setIsStartingImmediateCall(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
        <p className="mt-4 text-muted-foreground">Setting up your demo booking session...</p>
      </div>
    );
  }

  if (skipMode) {
    return (
      <div className="space-y-8">
        <header className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
            <Calendar className="h-3.5 w-3.5" />
            Book directly
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Skip Intake → Book a Demo</h1>
          <p className="text-base text-muted-foreground md:text-lg">
            Pick a time now. You can share details later — confirmation email is still sent.
          </p>
        </header>

        <Card className="border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_12px_60px_rgba(0,0,0,0.35)]">
          <CardHeader>
            <CardTitle className="text-white">Optional prefill</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="directCompany">Company</Label>
              <Input
                id="directCompany"
                value={directCompanyName}
                onChange={(e) => setDirectCompanyName(e.target.value)}
                placeholder="Acme Inc."
                className="bg-black/30 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="directName">Name</Label>
              <Input
                id="directName"
                value={directName}
                onChange={(e) => setDirectName(e.target.value)}
                placeholder="John Doe"
                className="bg-black/30 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="directEmail">Email</Label>
              <Input
                id="directEmail"
                type="email"
                value={directEmail}
                onChange={(e) => setDirectEmail(e.target.value)}
                placeholder="john@acme.com"
                className="bg-black/30 border-white/10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
          <div className="order-2 lg:order-1 space-y-6">
            <Card className="border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_12px_60px_rgba(0,0,0,0.35)]">
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-white">Preferred Booking Tool</h3>
                  <p className="text-xs text-muted-foreground">
                    Select how you&apos;d like to schedule your demo.
                  </p>
                </div>
                <Select value={meetingType} onValueChange={(v: any) => setMeetingType(v)}>
                  <SelectTrigger className="w-full sm:w-[220px] bg-black/40 border-white/10 h-10 px-4">
                    <SelectValue placeholder="Select tool" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                    <SelectItem value="cal" className="cursor-pointer hover:bg-white/5">
                      Cal.com (Default)
                    </SelectItem>
                    <SelectItem value="calendly" className="cursor-pointer hover:bg-white/5">
                      Calendly
                    </SelectItem>
                    <SelectItem value="other" className="cursor-pointer hover:bg-white/5">
                      Other / Manual Link
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
            </Card>

            {meetingType === "other" ? (
              <Card className="border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 flex flex-col items-center justify-center space-y-6 min-h-[340px] shadow-[0_12px_60px_rgba(0,0,0,0.35)]">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-white">Paste your meeting link</h3>
                  <p className="text-sm text-muted-foreground">
                    Use Zoom / Meet / Teams / Cal / Calendly.
                  </p>
                </div>
                <div className="w-full max-w-lg space-y-3">
                  <Input
                    value={customMeetingUrl}
                    onChange={(e) => setCustomMeetingUrl(e.target.value)}
                    placeholder="https://..."
                    className="bg-black/30 border-white/10"
                  />
                  <Button
                    onClick={handleCustomMeetingSubmit}
                    disabled={isSubmittingCustom}
                    className="w-full bg-violet-600 hover:bg-violet-700"
                  >
                    {isSubmittingCustom ? "Creating..." : "Confirm booking"}
                  </Button>
                </div>
              </Card>
            ) : (
              <BookingWidget
                name={directName}
                email={directEmail}
                companyName={directCompanyName}
                skipAiAgent={skipAiAgent}
                forcedMeetingType={meetingType === "calendly" ? "calendly" : "cal"}
              />
            )}
          </div>

          <aside className="order-1 lg:order-2 space-y-6">
            <Card className="border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_12px_60px_rgba(0,0,0,0.35)]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Info className="h-4 w-4 text-violet-400" />
                  Demo preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="skipAiAgent"
                    checked={skipAiAgent}
                    onCheckedChange={(v) => setSkipAiAgent(!!v)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="skipAiAgent" className="text-sm text-white">
                      Skip AI agent session after booking
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      If enabled, you&apos;ll return home after booking.
                    </p>
                  </div>
                </div>

                <Button asChild variant="outline" className="w-full border-white/10 bg-black/30 hover:bg-black/40">
                  <Link href="/">Back to intake</Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    );
  }

  if (error || !analysis || !lead) {
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
    <div className="space-y-8">
      <header className="space-y-3 rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-slate-800/30 p-6 md:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
          <Zap className="h-3.5 w-3.5" />
          Fast Booking Experience
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Book Your Free Demo</h1>
        <p className="text-base text-muted-foreground md:text-lg">
          Pick your preferred path for {lead.companyName}: schedule normally or connect instantly.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
        <div className="order-2 lg:order-1 space-y-6">
          <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent backdrop-blur-sm">
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-emerald-300">Immediate Call</p>
                  <p className="text-xs text-muted-foreground">
                    Start an on-demand call with AI in one click.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {checkingAvailability
                      ? "Checking live availability..."
                      : availability?.message || "Availability unavailable"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      availability?.available
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {availability?.available ? "Available Now" : "Busy"}
                  </span>
                  <Button
                    onClick={handleStartImmediateCall}
                    disabled={
                      checkingAvailability ||
                      !availability?.available ||
                      isStartingImmediateCall
                    }
                    className="h-11 bg-emerald-600 px-5 font-semibold hover:bg-emerald-700"
                  >
                    {isStartingImmediateCall ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <PhoneCall className="mr-2 h-4 w-4" />
                        Start Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-sm p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-white">Preferred Booking Tool</h3>
                <p className="text-xs text-muted-foreground">
                  Select how you&apos;d like to schedule your formal demo.
                </p>
              </div>
              <Select value={meetingType} onValueChange={(v: any) => setMeetingType(v)}>
                <SelectTrigger className="w-full sm:w-[220px] bg-black/40 border-white/10 h-10 px-4">
                  <SelectValue placeholder="Select tool" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                  <SelectItem value="cal" className="cursor-pointer hover:bg-white/5">
                    Cal.com (Default)
                  </SelectItem>
                  <SelectItem value="calendly" className="cursor-pointer hover:bg-white/5">
                    Calendly
                  </SelectItem>
                  <SelectItem value="other" className="cursor-pointer hover:bg-white/5">
                    Other / Manual Link
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {meetingType === "other" ? (
            <Card className="border-white/10 bg-white/5 backdrop-blur-sm p-8 flex flex-col items-center justify-center space-y-6 min-h-[400px]">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-white">Using another tool?</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Book a time using your preferred tool, then paste the meeting link below to connect your AI agent.
                </p>
              </div>
              <div className="w-full max-w-md space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manualUrl" className="text-xs text-muted-foreground">
                    Meeting URL (Zoom, Meet, Teams, etc.)
                  </Label>
                  <Input
                    id="manualUrl"
                    placeholder="https://meet.google.com/abc-def-ghi"
                    value={customMeetingUrl}
                    onChange={(e) => setCustomMeetingUrl(e.target.value)}
                    className="bg-black/40 border-white/10 h-12"
                  />
                </div>
                <Button
                  onClick={handleCustomMeetingSubmit}
                  className="w-full bg-violet-600 hover:bg-violet-700 h-12 text-lg font-semibold"
                  disabled={isSubmittingCustom}
                >
                  {isSubmittingCustom ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect AI Agent & Start"
                  )}
                </Button>
              </div>
            </Card>
          ) : (
            <BookingWidget
              name={lead.contactName}
              email={lead.contactEmail}
              leadId={analysis.leadId || lead.leadId}
              analysisId={analysisId!}
              skipAiAgent={skipAiAgent}
              forcedMeetingType={meetingType}
            />
          )}
        </div>

        <div className="order-1 lg:order-2 space-y-6">
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-violet-300">
                <Info className="h-5 w-5" />
                Call Agenda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {analysis.solutions.slice(0, 3).map((sol, i) => (
                  <div key={i} className="flex gap-3 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-violet-500 mt-1.5" />
                    <p>
                      <span className="text-white font-medium">{sol.solution}:</span> {sol.expectedOutcome}
                    </p>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-white/5 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="skipAi"
                    checked={skipAiAgent}
                    onCheckedChange={(checked) => setSkipAiAgent(checked === true)}
                    className="border-violet-500/50 data-[state=checked]:bg-violet-600"
                  />
                  <Label htmlFor="skipAi" className="text-xs text-muted-foreground cursor-pointer">
                    Skip pre-call AI consultation
                  </Label>
                </div>
                {!skipAiAgent && (
                  <p className="text-xs text-muted-foreground italic">
                    After booking, you&apos;ll be connected to our AI Agent for a pre-call consultation.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-emerald-300">
                <Calendar className="h-5 w-5" />
                Live Demo
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                Your session will be customized based on the {analysis.painPoints.length} pain points identified in our analysis.
              </p>
              <p className="mt-2 text-xs">
                Current queue: {availability?.activeImmediateCount ?? 0}/{availability?.maxImmediateCalls ?? 0} active immediate calls.
                {availability && !availability.available
                  ? ` Estimated wait: ~${availability.estimatedWaitMinutes} min.`
                  : ""}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function BookDemoPage() {
  return (
    <main className="min-h-screen bg-[#0A0F1E] pb-20">
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:pt-24">
        <Suspense fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
          </div>
        }>
          <BookDemoContent />
        </Suspense>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookingWidget } from "@/components/BookingWidget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Clock,
  Users,
  ArrowLeft,
  XCircle,
  ChevronRight,
  Star,
} from "lucide-react";
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
import { GlassPanel } from "@/components/immersive";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type ImmediateAvailability = {
  available: boolean;
  message: string;
  activeImmediateCount: number;
  maxImmediateCalls: number;
  estimatedWaitMinutes: number;
};

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "VP Sales at TechCorp",
    content: "DealFlow AI helped us close 30% more deals in the first quarter. The AI-driven insights are game-changing!",
  },
  {
    name: "Marcus Johnson",
    role: "CEO at GrowthLab",
    content: "The automated meeting summaries save us 20+ hours a week. Our team is now focused on high-value activities.",
  },
];

const BENEFITS = [
  { title: "Interactive Sandbox Tour", desc: "Explore the unified pipeline workspace loaded with live Firestore data." },
  { title: "Custom Agent Demo", desc: "See Memory OS (Hermes) and MEM Palace coordinate in real-time." },
  { title: "Frictionless Integrations", desc: "View live synchronization pathways with Salesforce & HubSpot." },
  { title: "ROI Projection", desc: "Get a tailored savings estimation for your specific sales team." },
  { title: "Security Verification", desc: "Review Clawpatrol compliance vaults and PII redaction rules." }
];

function Section({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

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
  const [availability, setAvailability] = useState<ImmediateAvailability | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(true);
  const [directCompanyName, setDirectCompanyName] = useState("");
  const [directName, setDirectName] = useState("");
  const [directEmail, setDirectEmail] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

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
        setFormSubmitted(true);
        if (skipAiAgent) {
          setTimeout(() => router.push("/"), 2000);
        } else {
          setTimeout(() => router.push(`/meeting-agent/live?callId=${data.callId}`), 2000);
        }
      }
    } catch (err) {
      console.error("Error creating custom call:", err);
      alert("Failed to create call session.");
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Loader2 className="h-16 w-16 animate-spin text-teal-500" />
          <p className="mt-6 text-slate-400 animate-pulse font-medium text-lg">Setting up your demo booking session...</p>
        </motion.div>
      </div>
    );
  }

  if (formSubmitted) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-8 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <CheckCircle2 className="h-24 w-24 text-emerald-500 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Demo Request Confirmed!</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            You&apos;ll receive a calendar invite and confirmation email shortly. Redirecting you to your next step...
          </p>
          <Loader2 className="h-8 w-8 animate-spin text-teal-500 mx-auto" />
        </motion.div>
      </div>
    );
  }

  if (skipMode) {
    return (
      <div className="space-y-12">
        {/* Hero Section */}
        <Section>
          <header className="space-y-6 rounded-3xl border border-white/15 bg-slate-900 p-8 md:p-12 backdrop-blur-md shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-teal-500/8 transition-all duration-700" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/4 rounded-full blur-3xl pointer-events-none" />
            
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-xs font-semibold text-teal-300 uppercase tracking-wider shadow-sm">
              <Calendar className="h-4 w-4" />
              <span>Direct Scheduling</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Schedule Your DealFlow AI Demo
            </h1>
            
            <p className="text-base md:text-lg text-slate-400 max-w-3xl leading-relaxed">
              Discover how our AI-powered GTM engine can transform your sales pipeline. Pick a time that works best for your team — we&apos;ll send a confirmation invite instantly.
            </p>
          </header>
        </Section>

        {/* Trust Signals */}
        <Section delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassPanel material="glass" depth="mid" className="p-6 border-white/8 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-sm text-slate-300 mb-4 italic">
                &quot;DealFlow AI helped us close 30% more deals in the first quarter!&quot;
              </p>
              <div className="text-xs text-slate-500">
                <strong className="text-slate-300">Sarah Chen</strong>
                <div>VP Sales, TechCorp</div>
              </div>
            </GlassPanel>
            <GlassPanel material="glass" depth="mid" className="p-6 border-white/8 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-6 w-6 text-teal-400" />
                <h3 className="text-lg font-bold text-white">Enterprise Security</h3>
              </div>
              <p className="text-sm text-slate-400">SOC 2 compliant, GDPR ready, and PII encrypted</p>
            </GlassPanel>
            <GlassPanel material="glass" depth="mid" className="p-6 border-white/8 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-6 w-6 text-violet-400" />
                <h3 className="text-lg font-bold text-white">Instant Setup</h3>
              </div>
              <p className="text-sm text-slate-400">Book in 30 seconds, get started in minutes</p>
            </GlassPanel>
          </div>
        </Section>

        <div className="grid gap-10 lg:grid-cols-[1fr,380px]">
          <div className="space-y-4">
            {/* Essential Form Fields */}
            <Section delay={0.15}>
              <GlassPanel material="glass" depth="mid" className="p-8 border-white/8 shadow-xl">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 text-teal-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Essential Information
                </h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label htmlFor="directName" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name *</Label>
                    <Input
                      id="directName"
                      value={directName}
                      onChange={(e) => setDirectName(e.target.value)}
                      placeholder="John Doe"
                      className="bg-slate-950/70 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-teal-500/40 h-12 rounded-xl px-4 transition-all focus:border-teal-500/40"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="directEmail" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Work Email *</Label>
                    <Input
                      id="directEmail"
                      type="email"
                      value={directEmail}
                      onChange={(e) => setDirectEmail(e.target.value)}
                      placeholder="john@acme.com"
                      className="bg-slate-950/70 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-teal-500/40 h-12 rounded-xl px-4 transition-all focus:border-teal-500/40"
                      required
                    />
                  </div>
                </div>
              </GlassPanel>
            </Section>

            {/* Scheduling Tool Selection */}
            <GlassPanel material="glass" depth="mid" className="p-8 border-white/8 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Preferred Scheduling Tool</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select Cal.com or Calendly to view instant calendar slots.
                </p>
              </div>
              <Select value={meetingType} onValueChange={(v: any) => setMeetingType(v)}>
                <SelectTrigger className="w-full md:w-[260px] bg-slate-950 border-white/10 text-white h-12 px-5 rounded-xl transition-all focus:border-teal-500/40" aria-label="Select scheduling platform">
                  <SelectValue placeholder="Select tool" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a1f] border-white/10 text-white rounded-xl shadow-2xl backdrop-blur-xl">
                  <SelectItem value="cal" className="cursor-pointer hover:bg-white/5 text-sm py-3">
                    Cal.com (Default)
                  </SelectItem>
                  <SelectItem value="calendly" className="cursor-pointer hover:bg-white/5 text-sm py-3">
                    Calendly
                  </SelectItem>
                  <SelectItem value="other" className="cursor-pointer hover:bg-white/5 text-sm py-3">
                    Other / Manual Link
                  </SelectItem>
                </SelectContent>
              </Select>
            </GlassPanel>

            {meetingType === "other" ? (
              <GlassPanel material="glass" depth="mid" className="p-10 border-white/8 shadow-xl flex flex-col items-center justify-center space-y-8 min-h-[420px]">
                <div className="text-center space-y-3 max-w-lg">
                  <h3 className="text-xl font-bold text-white">Paste your custom meeting link</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Paste a Zoom, Google Meet, Microsoft Teams, Cal, or Calendly slot link below to trigger automated agent workflows.
                  </p>
                </div>
                <div className="w-full max-w-xl space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="customUrl" className="text-xs font-bold text-slate-400 uppercase tracking-widest">Meeting URL</Label>
                    <Input
                      id="customUrl"
                      value={customMeetingUrl}
                      onChange={(e) => setCustomMeetingUrl(e.target.value)}
                      placeholder="https://meet.google.com/abc-def-ghi"
                      className="bg-slate-950/70 border-white/10 text-white h-13 rounded-xl px-4 text-sm transition-all focus:border-teal-500/40"
                    />
                  </div>
                  <Button
                    onClick={handleCustomMeetingSubmit}
                    disabled={isSubmittingCustom}
                    className="w-full h-13 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-semibold text-sm uppercase tracking-wider transition-all shadow-xl shadow-teal-500/25 hover:shadow-teal-400/35 hover:-translate-y-0.5"
                  >
                    {isSubmittingCustom ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        Confirm Custom Booking
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </GlassPanel>
            ) : (
              <div className="bg-slate-900 border border-white/15 rounded-2xl overflow-hidden shadow-2xl p-3 min-h-[620px]">
                <BookingWidget
                  name={directName}
                  email={directEmail}
                  companyName={directCompanyName}
                  skipAiAgent={skipAiAgent}
                  forcedMeetingType={meetingType === "calendly" ? "calendly" : "cal"}
                />
              </div>
            )}
          </div>

          <aside className="space-y-8">
            {/* Benefits */}
            <Section delay={0.3}>
              <GlassPanel material="glass" depth="mid" className="p-8 border-white/8 shadow-xl space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest text-indigo-300 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  What to Expect
                </h3>
                <ul className="space-y-5">
                  {BENEFITS.map((benefit, i) => (
                    <li key={i} className="flex gap-4">
                      <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-teal-400" />
                      <div className="space-y-1">
                        <strong className="text-white block text-sm">{benefit.title}</strong>
                        <span className="text-xs text-slate-400 leading-relaxed">{benefit.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </GlassPanel>
            </Section>

            {/* Session Settings */}
            <Section delay={0.4}>
              <GlassPanel material="glass" depth="mid" className="p-8 border-white/8 shadow-xl space-y-7">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest text-teal-300 flex items-center gap-2">
                  <Clock className="h-5 w-5 shrink-0" />
                  Session Settings
                </h3>
                
                <div className="space-y-5 border-t border-white/5 pt-5">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      id="skipAiAgent"
                      checked={skipAiAgent}
                      onCheckedChange={(v) => setSkipAiAgent(!!v)}
                      className="border-teal-500/50 data-[state=checked]:bg-teal-600 mt-1 h-5 w-5"
                    />
                    <div className="space-y-1.5">
                      <Label htmlFor="skipAiAgent" className="text-sm text-white font-semibold cursor-pointer">
                        Skip pre-call AI agent consult
                      </Label>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        If enabled, you will bypass the interactive meeting agent simulator and return to the main dashboard after booking.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-5 border-t border-white/5">
                  <Link href="/">
                    <Button variant="outline" className="w-full border-white/10 bg-white/3 hover:bg-white/5 text-white h-12 rounded-xl text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5">
                      <ArrowLeft className="h-4.5 w-4.5" />
                      Back to Intake
                    </Button>
                  </Link>
                </div>
              </GlassPanel>
            </Section>
          </aside>
        </div>
      </div>
    );
  }

  if (error || !analysis || !lead) {
    return (
      <div className="mx-auto max-w-2xl py-24 text-center space-y-8">
        <XCircle className="h-20 w-20 text-rose-500 mx-auto" />
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-white">Something went wrong</h2>
          <p className="text-slate-400 text-lg">{error || "The requested analysis details could not be found."}</p>
        </div>
        <Link href="/">
          <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white px-10 h-12 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5">
            Back to Intake
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <Section>
        <header className="space-y-6 rounded-3xl border border-white/15 bg-slate-900 p-8 md:p-12 backdrop-blur-md shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-teal-500/8 transition-all duration-700" />
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-xs font-semibold text-teal-300 uppercase tracking-wider">
            <Zap className="h-4 w-4 text-teal-400 animate-pulse" />
            <span>Frictionless Booking Active</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Book Your Custom Demo
          </h1>
          <p className="text-base md:text-lg text-slate-400 max-w-3xl leading-relaxed">
            Configure a tailored demo walkthrough for <strong className="text-white">{lead.companyName}</strong>. Our system has automatically mapped your GTM vulnerabilities.
          </p>
        </header>
      </Section>

      <div className="grid gap-10 lg:grid-cols-[1fr,380px]">
        <div className="space-y-4">
          <GlassPanel material="glass" depth="mid" className="p-8 border-white/8 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Preferred Scheduling Tool</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Select Cal.com or Calendly to view instant calendar slots.
              </p>
            </div>
            <Select value={meetingType} onValueChange={(v: any) => setMeetingType(v)}>
              <SelectTrigger className="w-full md:w-[260px] bg-slate-950 border-white/10 text-white h-12 px-5 rounded-xl transition-all focus:border-teal-500/40" aria-label="Select scheduling platform">
                <SelectValue placeholder="Select tool" />
              </SelectTrigger>
              <SelectContent className="bg-[#0a0a1f] border-white/10 text-white rounded-xl shadow-2xl backdrop-blur-xl">
                <SelectItem value="cal" className="cursor-pointer hover:bg-white/5 text-sm py-3">
                  Cal.com (Default)
                </SelectItem>
                <SelectItem value="calendly" className="cursor-pointer hover:bg-white/5 text-sm py-3">
                  Calendly
                </SelectItem>
                <SelectItem value="other" className="cursor-pointer hover:bg-white/5 text-sm py-3">
                  Other / Manual Link
                </SelectItem>
              </SelectContent>
            </Select>
          </GlassPanel>

          {meetingType === "other" ? (
            <GlassPanel material="glass" depth="mid" className="p-10 border-white/8 shadow-xl flex flex-col items-center justify-center space-y-8 min-h-[440px]">
              <div className="text-center space-y-3 max-w-lg">
                <h3 className="text-xl font-bold text-white">Using another calendar platform?</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Book a time directly using your tool, then paste the meeting link below to synchronize our conversational AI agents.
                </p>
              </div>
              <div className="w-full max-w-xl space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="manualUrl" className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Meeting URL (Zoom, Meet, Teams, etc.)
                  </Label>
                  <Input
                    id="manualUrl"
                    placeholder="https://meet.google.com/abc-def-ghi"
                    value={customMeetingUrl}
                    onChange={(e) => setCustomMeetingUrl(e.target.value)}
                    className="bg-slate-950/70 border-white/10 text-white h-13 rounded-xl px-4 text-sm transition-all focus:border-teal-500/40"
                  />
                </div>
                <Button
                  onClick={handleCustomMeetingSubmit}
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 h-13 text-sm font-semibold uppercase tracking-wider rounded-xl shadow-xl shadow-teal-500/25 hover:shadow-teal-400/35 transition-all hover:-translate-y-0.5"
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
            </GlassPanel>
          ) : (
            <div className="bg-slate-900 border border-white/15 rounded-2xl overflow-hidden shadow-2xl p-3 min-h-[620px]">
              <BookingWidget
                name={lead.contactName}
                email={lead.contactEmail}
                leadId={analysis.leadId || lead.leadId}
                analysisId={analysisId!}
                skipAiAgent={skipAiAgent}
                forcedMeetingType={meetingType}
              />
            </div>
          )}
        </div>

        <aside className="space-y-8">
          <Section delay={0.2}>
            <GlassPanel material="glass" depth="mid" className="p-8 border-white/8 shadow-xl space-y-7">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest text-teal-300 flex items-center gap-2">
                <Users className="h-5 w-5 shrink-0" />
                Call Agenda Details
              </h3>
              
              <div className="space-y-3 border-t border-white/5 pt-5">
                {(analysis.marketDifferentiationTriggers || []).slice(0, 3).map((trigger, i) => (
                  <div key={i} className="flex gap-3 text-xs text-slate-400">
                    <div className="h-2 w-2 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                    <p className="leading-relaxed">{trigger}</p>
                  </div>
                ))}
              </div>

              <div className="pt-5 border-t border-white/5 space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="skipAi"
                    checked={skipAiAgent}
                    onCheckedChange={(checked) => setSkipAiAgent(checked === true)}
                    className="border-teal-500/50 data-[state=checked]:bg-teal-600 mt-0.5 h-5 w-5"
                  />
                  <Label htmlFor="skipAi" className="text-xs font-semibold text-slate-300 cursor-pointer">
                    Skip pre-call AI consultation
                  </Label>
                </div>
                {!skipAiAgent && (
                  <p className="text-[11px] text-slate-500 italic leading-relaxed">
                    After scheduling, you will immediately be redirected to our interactive conversational simulator for briefing.
                  </p>
                )}
              </div>
            </GlassPanel>
          </Section>

          <Section delay={0.3}>
            <GlassPanel material="glass" depth="mid" className="p-8 border-white/8 shadow-xl space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest text-indigo-300 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                GTM Diagnostics
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your demo workspace is initialized with website scan telemetry.
              </p>
              <div className="bg-slate-900 border border-white/15 rounded-xl p-4 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-widest">Health Index</span>
                <span className="text-emerald-400 font-extrabold text-lg">{analysis.healthScore} / 100</span>
              </div>
              
              <div className="text-[11px] text-slate-500 space-y-1.5">
                <div>Active connections in queue: {availability?.activeImmediateCount ?? 0} / {availability?.maxImmediateCalls ?? 0}</div>
                {availability && !availability.available && (
                  <div className="text-amber-400 font-medium">Estimated wait limit: ~{availability.estimatedWaitMinutes} minutes.</div>
                )}
              </div>
            </GlassPanel>
          </Section>
        </aside>
      </div>
    </div>
  );
}

export default function BookDemoPage() {
  return (
    <main className="min-h-screen bg-dealflow-ink pb-20">
      <div className="mx-auto max-w-7xl px-6 pt-24 md:pt-32">
        <Suspense fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Loader2 className="h-14 w-14 animate-spin text-teal-500" />
            </motion.div>
          </div>
        }>
          <BookDemoContent />
        </Suspense>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadLeadContext, StoredLeadContext } from "@/lib/lead-context";
import { BookingWidget } from "@/components/BookingWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Download, WifiOff, Loader2, CheckCircle2, FileText, Users, TrendingUp, Target, 
  Shield, Check, ChevronRight, PieChart, X, ZoomIn, ZoomOut, ChevronLeft, 
  AlertCircle, ExternalLink 
} from "lucide-react";
import {
  IconAlertObjection,
  IconCheckCircle,
  IconRefreshPipeline,
  IconArrowLeft,
  IconArrowRight,
} from "@/components/gtm/GtmIcons";
import { type AnalysisResult, getRevenueAgentCatalog } from "@/lib/types";
import { getLeadOffline, saveLeadOffline } from "@/lib/offlineStore";
import { GlassPanel } from "@/components/immersive";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

// Mock data generator for offline mode
function generateMockCompleteGTM(companyName: string): AnalysisResult {
  return {
    executiveSummary: `${companyName} has strong potential for growth with a B2B SaaS offering. The GTM analysis identifies key segments, channels, and messaging strategies to accelerate pipeline and close rates.`,
    icpDefinition: {
      inclusionCriteria: [
        "B2B SaaS companies with 10-250 employees",
        "Revenue of $500k to $50M ARR",
        "Uses Salesforce or HubSpot CRM",
        "Located in North America or Europe",
        "Has existing outbound sales motion"
      ],
      exclusionCriteria: [
        "B2C companies",
        "Early-stage pre-revenue startups",
        "Enterprise companies >1000 employees requiring custom onboarding"
      ]
    },
    table1FirmographicDemographic: [
      { priorityTier: "Tier 1", industryVertical: "SalesTech/MarTech", companySize: "25-100 employees", arrRange: "$2M-$20M", location: "United States (West/Northeast)", keyDecisionMakerDemographics: "VP Sales, 35-50yo, data-driven", notes: "Highest conversion, fastest sales cycles" },
      { priorityTier: "Tier 2", industryVertical: "FinTech B2B SaaS", companySize: "50-150 employees", arrRange: "$5M-$50M", location: "US/EU", keyDecisionMakerDemographics: "CRO/Director of Sales", notes: "High ACV, higher retention" }
    ],
    behavioralPsychographicTraits: {
      observableBehavioralPatterns: ["Downloads sales automation content", "Attends GTM webinars", "Active on LinkedIn Sales", "Uses multiple SaaS tools"],
      corePsychographicAttributes: ["Data-driven decision making", "Risk-tolerant for ROI-positive tools", "Innovation-focused"]
    },
    table2PainPointAnalysis: [
      { painPoint: "Manual lead qualification takes too long", severity: "Critical", businessImpact: "30% wasted sales time, $40k/year cost per rep", rootCause: "No AI-assisted scoring", dealFlowAISolution: "AI Lead Analysis + ICP Matching" },
      { painPoint: "No visibility into meeting quality", severity: "High", businessImpact: "10% lower close rate", rootCause: "No systematic call analysis", dealFlowAISolution: "Meeting Summaries + Sentiment Analysis" }
    ],
    table3DecisionMakerInfluence: [
      { role: "VP Sales / CRO", influenceScore: "10", coreDecisionRole: "Economic Buyer", top3Priorities: "Hit quota, increase pipeline, prove ROI", dealFlowAIMessagingFocus: "ROI case studies, enterprise pricing" },
      { role: "Sales Ops Manager", influenceScore: "8", coreDecisionRole: "Gatekeeper + Champion", top3Priorities: "Process efficiency, adoption metrics", dealFlowAIMessagingFocus: "Implementation guides, integration docs" }
    ],
    purchasingJourneyMapping: [
      { stage: "Awareness", duration: "Week 1-2", customerActions: "Reads content, attends webinars", customerNeedsQuestions: "What problems can AI solve?", channelPreferences: "LinkedIn, Google Search", dealFlowAIAssetsEngagement: "SEO content, thought leadership" },
      { stage: "Consideration", duration: "Week 2-4", customerActions: "Downloads assets, requests demo", customerNeedsQuestions: "Does this integrate with my stack?", channelPreferences: "Website, G2/Capterra", dealFlowAIAssetsEngagement: "Personalized demo, case studies" }
    ],
    table4LeadScoringFramework: {
      criteria: [
        { category: "Firmographics", criterion: "B2B SaaS Industry", points: "15" },
        { category: "Firmographics", criterion: "Uses Salesforce/HubSpot", points: "10" }
      ],
      qualificationThresholds: { mql: "40 points", sql: "70 points", sal: "80+ points" }
    },
    table5ChannelEffectiveness: [
      { channel: "LinkedIn Outbound", icpSegmentsBestFor: "All Tiers", monthlyLeadVolume: "120", conversionRate: "8.5%", costPerAcquisition: "$1,200", ltvToCacRatio: "12:1", budgetAllocation: "35%", optimizationRecommendations: "Focus on VP Sales roles" },
      { channel: "Paid Search", icpSegmentsBestFor: "Tiers 1-3", monthlyLeadVolume: "80", conversionRate: "5.2%", costPerAcquisition: "$1,800", ltvToCacRatio: "8:1", budgetAllocation: "25%", optimizationRecommendations: "High-intent keywords only" }
    ],
    crossTeamAlignmentGuidelines: {
      raciFramework: [],
      communicationCadenceSlas: [],
      sharedSLAs: ["MQL to SDR assignment: <24h", "Hot lead follow-up: <15m"]
    },
    icpValidationChecklist: {
      preQualificationChecklist: ["B2B SaaS?", "10-250 employees?", "CRM in use?"],
      quarterlyValidationReview: ["Review ICP performance", "Collect team feedback", "Check market shifts"],
      dataSourcesForValidation: ["CRM data", "Product analytics", "Win/loss interviews"],
      icpUpdateTriggers: ["Close rate drops", "Market shifts", "Product launches"]
    }
  };
}

export function LeadAnalysisDashboard({ leadId }: { leadId?: string }) {
  const [context, setContext] = useState<StoredLeadContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [showICPDocument, setShowICPDocument] = useState(false);
  const [isOfflineData, setIsOfflineData] = useState(false);

  // Download states
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Document viewer states
  const [showViewer, setShowViewer] = useState(false);
  const [zoom, setZoom] = useState(100);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Agent Assignment & Onboarding States
  const [assignedAgent, setAssignedAgent] = useState<any | null>(null);
  const [selectedAgentKey, setSelectedAgentKey] = useState<string | null>(null);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [postSubmissionStep, setPostSubmissionStep] = useState<number | null>(null);
  const [isSubmittingAgent, setIsSubmittingAgent] = useState(false);
  const [isSubmittingCreds, setIsSubmittingCreds] = useState(false);

  // Regenerate state
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    async function fetchAssignment() {
      if (leadId) {
        try {
          const res = await fetch(`/api/agent-assignments?leadId=${leadId}`);
          const data = await res.json();
          if (data.success && data.assignments?.length > 0) {
            setAssignedAgent(data.assignments[0]);
            setPostSubmissionStep(null);
          } else {
            setPostSubmissionStep(0);
          }
        } catch (e) {
          console.error(e);
          setPostSubmissionStep(0);
        }
      } else {
        setPostSubmissionStep(0);
      }
    }

    async function runAnalysis(forceRegenerate = false) {
      if (forceRegenerate) {
        setRegenerating(true);
        setLoading(true);
        setError(null);
      }
      
      try {
        const stored = loadLeadContext();
        setContext(stored);

        let companyData = stored?.form;
        let cachedLead = null;

        if (leadId && !forceRegenerate) {
          cachedLead = await getLeadOffline(leadId);
          if (cachedLead?.readout) {
            setAnalysis(cachedLead.readout);
            setIsOfflineData(!cachedLead.synced);
            const emailVal = companyData?.emailPersonal || companyData?.contactEmail || "";
            setCredentials(c => ({ ...c, email: emailVal }));
            await fetchAssignment();
            setLoading(false);
            return;
          }
        }

        if (!companyData && !leadId) {
          setError("No lead data found.");
          setLoading(false);
          return;
        }

        const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
        if (!isOnline) throw new Error("offline");

        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId, companyData, regenerate: forceRegenerate })
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Analysis failed");
        
        setAnalysis(data);
        if (leadId) await saveLeadOffline(leadId, companyData as any, data, true);

        const emailVal = companyData?.emailPersonal || companyData?.contactEmail || "";
        setCredentials(c => ({ ...c, email: emailVal }));
        await fetchAssignment();
      } catch (err) {
        console.warn("Using mock offline data", err);
        let fallbackData = loadLeadContext()?.form;
        if (leadId) {
          const cached = await getLeadOffline(leadId);
          if (cached?.data) fallbackData = cached.data as any;
        }
        
        if (fallbackData) {
          const mockData = generateMockCompleteGTM(fallbackData.companyName || "Company");
          setAnalysis(mockData);
          setIsOfflineData(true);
          if (leadId) await saveLeadOffline(leadId, fallbackData as any, mockData, false);
          const emailVal = fallbackData?.emailPersonal || fallbackData?.contactEmail || "";
          setCredentials(c => ({ ...c, email: emailVal }));
          await fetchAssignment();
        } else {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        setLoading(false);
        setRegenerating(false);
      }
    }

    runAnalysis();

    // Attach regenerate to window for easy access
    (window as any).regenerateAnalysis = () => runAnalysis(true);
  }, [leadId]);

  // Enhanced download with multiple options
  const handleDownloadMarkdown = async () => {
    setDownloading(true);
    setDownloadProgress(0);
    setDownloadError(null);
    setDownloadSuccess(false);

    try {
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setDownloadProgress(i);
      }

      // Generate the document
      const docContent = generateFullMarkdownReport(analysis, context);
      const blob = new Blob([docContent], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${analysis?.companyName || "company"}-gtm-analysis.md`;
      a.click();
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "Download failed. Please try again.");
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const handleDownloadHtml = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${analysis?.companyName || "Company"} - GTM Analysis</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 1000px; margin: 40px auto; padding: 20px; color: #0f172a; line-height: 1.6; }
            h1 { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; }
            h2 { margin-top: 32px; margin-bottom: 16px; color: #1e293b; }
            h3 { margin-top: 24px; margin-bottom: 12px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
            th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; }
            .journey-stage { margin: 24px 0; padding: 20px; background: #f8fafc; border-radius: 8px; }
          </style>
        </head>
        <body>
          ${renderMarkdownToHtml(analysis, context)}
        </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis?.companyName || "company"}-gtm-analysis.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${analysis?.companyName || "Company"} - GTM Analysis</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 8.5in; margin: 0 auto; padding: 20px; color: #0f172a; }
              h1 { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; }
              table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
              th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; }
              th { background: #f8fafc; }
              @media print { body { max-width: 100%; } }
            </style>
          </head>
          <body>
            ${renderMarkdownToHtml(analysis, context)}
          </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4" role="status" aria-live="polite">
        <IconRefreshPipeline className="h-10 w-10 animate-spin text-teal-400" aria-hidden="true" />
        <p className="text-lg font-medium text-slate-300">Generating Complete GTM AI Analysis...</p>
        <p className="text-sm text-slate-500">Scraping website and building your 11-section playbook</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center space-y-4" role="alert" aria-live="assertive">
        <IconAlertObjection className="mx-auto h-10 w-10 text-red-400" aria-hidden="true" />
        <div>
          <h3 className="text-lg font-bold text-red-300 mb-2">Analysis Failed</h3>
          <p className="text-red-200/80">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/30 transition-colors"
          aria-label="Retry analysis"
        >
          <IconRefreshPipeline className="h-4 w-4" aria-hidden="true" />
          Try Again
        </button>
      </div>
    );
  }

  if (!analysis) return null;

  // Determine whether we have new-style complete analysis
  const hasCompleteGTM = !!analysis.executiveSummary;

  return (
    <div className="space-y-12">
      {isOfflineData && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/60 backdrop-blur-md p-4 text-amber-200 text-sm flex items-center gap-3" role="status" aria-live="polite">
          <WifiOff className="w-5 h-5 flex-shrink-0 text-amber-400 animate-pulse" aria-hidden="true" />
          <div>
            <strong>Viewing Offline Analysis Report</strong> — This GTM readout was generated locally from cache because you are currently offline. It will synchronize with our AI pipeline automatically once you are back online.
          </div>
        </div>
      )}

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="space-y-8">
          {/* Header & Action Controls */}
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white mb-2" id="analysis-title">
                GTM AI Analysis <span className="text-teal-400">Playbook</span>
              </h1>
              <p className="text-lg text-slate-400" aria-describedby="analysis-title">
                Complete 11-section analysis for {analysis.companyName || "your company"}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  // Call the regenerate function we attached to window
                  const win = window as any;
                  if (win.regenerateAnalysis) win.regenerateAnalysis();
                }}
                disabled={loading || regenerating}
                className="bg-orange-600 hover:bg-orange-700 text-white"
                aria-label="Regenerate analysis"
              >
                {regenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <IconRefreshPipeline className="w-4 h-4 mr-2" aria-hidden="true" />
                    Regenerate Analysis
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowViewer(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                aria-label="View analysis document in viewer"
              >
                <FileText className="w-4 h-4 mr-2" aria-hidden="true" />
                View Document
              </Button>
              <Button
                onClick={handlePrint}
                className="bg-slate-700 hover:bg-slate-600 text-white"
                aria-label="Print or save as PDF"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print/PDF
              </Button>
              <Button
                onClick={handleDownloadHtml}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                aria-label="Download as HTML"
              >
                <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                HTML
              </Button>
              <Button
                onClick={handleDownloadMarkdown}
                disabled={downloading}
                className="bg-teal-600 hover:bg-teal-700 text-white"
                aria-live="polite"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    Downloading... {downloadProgress}%
                  </>
                ) : downloadSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" aria-hidden="true" />
                    Downloaded!
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                    Markdown
                  </>
                )}
              </Button>
            </div>
          </div>

        {/* Download Progress/Error */}
        <AnimatePresence>
          {downloading && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-slate-900/50 border border-slate-700 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 text-sm">Preparing download...</span>
                <span className="text-teal-400 font-semibold">{downloadProgress}%</span>
              </div>
              <Progress value={downloadProgress} className="h-2" aria-hidden="true" />
            </motion.div>
          )}
          {downloadError && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 flex items-start gap-3"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-300">Download Failed</h4>
                <p className="text-red-200/80 text-sm">{downloadError}</p>
                <Button
                  onClick={handleDownloadMarkdown}
                  className="mt-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
                >
                  Retry Download
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {hasCompleteGTM ? (
          <CompleteGTMDisplay analysis={analysis} />
        ) : (
          <LegacyGTMDisplay analysis={analysis} />
        )}

        {/* Agent Section */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.3 }} className="mt-16 pt-16 border-t border-white/10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold text-white mb-4" id="agent-section-title">Autonomous AI Revenue Agents</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto" aria-describedby="agent-section-title">Assign an AI agent to execute your GTM plan.</p>
          </div>
          <div className="mx-auto max-w-4xl">
            {postSubmissionStep ===0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-teal-300/90">Step 1/2</span>
                    <h3 className="text-lg font-bold text-white">Select your agent</h3>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getRevenueAgentCatalog().map(agent => (
                    <GlassPanel key={agent.key} tilt={false} onClick={() => setSelectedAgentKey(agent.key)}
                      className={`border-slate-700/50 cursor-pointer transition-all ${selectedAgentKey===agent.key ? "border-teal-500/70 bg-teal-500/10 shadow-lg shadow-teal-500/20" : "hover:border-teal-500/30 hover:bg-white/[0.02]" }`}
                    >
                      <div className="flex items-center gap-4 p-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-600 to-purple-600 flex items-center justify-center shrink-0">
                          <span className="text-white font-bold text-lg">{agent.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="text-lg font-semibold text-white">{agent.name}</h4>
                          <p className="text-xs text-slate-400 mt-1">{agent.expertise.join(", ")}</p>
                        </div>
                        {selectedAgentKey===agent.key && <CheckCircle2 className="w-6 h-6 text-teal-400" aria-hidden="true" />}
                      </div>
                    </GlassPanel>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button disabled={!selectedAgentKey || isSubmittingAgent} onClick={async () => {
                    if (!leadId) return;
                    setIsSubmittingAgent(true);
                    try {
                      const res = await fetch("/api/agent-assignments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId, agentKey: selectedAgentKey }) });
                      const data = await res.json();
                      if (data.success) { setAssignedAgent(data.assignment); setPostSubmissionStep(1); }
                    } catch (e) { console.error(e); } finally { setIsSubmittingAgent(false); }
                  }} className="bg-gradient-to-r from-teal-600 to-teal-500">
                    {isSubmittingAgent ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" /> Assigning...</> : <>Continue <IconArrowRight className="w-4 h-4 ml-2" aria-hidden="true" /></>}
                  </Button>
                </div>
              </div>
            )}

            {postSubmissionStep ===1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <div><span className="text-xs font-semibold uppercase tracking-wider text-teal-300/90">Step 2/2</span><h3 className="text-lg font-bold text-white">Create your account</h3></div>
                </div>
                <GlassPanel tilt={false} className="border-slate-700/50 p-6 text-left">
                  <div className="space-y-4">
                    <div className="space-y-2"><Label htmlFor="creds-email">Email Address</Label><Input id="creds-email" type="email" value={credentials.email} onChange={e => setCredentials({ ...credentials, email: e.target.value })} className="bg-black/20 border-white/10 text-white" placeholder="you@company.com" /></div>
                    <div className="space-y-2"><Label htmlFor="creds-password">Password</Label><Input id="creds-password" type="password" value={credentials.password} onChange={e => setCredentials({ ...credentials, password: e.target.value })} className="bg-black/20 border-white/10 text-white" placeholder="Create a password" /></div>
                  </div>
                </GlassPanel>
                <div className="flex justify-between gap-4">
                  <Button variant="outline" onClick={() => setPostSubmissionStep(0)} className="border-white/10 bg-white/5"><IconArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" /> Back</Button>
                  <Button disabled={!credentials.email || !credentials.password || isSubmittingCreds} onClick={async () => {
                    if (!leadId) return;
                    setIsSubmittingCreds(true);
                    try { await fetch("/api/customer-credentials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId, email: credentials.email, password: credentials.password }) }); setPostSubmissionStep(null); } catch (e) { console.error(e); } finally { setIsSubmittingCreds(false); }
                  }} className="bg-gradient-to-r from-teal-600 to-teal-500">
                    {isSubmittingCreds ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" /> Creating...</> : <>Complete Setup & Launch <IconArrowRight className="w-4 h-4 ml-2" aria-hidden="true" /></>}
                  </Button>
                </div>
              </div>
            )}

            {postSubmissionStep === null && assignedAgent && (
              <GlassPanel tilt={false} className="border-slate-700/50 p-6 text-left">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">{assignedAgent.agentName.charAt(0)}</span>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold uppercase tracking-wider border border-teal-500/20">Active Agent</span>
                      <h3 className="text-xl font-bold text-white">{assignedAgent.agentName}</h3>
                    </div>
                  </div>
                  <div className="bg-teal-500/5 border border-teal-500/10 rounded-xl p-4">
                    <p className="font-semibold text-teal-400 mb-1">Status: Active</p>
                    <p className="text-sm text-slate-300">Your AI agent is assigned and ready to execute your GTM plan.</p>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Link href="/portal/customer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-semibold transition-all duration-300 shadow-md shadow-teal-500/20 hover:shadow-teal-400/30 hover:-translate-y-0.5">
                      Go to Customer Portal <IconArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </GlassPanel>
            )}
          </div>
        </motion.div>

        {/* Booking Widget Section */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }} className="mt-16 pt-16 border-t border-white/10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold text-white mb-4" id="booking-title">Let&apos;s Fix Your Pipeline</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto" aria-describedby="booking-title">Book a strategy call to review this AI GTM analysis.</p>
          </div>
          <BookingWidget
            name={context?.form?.contactName || ""}
            email={context?.form?.contactEmail || ""}
            companyName={analysis.companyName || ""}
            leadId={leadId}
            analysisId={analysis.analysisId}
            contactPhone={context?.form?.contactPhone || ""}
            challengeTags={context?.form?.challenges || []}
          />
        </motion.div>
      </motion.div>

      {/* Document Viewer Modal */}
      <AnimatePresence>
        {showViewer && (
          <DocumentViewer
            analysis={analysis}
            context={context}
            zoom={zoom}
            setZoom={setZoom}
            onClose={() => setShowViewer(false)}
            scrollRef={scrollRef}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Full Markdown report generator
function generateFullMarkdownReport(analysis: AnalysisResult | null, context: StoredLeadContext | null): string {
  if (!analysis) return "";

  let md = `# ${analysis.companyName || "Company"} - GTM Analysis Playbook\n\n`;
  
  if (analysis.executiveSummary) md += `## 1. Executive Summary\n\n${analysis.executiveSummary}\n\n`;
  if (analysis.icpDefinition) {
    md += `## 2. ICP Definition\n\n### Inclusion Criteria\n\n${analysis.icpDefinition.inclusionCriteria.map(i => `- ${i}`).join("\n")}\n\n### Exclusion Criteria\n\n${analysis.icpDefinition.exclusionCriteria.map(e => `- ${e}`).join("\n")}\n\n`;
  }

  // Table 1
  if (analysis.table1FirmographicDemographic?.length) {
    md += `## 3. Table 1: Firmographic & Demographic Segmentation\n\n`;
    md += `| Priority Tier | Industry | Company Size | ARR Range | Location | Notes |\n`;
    md += `|---------------|----------|--------------|-----------|----------|-------|\n`;
    for (let entry of analysis.table1FirmographicDemographic) {
      md += `| ${entry.priorityTier} | ${entry.industryVertical} | ${entry.companySize} | ${entry.arrRange} | ${entry.location} | ${entry.notes} |\n`;
    }
    md += `\n`;
  }

  if (analysis.behavioralPsychographicTraits) {
    md += `## 4. Behavioral & Psychographic Traits\n\n`;
    md += `### Observable Behavioral Patterns\n\n${analysis.behavioralPsychographicTraits.observableBehavioralPatterns.map(b => `- ${b}`).join("\n")}\n\n`;
    md += `### Core Psychographic Attributes\n\n${analysis.behavioralPsychographicTraits.corePsychographicAttributes.map(b => `- ${b}`).join("\n")}\n\n`;
  }

  // Table 2
  if (analysis.table2PainPointAnalysis?.length) {
    md += `## 5. Table 2: Pain Point Analysis\n\n`;
    md += `| Pain Point | Severity | Business Impact | Root Cause | DealFlow Solution |\n`;
    md += `|------------|----------|-----------------|------------|-------------------|\n`;
    for (let entry of analysis.table2PainPointAnalysis) {
      md += `| ${entry.painPoint} | ${entry.severity} | ${entry.businessImpact} | ${entry.rootCause} | ${entry.dealFlowAISolution} |\n`;
    }
    md += `\n`;
  }

  // Table 3
  if (analysis.table3DecisionMakerInfluence?.length) {
    md += `## 6. Table 3: Decision-Maker Influence Matrix\n\n`;
    md += `| Role | Influence Score | Core Role | Top 3 Priorities |\n`;
    md += `|------|-----------------|-----------|------------------|\n`;
    for (let entry of analysis.table3DecisionMakerInfluence) {
      md += `| ${entry.role} | ${entry.influenceScore} | ${entry.coreDecisionRole} | ${entry.top3Priorities} |\n`;
    }
    md += `\n`;
  }

  // Purchasing Journey
  if (analysis.purchasingJourneyMapping?.length) {
    md += `## 7. Purchasing Journey Mapping\n\n`;
    for (let stage of analysis.purchasingJourneyMapping) {
      md += `### ${stage.stage} (${stage.duration})\n\n`;
      md += `- **Customer Actions**: ${stage.customerActions}\n`;
      md += `- **Customer Needs**: ${stage.customerNeedsQuestions}\n`;
      md += `- **Channel Preferences**: ${stage.channelPreferences}\n\n`;
    }
  }

  // Table 4
  if (analysis.table4LeadScoringFramework) {
    md += `## 8. Table 4: Lead Scoring Framework\n\n`;
    md += `| Category | Criterion | Points |\n`;
    md += `|----------|-----------|--------|\n`;
    for (let entry of analysis.table4LeadScoringFramework.criteria) {
      md += `| ${entry.category} | ${entry.criterion} | ${entry.points} |\n`;
    }
    md += `\n### Qualification Thresholds\n\n`;
    md += `- MQL: ${analysis.table4LeadScoringFramework.qualificationThresholds.mql}\n`;
    md += `- SQL: ${analysis.table4LeadScoringFramework.qualificationThresholds.sql}\n`;
    md += `- SAL: ${analysis.table4LeadScoringFramework.qualificationThresholds.sal}\n\n`;
  }

  // Table 5
  if (analysis.table5ChannelEffectiveness?.length) {
    md += `## 9. Table 5: Channel Effectiveness Analysis\n\n`;
    md += `| Channel | Conversion Rate | CAC | LTV:CAC | Budget Allocation |\n`;
    md += `|---------|-----------------|-----|---------|-------------------|\n`;
    for (let entry of analysis.table5ChannelEffectiveness) {
      md += `| ${entry.channel} | ${entry.conversionRate} | ${entry.costPerAcquisition} | ${entry.ltvToCacRatio} | ${entry.budgetAllocation} |\n`;
    }
    md += `\n`;
  }

  if (analysis.crossTeamAlignmentGuidelines) {
    md += `## 10. Cross-Team Alignment Guidelines\n\n`;
    md += `### Shared SLAs\n\n`;
    for (let sla of analysis.crossTeamAlignmentGuidelines.sharedSLAs) {
      md += `- ${sla}\n`;
    }
    md += `\n`;
  }

  if (analysis.icpValidationChecklist) {
    md += `## 11. ICP Validation Checklist\n\n`;
    md += `### Pre-Qualification Checklist\n\n`;
    for (let item of analysis.icpValidationChecklist.preQualificationChecklist) {
      md += `- [ ] ${item}\n`;
    }
    md += `\n### Data Sources for Validation\n\n`;
    for (let source of analysis.icpValidationChecklist.dataSourcesForValidation) {
      md += `- ${source}\n`;
    }
    md += `\n### ICP Update Triggers\n\n`;
    for (let trigger of analysis.icpValidationChecklist.icpUpdateTriggers) {
      md += `- ${trigger}\n`;
    }
  }

  return md;
}

// Component to display complete GTM analysis
function CompleteGTMDisplay({ analysis }: { analysis: AnalysisResult }) {
  const sections = [
    { id: "executive", icon: <FileText />, title: "1. Executive Summary" },
    { id: "icp", icon: <Target />, title: "2. ICP Definition" },
    { id: "firmographics", icon: <Users />, title: "3. Table 1: Firmographics" },
    { id: "behavioral", icon: <PieChart />, title: "4. Behavioral Traits" },
    { id: "painpoints", icon: <IconAlertObjection />, title: "5. Table 2: Pain Points" },
    { id: "decisionmakers", icon: <Users />, title: "6. Table 3: Decision Makers" },
    { id: "journey", icon: <ChevronRight />, title: "7. Purchasing Journey" },
    { id: "scoring", icon: <TrendingUp />, title: "8. Table 4: Lead Scoring" },
    { id: "channels", icon: <Target />, title: "9. Table 5: Channels" },
    { id: "alignment", icon: <CheckCircle2 />, title: "10. Cross-Team Alignment" },
    { id: "checklist", icon: <Check />, title: "11. Validation Checklist" }
  ];

  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar Navigation - Mobile & Desktop */}
      <div className="lg:col-span-3">
        <Card className="border-white/10 bg-white/[0.03] backdrop-blur-md sticky top-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Analysis Sections</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <nav aria-label="Analysis sections">
              <ul className="space-y-1">
                {sections.map(section => (
                  <li key={section.id}>
                    <button
                      onClick={() => {
                        const el = document.getElementById(section.id);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        setActiveSection(section.id);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${activeSection === section.id ? "bg-teal-500/20 text-teal-300" : "text-slate-300 hover:bg-white/5"}`}
                      aria-current={activeSection === section.id ? "true" : "false"}
                    >
                      <span className="w-4 h-4 opacity-80 flex-shrink-0" aria-hidden="true">{section.icon}</span>
                      <span className="text-sm font-medium">{section.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-9 space-y-6">
        {/* Section 1: Executive Summary */}
        <GTMSection title="1. Executive Summary" id="executive" icon={<FileText />}>
          <p className="text-slate-300 leading-relaxed">{analysis.executiveSummary}</p>
        </GTMSection>

        {/* Section 2: ICP Definition */}
        <GTMSection title="2. ICP Definition" id="icp" icon={<Target />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-green-950/30 border border-green-500/20 p-6">
              <h4 className="text-green-400 font-semibold mb-4 flex items-center gap-2">
                <Check className="w-4 h-4" aria-hidden="true" />
                Inclusion Criteria
              </h4>
              <ul className="space-y-2">
                {analysis.icpDefinition?.inclusionCriteria.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-red-950/30 border border-red-500/20 p-6">
              <h4 className="text-red-400 font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" aria-hidden="true" />
                Exclusion Criteria
              </h4>
              <ul className="space-y-2">
                {analysis.icpDefinition?.exclusionCriteria.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <IconAlertObjection className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </GTMSection>

        {/* Section 3: Table 1 Firmographics */}
        <GTMSection title="3. Table 1: Firmographic & Demographic Segmentation" id="firmographics" icon={<Users />}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" role="table" aria-label="Firmographic segmentation data">
              <thead>
                <tr className="border-b border-white/10">
                  <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">Priority Tier</th>
                  <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">Industry</th>
                  <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">Company Size</th>
                  <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">ARR Range</th>
                  <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">Location</th>
                  <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">Notes</th>
                </tr>
              </thead>
              <tbody>
                {analysis.table1FirmographicDemographic?.map((entry, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="p-3 text-sm text-slate-200">{entry.priorityTier}</td>
                    <td className="p-3 text-sm text-slate-300">{entry.industryVertical}</td>
                    <td className="p-3 text-sm text-slate-300">{entry.companySize}</td>
                    <td className="p-3 text-sm text-slate-300">{entry.arrRange}</td>
                    <td className="p-3 text-sm text-slate-300">{entry.location}</td>
                    <td className="p-3 text-sm text-slate-400">{entry.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GTMSection>

        {/* Section 4: Behavioral Traits */}
        <GTMSection title="4. Behavioral & Psychographic Traits" id="behavioral" icon={<PieChart />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-white/[0.02] border border-white/10 p-6">
              <h4 className="text-slate-200 font-semibold mb-4">Observable Behavioral Patterns</h4>
              <ul className="space-y-2">
                {analysis.behavioralPsychographicTraits?.observableBehavioralPatterns.map((b, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" aria-hidden="true" />
                    <span className="text-slate-300">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-white/[0.02] border border-white/10 p-6">
              <h4 className="text-slate-200 font-semibold mb-4">Core Psychographic Attributes</h4>
              <ul className="space-y-2">
                {analysis.behavioralPsychographicTraits?.corePsychographicAttributes.map((b, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" aria-hidden="true" />
                    <span className="text-slate-300">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </GTMSection>

        {/* Section 5: Table 2 Pain Points */}
        <GTMSection title="5. Table 2: Pain Point Analysis" id="painpoints" icon={<IconAlertObjection />}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" role="table" aria-label="Pain point analysis">
              <thead>
                <tr className="border-b border-white/10">
                  <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">Pain Point</th>
                  <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">Severity</th>
                  <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">Business Impact</th>
                  <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">DealFlow Solution</th>
                </tr>
              </thead>
              <tbody>
                {analysis.table2PainPointAnalysis?.map((p, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="p-3 text-sm text-slate-200">{p.painPoint}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${p.severity === "Critical" ? "bg-red-500/20 text-red-300" : p.severity === "High" ? "bg-orange-500/20 text-orange-300" : "bg-amber-500/20 text-amber-300"}`}>
                        {p.severity}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-slate-300">{p.businessImpact}</td>
                    <td className="p-3 text-sm text-teal-300">{p.dealFlowAISolution}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GTMSection>

        {/* Section 6: Table 3 Decision Makers */}
        <GTMSection title="6. Table 3: Decision-Maker Influence Matrix" id="decisionmakers" icon={<Users />}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" role="table" aria-label="Decision maker influence matrix">
              <thead>
                <tr className="border-b border-white/10">
                  <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">Role</th>
                  <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">Influence</th>
                  <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">Core Role</th>
                  <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">Top Priorities</th>
                  <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">Messaging</th>
                </tr>
              </thead>
              <tbody>
                {analysis.table3DecisionMakerInfluence?.map((d, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="p-3 text-sm text-slate-200">{d.role}</td>
                    <td className="p-3 text-sm text-purple-300 font-semibold">{d.influenceScore}/10</td>
                    <td className="p-3 text-sm text-slate-300">{d.coreDecisionRole}</td>
                    <td className="p-3 text-sm text-slate-300">{d.top3Priorities}</td>
                    <td className="p-3 text-sm text-teal-300">{d.dealFlowAIMessagingFocus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GTMSection>

        {/* Section 7: Purchasing Journey */}
        <GTMSection title="7. Purchasing Journey Mapping" id="journey" icon={<ChevronRight />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.purchasingJourneyMapping?.map((stage, i) => (
              <div key={i} className="rounded-xl bg-white/[0.02] border border-white/10 p-6">
                <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300 font-bold">
                    {i + 1}
                  </div>
                  {stage.stage} <span className="text-sm text-slate-500">({stage.duration})</span>
                </h4>
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-slate-300"><strong className="text-slate-200">Customer Actions:</strong> {stage.customerActions}</p>
                  <p className="text-sm text-slate-300"><strong className="text-slate-200">Needs:</strong> {stage.customerNeedsQuestions}</p>
                  <p className="text-sm text-slate-300"><strong className="text-slate-200">Channels:</strong> {stage.channelPreferences}</p>
                </div>
              </div>
            ))}
          </div>
        </GTMSection>

        {/* Section 8: Table 4 Lead Scoring */}
        <GTMSection title="8. Table 4: Lead Scoring Framework" id="scoring" icon={<TrendingUp />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 overflow-x-auto">
              <table className="w-full border-collapse" role="table" aria-label="Lead scoring framework">
                <thead>
                  <tr className="border-b border-white/10">
                    <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">Category</th>
                    <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">Criterion</th>
                    <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.table4LeadScoringFramework?.criteria.map((c, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="p-3 text-sm text-slate-300">{c.category}</td>
                      <td className="p-3 text-sm text-slate-200">{c.criterion}</td>
                      <td className="p-3 text-sm text-teal-300 font-semibold">{c.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-xl bg-white/[0.02] border border-white/10 p-6">
              <h4 className="font-semibold text-white mb-4">Qualification Thresholds</h4>
              <ul className="space-y-3">
                <li className="flex items-center justify-between">
                  <span className="text-slate-300">MQL</span>
                  <span className="font-semibold text-amber-300">{analysis.table4LeadScoringFramework?.qualificationThresholds.mql}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-300">SQL</span>
                  <span className="font-semibold text-orange-300">{analysis.table4LeadScoringFramework?.qualificationThresholds.sql}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-300">SAL</span>
                  <span className="font-semibold text-green-300">{analysis.table4LeadScoringFramework?.qualificationThresholds.sal}</span>
                </li>
              </ul>
            </div>
          </div>
        </GTMSection>

        {/* Section 9: Table 5 Channels */}
        <GTMSection title="9. Table 5: Channel Effectiveness" id="channels" icon={<Target />}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" role="table" aria-label="Channel effectiveness analysis">
              <thead>
                <tr className="border-b border-white/10">
                  <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">Channel</th>
                  <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">Best For</th>
                  <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">Conversion</th>
                  <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">CAC</th>
                  <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">LTV:CAC</th>
                  <th scope="col" className="text-left p-3 text-sm font-semibold text-teal-300">Budget</th>
                </tr>
              </thead>
              <tbody>
                {analysis.table5ChannelEffectiveness?.map((ch, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="p-3 text-sm text-slate-200">{ch.channel}</td>
                    <td className="p-3 text-sm text-slate-300">{ch.icpSegmentsBestFor}</td>
                    <td className="p-3 text-sm text-teal-300 font-semibold">{ch.conversionRate}</td>
                    <td className="p-3 text-sm text-slate-300">{ch.costPerAcquisition}</td>
                    <td className="p-3 text-sm text-green-300 font-semibold">{ch.ltvToCacRatio}</td>
                    <td className="p-3 text-sm text-slate-300">{ch.budgetAllocation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GTMSection>

        {/* Section 10: Cross-Team Alignment */}
        <GTMSection title="10. Cross-Team Alignment Guidelines" id="alignment" icon={<CheckCircle2 />}>
          <Card className="border-white/10 bg-white/[0.03]">
            <CardContent className="p-6">
              <h4 className="font-semibold text-white mb-4">Shared SLAs</h4>
              <ul className="space-y-2">
                {analysis.crossTeamAlignmentGuidelines?.sharedSLAs.map((sla, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" aria-hidden="true" />
                    <span className="text-slate-300">{sla}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </GTMSection>

        {/* Section 11: Validation Checklist */}
        <GTMSection title="11. ICP Validation Checklist" id="checklist" icon={<Check />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-white/[0.02] border border-white/10 p-6">
              <h4 className="font-semibold text-white mb-4">Pre-Qualification Checklist</h4>
              <ul className="space-y-2">
                {analysis.icpValidationChecklist?.preQualificationChecklist.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded border border-white/20 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                      <Check className="w-3 h-3 text-teal-400 opacity-0 group-hover:opacity-100" />
                    </div>
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-white/[0.02] border border-white/10 p-6">
              <h4 className="font-semibold text-white mb-4">ICP Update Triggers</h4>
              <ul className="space-y-2">
                {analysis.icpValidationChecklist?.icpUpdateTriggers.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <IconAlertObjection className="w-4 h-4 text-amber-400" aria-hidden="true" />
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 rounded-xl bg-teal-500/5 border border-teal-500/10 p-6">
            <h4 className="font-semibold text-teal-300 mb-2">Data Sources for Validation</h4>
            <ul className="flex flex-wrap gap-2">
              {analysis.icpValidationChecklist?.dataSourcesForValidation.map((ds, i) => (
                <li key={i} className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 text-slate-300 text-sm border border-white/10">
                  {ds}
                </li>
              ))}
            </ul>
          </div>
        </GTMSection>
      </div>
    </div>
  );
}

// Simple wrapper for sections
function GTMSection({ title, id, icon, children }: any) {
  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} id={id} className="mb-8 scroll-mt-24" aria-labelledby={`${id}-title`}>
      <Card className="border-white/10 bg-white/[0.03] backdrop-blur-md shadow-xl">
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400" aria-hidden="true">
              {icon}
            </div>
            <CardTitle className="text-xl font-bold text-white tracking-tight" id={`${id}-title`}>{title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {children}
        </CardContent>
      </Card>
    </motion.section>
  );
}

// Document Viewer Modal
function DocumentViewer({ analysis, context, zoom, setZoom, onClose, scrollRef }: any) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${analysis?.companyName || "Company"} - GTM Analysis</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 8.5in; margin: 0 auto; padding: 20px; color: #0f172a; }
              h1 { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; }
              table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
              th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; }
              th { background: #f8fafc; }
              @media print { body { max-width: 100%; } }
            </style>
          </head>
          <body>
            ${renderMarkdownToHtml(analysis, context)}
          </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const handleDownloadHtml = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${analysis?.companyName || "Company"} - GTM Analysis</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 1000px; margin: 40px auto; padding: 20px; color: #0f172a; line-height: 1.6; }
            h1 { border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; }
            h2 { margin-top: 32px; margin-bottom: 16px; color: #1e293b; }
            h3 { margin-top: 24px; margin-bottom: 12px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
            th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; }
            .journey-stage { margin: 24px 0; padding: 20px; background: #f8fafc; border-radius: 8px; }
          </style>
        </head>
        <body>
          ${renderMarkdownToHtml(analysis, context)}
        </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis?.companyName || "company"}-gtm-analysis.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="GTM Analysis Document Viewer"
    >
      {/* Viewer Header */}
      <div className="border-b border-white/10 p-4 flex items-center justify-between bg-slate-900/95">
        <div className="flex items-center gap-4">
          <FileText className="w-6 h-6 text-teal-400" aria-hidden="true" />
          <h2 className="text-xl font-bold text-white">{analysis?.companyName || "Company"} - GTM Analysis</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              disabled={zoom <= 50}
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" aria-hidden="true" />
            </Button>
            <span className="text-slate-300 text-sm w-12 text-center">{zoom}%</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              disabled={zoom >= 200}
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
          <Button
            onClick={handlePrint}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white"
            aria-label="Print or save as PDF"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print/PDF
          </Button>
          <Button
            onClick={handleDownloadHtml}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white"
            aria-label="Download as HTML"
          >
            <Download className="w-4 h-4 mr-1" aria-hidden="true" />
            HTML
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-slate-300 hover:text-white"
            aria-label="Close document viewer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Viewer Content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6"
        style={{ fontSize: `${zoom / 100}rem` }}
      >
        <div className="max-w-4xl mx-auto bg-white text-slate-900 rounded-xl shadow-2xl p-12">
          <div dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(analysis, context) }} />
        </div>
      </div>
    </motion.div>
  );
}

// Convert analysis to HTML for viewer
function renderMarkdownToHtml(analysis: AnalysisResult | null, context: StoredLeadContext | null): string {
  if (!analysis) return "";

  let html = `
    <h1 style="margin-bottom: 24px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px;">${analysis.companyName || "Company"} - GTM Analysis Playbook</h1>
  `;

  if (analysis.executiveSummary) {
    html += `<h2 style="margin-top: 32px; margin-bottom: 16px; color: #1e293b;">1. Executive Summary</h2>`;
    html += `<p style="line-height: 1.8; color: #334155;">${analysis.executiveSummary}</p>`;
  }

  if (analysis.icpDefinition) {
    html += `<h2 style="margin-top: 32px; margin-bottom: 16px; color: #1e293b;">2. ICP Definition</h2>`;
    html += `<h3 style="margin-top:24px; margin-bottom:12px; color:#0f172a;">Inclusion Criteria</h3>`;
    html += `<ul style="margin-left:24px; margin-bottom:16px; line-height:1.8; color: #334155;">${analysis.icpDefinition.inclusionCriteria.map(i => `<li>${i}</li>`).join("")}</ul>`;
    html += `<h3 style="margin-top:24px; margin-bottom:12px; color:#0f172a;">Exclusion Criteria</h3>`;
    html += `<ul style="margin-left:24px; margin-bottom:16px; line-height:1.8; color: #334155;">${analysis.icpDefinition.exclusionCriteria.map(i => `<li>${i}</li>`).join("")}</ul>`;
  }

  // Table 1
  if (analysis.table1FirmographicDemographic?.length) {
    html += `<h2 style="margin-top:32px; margin-bottom:16px; color:#1e293b;">3. Table 1: Firmographic & Demographic Segmentation</h2>`;
    html += `<table style="width:100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">`;
    html += `<thead>`;
    html += `<tr style="border-bottom:2px solid #e2e8f0;">`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">Priority Tier</th>`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">Industry</th>`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">Company Size</th>`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">ARR Range</th>`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">Location</th>`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">Notes</th>`;
    html += `</tr>`;
    html += `</thead>`;
    html += `<tbody>`;
    for (let entry of analysis.table1FirmographicDemographic) {
      html += `<tr style="border-bottom:1px solid #e2e8f0;">`;
      html += `<td style="padding:12px; color: #334155;">${entry.priorityTier}</td>`;
      html += `<td style="padding:12px; color: #334155;">${entry.industryVertical}</td>`;
      html += `<td style="padding:12px; color: #334155;">${entry.companySize}</td>`;
      html += `<td style="padding:12px; color: #334155;">${entry.arrRange}</td>`;
      html += `<td style="padding:12px; color: #334155;">${entry.location}</td>`;
      html += `<td style="padding:12px; color: #334155;">${entry.notes}</td>`;
      html += `</tr>`;
    }
    html += `</tbody></table>`;
  }

  // Section 4: Behavioral Traits
  if (analysis.behavioralPsychographicTraits) {
    html += `<h2 style="margin-top:32px; margin-bottom:16px; color:#1e293b;">4. Behavioral & Psychographic Traits</h2>`;
    html += `<h3 style="margin-top:24px; margin-bottom:12px; color:#0f172a;">Observable Behavioral Patterns</h3>`;
    html += `<ul style="margin-left:24px; margin-bottom:16px; line-height:1.8; color: #334155;">${analysis.behavioralPsychographicTraits.observableBehavioralPatterns.map(b => `<li>${b}</li>`).join("")}</ul>`;
    html += `<h3 style="margin-top:24px; margin-bottom:12px; color:#0f172a;">Core Psychographic Attributes</h3>`;
    html += `<ul style="margin-left:24px; margin-bottom:16px; line-height:1.8; color: #334155;">${analysis.behavioralPsychographicTraits.corePsychographicAttributes.map(b => `<li>${b}</li>`).join("")}</ul>`;
  }

  // Table 2
  if (analysis.table2PainPointAnalysis?.length) {
    html += `<h2 style="margin-top:32px; margin-bottom:16px; color:#1e293b;">5. Table 2: Pain Point Analysis</h2>`;
    html += `<table style="width:100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">`;
    html += `<thead>`;
    html += `<tr style="border-bottom:2px solid #e2e8f0;">`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">Pain Point</th>`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">Severity</th>`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">Business Impact</th>`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">DealFlow Solution</th>`;
    html += `</tr>`;
    html += `</thead>`;
    html += `<tbody>`;
    for (let entry of analysis.table2PainPointAnalysis) {
      html += `<tr style="border-bottom:1px solid #e2e8f0;">`;
      html += `<td style="padding:12px; color: #334155;">${entry.painPoint}</td>`;
      html += `<td style="padding:12px; color: #334155;">${entry.severity}</td>`;
      html += `<td style="padding:12px; color: #334155;">${entry.businessImpact}</td>`;
      html += `<td style="padding:12px; color: #0f172a; font-weight: 600;">${entry.dealFlowAISolution}</td>`;
      html += `</tr>`;
    }
    html += `</tbody></table>`;
  }

  // Table 3
  if (analysis.table3DecisionMakerInfluence?.length) {
    html += `<h2 style="margin-top:32px; margin-bottom:16px; color:#1e293b;">6. Table 3: Decision-Maker Influence Matrix</h2>`;
    html += `<table style="width:100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">`;
    html += `<thead>`;
    html += `<tr style="border-bottom:2px solid #e2e8f0;">`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">Role</th>`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">Influence Score</th>`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">Core Role</th>`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">Top 3 Priorities</th>`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">DealFlow Messaging Focus</th>`;
    html += `</tr>`;
    html += `</thead>`;
    html += `<tbody>`;
    for (let entry of analysis.table3DecisionMakerInfluence) {
      html += `<tr style="border-bottom:1px solid #e2e8f0;">`;
      html += `<td style="padding:12px; color: #334155;">${entry.role}</td>`;
      html += `<td style="padding:12px; color: #334155;">${entry.influenceScore}/10</td>`;
      html += `<td style="padding:12px; color: #334155;">${entry.coreDecisionRole}</td>`;
      html += `<td style="padding:12px; color: #334155;">${entry.top3Priorities}</td>`;
      html += `<td style="padding:12px; color: #0f172a; font-weight: 600;">${entry.dealFlowAIMessagingFocus}</td>`;
      html += `</tr>`;
    }
    html += `</tbody></table>`;
  }

  // Purchasing Journey
  if (analysis.purchasingJourneyMapping?.length) {
    html += `<h2 style="margin-top:32px; margin-bottom:16px; color:#1e293b;">7. Purchasing Journey Mapping</h2>`;
    for (let stage of analysis.purchasingJourneyMapping) {
      html += `<div style="margin: 24px 0; padding: 20px; background: #f8fafc; border-radius: 8px;">`;
      html += `<h3 style="margin-top: 0; margin-bottom: 12px; color: #0f172a;">${stage.stage} <span style="font-weight: 400; color: #64748b;">(${stage.duration})</span></h3>`;
      html += `<p style="line-height: 1.7; color: #334155; margin: 8px 0;"><strong>Customer Actions:</strong> ${stage.customerActions}</p>`;
      html += `<p style="line-height: 1.7; color: #334155; margin: 8px 0;"><strong>Customer Needs:</strong> ${stage.customerNeedsQuestions}</p>`;
      html += `<p style="line-height: 1.7; color: #334155; margin: 8px 0;"><strong>Channel Preferences:</strong> ${stage.channelPreferences}</p>`;
      html += `</div>`;
    }
  }

  // Table 4
  if (analysis.table4LeadScoringFramework) {
    html += `<h2 style="margin-top:32px; margin-bottom:16px; color:#1e293b;">8. Table 4: Lead Scoring Framework</h2>`;
    html += `<table style="width:100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">`;
    html += `<thead>`;
    html += `<tr style="border-bottom:2px solid #e2e8f0;">`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">Category</th>`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">Criterion</th>`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">Points</th>`;
    html += `</tr>`;
    html += `</thead>`;
    html += `<tbody>`;
    for (let entry of analysis.table4LeadScoringFramework.criteria) {
      html += `<tr style="border-bottom:1px solid #e2e8f0;">`;
      html += `<td style="padding:12px; color: #334155;">${entry.category}</td>`;
      html += `<td style="padding:12px; color: #334155;">${entry.criterion}</td>`;
      html += `<td style="padding:12px; color: #0f172a; font-weight: 600;">${entry.points}</td>`;
      html += `</tr>`;
    }
    html += `</tbody></table>`;
    html += `<h3 style="margin-top:24px; margin-bottom:12px; color:#0f172a;">Qualification Thresholds</h3>`;
    html += `<ul style="margin-left:24px; margin-bottom:16px; line-height:1.8; color: #334155;">`;
    html += `<li><strong>MQL:</strong> ${analysis.table4LeadScoringFramework.qualificationThresholds.mql}</li>`;
    html += `<li><strong>SQL:</strong> ${analysis.table4LeadScoringFramework.qualificationThresholds.sql}</li>`;
    html += `<li><strong>SAL:</strong> ${analysis.table4LeadScoringFramework.qualificationThresholds.sal}</li>`;
    html += `</ul>`;
  }

  // Table 5
  if (analysis.table5ChannelEffectiveness?.length) {
    html += `<h2 style="margin-top:32px; margin-bottom:16px; color:#1e293b;">9. Table 5: Channel Effectiveness Analysis</h2>`;
    html += `<table style="width:100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">`;
    html += `<thead>`;
    html += `<tr style="border-bottom:2px solid #e2e8f0;">`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">Channel</th>`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">Best For</th>`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">Conversion Rate</th>`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">Cost Per Acquisition</th>`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">LTV:CAC Ratio</th>`;
    html += `<th style="text-align:left; padding:12px; background:#f8fafc; color: #0f172a;">Budget Allocation</th>`;
    html += `</tr>`;
    html += `</thead>`;
    html += `<tbody>`;
    for (let entry of analysis.table5ChannelEffectiveness) {
      html += `<tr style="border-bottom:1px solid #e2e8f0;">`;
      html += `<td style="padding:12px; color: #334155;">${entry.channel}</td>`;
      html += `<td style="padding:12px; color: #334155;">${entry.icpSegmentsBestFor}</td>`;
      html += `<td style="padding:12px; color: #0f172a; font-weight: 600;">${entry.conversionRate}</td>`;
      html += `<td style="padding:12px; color: #334155;">${entry.costPerAcquisition}</td>`;
      html += `<td style="padding:12px; color: #0f172a; font-weight: 600;">${entry.ltvToCacRatio}</td>`;
      html += `<td style="padding:12px; color: #334155;">${entry.budgetAllocation}</td>`;
      html += `</tr>`;
    }
    html += `</tbody></table>`;
  }

  if (analysis.crossTeamAlignmentGuidelines) {
    html += `<h2 style="margin-top:32px; margin-bottom:16px; color:#1e293b;">10. Cross-Team Alignment Guidelines</h2>`;
    html += `<h3 style="margin-top:24px; margin-bottom:12px; color:#0f172a;">Shared SLAs</h3>`;
    html += `<ul style="margin-left:24px; margin-bottom:16px; line-height:1.8; color: #334155;">`;
    for (let sla of analysis.crossTeamAlignmentGuidelines.sharedSLAs) {
      html += `<li>${sla}</li>`;
    }
    html += `</ul>`;
  }

  if (analysis.icpValidationChecklist) {
    html += `<h2 style="margin-top:32px; margin-bottom:16px; color:#1e293b;">11. ICP Validation Checklist</h2>`;
    html += `<h3 style="margin-top:24px; margin-bottom:12px; color:#0f172a;">Pre-Qualification Checklist</h3>`;
    html += `<ul style="margin-left:24px; margin-bottom:16px; line-height:1.8; color: #334155;">`;
    for (let item of analysis.icpValidationChecklist.preQualificationChecklist) {
      html += `<li>${item}</li>`;
    }
    html += `</ul>`;
    html += `<h3 style="margin-top:24px; margin-bottom:12px; color:#0f172a;">Data Sources for Validation</h3>`;
    html += `<ul style="margin-left:24px; margin-bottom:16px; line-height:1.8; color: #334155;">`;
    for (let source of analysis.icpValidationChecklist.dataSourcesForValidation) {
      html += `<li>${source}</li>`;
    }
    html += `</ul>`;
    html += `<h3 style="margin-top:24px; margin-bottom:12px; color:#0f172a;">ICP Update Triggers</h3>`;
    html += `<ul style="margin-left:24px; margin-bottom:16px; line-height:1.8; color: #334155;">`;
    for (let trigger of analysis.icpValidationChecklist.icpUpdateTriggers) {
      html += `<li>${trigger}</li>`;
    }
    html += `</ul>`;
  }

  return html;
}

// Legacy display for backward compatibility
function LegacyGTMDisplay({ analysis }: { analysis: AnalysisResult }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-white/10 bg-white/[0.03] backdrop-blur-md md:col-span-1">
          <CardHeader><CardTitle className="text-xs uppercase text-slate-400">GTM Health Score</CardTitle></CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-white mb-4 flex items-baseline gap-1">
              {analysis.healthScore} <span className="text-xl text-slate-500 font-semibold">/100</span>
            </div>
            <Progress value={analysis.healthScore} className="h-2" />
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-white/[0.03] backdrop-blur-md md:col-span-2">
          <CardHeader><CardTitle className="text-xs uppercase text-slate-400">Complete GTM Plan</CardTitle></CardHeader>
          <CardContent><p className="text-base leading-relaxed text-slate-300 font-medium">{analysis.gtmPlan}</p></CardContent>
        </Card>
      </div>
      <Card className="border-white/10 bg-white/[0.03] backdrop-blur-md">
        <CardHeader className="border-b border-white/5"><CardTitle className="text-lg font-bold text-white">Comprehensive Brand Overview</CardTitle></CardHeader>
        <CardContent className="p-6"><p className="text-sm text-slate-300 leading-relaxed">{analysis.comprehensiveBrandOverview}</p></CardContent>
      </Card>
    </div>
  );
}

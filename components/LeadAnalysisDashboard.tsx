"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { loadLeadContext, StoredLeadContext } from "@/lib/lead-context";
import { BookingWidget } from "@/components/BookingWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, WifiOff } from "lucide-react";
import {
  IconAlertObjection,
  IconCheckCircle,
  IconRefreshPipeline,
} from "@/components/gtm/GtmIcons";
import type { AnalysisResult } from "@/lib/types";
import { generateICPDocument, formatICPDocument } from "@/lib/icp-document-generator";
import { getLeadOffline, saveLeadOffline } from "@/lib/offlineStore";

function generateMockupAnalysis(companyName: string, data: any): AnalysisResult {
  return {
    analysisId: "mock-analysis-" + Math.random().toString(36).substring(2, 11),
    leadId: data.leadId || "offline-lead",
    companyName: companyName || "Your Company",
    healthScore: 78,
    gtmPlan: `Based on your offering for ${data.productsServices || "products and services"} targeting ${data.icpDescription || "your ideal customers"}, we recommend focusing on inbound marketing through ${data.brandChannels?.join(", ") || "social media"} and utilizing personalized email sequences targeting ${data.buyingRoles?.join(", ") || "decision makers"}.`,
    idealCustomerProfiles: [
      {
        title: "Primary Segment: " + (data.targetIndustries?.[0] || "Target Industry"),
        content: `Targeting companies with sizes ${data.targetCompanySizes?.join(", ") || "all sizes"} and revenues of ${data.targetRevenues?.join(", ") || "all ranges"} located in ${data.targetGeographics?.join(", ") || "all regions"}.`
      },
      {
        title: "Secondary Segment: Buying Committee",
        content: `Key roles: ${data.buyingRoles?.join(", ") || "all decision makers"} with seniorities ${data.targetSeniorities?.join(", ") || "managers and executives"} in departments like ${data.budgetDepartments?.join(", ") || "all departments"}.`
      }
    ],
    comprehensiveBrandOverview: `Your value proposition is: "${data.uniqueValueProp || "Not specified"}". Key business challenges you solve include: "${data.keyChallenges || "Not specified"}". You target time-to-value of ${data.timeToValue || "immediate"}.`,
    strategicOutreachApproach: `Approach outreach using messaging built around key triggers like ${data.buyingSignals?.join(", ") || "funding and hiring"}. Address objections such as: "${data.commonObjections || "Not specified"}" by highlighting: "${data.overcomeObjections || "Not specified"}".`,
    marketDifferentiationTriggers: data.buyingSignals || ["Funding Announcements", "Leadership Changes"],
    goToMarketCoreFramework: `Integrate ${data.crmSystems?.join(", ") || "your CRM"} with outreach platforms like ${data.outreachTools?.join(", ") || "Apollo or Outreach"} and automate marketing flows using ${data.marketingAutomationTools?.join(", ") || "HubSpot"}.`,
    customerJourneyPipeline: [
      { title: "Awareness", content: `Establish brand presence on ${data.brandChannels?.join(", ") || "LinkedIn"} through ${data.contentTypes?.join(", ") || "thought leadership content"}.` },
      { title: "Qualification", content: `Filter prospects by technologies used: "${data.prospectTechnologies || "Not specified"}".` },
      { title: "Proposal", content: `Present offer structure with risk reductions like: ${data.riskReductions?.join(", ") || "guarantees"}.` },
      { title: "Negotiation & Closed", content: `Leverage testimonials and credibility factors ("${data.credibilityFactors || "industry experience"}").` }
    ]
  };
}

export function LeadAnalysisDashboard({ leadId }: { leadId?: string }) {
  const [context, setContext] = useState<StoredLeadContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [showICPDocument, setShowICPDocument] = useState(false);
  const [isOfflineData, setIsOfflineData] = useState(false);

  useEffect(() => {
    async function runAnalysis() {
      try {
        const stored = loadLeadContext();
        setContext(stored);

        let companyData = stored?.form;
        let cachedLead = null;

        // Try load from local db
        if (leadId) {
          cachedLead = await getLeadOffline(leadId);
          if (cachedLead) {
            companyData = cachedLead.data as any;
            if (cachedLead.readout) {
              setAnalysis(cachedLead.readout);
              setIsOfflineData(!cachedLead.synced);
              setLoading(false);
              return;
            }
          }
        }

        if (!companyData && !leadId) {
          setError("No lead data found to analyze.");
          setLoading(false);
          return;
        }

        // Check online status
        const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
        if (!isOnline) {
          throw new Error("offline");
        }

        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadId,
            companyData,
          }),
        });

        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to run analysis.");
        }

        setAnalysis(data);
        if (leadId) {
          await saveLeadOffline(leadId, companyData as any, data, true);
        }
      } catch (err: unknown) {
        // Fallback to offline mockup generation
        console.warn("Analysis API call failed or offline. Generating mockup analysis:", err);
        
        let fallbackData = stored?.form;
        if (leadId) {
          const cached = await getLeadOffline(leadId);
          if (cached?.data) {
            fallbackData = cached.data as any;
          }
        }

        if (fallbackData) {
          const mockup = generateMockupAnalysis(fallbackData.companyName, fallbackData);
          setAnalysis(mockup);
          setIsOfflineData(true);
          if (leadId) {
            await saveLeadOffline(leadId, fallbackData, mockup, false);
          }
        } else {
          setError(err instanceof Error ? err.message : "An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    }

    runAnalysis();
  }, [leadId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <IconRefreshPipeline className="h-10 w-10 animate-spin text-teal-400" />
        <p className="text-lg font-medium text-slate-300">Generating GTM AI Analysis...</p>
        <p className="text-sm text-slate-500">Analyzing your company website and building your GTM plan</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center space-y-4">
        <IconAlertObjection className="mx-auto h-10 w-10 text-red-400" />
        <div>
          <h3 className="text-lg font-bold text-red-300 mb-2">Analysis Failed</h3>
          <p className="text-red-200/80">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/30 transition-colors"
        >
          <IconRefreshPipeline className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-12">
      {isOfflineData && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/60 backdrop-blur-md p-4 text-amber-200 text-sm flex items-center gap-3">
          <WifiOff className="w-5 h-5 flex-shrink-0 text-amber-400 animate-pulse" />
          <div>
            <strong>Viewing Offline Analysis Report</strong> — This GTM readout was generated locally from cache because you are currently offline. It will synchronize with our AI pipeline automatically once you are back online.
          </div>
        </div>
      )}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-white/10 bg-white/[0.03] backdrop-blur-md md:col-span-1 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                GTM Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-black text-white mb-4 tracking-tight tabular-nums flex items-baseline gap-1">
                {analysis.healthScore}
                <span className="text-xl text-slate-500 font-semibold">/100</span>
              </div>
              <Progress value={analysis.healthScore} className="h-2 bg-white/5" />
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.03] backdrop-blur-md md:col-span-2 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Complete GTM Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-slate-200 font-medium">{analysis.gtmPlan}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/10 bg-white/[0.03] backdrop-blur-md shadow-xl">
          <CardHeader className="border-b border-white/5 py-4">
            <CardTitle className="text-lg font-bold text-white tracking-tight">
              Comprehensive Brand Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-slate-300 leading-relaxed">{analysis.comprehensiveBrandOverview}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-white/10 bg-white/[0.03] backdrop-blur-md shadow-xl">
            <CardHeader className="border-b border-white/5 py-4">
              <CardTitle className="text-lg font-bold text-white tracking-tight">
                Ideal Customer Profiles
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {analysis.idealCustomerProfiles.map((icp, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-black/30 p-5 border border-white/5"
                >
                  <h4 className="font-bold text-white mb-1.5 text-sm">{icp.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{icp.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.03] backdrop-blur-md shadow-xl">
            <CardHeader className="border-b border-white/5 py-4">
              <CardTitle className="text-lg font-bold text-white tracking-tight">
                Strategic Outreach Approach
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm text-slate-300 leading-relaxed">{analysis.strategicOutreachApproach}</p>
              <div className="mt-6 pt-6 border-t border-white/5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                  Market Differentiation Triggers
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.marketDifferentiationTriggers.map((trigger) => (
                    <span
                      key={trigger}
                      className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10"
                    >
                      {trigger}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/10 bg-white/[0.03] backdrop-blur-md shadow-xl">
          <CardHeader className="border-b border-white/5 py-4">
            <CardTitle className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <IconCheckCircle className="h-5 w-5 text-teal-400" />
              Go-To-Market Core Framework
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-slate-300 leading-relaxed mb-6">{analysis.goToMarketCoreFramework}</p>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Customer Journey Pipeline
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.customerJourneyPipeline.map((stage, idx) => (
                <div key={idx} className="rounded-xl bg-black/30 p-4 border border-white/5">
                  <h5 className="font-semibold text-white text-sm mb-1">{stage.title}</h5>
                  <p className="text-xs text-slate-400">{stage.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ICP Document Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Complete ICP Document
            </h3>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowICPDocument(!showICPDocument)}
                className="border-white/20 text-white hover:bg-white/5"
              >
                {showICPDocument ? "Hide ICP Document" : "View ICP Document"}
              </Button>
              {context?.form && (
                <Button
                onClick={() => {
                  const icpData = generateICPDocument(context.form);
                  const icpText = formatICPDocument(icpData);
                  const blob = new Blob([icpText], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${context.form.companyName || "company"}-icp-document.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download ICP Document
              </Button>
              )}
            </div>
          </div>
          
          {showICPDocument && context?.form && (
            <Card className="border-white/10 bg-white/[0.03] backdrop-blur-md shadow-xl">
              <CardContent className="p-6">
                <div className="space-y-6 max-h-[600px] overflow-y-auto">
                  {Object.entries(generateICPDocument(context.form)).map(([section, content]) => {
                    // Handle nested objects recursively!
                    const renderContent = (value: any): React.ReactNode => {
                      if (typeof value === "string") {
                        return <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{value}</p>;
                      }
                      if (typeof value === "object" && value !== null) {
                        return (
                          <div className="pl-4 mt-2 space-y-3">
                            {Object.entries(value).map(([subKey, subValue]) => (
                              <div key={subKey} className="border-l-2 border-teal-500/20 pl-3">
                                <h5 className="text-xs font-semibold text-teal-300 uppercase tracking-wide mb-1">{subKey}</h5>
                                {renderContent(subValue)}
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return null;
                    };
                    return (
                      <div key={section} className="border-l-4 border-teal-500/30 pl-4">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest text-teal-400 mb-2">
                          {section}
                        </h4>
                        {renderContent(content)}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-16 pt-16 border-t border-white/10"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-semibold text-white mb-4 font-display tracking-tight sm:text-4xl">
            Let&apos;s Fix Your Pipeline
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Schedule a strategy session with our team to review this AI analysis and discuss implementing the recommended solutions.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <BookingWidget
            name={context?.form?.contactName || ""}
            email={context?.form?.contactEmail || ""}
            companyName={context?.form?.companyName || ""}
            leadId={leadId}
            analysisId={analysis.analysisId}
            contactPhone={context?.form?.contactPhone || ""}
            challengeTags={context?.form?.challenges || []}
          />
        </div>
      </motion.div>
    </div>
  );
}

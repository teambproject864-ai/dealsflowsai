"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Target, TrendingUp, DollarSign, Users, Award, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";
import { GlassPanel, ExtrudedButton } from "@/components/immersive";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface MarketingStrategyModuleProps {
  initialIcpData?: {
    industry?: string;
    companySize?: string;
    geography?: string;
    businessModel?: string;
  };
}

export function MarketingStrategyModule({ initialIcpData }: MarketingStrategyModuleProps) {
  // Ingest state
  const [budget, setBudget] = useState<number>(3000);
  const [competitor, setCompetitor] = useState<string>("Legacy CRM Providers");
  const [persona, setPersona] = useState<string>("VP of Sales / RevOps");
  const [industry, setIndustry] = useState<string>(initialIcpData?.industry || "Software & SaaS");
  const [businessModel, setBusinessModel] = useState<string>(initialIcpData?.businessModel || "b2b");

  // Dynamic calculations based on input triggers
  const channelRecommendations = useMemo(() => {
    // Basic Scoring logic
    let linkedinScore = 65;
    let googleAdsScore = 55;
    let seoScore = 40;
    let affiliateScore = 30;

    // Adjust based on business model
    if (businessModel === "b2b") {
      linkedinScore += 25;
      seoScore += 10;
      affiliateScore -= 10;
    } else {
      linkedinScore -= 30;
      affiliateScore += 45;
      seoScore += 15;
      googleAdsScore += 10;
    }

    // Adjust based on budget
    if (budget > 5000) {
      googleAdsScore += 20;
      linkedinScore += 10;
    } else if (budget < 1500) {
      googleAdsScore -= 25;
      seoScore += 20;
    }

    // Adjust based on industry
    const indLower = industry.toLowerCase();
    if (indLower.includes("health") || indLower.includes("medical")) {
      linkedinScore += 5;
      googleAdsScore -= 10; // Compliance checks
      seoScore += 15; // Informational content is key
    } else if (indLower.includes("finance") || indLower.includes("fintech")) {
      linkedinScore += 10;
      googleAdsScore += 10;
    } else if (indLower.includes("retail") || indLower.includes("consumer")) {
      linkedinScore -= 20;
      affiliateScore += 20;
      googleAdsScore += 10;
    }

    // Clamp values between 0 and 100
    const clamp = (val: number) => Math.max(0, Math.min(100, val));

    return [
      {
        id: "linkedin",
        name: "LinkedIn Outreach & ABM",
        score: clamp(linkedinScore),
        color: "from-teal-600 to-cyan-500",
        description: `Direct social prospecting targeting ${persona} personas in the ${industry} space. Ideal for ${businessModel.toUpperCase()} models.`,
        tactics: [
          `Send 20 personalized connection requests daily to ${persona} prospects`,
          "Share thought leadership articles highlighting competitor gaps",
          "Deploy hyper-targeted conversation ads to high-intent buyer lists"
        ]
      },
      {
        id: "google_search",
        name: "Google Search Ads",
        score: clamp(googleAdsScore),
        color: "from-emerald-600 to-teal-500",
        description: `Capture buyers actively searching for solutions related to ${competitor}.`,
        tactics: [
          `Target bidding on high-intent keywords: "Alternative to ${competitor}"`,
          "Build hyper-focused comparison landing pages highlighting key differentiators",
          "Implement site-link extensions for case studies and interactive demo widgets"
        ]
      },
      {
        id: "seo_content",
        name: "Content SEO & Programmatic Pages",
        score: clamp(seoScore),
        color: "from-purple-600 to-pink-500",
        description: "Scale organic growth by targeting long-tail problem terms.",
        tactics: [
          `Write 4 comparative guides reviewing "${industry} outbound best practices"`,
          "Optimize metadata schema to boost mobile and rich snippet click-throughs",
          "Publish client success studies referencing ROI gains and setup speed"
        ]
      },
      {
        id: "affiliate",
        name: "Affiliate & Partner Referrals",
        score: clamp(affiliateScore),
        color: "from-amber-600 to-orange-500",
        description: "Leverage third-party credibility to scale user acquisition.",
        tactics: [
          `Onboard 5 micro-influencers or advisors operating in ${industry}`,
          "Integrate co-marketing webinars with complementary tech tools",
          "Offer a 20% recurring referral reward on successfully closed leads"
        ]
      }
    ].sort((a, b) => b.score - a.score);
  }, [budget, competitor, persona, industry, businessModel]);

  // Determine top category recommendation
  const primaryStrategyCategory = useMemo(() => {
    const topChannel = channelRecommendations[0];
    if (topChannel.id === "linkedin") return "Outbound Demand Acceleration";
    if (topChannel.id === "google_search") return "Competitor Hijack Strategy";
    if (topChannel.id === "seo_content") return "Programmatic SEO & Authority Scaling";
    return "Partner-Led Acquisition Model";
  }, [channelRecommendations]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Parameters Pane */}
        <div className="lg:col-span-1">
          <GlassPanel tilt={false} className="border-slate-800 p-5 rounded-2xl h-full space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="h-4 w-4 text-teal-400" />
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Input Config Engine</h4>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="strategy-budget" className="text-xs text-slate-400">Monthly Ad Budget</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    id="strategy-budget"
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-9 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="strategy-competitor" className="text-xs text-slate-400">Primary Competitor</Label>
                <input
                  id="strategy-competitor"
                  type="text"
                  value={competitor}
                  onChange={(e) => setCompetitor(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="strategy-persona" className="text-xs text-slate-400">Target Persona</Label>
                <input
                  id="strategy-persona"
                  type="text"
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="strategy-industry" className="text-xs text-slate-400">Target Industry</Label>
                <input
                  id="strategy-industry"
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-400">Business Model</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBusinessModel("b2b")}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      businessModel === "b2b"
                        ? "bg-teal-500/20 border-teal-500/40 text-teal-300 shadow-lg shadow-teal-500/5"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    B2B
                  </button>
                  <button
                    type="button"
                    onClick={() => setBusinessModel("b2c")}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      businessModel === "b2c"
                        ? "bg-teal-500/20 border-teal-500/40 text-teal-300 shadow-lg shadow-teal-500/5"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}
                  >
                    B2C/D2C
                  </button>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Dynamic Channel Scoring Pane */}
        <div className="lg:col-span-2 space-y-6">
          <GlassPanel tilt={false} className="border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Fit Score Analysis</h4>
              </div>
              <div className="px-3 py-1 rounded bg-teal-500/10 border border-teal-500/20 text-[10px] font-bold text-teal-400">
                Category: {primaryStrategyCategory}
              </div>
            </div>

            <div className="space-y-5 mt-4">
              {channelRecommendations.map((channel) => (
                <div key={channel.id} className="p-4 bg-slate-900/40 rounded-xl border border-slate-850 space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-slate-200">{channel.name}</p>
                    <span className="text-xs font-extrabold text-teal-400">{channel.score}% Fit</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5 relative">
                    <div
                      className={`h-full bg-gradient-to-r ${channel.color} rounded-full transition-all duration-500`}
                      style={{ width: `${channel.score}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">{channel.description}</p>

                  <div className="pt-2 border-t border-slate-850 space-y-1.5">
                    <p className="text-[9px] font-bold text-teal-400 uppercase tracking-wider">Recommended Playbook Tactics</p>
                    <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-1 pl-1">
                      {channel.tactics.map((tactic, idx) => (
                        <li key={idx} className="leading-normal">{tactic}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

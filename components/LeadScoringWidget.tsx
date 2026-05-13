"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Check, AlertCircle } from "lucide-react";

interface ScoreComponent {
  name: string;
  score: number;
  maxScore: number;
  reason: string;
}

export function LeadScoringWidget() {
  const [companySize, setCompanySize] = useState<string>("");
  const [industry, setIndustry] = useState<string>("");
  const [jobTitle, setJobTitle] = useState<string>("");
  const [painPoints, setPainPoints] = useState<string>("");
  const [score, setScore] = useState<number | null>(null);
  const [components, setComponents] = useState<ScoreComponent[] | null>(null);

  const calculateScore = () => {
    const comps: ScoreComponent[] = [];
    let total = 0;

    let sizeScore = 0;
    let sizeReason = "";
    if (companySize === "500+") {
      sizeScore = 30;
      sizeReason = "Enterprise company - high value";
    } else if (companySize === "201-500") {
      sizeScore = 25;
      sizeReason = "Mid-market company - good value";
    } else if (companySize === "51-200") {
      sizeScore = 20;
      sizeReason = "Growing company - moderate value";
    } else if (companySize === "11-50") {
      sizeScore = 15;
      sizeReason = "Small company - lower value";
    } else {
      sizeScore = 10;
      sizeReason = "Startup - very early stage";
    }
    comps.push({ name: "Company Size", score: sizeScore, maxScore: 30, reason: sizeReason });
    total += sizeScore;

    let industryScore = 0;
    let industryReason = "";
    if (industry) {
      industryScore = 25;
      industryReason = "Industry data provided";
    } else {
      industryScore = 10;
      industryReason = "No industry data";
    }
    comps.push({ name: "Industry Fit", score: industryScore, maxScore: 25, reason: industryReason });
    total += industryScore;

    let titleScore = 0;
    let titleReason = "";
    if (jobTitle.toLowerCase().includes("ceo") || jobTitle.toLowerCase().includes("founder")) {
      titleScore = 25;
      titleReason = "Decision-maker - high influence";
    } else if (jobTitle.toLowerCase().includes("vp") || jobTitle.toLowerCase().includes("director")) {
      titleScore = 20;
      titleReason = "Senior leader - good influence";
    } else if (jobTitle.toLowerCase().includes("manager")) {
      titleScore = 15;
      titleReason = "Manager - some influence";
    } else {
      titleScore = 10;
      titleReason = "Individual contributor - low influence";
    }
    comps.push({ name: "Job Title", score: titleScore, maxScore: 25, reason: titleReason });
    total += titleScore;

    let painScore = 0;
    let painReason = "";
    if (painPoints.length > 50) {
      painScore = 20;
      painReason = "Clear pain points identified";
    } else if (painPoints.length > 0) {
      painScore = 10;
      painReason = "Some pain points mentioned";
    } else {
      painScore = 0;
      painReason = "No pain points identified";
    }
    comps.push({ name: "Pain Points", score: painScore, maxScore: 20, reason: painReason });
    total += painScore;

    setScore(total);
    setComponents(comps);
  };

  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
    if (s >= 60) return "text-amber-400 bg-amber-500/20 border-amber-500/30";
    return "text-red-400 bg-red-500/20 border-red-500/30";
  };

  const getRecommendation = (s: number) => {
    if (s >= 80) return "High priority - book a demo immediately!";
    if (s >= 60) return "Medium priority - nurture and follow up.";
    return "Low priority - monitor and re-evaluate later.";
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
        <CardHeader>
          <CardTitle className="text-2xl">Lead Scoring Widget</CardTitle>
          <CardDescription>
            Calculate ICP fit score for your prospects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companySize">Company Size</Label>
              <Select value={companySize} onValueChange={setCompanySize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="500+">500+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. B2B SaaS"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. VP of Sales"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="painPoints">Pain Points</Label>
            <Textarea
              id="painPoints"
              value={painPoints}
              onChange={(e) => setPainPoints(e.target.value)}
              placeholder="Describe the prospect's main challenges..."
            />
          </div>

          <Button
            onClick={calculateScore}
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            Calculate Lead Score
          </Button>

          {score !== null && components && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 pt-4"
            >
              <div className="flex items-center justify-center">
                <div className={`text-center p-6 rounded-2xl border ${getScoreColor(score)}`}>
                  <p className="text-sm font-medium uppercase tracking-wider mb-2">ICP Fit Score</p>
                  <p className="text-6xl font-bold">{score}</p>
                  <p className="text-sm mt-2">/ 100</p>
                </div>
              </div>

              <Card className="border border-white/5 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {score >= 80 ? <Check className="inline mr-2 h-5 w-5 text-emerald-400" /> : <AlertCircle className="inline mr-2 h-5 w-5 text-amber-400" />}
                    Recommendation
                  </CardTitle>
                  <CardDescription>{getRecommendation(score)}</CardDescription>
                </CardHeader>
              </Card>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Score Breakdown</h3>
                {components.map((comp, index) => (
                  <Card key={index} className="border border-white/5 bg-white/5">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{comp.name}</span>
                        <span className="text-violet-300">{comp.score}/{comp.maxScore}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-violet-500 transition-all"
                          style={{ width: `${(comp.score / comp.maxScore) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{comp.reason}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

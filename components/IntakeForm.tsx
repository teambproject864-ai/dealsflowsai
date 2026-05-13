"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { challengeOptions, toolOptions, intakeSchema, type IntakeFormData } from "@/lib/types";
import { saveLeadContext } from "@/lib/lead-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";

const empty: IntakeFormData = {
  companyName: "",
  industry: "",
  websiteUrl: "",
  companySize: "",
  revenue: "",
  currentTools: [],
  challenges: [],
  challengesOther: "",
  targetAudience: "",
  targetAudienceOther: "",
  monthlyLeads: "",
  monthlyLeadsOther: "",
  salesCycle: "",
  salesCycleOther: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
};

const stepTitles = [
  "Company profile",
  "Scale & Revenue",
  "Tech stack",
  "Biggest challenges",
  "GTM motion",
  "Contact details",
];

export function IntakeForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<IntakeFormData>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function toggleChallenge(c: string) {
    setData((d) => ({
      ...d,
      challenges: d.challenges.includes(c)
        ? d.challenges.filter((x) => x !== c)
        : [...d.challenges, c],
    }));
  }

  function toggleTool(t: string) {
    setData((d) => ({
      ...d,
      currentTools: d.currentTools.includes(t)
        ? d.currentTools.filter((x) => x !== t)
        : [...d.currentTools, t],
    }));
  }

  function validateStep(): boolean {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!data.companyName.trim()) e.companyName = "Required";
      if (!data.industry.trim()) e.industry = "Required";
      if (!data.websiteUrl.trim()) e.websiteUrl = "Required";
    }
    if (step === 1) {
      if (!data.companySize) e.companySize = "Required";
      if (!data.revenue) e.revenue = "Required";
    }
    if (step === 2) {
      if (data.currentTools.length === 0) e.currentTools = "Pick at least one";
    }
    if (step === 3) {
      if (data.challenges.length === 0) e.challenges = "Pick at least one";
      if (data.challenges.includes("Other") && !data.challengesOther?.trim()) {
        e.challengesOther = "Describe the other challenge";
      }
    }
    if (step === 4) {
      if (!data.targetAudience) e.targetAudience = "Required";
      if (data.targetAudience === "Other" && !data.targetAudienceOther?.trim()) {
        e.targetAudienceOther = "Required";
      }
      if (!data.monthlyLeads) e.monthlyLeads = "Required";
      if (data.monthlyLeads === "Other" && !data.monthlyLeadsOther?.trim()) {
        e.monthlyLeadsOther = "Required";
      }
      if (!data.salesCycle) e.salesCycle = "Required";
      if (data.salesCycle === "Other" && !data.salesCycleOther?.trim()) {
        e.salesCycleOther = "Required";
      }
    }
    if (step === 5) {
      if (!data.contactName.trim()) e.contactName = "Required";
      if (!data.contactEmail.trim()) e.contactEmail = "Required";
      if (!data.contactPhone.trim()) e.contactPhone = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validateStep()) return;
    const full = intakeSchema.safeParse(data);
    if (!full.success) {
      const flat = full.error.flatten().fieldErrors;
      const e: Record<string, string> = {};
      Object.entries(flat).forEach(([k, v]) => {
        if (v?.[0]) e[k] = v[0];
      });
      setErrors(e);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(full.data),
      });
      const result = await res.json();
      if (result.leadId) {
        const analyzeRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            leadId: result.leadId, 
            companyData: full.data 
          }),
        });
        const analyzeResult = await analyzeRes.json();
        
        saveLeadContext(full.data, analyzeResult);
        router.push(`/?leadId=${result.leadId}`);
      }
    } catch (error) {
      console.error("Error saving lead:", error);
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, 5));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
    setErrors({});
  }

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] relative overflow-hidden [perspective:1200px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_20%_10%,rgba(139,92,246,0.16),transparent)]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-violet-300/90">
            Step {step + 1} of 6
          </p>
          <h2 className="text-lg font-semibold">{stepTitles[step]}</h2>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                i <= step ? "bg-violet-500" : "bg-white/15"
              }`}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
          className="space-y-4 [transform:translateZ(0)]"
        >
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company name</Label>
                <Input
                  id="companyName"
                  value={data.companyName}
                  onChange={(e) =>
                    setData({ ...data, companyName: e.target.value })
                  }
                  placeholder="Acme Inc."
                />
                {errors.companyName && (
                  <p className="text-xs text-red-400">{errors.companyName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry / niche</Label>
                <Input
                  id="industry"
                  value={data.industry}
                  onChange={(e) =>
                    setData({ ...data, industry: e.target.value })
                  }
                  placeholder="e.g. B2B SaaS"
                />
                {errors.industry && (
                  <p className="text-xs text-red-400">{errors.industry}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  value={data.websiteUrl}
                  onChange={(e) =>
                    setData({ ...data, websiteUrl: e.target.value })
                  }
                  placeholder="https://acme.com"
                />
                {errors.websiteUrl && (
                  <p className="text-xs text-red-400">{errors.websiteUrl}</p>
                )}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="companySize">Company size</Label>
                <Select
                  value={data.companySize}
                  onValueChange={(v) => setData({ ...data, companySize: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="500+">500+ employees</SelectItem>
                  </SelectContent>
                </Select>
                {errors.companySize && (
                  <p className="text-xs text-red-400">{errors.companySize}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="revenue">Annual revenue range</Label>
                <Select
                  value={data.revenue}
                  onValueChange={(v) => setData({ ...data, revenue: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select revenue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="<$1M">&lt;$1M</SelectItem>
                    <SelectItem value="$1M-$5M">$1M-$5M</SelectItem>
                    <SelectItem value="$5M-$20M">$5M-$20M</SelectItem>
                    <SelectItem value="$20M-$50M">$20M-$50M</SelectItem>
                    <SelectItem value="$50M+">$50M+</SelectItem>
                  </SelectContent>
                </Select>
                {errors.revenue && (
                  <p className="text-xs text-red-400">{errors.revenue}</p>
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <Label>Current marketing tools used</Label>
              <div className="grid grid-cols-2 gap-3">
                {toolOptions.map((tool) => (
                  <div
                    key={tool}
                    className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 p-3"
                  >
                    <Checkbox
                      id={`tool-${tool}`}
                      checked={data.currentTools.includes(tool)}
                      onCheckedChange={() => toggleTool(tool)}
                    />
                    <label
                      htmlFor={`tool-${tool}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {tool}
                    </label>
                  </div>
                ))}
              </div>
              {errors.currentTools && (
                <p className="text-xs text-red-400">{errors.currentTools}</p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <Label>Biggest marketing & sales challenges</Label>
              <div className="space-y-2">
                {challengeOptions.map((c) => (
                  <div
                    key={c}
                    className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 p-3"
                  >
                    <Checkbox
                      id={`ch-${c}`}
                      checked={data.challenges.includes(c)}
                      onCheckedChange={() => toggleChallenge(c)}
                    />
                    <label
                      htmlFor={`ch-${c}`}
                      className="text-sm font-medium leading-none"
                    >
                      {c}
                    </label>
                  </div>
                ))}
              </div>
              {data.challenges.includes("Other") && (
                <Textarea
                  placeholder="Describe your other challenge..."
                  value={data.challengesOther}
                  onChange={(e) =>
                    setData({ ...data, challengesOther: e.target.value })
                  }
                  className="mt-2"
                />
              )}
              {errors.challenges && (
                <p className="text-xs text-red-400">{errors.challenges}</p>
              )}
            </div>
          )}

          {step === 4 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target audience</Label>
                <Select
                  value={data.targetAudience}
                  onValueChange={(v) => setData({ ...data, targetAudience: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B2B - SMB">B2B - SMB</SelectItem>
                    <SelectItem value="B2B - Mid-Market">B2B - Mid-Market</SelectItem>
                    <SelectItem value="B2B - Enterprise">B2B - Enterprise</SelectItem>
                    <SelectItem value="B2C - Direct to Consumer">B2C - Direct to Consumer</SelectItem>
                    <SelectItem value="Agencies & Partners">Agencies & Partners</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {data.targetAudience === "Other" && (
                  <Input
                    placeholder="Describe your target audience..."
                    value={data.targetAudienceOther}
                    onChange={(e) =>
                      setData({ ...data, targetAudienceOther: e.target.value })
                    }
                    className="mt-2"
                  />
                )}
                {errors.targetAudience && (
                  <p className="text-xs text-red-400">{errors.targetAudience}</p>
                )}
                {errors.targetAudienceOther && (
                  <p className="text-xs text-red-400">{errors.targetAudienceOther}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyLeads">Monthly lead volume</Label>
                <Select
                  value={data.monthlyLeads}
                  onValueChange={(v) => setData({ ...data, monthlyLeads: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select monthly lead volume" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-50">0-50</SelectItem>
                    <SelectItem value="51-200">51-200</SelectItem>
                    <SelectItem value="201-500">201-500</SelectItem>
                    <SelectItem value="501-1000">501-1000</SelectItem>
                    <SelectItem value="1000+">1000+</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {data.monthlyLeads === "Other" && (
                  <Input
                    placeholder="Enter lead volume..."
                    value={data.monthlyLeadsOther}
                    onChange={(e) =>
                      setData({ ...data, monthlyLeadsOther: e.target.value })
                    }
                    className="mt-2"
                  />
                )}
                {errors.monthlyLeads && (
                  <p className="text-xs text-red-400">{errors.monthlyLeads}</p>
                )}
                {errors.monthlyLeadsOther && (
                  <p className="text-xs text-red-400">{errors.monthlyLeadsOther}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="salesCycle">Typical sales cycle</Label>
                <Select
                  value={data.salesCycle}
                  onValueChange={(v) => setData({ ...data, salesCycle: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sales cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="< 1 month">&lt; 1 month</SelectItem>
                    <SelectItem value="1-3 months">1-3 months</SelectItem>
                    <SelectItem value="3-6 months">3-6 months</SelectItem>
                    <SelectItem value="6-12 months">6-12 months</SelectItem>
                    <SelectItem value="12+ months">12+ months</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {data.salesCycle === "Other" && (
                  <Input
                    placeholder="Describe your sales cycle..."
                    value={data.salesCycleOther}
                    onChange={(e) =>
                      setData({ ...data, salesCycleOther: e.target.value })
                    }
                    className="mt-2"
                  />
                )}
                {errors.salesCycle && (
                  <p className="text-xs text-red-400">{errors.salesCycle}</p>
                )}
                {errors.salesCycleOther && (
                  <p className="text-xs text-red-400">{errors.salesCycleOther}</p>
                )}
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="contactName">Your name</Label>
                <Input
                  id="contactName"
                  value={data.contactName}
                  onChange={(e) =>
                    setData({ ...data, contactName: e.target.value })
                  }
                  placeholder="John Doe"
                />
                {errors.contactName && (
                  <p className="text-xs text-red-400">{errors.contactName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email address</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={data.contactEmail}
                  onChange={(e) =>
                    setData({ ...data, contactEmail: e.target.value })
                  }
                  placeholder="john@acme.com"
                />
                {errors.contactEmail && (
                  <p className="text-xs text-red-400">{errors.contactEmail}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone number</Label>
                <Input
                  id="contactPhone"
                  value={data.contactPhone}
                  onChange={(e) =>
                    setData({ ...data, contactPhone: e.target.value })
                  }
                  placeholder="+1 (555) 000-0000"
                />
                {errors.contactPhone && (
                  <p className="text-xs text-red-400">{errors.contactPhone}</p>
                )}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex justify-between gap-4">
        {step > 0 ? (
          <Button variant="outline" onClick={back} disabled={submitting}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <Button
            className="bg-violet-600 hover:bg-violet-700"
            onClick={next}
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="bg-violet-600 hover:bg-violet-700"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Get AI Analysis"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

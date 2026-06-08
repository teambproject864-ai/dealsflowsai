"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { intakeSchema, type IntakeFormData } from "@/lib/types";
import { saveLeadContext } from "@/lib/lead-context";
import { saveLeadOffline } from "@/lib/offlineStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { IconArrowLeft, IconArrowRight } from "@/components/gtm/GtmIcons";

const countries = [
  "United States", "Canada", "United Kingdom", "Germany", "France",
  "Australia", "India", "Singapore", "Japan", "Netherlands", "Other"
];

const targetIndustryOptions = [
  "SaaS", "E-commerce", "Healthcare", "Finance", "Real Estate",
  "Education", "Professional Services", "Manufacturing", "Retail",
  "Logistics", "Cyber Security", "AI/ML", "Other"
];

const targetCompanySizeOptions = [
  "Solopreneur", "Small Business (1–50 Employees)", "Medium Business (51–250 Employees)",
  "Mid-Market (251–1,000 Employees)", "Enterprise (1,001–10,000 Employees)",
  "Large Enterprise (10,000+ Employees)"
];

const empty: IntakeFormData = {
  // Essential fields only
  name: "",
  emailPersonal: "",
  jobTitle: "",
  companyName: "",
  websiteUrl: "",
  website: "",
  headquartersCountry: "United States",
  companyDescription: "",
  productsServices: "",
  primaryOutcome: "",
  keyChallenges: "",
  icpDescription: "",
  targetIndustries: [],
  targetCompanySizes: [],
  additionalNotes: "",
  
  // Maintain all other fields for compatibility (set defaults)
  emailAdditional: "",
  linkedinPage: "",
  headquartersCity: "",
  uniqueValueProp: "",
  successStories: "",
  uploadedDocuments: [],
  customerTestimonials: "No",
  credibilityFactors: "",
  certifications: [],
  certificationsOther: "",
  brandChannels: [],
  brandChannelsOther: "",
  contentTypes: [],
  contentTypesOther: "",
  publishingFrequency: "Weekly",
  riskReductions: [],
  riskReductionsOther: "",
  timeToValue: "Within Weeks",
  primaryCta: "Book a Meeting",
  primaryCtaOther: "",
  outreachAssets: [],
  outreachAssetsOther: "",
  targetIndustriesOther: "",
  targetRevenues: [],
  targetGeographics: [],
  preferredLanguages: [],
  buyingRoles: [],
  buyingRolesOther: "",
  budgetDepartments: [],
  targetSeniorities: [],
  buyingSignals: [],
  buyingSignalsOther: "",
  prospectTechnologies: "",
  crmSystems: [],
  crmSystemsOther: "",
  outreachTools: [],
  outreachToolsOther: "",
  marketingAutomationTools: [],
  marketingAutomationToolsOther: "",
  commonObjections: "",
  overcomeObjections: "",
  messagingThemes: "",
  doNotTarget: "",
};

const stepTitles = [
  "Contact & Company Info",
  "Offer & Challenges",
  "Ideal Customer Profile",
];

export function IntakeForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<IntakeFormData>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function toggleArrayItem(key: keyof IntakeFormData, item: string) {
    setData((prev) => {
      const currentArray = (prev[key] as string[]) || [];
      return {
        ...prev,
        [key]: currentArray.includes(item)
          ? currentArray.filter((i) => i !== item)
          : [...currentArray, item],
      };
    });
  }

  function validateStep(): boolean {
    const e: Record<string, string> = {};

    if (step === 0) {
      if (!data.name.trim()) e.name = "Full name is required";
      if (!data.emailPersonal.trim()) e.emailPersonal = "Business email is required";
      if (!data.jobTitle.trim()) e.jobTitle = "Job title is required";
      if (!data.companyName.trim()) e.companyName = "Company name is required";
      if (!data.websiteUrl.trim()) e.websiteUrl = "Company website is required";
      if (!data.headquartersCountry.trim()) e.headquartersCountry = "Country is required";
    }
    if (step === 1) {
      if (!data.companyDescription.trim()) e.companyDescription = "Company description is required";
      if (!data.productsServices.trim()) e.productsServices = "Products/services are required";
      if (!data.primaryOutcome.trim()) e.primaryOutcome = "Primary outcome is required";
      if (!data.keyChallenges.trim()) e.keyChallenges = "Key challenges are required";
    }
    if (step === 2) {
      if (!data.icpDescription.trim()) e.icpDescription = "ICP description is required";
      if (data.targetIndustries.length === 0) e.targetIndustries = "Select at least one industry";
      if (data.targetCompanySizes.length === 0) e.targetCompanySizes = "Select at least one company size";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validateStep()) return;

    // Map for compatibility
    const submissionData = {
      ...data,
      website: data.websiteUrl,
      brandTrust: data.credibilityFactors,
      contentAndPosting: `Frequency: ${data.publishingFrequency}.`,
      offerPromise: data.primaryOutcome,
      painPoint: data.keyChallenges,
      timeToGetStarted: data.timeToValue,
      irresistibleOffer: data.uniqueValueProp,
      targetCompanySize: data.targetCompanySizes[0] || "SMB",
      targetRegions: data.targetGeographics,
      targetDecisionMakers: "",
      keyBuyingTriggers: data.buyingSignals,
      currentOutreachTools: data.outreachTools || [],
      primaryCampaignCta: data.primaryCta,
      assetsAvailable: data.outreachAssets || [],
      coldEmailSequence: data.messagingThemes,
      giftCardOffer: "Maybe",
    };

    const full = intakeSchema.safeParse(submissionData);
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
      const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
      const res = await fetch("/api/leads/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(full.data),
      });
      const result = await res.json();
      if (result.success && result.leadId) {
        saveLeadContext(full.data, null);
        await saveLeadOffline(result.leadId, full.data, null, true);
        router.push(`/analysis?leadId=${result.leadId}`);
      } else {
        alert(result.error || "Failed to save lead");
      }
    } catch (error) {
      console.warn("API save failed, caching lead offline:", error);
      const tempLeadId = "offline-" + Math.random().toString(36).substring(2, 11);
      saveLeadContext(full.data, null);
      await saveLeadOffline(tempLeadId, full.data, null, false);
      router.push(`/analysis?leadId=${tempLeadId}`);
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    if (!validateStep()) return;
    if (step === stepTitles.length - 1) {
      handleSubmit();
    } else {
      setStep((s) => s + 1);
    }
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
    setErrors({});
  }

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] relative overflow-hidden [perspective:1200px]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_20%_10%,rgba(139,92,246,0.16),transparent)]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />

      <div className="mb-8 flex items-center justify-between gap-4 relative z-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-300/90">
            Step {step + 1} of {stepTitles.length}
          </p>
          <h2 className="text-lg font-bold text-white tracking-tight">{stepTitles[step]}</h2>
        </div>
        <div className="flex gap-1">
          {stepTitles.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-3.5 rounded-full transition-colors ${
                i <= step ? "bg-teal-500 shadow-[0_0_8px_#14b8a6]" : "bg-white/10"
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
          className="space-y-5 relative z-10 min-h-[320px]"
        >
          {/* Step 0: Contact & Company Info */}
          {step === 0 && (
            <>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-2">Primary Contact</h3>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  placeholder="John Doe"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500"
                />
                {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailPersonal">Business Email</Label>
                <Input
                  id="emailPersonal"
                  type="email"
                  value={data.emailPersonal}
                  onChange={(e) => setData({ ...data, emailPersonal: e.target.value })}
                  placeholder="john@company.com"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500"
                />
                {errors.emailPersonal && <p className="text-xs text-red-400">{errors.emailPersonal}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={data.jobTitle}
                  onChange={(e) => setData({ ...data, jobTitle: e.target.value })}
                  placeholder="VP of Growth"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500"
                />
                {errors.jobTitle && <p className="text-xs text-red-400">{errors.jobTitle}</p>}
              </div>

              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-2 pt-4">Company Details</h3>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={data.companyName}
                  onChange={(e) => setData({ ...data, companyName: e.target.value })}
                  placeholder="Acme Corp"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500"
                />
                {errors.companyName && <p className="text-xs text-red-400">{errors.companyName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Company Website</Label>
                <Input
                  id="websiteUrl"
                  value={data.websiteUrl}
                  onChange={(e) => setData({ ...data, websiteUrl: e.target.value })}
                  placeholder="https://acme.com"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500"
                />
                {errors.websiteUrl && <p className="text-xs text-red-400">{errors.websiteUrl}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="headquartersCountry">Country</Label>
                <Select
                  value={data.headquartersCountry}
                  onValueChange={(v) => setData({ ...data, headquartersCountry: v })}
                >
                  <SelectTrigger className="bg-black/20 border-white/10 text-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    {countries.map((c) => (
                      <SelectItem key={c} value={c} className="hover:bg-teal-500/20">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.headquartersCountry && <p className="text-xs text-red-400">{errors.headquartersCountry}</p>}
              </div>
            </>
          )}

          {/* Step 1: Offer & Challenges */}
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="companyDescription">Describe Your Company</Label>
                <Textarea
                  id="companyDescription"
                  value={data.companyDescription}
                  onChange={(e) => setData({ ...data, companyDescription: e.target.value })}
                  placeholder="What does your company do and who do you serve?"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[70px]"
                />
                {errors.companyDescription && <p className="text-xs text-red-400">{errors.companyDescription}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="productsServices">What products/services do you offer?</Label>
                <Textarea
                  id="productsServices"
                  value={data.productsServices}
                  onChange={(e) => setData({ ...data, productsServices: e.target.value })}
                  placeholder="List your core products or services."
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[70px]"
                />
                {errors.productsServices && <p className="text-xs text-red-400">{errors.productsServices}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryOutcome">Primary Outcome</Label>
                <Textarea
                  id="primaryOutcome"
                  value={data.primaryOutcome}
                  onChange={(e) => setData({ ...data, primaryOutcome: e.target.value })}
                  placeholder="What key result do customers get from your solution?"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[70px]"
                />
                {errors.primaryOutcome && <p className="text-xs text-red-400">{errors.primaryOutcome}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyChallenges">Key Challenges Solved</Label>
                <Textarea
                  id="keyChallenges"
                  value={data.keyChallenges}
                  onChange={(e) => setData({ ...data, keyChallenges: e.target.value })}
                  placeholder="Which pain points or bottlenecks do you eliminate?"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[70px]"
                />
                {errors.keyChallenges && <p className="text-xs text-red-400">{errors.keyChallenges}</p>}
              </div>
            </>
          )}

          {/* Step 2: Ideal Customer Profile */}
          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="icpDescription">Ideal Customer Profile</Label>
                <Textarea
                  id="icpDescription"
                  value={data.icpDescription}
                  onChange={(e) => setData({ ...data, icpDescription: e.target.value })}
                  placeholder="Describe your ideal customer (industry, size, pain points, etc.)"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[70px]"
                />
                {errors.icpDescription && <p className="text-xs text-red-400">{errors.icpDescription}</p>}
              </div>
              <div className="space-y-3">
                <Label>Target Industries</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[150px] overflow-y-auto pr-1">
                  {targetIndustryOptions.map((ti) => (
                    <label key={ti} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(data.targetIndustries || []).includes(ti)}
                        onChange={() => toggleArrayItem("targetIndustries", ti)}
                        className="h-4 w-4 text-teal-500"
                      />
                      <span className="text-xs font-semibold text-slate-300">{ti}</span>
                    </label>
                  ))}
                </div>
                {errors.targetIndustries && <p className="text-xs text-red-400">{errors.targetIndustries}</p>}
              </div>
              <div className="space-y-3">
                <Label>Target Company Sizes</Label>
                <div className="grid grid-cols-1 gap-2.5 max-h-[180px] overflow-y-auto pr-1">
                  {targetCompanySizeOptions.map((cs) => (
                    <label key={cs} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(data.targetCompanySizes || []).includes(cs)}
                        onChange={() => toggleArrayItem("targetCompanySizes", cs)}
                        className="h-4 w-4 text-teal-500"
                      />
                      <span className="text-xs font-semibold text-slate-300">{cs}</span>
                    </label>
                  ))}
                </div>
                {errors.targetCompanySizes && <p className="text-xs text-red-400">{errors.targetCompanySizes}</p>}
              </div>
              <div className="space-y-2 pt-2">
                <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                <Textarea
                  id="additionalNotes"
                  value={data.additionalNotes}
                  onChange={(e) => setData({ ...data, additionalNotes: e.target.value })}
                  placeholder="Any other details we should know?"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[60px]"
                />
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex justify-between gap-4 relative z-10">
        <Button
          variant="outline"
          onClick={back}
          disabled={step === 0}
          className="border-white/10 bg-white/5 hover:bg-white/10 text-white disabled:opacity-40 px-4 h-11 rounded-xl"
        >
          <IconArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Button
          onClick={next}
          disabled={submitting}
          className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white px-6 h-11 rounded-xl shadow-lg shadow-teal-600/30 transition-all"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
            </>
          ) : step === stepTitles.length - 1 ? (
            "Submit"
          ) : (
            <>
              Next <IconArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

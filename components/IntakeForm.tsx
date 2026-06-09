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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, File, X } from "lucide-react";
import { IconArrowLeft, IconArrowRight } from "@/components/gtm/GtmIcons";

// --- Custom field options as per user's request ---
const certificationOptions = [
  "GDPR", "ISO 27001", "SOC 2", "HIPAA", "PCI DSS", "Other (Specify)"
];
const socialOptions = [
  "LinkedIn", "YouTube", "X (Twitter)", "Facebook", "Instagram", "Industry Communities", "Not Active"
];
const publishingOptions = [
  "Daily", "Multiple Times per Week", "Weekly", "Monthly", "Occasionally", "Rarely/Never"
];
const riskReversalOptions = [
  "Performance-Based Pricing", "Milestone-Based Billing", "Money-Back Guarantee", "Pilot Program", "Free Trial", "None", "Other (Specify)"
];
const timeToStartOptions = [
  "Same Day", "Within 1–3 Days", "Within 1 Week", "Within 2–4 Weeks", "More than 1 Month"
];
const primaryCtaOptions = [
  "Book a Call", "Schedule a Demo", "Free Audit", "Download Resource", "Sign Up for Trial", "Consultation Request", "Other"
];
const outreachAssets = [
  "Loom Video", "One-pager", "Mini Case Study", "Pitch Deck", "Checklist", "Whitepaper", "Audit Report", "Other"
];
const targetIndustries = [
  "SaaS", "FinTech", "Healthcare", "Manufacturing", "Retail", "Logistics", "Education", "Real Estate", "IT Services", "E-commerce", "Other"
];
const targetCompanySizes = [
  "Startup (1–10 Employees)", "Early Stage (11–50 Employees)", "Growth Stage (51–200 Employees)", "Mid-Market (201–1000 Employees)", "Enterprise (1000+ Employees)"
];
const targetRegions = [
  "North America", "Europe", "United Kingdom", "APAC", "Middle East", "LATAM", "Africa", "Global"
];
const decisionMakers = [
  "Founder", "CEO", "COO", "CTO", "CIO", "VP Sales", "VP Marketing", "Head of Operations", "Procurement", "HR Leadership", "Other"
];
const buyingTriggers = [
  "Funding Rounds", "Leadership Changes", "Hiring Growth", "Expansion into New Markets", "Technology Adoption", "Mergers & Acquisitions", "Compliance Deadlines", "Product Launches", "Other"
];
const techTools = [
  "Apollo", "HubSpot", "Salesforce", "Outreach", "Lemlist", "Clay", "Instantly", "Salesloft", "Zoho CRM", "Pipedrive", "Other"
];
const giftCardOptions = ["Yes", "No", "Depends on the Prospect"];

// --- Empty Initial State, including defaults for schema-required fields ---
const empty: Partial<IntakeFormData> & Record<string, any> = {
  // --- User-specified fields ---
  name: "",
  additionalEmail: "",
  companyName: "",
  websiteUrl: "",
  emailPersonal: "",

  caseStudies: "",
  uploadedDocuments: [],
  certifications: [],
  certificationsOther: "",
  trustFactors: "",

  socialPlatforms: [],
  linkedInContent: "",
  publishingFrequency: "",
  offerPromise: "",
  irresistibleHook: "",
  painPoint: "",

  riskReversal: [],
  riskReversalOther: "",
  timeToStart: "",
  primaryCta: "",
  primaryCtaOther: "",
  minimumAsset: [],
  minimumAssetOther: "",
  objectionsHandling: "",
  emailSequenceThemes: "",
  giftCard: "",

  icpDescription: "",
  targetIndustries: [],
  targetIndustriesOther: "",
  targetCompanySizes: [],
  targetGeographicRegionsText: "", // User wants this as a TEXT AREA
  decisionMakers: [],
  decisionMakersOther: "",
  buyingTriggers: [],
  buyingTriggersOther: "",

  currentTools: [],
  currentToolsOther: "",
  additionalNotes: "",

  // --- Schema-required defaults (backward compatibility) ---
  jobTitle: "Not specified",
  headquartersCountry: "Not specified",
  headquartersCity: "Not specified",
  companyDescription: "Not specified",
  productsServices: "Not specified",
  primaryOutcome: "Not specified",
  keyChallenges: "Not specified",
  uniqueValueProp: "Not specified",
  successStories: "Not specified",
  customerTestimonials: "Not specified",
  credibilityFactors: "Not specified",
  contentTypes: [],
  riskReductions: [],
  timeToValue: "Not specified",
  targetRevenues: ["Not specified"],
  preferredLanguages: ["English"],
  buyingRoles: ["Not specified"],
  budgetDepartments: ["Not specified"],
  targetSeniorities: ["Not specified"],
  prospectTechnologies: "Not specified",
  commonObjections: "Not specified",
  overcomeObjections: "Not specified",
  messagingThemes: "Not specified",
  targetGeographics: [], // Missing required field
  buyingSignals: [], // Missing required field
};

const stepTitles = [
  "Company Information",
  "Proof of Results & Credibility",
  "Brand Presence & Positioning",
  "Offer & Sales Process",
  "Ideal Customer Profile",
  "Tech Stack & Outreach"
];

export function IntakeForm({ onComplete }: { onComplete?: () => void }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [data, setData] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [schemaErrors, setSchemaErrors] = useState<string[]>([]);

  // Helper: Toggle array items (for checkboxes)
  function toggleArrayItem(key: string, item: string) {
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

  // File upload handling
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map((f) => f.name);
      setData((prev) => ({
        ...prev,
        uploadedDocuments: [...(prev.uploadedDocuments || []), ...filesArray],
      }));
    }
  }
  function removeUploadedDocument(index: number) {
    setData((prev) => ({
      ...prev,
      uploadedDocuments: (prev.uploadedDocuments || []).filter((_, i) => i !== index),
    }));
  }

  // Step validation
  function validateStep(): boolean {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!data.name?.trim()) e.name = "Full name is required";
      if (!data.emailPersonal?.trim()) e.emailPersonal = "Primary email is required";
      if (!data.companyName?.trim()) e.companyName = "Company name is required";
      if (!data.websiteUrl?.trim()) e.websiteUrl = "Company website is required";
    } else if (step === 1) {
      if (!data.caseStudies?.trim()) e.caseStudies = "Please share at least three case studies";
      if (!data.trustFactors?.trim()) e.trustFactors = "Please explain why prospects should trust your company";
    } else if (step === 2) {
      if (data.socialPlatforms.length === 0) e.socialPlatforms = "Select at least one option";
      if (!data.offerPromise?.trim()) e.offerPromise = "Please share your offer promise";
      if (!data.painPoint?.trim()) e.painPoint = "Please share the pain point your offer solves";
    } else if (step === 3) {
      if (!data.timeToStart) e.timeToStart = "Please select how quickly customers can get started";
      if (!data.primaryCta) e.primaryCta = "Please select your primary CTA";
      if (!data.objectionsHandling?.trim()) e.objectionsHandling = "Please share common objections and how you address them";
      if (!data.giftCard) e.giftCard = "Please select your answer";
    } else if (step === 4) {
      if (!data.icpDescription?.trim()) e.icpDescription = "Please describe your ICP";
      if (data.targetIndustries.length === 0) e.targetIndustries = "Select at least one industry";
      if (data.targetCompanySizes.length === 0) e.targetCompanySizes = "Select at least one company size";
      if (!data.targetGeographicRegionsText?.trim()) e.targetGeographicRegionsText = "Please specify target geographic regions";
      if (data.decisionMakers.length === 0) e.decisionMakers = "Select at least one decision maker";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // --- Handle Submit ---
  async function handleSubmit() {
    if (!validateStep()) return;
    setSubmitting(true);
    setSchemaErrors([]);

    // --- Map user's form data to schema fields ---
    const submissionData: any = {
      ...data,
      website: data.websiteUrl, // Backward compatibility
      brandTrust: data.trustFactors,
      contentAndPosting: `Frequency: ${data.publishingFrequency}, LinkedIn content: ${data.linkedInContent || "Not specified"}`,
      offerPromise: data.offerPromise,
      painPoint: data.painPoint,
      timeToValue: data.timeToStart,
      timeToGetStarted: data.timeToStart,
      irresistibleOffer: data.irresistibleHook,
      targetCompanySize: data.targetCompanySizes?.[0] || "SMB",
      targetGeographics: data.targetGeographicRegionsText.split(",").map((s: string) => s.trim()), // Map to required targetGeographics
      targetRegions: data.targetGeographicRegionsText.split(",").map((s: string) => s.trim()), // Convert text area to array for schema
      targetDecisionMakers: data.decisionMakers?.join(", "),
      keyBuyingTriggers: data.buyingTriggers,
      buyingSignals: data.buyingTriggers, // Map to required buyingSignals
      currentOutreachTools: data.currentTools,
      primaryCampaignCta: data.primaryCta,
      assetsAvailable: data.minimumAsset,
      coldEmailSequence: data.emailSequenceThemes,
      giftCardOffer: data.giftCard,
    };

    // Validate against zod schema
    const fullValidation = intakeSchema.safeParse(submissionData);
    if (fullValidation.success && onComplete) {
      onComplete(); // Trigger onComplete when form is successfully validated!
    }
    if (!fullValidation.success) {
      const flatErrors = fullValidation.error.flatten().fieldErrors;
      const e: Record<string, string> = {};
      const schemaErrorList: string[] = [];
      Object.entries(flatErrors).forEach(([key, messages]) => {
        if (messages?.length) {
          e[key] = messages[0];
          schemaErrorList.push(`${key}: ${messages[0]}`);
        }
      });
      setErrors(e);
      setSchemaErrors(schemaErrorList);
      setSubmitting(false);
      console.error("Schema validation failed:", fullValidation.error);
      return;
    }

    // --- Submit (online/offline) ---
    try {
      const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
      const res = await fetch("/api/leads/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullValidation.data),
      });
      const result = await res.json();
      if (result.success && result.leadId) {
        saveLeadContext(fullValidation.data, null);
        await saveLeadOffline(result.leadId, fullValidation.data, null, true);
        router.push(`/analysis?leadId=${result.leadId}`);
      } else {
        alert(result.error || "Failed to save lead");
        setSubmitting(false);
      }
    } catch (error) {
      console.warn("API save failed, caching offline:", error);
      const tempLeadId = "offline-" + Math.random().toString(36).substring(2, 11);
      saveLeadContext(fullValidation.data, null);
      await saveLeadOffline(tempLeadId, fullValidation.data, null, false);
      router.push(`/analysis?leadId=${tempLeadId}`);
    } finally {
      if (!router.pathname?.includes("/analysis")) {
        setSubmitting(false);
      }
    }
  }

  // --- Step Navigation ---
  function next() {
    if (!validateStep()) return;
    if (step === stepTitles.length - 1) {
      handleSubmit();
    } else {
      setStep((s) => s + 1);
      setErrors({});
    }
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
    setErrors({});
    setSchemaErrors([]);
  }

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] relative overflow-hidden">
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

      {schemaErrors.length > 0 && (
        <div className="bg-red-900/30 border border-red-500/50 p-3 mb-4 rounded-xl text-xs text-red-200 relative z-10">
          <p className="font-semibold mb-1">Validation issues:</p>
          <ul className="list-disc pl-4">
            {schemaErrors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
          className="space-y-5 relative z-10 min-h-[360px]"
        >
          {/* --- Step 1: Company Information --- */}
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-2">
                Company Information
              </h3>
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
                <Label htmlFor="emailPersonal">Primary Email Address</Label>
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
                <Label htmlFor="additionalEmail">Additional Email Address</Label>
                <Input
                  id="additionalEmail"
                  type="email"
                  value={data.additionalEmail}
                  onChange={(e) => setData({ ...data, additionalEmail: e.target.value })}
                  placeholder="optional@company.com"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500"
                />
              </div>

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
            </div>
          )}

          {/* --- Step 2: Proof of Results & Credibility --- */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-2">
                Proof of Results & Credibility
              </h3>

              <div className="space-y-2">
                <Label htmlFor="caseStudies">
                  Can you share at least three case studies with measurable outcomes?
                </Label>
                <Textarea
                  id="caseStudies"
                  value={data.caseStudies}
                  onChange={(e) => setData({ ...data, caseStudies: e.target.value })}
                  placeholder="Case 1: X company grew by 40%... Bonus: Include video testimonials, customer quotes, or success stories..."
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[120px]"
                />
                {errors.caseStudies && <p className="text-xs text-red-400">{errors.caseStudies}</p>}
              </div>

              <div className="space-y-2">
                <Label>Upload Supporting Case Study Documents</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 hover:border-teal-500/50 bg-black/20 rounded-xl p-4 text-center cursor-pointer transition-all hover:bg-white/[0.02]"
                >
                  <Upload className="mx-auto h-8 w-8 text-teal-400 mb-2" />
                  <p className="text-sm font-semibold text-white">Drag & drop files here or click to browse</p>
                  <p className="text-xs text-slate-500 mt-1">Supports PDF, DOCX, PNG, MP4 up to 50MB</p>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />
                </div>
                {data.uploadedDocuments?.length > 0 && (
                  <div className="space-y-1.5 mt-2 max-h-[100px] overflow-y-auto">
                    {data.uploadedDocuments.map((doc: string, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-slate-300">
                        <div className="flex items-center gap-2 truncate">
                          <File className="h-3.5 w-3.5 text-teal-400 flex-shrink-0" />
                          <span className="truncate">{doc}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); removeUploadedDocument(idx); }} className="text-slate-500 hover:text-red-400 p-0.5 transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label>What certifications or compliance standards does your company hold?</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[170px] overflow-y-auto pr-1">
                  {certificationOptions.map((cert) => (
                    <div key={cert} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5">
                      <Checkbox
                        id={`cert-${cert}`}
                        checked={(data.certifications || []).includes(cert)}
                        onCheckedChange={() => toggleArrayItem("certifications", cert)}
                      />
                      <label htmlFor={`cert-${cert}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {cert}
                      </label>
                    </div>
                  ))}
                </div>
                {(data.certifications || []).includes("Other (Specify)") && (
                  <Input
                    placeholder="Specify other certification..."
                    value={data.certificationsOther}
                    onChange={(e) => setData({ ...data, certificationsOther: e.target.value })}
                    className="bg-black/20 border-white/10 text-white mt-1.5 placeholder-slate-500"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="trustFactors">Why should prospects trust your company even if they've never heard of your brand?</Label>
                <Textarea
                  id="trustFactors"
                  value={data.trustFactors}
                  onChange={(e) => setData({ ...data, trustFactors: e.target.value })}
                  placeholder="Social proof, authority, industry recognition, unique positioning, credibility indicators, etc."
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[80px]"
                />
                {errors.trustFactors && <p className="text-xs text-red-400">{errors.trustFactors}</p>}
              </div>
            </div>
          )}

          {/* --- Step 3: Brand Presence & Positioning --- */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-2">
                Brand Presence & Positioning
              </h3>

              <div className="space-y-3">
                <Label>Is your brand actively visible on social platforms?</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[170px] overflow-y-auto pr-1">
                  {socialOptions.map((ch) => (
                    <div key={ch} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5">
                      <Checkbox
                        id={`social-${ch}`}
                        checked={(data.socialPlatforms || []).includes(ch)}
                        onCheckedChange={() => toggleArrayItem("socialPlatforms", ch)}
                      />
                      <label htmlFor={`social-${ch}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {ch}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.socialPlatforms && <p className="text-xs text-red-400">{errors.socialPlatforms}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedInContent">What type of content or messaging do you share on LinkedIn?</Label>
                <Textarea
                  id="linkedInContent"
                  value={data.linkedInContent}
                  onChange={(e) => setData({ ...data, linkedInContent: e.target.value })}
                  placeholder="What do you post on LinkedIn?"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[70px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="publishingFrequency">How consistently do you publish content?</Label>
                <Select value={data.publishingFrequency} onValueChange={(v) => setData({ ...data, publishingFrequency: v })}>
                  <SelectTrigger className="bg-black/20 border-white/10 text-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    {publishingOptions.map((opt) => (
                      <SelectItem key={opt} value={opt} className="hover:bg-teal-500/20">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="offerPromise">What is the clear, no-fluff promise your offer delivers?</Label>
                <Textarea
                  id="offerPromise"
                  value={data.offerPromise}
                  onChange={(e) => setData({ ...data, offerPromise: e.target.value })}
                  placeholder="Clear, concise promise..."
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[70px]"
                />
                {errors.offerPromise && <p className="text-xs text-red-400">{errors.offerPromise}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="irresistibleHook">Do you have an irresistible hook or offer?</Label>
                <Textarea
                  id="irresistibleHook"
                  value={data.irresistibleHook}
                  onChange={(e) => setData({ ...data, irresistibleHook: e.target.value })}
                  placeholder="Examples: Free Audit, Guaranteed Results, Done-for-You in 7 Days, Free Strategy Session..."
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[70px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="painPoint">What pain point does your offer solve in one sentence?</Label>
                <Textarea
                  id="painPoint"
                  value={data.painPoint}
                  onChange={(e) => setData({ ...data, painPoint: e.target.value })}
                  placeholder="Focus on the prospect's problem rather than product features..."
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[70px]"
                />
                {errors.painPoint && <p className="text-xs text-red-400">{errors.painPoint}</p>}
              </div>
            </div>
          )}

          {/* --- Step4: Offer & Sales Process --- */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-2">
                Offer & Sales Process
              </h3>

              <div className="space-y-3">
                <Label>Do you offer any risk-reversal mechanisms?</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[170px] overflow-y-auto pr-1">
                  {riskReversalOptions.map((rr) => (
                    <div key={rr} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5">
                      <Checkbox
                        id={`rr-${rr}`}
                        checked={(data.riskReversal || []).includes(rr)}
                        onCheckedChange={() => toggleArrayItem("riskReversal", rr)}
                      />
                      <label htmlFor={`rr-${rr}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {rr}
                      </label>
                    </div>
                  ))}
                </div>
                {(data.riskReversal || []).includes("Other (Specify)") && (
                  <Input
                    placeholder="Specify other risk-reversal mechanism..."
                    value={data.riskReversalOther}
                    onChange={(e) => setData({ ...data, riskReversalOther: e.target.value })}
                    className="bg-black/20 border-white/10 text-white mt-1.5 placeholder-slate-500"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeToStart">How quickly can a customer get started with your offer?</Label>
                <Select value={data.timeToStart} onValueChange={(v) => setData({ ...data, timeToStart: v })}>
                  <SelectTrigger className="bg-black/20 border-white/10 text-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    {timeToStartOptions.map((opt) => (
                      <SelectItem key={opt} value={opt} className="hover:bg-teal-500/20">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.timeToStart && <p className="text-xs text-red-400">{errors.timeToStart}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryCta">What is your primary Call-to-Action (CTA) for this campaign?</Label>
                <Select value={data.primaryCta} onValueChange={(v) => setData({ ...data, primaryCta: v })}>
                  <SelectTrigger className="bg-black/20 border-white/10 text-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    {primaryCtaOptions.map((opt) => (
                      <SelectItem key={opt} value={opt} className="hover:bg-teal-500/20">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.primaryCta && <p className="text-xs text-red-400">{errors.primaryCta}</p>}
                {data.primaryCta === "Other" && (
                  <Input
                    placeholder="Specify other CTA..."
                    value={data.primaryCtaOther}
                    onChange={(e) => setData({ ...data, primaryCtaOther: e.target.value })}
                    className="bg-black/20 border-white/10 text-white mt-2 placeholder-slate-500"
                  />
                )}
              </div>

              <div className="space-y-3">
                <Label>What is the minimum viable asset we can share in the first outreach message?</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[170px] overflow-y-auto pr-1">
                  {outreachAssets.map((oa) => (
                    <div key={oa} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5">
                      <Checkbox
                        id={`asset-${oa}`}
                        checked={(data.minimumAsset || []).includes(oa)}
                        onCheckedChange={() => toggleArrayItem("minimumAsset", oa)}
                      />
                      <label htmlFor={`asset-${oa}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {oa}
                      </label>
                    </div>
                  ))}
                </div>
                {(data.minimumAsset || []).includes("Other") && (
                  <Input
                    placeholder="Specify other asset..."
                    value={data.minimumAssetOther}
                    onChange={(e) => setData({ ...data, minimumAssetOther: e.target.value })}
                    className="bg-black/20 border-white/10 text-white mt-1.5 placeholder-slate-500"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="objectionsHandling">What objections do prospects most commonly raise, and how do you address them?</Label>
                <Textarea
                  id="objectionsHandling"
                  value={data.objectionsHandling}
                  onChange={(e) => setData({ ...data, objectionsHandling: e.target.value })}
                  placeholder="Common objections and your responses..."
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[80px]"
                />
                {errors.objectionsHandling && <p className="text-xs text-red-400">{errors.objectionsHandling}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailSequenceThemes">If you were writing a 5-email outbound sequence yourself, what themes, messaging, and proof points would you include?</Label>
                <Textarea
                  id="emailSequenceThemes"
                  value={data.emailSequenceThemes}
                  onChange={(e) => setData({ ...data, emailSequenceThemes: e.target.value })}
                  placeholder="What themes and messaging should we include?"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="giftCard">Would you be open to offering a small thank-you gift card ($50) for a 15-minute customer research call?</Label>
                <Select value={data.giftCard} onValueChange={(v) => setData({ ...data, giftCard: v })}>
                  <SelectTrigger className="bg-black/20 border-white/10 text-white"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white">
                    {giftCardOptions.map((opt) => (
                      <SelectItem key={opt} value={opt} className="hover:bg-teal-500/20">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.giftCard && <p className="text-xs text-red-400">{errors.giftCard}</p>}
              </div>
            </div>
          )}

          {/* --- Step 5: Ideal Customer Profile (ICP) --- */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-2">
                Ideal Customer Profile
              </h3>

              <div className="space-y-2">
                <Label htmlFor="icpDescription">Who is your Ideal Customer Profile (ICP)?</Label>
                <Textarea
                  id="icpDescription"
                  value={data.icpDescription}
                  onChange={(e) => setData({ ...data, icpDescription: e.target.value })}
                  placeholder="Describe your ICP..."
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[80px]"
                />
                {errors.icpDescription && <p className="text-xs text-red-400">{errors.icpDescription}</p>}
              </div>

              <div className="space-y-3">
                <Label>Target Industry Verticals</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[150px] overflow-y-auto pr-1">
                  {targetIndustries.map((ind) => (
                    <div key={ind} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5">
                      <Checkbox
                        id={`ind-${ind}`}
                        checked={(data.targetIndustries || []).includes(ind)}
                        onCheckedChange={() => toggleArrayItem("targetIndustries", ind)}
                      />
                      <label htmlFor={`ind-${ind}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {ind}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.targetIndustries && <p className="text-xs text-red-400">{errors.targetIndustries}</p>}
                {(data.targetIndustries || []).includes("Other") && (
                  <Input
                    placeholder="Specify other industry..."
                    value={data.targetIndustriesOther}
                    onChange={(e) => setData({ ...data, targetIndustriesOther: e.target.value })}
                    className="bg-black/20 border-white/10 text-white mt-1.5 placeholder-slate-500"
                  />
                )}
              </div>

              <div className="space-y-3">
                <Label>Target Company Size / Growth Stage</Label>
                <div className="grid grid-cols-1 gap-2.5 max-h-[180px] overflow-y-auto pr-1">
                  {targetCompanySizes.map((cs) => (
                    <div key={cs} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5">
                      <Checkbox
                        id={`cs-${cs}`}
                        checked={(data.targetCompanySizes || []).includes(cs)}
                        onCheckedChange={() => toggleArrayItem("targetCompanySizes", cs)}
                      />
                      <label htmlFor={`cs-${cs}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {cs}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.targetCompanySizes && <p className="text-xs text-red-400">{errors.targetCompanySizes}</p>}
              </div>

              {/* --- User requested Target Geographic Regions as TEXT AREA --- */}
              <div className="space-y-2">
                <Label htmlFor="targetGeographicRegionsText">Target Geographic Regions</Label>
                <Textarea
                  id="targetGeographicRegionsText"
                  value={data.targetGeographicRegionsText}
                  onChange={(e) => setData({ ...data, targetGeographicRegionsText: e.target.value })}
                  placeholder="North America, Europe, APAC, etc. (comma separated)"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[80px]"
                />
                {errors.targetGeographicRegionsText && <p className="text-xs text-red-400">{errors.targetGeographicRegionsText}</p>}
              </div>

              <div className="space-y-3">
                <Label>Who are the decision-makers and influencers you are targeting?</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[170px] overflow-y-auto pr-1">
                  {decisionMakers.map((dm) => (
                    <div key={dm} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5">
                      <Checkbox
                        id={`dm-${dm}`}
                        checked={(data.decisionMakers || []).includes(dm)}
                        onCheckedChange={() => toggleArrayItem("decisionMakers", dm)}
                      />
                      <label htmlFor={`dm-${dm}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {dm}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.decisionMakers && <p className="text-xs text-red-400">{errors.decisionMakers}</p>}
                {(data.decisionMakers || []).includes("Other") && (
                  <Input
                    placeholder="Specify other decision maker..."
                    value={data.decisionMakersOther}
                    onChange={(e) => setData({ ...data, decisionMakersOther: e.target.value })}
                    className="bg-black/20 border-white/10 text-white mt-1.5 placeholder-slate-500"
                  />
                )}
              </div>

              <div className="space-y-3">
                <Label>Any specific buying triggers or events you target?</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[150px] overflow-y-auto pr-1">
                  {buyingTriggers.map((bt) => (
                    <div key={bt} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5">
                      <Checkbox
                        id={`bt-${bt}`}
                        checked={(data.buyingTriggers || []).includes(bt)}
                        onCheckedChange={() => toggleArrayItem("buyingTriggers", bt)}
                      />
                      <label htmlFor={`bt-${bt}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {bt}
                      </label>
                    </div>
                  ))}
                </div>
                {(data.buyingTriggers || []).includes("Other") && (
                  <Input
                    placeholder="Specify other trigger..."
                    value={data.buyingTriggersOther}
                    onChange={(e) => setData({ ...data, buyingTriggersOther: e.target.value })}
                    className="bg-black/20 border-white/10 text-white mt-1.5 placeholder-slate-500"
                  />
                )}
              </div>
            </div>
          )}

          {/* --- Step 6: Tech Stack & Outreach --- */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-2">
                Tech Stack & Outreach
              </h3>

              <div className="space-y-3">
                <Label>What tools or platforms do you currently use for outreach, CRM, and lead tracking?</Label>
                <div className="grid grid-cols-2 gap-2.5 max-h-[170px] overflow-y-auto pr-1">
                  {techTools.map((tool) => (
                    <div key={tool} className="flex items-center space-x-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2.5">
                      <Checkbox
                        id={`tool-${tool}`}
                        checked={(data.currentTools || []).includes(tool)}
                        onCheckedChange={() => toggleArrayItem("currentTools", tool)}
                      />
                      <label htmlFor={`tool-${tool}`} className="text-xs font-semibold text-slate-300 leading-none cursor-pointer">
                        {tool}
                      </label>
                    </div>
                  ))}
                </div>
                {(data.currentTools || []).includes("Other") && (
                  <Input
                    placeholder="Specify other tool..."
                    value={data.currentToolsOther}
                    onChange={(e) => setData({ ...data, currentToolsOther: e.target.value })}
                    className="bg-black/20 border-white/10 text-white mt-1.5 placeholder-slate-500"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes or Requirements</Label>
                <Textarea
                  id="additionalNotes"
                  value={data.additionalNotes}
                  onChange={(e) => setData({ ...data, additionalNotes: e.target.value })}
                  placeholder="Any other notes or requirements?"
                  className="bg-black/20 border-white/10 text-white placeholder-slate-500 min-h-[80px]"
                />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex justify-between gap-4 relative z-10">
        <Button variant="outline" onClick={back} disabled={step === 0} className="border-white/10 bg-white/5 hover:bg-white/10 text-white disabled:opacity-40 px-4 h-11 rounded-xl">
          <IconArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Button onClick={next} disabled={submitting} className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white px-6 h-11 rounded-xl shadow-lg shadow-teal-600/30 transition-all">
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

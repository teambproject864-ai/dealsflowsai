import { z } from "zod";

export const challengeOptions = [
  "Low lead quality / poor fit",
  "Manual follow-up bottlenecks",
  "No unified view of pipeline",
  "Weak attribution / unclear ROI",
  "Scaling outbound without burning domains",
  "Long sales cycles",
  "Inconsistent messaging across channels",
  "Other",
] as const;

export const toolOptions = [
  "Salesforce",
  "HubSpot",
  "Pipedrive",
  "Mailchimp",
  "Apollo.io",
  "Clay",
  "Instantly.ai",
  "Loom",
  "Other",
] as const;

const urlWithProtocol = z.preprocess((val) => {
  if (typeof val !== "string") return val;
  const t = val.trim();
  if (!t) return t;
  if (!/^https?:\/\//i.test(t)) return `https://${t}`;
  return t;
}, z.string().url("Enter a valid URL"));

export const intakeSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  websiteUrl: urlWithProtocol,
  companySize: z.string().min(1, "Company size is required"),
  revenue: z.string().min(1, "Revenue range is required"),
  currentTools: z.array(z.string()).min(1, "Select at least one tool"),
  challenges: z.array(z.string()).min(1, "Select at least one challenge"),
  challengesOther: z.string().optional(),
  targetAudience: z.string().min(1, "Target audience is required"),
  monthlyLeads: z.string().min(1, "Monthly lead volume is required"),
  salesCycle: z.string().min(1, "Sales cycle is required"),
  contactName: z.string().min(1, "Contact name is required"),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().min(1, "Contact phone is required"),
  targetAudienceOther: z.string().optional(),
  monthlyLeadsOther: z.string().optional(),
  salesCycleOther: z.string().optional(),
});

export type IntakeFormData = z.infer<typeof intakeSchema>;

export type PainPoint = {
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
};

export type SolutionMapping = {
  painPoint: string;
  solution: string;
  expectedOutcome: string;
  roiEstimate: string;
  beforeAfter: {
    before: string;
    after: string;
  };
};

export type AnalysisResult = {
  analysisId?: string;
  leadId?: string;
  companyName?: string;
  healthScore: number;
  executiveSummary: string;
  painPoints: PainPoint[];
  missedRevenue: {
    label: string;
    estimate: string;
    detail: string;
  }[];
  stackGaps: string[];
  solutions: SolutionMapping[];
};

export const STORAGE_KEY = "dealflow_lead_context_v1";

export type StoredLeadContext = {
  form: IntakeFormData;
  analysis: AnalysisResult | null;
  updatedAt: string;
  createdAt: string;
};

// --- Agent Learning Memory (MemPalace) Architecture ---
export type MemoryCategory = 'Knowledge' | 'Rule' | 'Experience' | 'Insight' | 'Objection' | 'Preference';

export type MemoryEntry = {
  id?: string;
  leadId: string;
  agentName: string;
  category: MemoryCategory;
  content: string;
  keywords: string[];
  createdAt: string;
  importance: number; // 1-10
  lastAccessed?: string;
  accessCount?: number;
};

export type MemPalaceContext = {
  relevantMemories: MemoryEntry[];
  summary?: string;
};

export type CallStatus = 'scheduled' | 'in-progress' | 'completed' | 'failed' | 'canceled';
export type CallMode = 'calendar' | 'immediate';

export interface CallRecord {
  id?: string;
  leadId: string;
  analysisId: string;
  status: CallStatus;
  callMode: CallMode;
  meetingUrl?: string;
  recallBotId?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  updatedAtMs: number;
  dealStatus?: string;
  dealProbability?: number;
  guests?: string[];
  agentPersona?: string;
  lastHeartbeat?: string;
}

export interface LeadRecord {
  id?: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  websiteUrl?: string;
  industry?: string;
  companySize?: string;
  revenue?: string;
  currentTools?: string[];
  challenges?: string[];
  targetAudience?: string;
  monthlyLeads?: string;
  salesCycle?: string;
  analysisId?: string;
  createdAt: any;
}

export interface TranscriptSegment {
  speaker: string;
  text: string;
  timestamp: string;
}

export interface TranscriptRecord {
  id?: string;
  callId: string;
  segments: TranscriptSegment[];
  updatedAt: string;
}

export interface SummaryRecord {
  id?: string;
  callId: string;
  content: string;
  type: 'pre-call' | 'post-call';
  sentTo?: string[];
  sentAt: string;
}

export interface ScreenSession {
  callId: string;
  url: string;
  lastActive: number;
}

export const createCallSchema = z.object({
  leadId: z.string().min(1),
  analysisId: z.string().optional().default(""),
  meetingUrl: z.string().optional(),
  scheduledAt: z.string().datetime(),
  guests: z.array(z.string().email()).optional(),
});

export const immediateCallSchema = z.object({
  leadId: z.string().min(1),
  analysisId: z.string().min(1),
  personaKey: z.string().optional(),
});

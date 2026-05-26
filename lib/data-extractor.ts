import type { IntakeFormData, AnalysisResult } from "./types";
import { z } from "zod";

export interface ExtractedData {
  id: string;
  extractedAt: string;
  userSubmitted: ExtractedUserSubmitted;
  analysisReport: ExtractedAnalysisReport;
  validation: ExtractionValidation;
  auditTrail: AuditTrailEntry[];
}

export interface ExtractedUserSubmitted {
  companyName: string;
  industry: string;
  websiteUrl: string;
  companySize: string;
  revenue: string;
  currentTools: string[];
  challenges: string[];
  targetAudience: string;
  monthlyLeads: string;
  salesCycle: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export interface ExtractedAnalysisReport {
  healthScore: number;
  executiveSummary: string;
  painPoints: Array<{ title: string; severity: string; description: string }>;
  solutions: Array<{
    painPoint: string;
    solution: string;
    expectedOutcome: string;
    roiEstimate: string;
  }>;
  stackGaps: string[];
}

export interface ExtractionValidation {
  isValid: boolean;
  missingFields: string[];
  invalidFields: string[];
  verificationPassed: boolean;
}

export interface AuditTrailEntry {
  timestamp: string;
  action: string;
  details: string;
  level: "info" | "warn" | "error";
}

const userSubmittedSchema = z.object({
  companyName: z.string().min(1),
  industry: z.string().min(1),
  websiteUrl: z.string().url(),
  companySize: z.string().min(1),
  revenue: z.string().min(1),
  currentTools: z.array(z.string()).min(1),
  challenges: z.array(z.string()).min(1),
  targetAudience: z.string().min(1),
  monthlyLeads: z.string().min(1),
  salesCycle: z.string().min(1),
  contactName: z.string().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(1),
});

const analysisReportSchema = z.object({
  healthScore: z.number().int().min(0).max(100),
  executiveSummary: z.string().min(1),
  painPoints: z.array(
    z.object({
      title: z.string().min(1),
      severity: z.string().min(1),
      description: z.string().min(1),
    })
  ),
  solutions: z.array(
    z.object({
      painPoint: z.string().min(1),
      solution: z.string().min(1),
      expectedOutcome: z.string().min(1),
      roiEstimate: z.string().min(1),
    })
  ),
  stackGaps: z.array(z.string()).optional().default([]),
});

class AuditLogger {
  private entries: AuditTrailEntry[] = [];

  log(action: string, details: string, level: "info" | "warn" | "error" = "info") {
    const entry: AuditTrailEntry = {
      timestamp: new Date().toISOString(),
      action,
      details,
      level,
    };
    this.entries.push(entry);
    console.log(`[Data Extractor] [${level.toUpperCase()}] ${action}: ${details}`);
  }

  getEntries(): AuditTrailEntry[] {
    return [...this.entries];
  }
}

export async function extractAndValidateData(
  id: string,
  userData: IntakeFormData,
  analysisData: AnalysisResult
): Promise<ExtractedData> {
  const auditLogger = new AuditLogger();
  auditLogger.log("extraction_started", `Starting data extraction for ID: ${id}`);

  const extractedUserSubmitted = extractUserSubmitted(userData, auditLogger);
  const extractedAnalysis = extractAnalysisReport(analysisData, auditLogger);

  const validation = validateExtractedData(
    extractedUserSubmitted,
    extractedAnalysis,
    userData,
    analysisData,
    auditLogger
  );

  const extractedData: ExtractedData = {
    id,
    extractedAt: new Date().toISOString(),
    userSubmitted: extractedUserSubmitted,
    analysisReport: extractedAnalysis,
    validation,
    auditTrail: auditLogger.getEntries(),
  };

  auditLogger.log("extraction_completed", `Data extraction completed for ID: ${id}, isValid: ${validation.isValid}`);

  return extractedData;
}

function extractUserSubmitted(
  userData: IntakeFormData,
  auditLogger: AuditLogger
): ExtractedUserSubmitted {
  auditLogger.log("extract_user_submitted", "Extracting user submitted data");

  const extracted: ExtractedUserSubmitted = {
    companyName: userData.companyName.trim(),
    industry: userData.industry.trim(),
    websiteUrl: userData.websiteUrl,
    companySize: userData.companySize,
    revenue: userData.revenue,
    currentTools: userData.currentTools,
    challenges: userData.challenges,
    targetAudience: userData.targetAudience,
    monthlyLeads: userData.monthlyLeads,
    salesCycle: userData.salesCycle,
    contactName: userData.contactName.trim(),
    contactEmail: userData.contactEmail.trim().toLowerCase(),
    contactPhone: userData.contactPhone.trim(),
  };

  auditLogger.log("extract_user_submitted_success", "User data extracted successfully");
  return extracted;
}

function extractAnalysisReport(
  analysisData: AnalysisResult,
  auditLogger: AuditLogger
): ExtractedAnalysisReport {
  auditLogger.log("extract_analysis_report", "Extracting analysis report data");

  const extracted: ExtractedAnalysisReport = {
    healthScore: analysisData.healthScore,
    executiveSummary: analysisData.executiveSummary.trim(),
    painPoints: analysisData.painPoints.map((pp) => ({
      title: pp.title.trim(),
      severity: pp.severity,
      description: pp.description.trim(),
    })),
    solutions: analysisData.solutions.map((sol) => ({
      painPoint: sol.painPoint.trim(),
      solution: sol.solution.trim(),
      expectedOutcome: sol.expectedOutcome.trim(),
      roiEstimate: sol.roiEstimate.trim(),
    })),
    stackGaps: analysisData.stackGaps || [],
  };

  auditLogger.log("extract_analysis_report_success", "Analysis report extracted successfully");
  return extracted;
}

function validateExtractedData(
  extractedUser: ExtractedUserSubmitted,
  extractedAnalysis: ExtractedAnalysisReport,
  originalUser: IntakeFormData,
  originalAnalysis: AnalysisResult,
  auditLogger: AuditLogger
): ExtractionValidation {
  auditLogger.log("validate_data", "Starting data validation");

  const missingFields: string[] = [];
  const invalidFields: string[] = [];
  let verificationPassed = true;

  try {
    userSubmittedSchema.parse(extractedUser);
  } catch (err) {
    if (err instanceof z.ZodError) {
      err.issues.forEach((issue) => {
        const field = issue.path.join(".");
        if (issue.code === "too_small" || issue.code === "invalid_type") {
          missingFields.push(field);
        } else {
          invalidFields.push(field);
        }
        auditLogger.log("validation_error", `Field ${field}: ${issue.message}`, "error");
      });
    }
  }

  try {
    analysisReportSchema.parse(extractedAnalysis);
  } catch (err) {
    if (err instanceof z.ZodError) {
      err.issues.forEach((issue) => {
        const field = `analysis.${issue.path.join(".")}`;
        invalidFields.push(field);
        auditLogger.log("validation_error", `Field ${field}: ${issue.message}`, "error");
      });
    }
  }

  auditLogger.log("verify_source", "Verifying extracted data matches source");
  if (extractedUser.companyName !== originalUser.companyName.trim()) {
    verificationPassed = false;
    auditLogger.log("verification_failed", "Company name mismatch", "warn");
  }
  if (extractedUser.contactEmail !== originalUser.contactEmail.trim().toLowerCase()) {
    verificationPassed = false;
    auditLogger.log("verification_failed", "Contact email mismatch", "warn");
  }
  if (extractedAnalysis.healthScore !== originalAnalysis.healthScore) {
    verificationPassed = false;
    auditLogger.log("verification_failed", "Health score mismatch", "warn");
  }

  const isValid = missingFields.length === 0 && invalidFields.length === 0;

  auditLogger.log(
    "validation_completed",
    `Validation complete. Valid: ${isValid}, Missing: ${missingFields.length}, Invalid: ${invalidFields.length}, Verified: ${verificationPassed}`
  );

  return {
    isValid,
    missingFields,
    invalidFields,
    verificationPassed,
  };
}

let inMemoryExtractedData: Map<string, ExtractedData> = new Map();

export function storeExtractedData(data: ExtractedData) {
  inMemoryExtractedData.set(data.id, data);
  console.log(`[Data Extractor] Stored extracted data for ID: ${data.id}`);
}

export function getExtractedData(id: string): ExtractedData | undefined {
  return inMemoryExtractedData.get(id);
}

export function getAllExtractedData(): ExtractedData[] {
  return Array.from(inMemoryExtractedData.values());
}

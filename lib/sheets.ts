import { google } from "googleapis";
import { parseGoogleSheetId } from "@/lib/google-sheet-id";
import { loadServiceAccount } from "@/lib/service-account";

let db: any = null;
try {
  const firebaseAdmin = require("@/lib/firebase-admin");
  db = firebaseAdmin.db;
} catch (e) {
  console.warn("Firebase Admin not available, sync metrics disabled");
}

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

type SheetsClient = ReturnType<typeof google.sheets>;

interface SyncMetric {
  id?: string;
  type: "lead" | "call" | "analysis";
  entityId: string;
  status: "success" | "failed";
  timestamp: string;
  errorMessage?: string;
  durationMs: number;
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 24)}\n...[truncated]`;
}

export type LeadSheetRow = {
  isoTime: string;
  firestoreDocId: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  finalDecision: string;
  analysisSummary: string;
  conversationText: string;
  fullJson: string;
  meetingUrl?: string;
  dealProbability?: number;
  lastUpdatedAt: string;
};

export type CallSheetRow = {
  isoTime: string;
  callId: string;
  leadId: string;
  status: string;
  meetingUrl?: string;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  dealStatus?: string;
  dealProbability?: number;
  durationMinutes?: number;
  participants?: string;
  summary?: string;
  fullJson: string;
};

export type AnalysisSheetRow = {
  isoTime: string;
  analysisId: string;
  leadId: string;
  companyName?: string;
  healthScore: number;
  executiveSummary: string;
  painPoints?: string;
  solutions?: string;
  fullJson: string;
};

function getSheetsClient(): SheetsClient | null {
  const sa = loadServiceAccount();
  if (!sa) return null;

  const auth = new google.auth.JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: [SHEETS_SCOPE],
  });

  return google.sheets({ version: "v4", auth });
}

async function recordSyncMetric(metric: Omit<SyncMetric, "id">) {
  if (!db) return;
  try {
    await db.collection("syncMetrics").add({
      ...metric,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[sheets] Failed to record sync metric:", e);
  }
}

function buildLeadValues(row: LeadSheetRow): string[][] {
  return [
    [
      row.isoTime,
      row.firestoreDocId,
      row.company,
      row.contactName,
      row.email,
      row.phone,
      row.finalDecision,
      row.meetingUrl || "",
      row.dealProbability?.toString() || "",
      truncate(row.analysisSummary, 8000),
      truncate(row.conversationText, 45000),
      truncate(row.fullJson, 45000),
      row.lastUpdatedAt,
    ],
  ];
}

function buildCallValues(row: CallSheetRow): string[][] {
  return [
    [
      row.isoTime,
      row.callId,
      row.leadId,
      row.status,
      row.meetingUrl || "",
      row.scheduledAt || "",
      row.startedAt || "",
      row.endedAt || "",
      row.dealStatus || "",
      row.dealProbability?.toString() || "",
      row.durationMinutes?.toString() || "",
      row.participants || "",
      truncate(row.summary || "", 8000),
      truncate(row.fullJson, 45000),
    ],
  ];
}

function buildAnalysisValues(row: AnalysisSheetRow): string[][] {
  return [
    [
      row.isoTime,
      row.analysisId,
      row.leadId,
      row.companyName || "",
      row.healthScore.toString(),
      truncate(row.executiveSummary, 8000),
      truncate(row.painPoints || "", 45000),
      truncate(row.solutions || "", 45000),
      truncate(row.fullJson, 45000),
    ],
  ];
}

async function findRowByValue(
  sheets: SheetsClient,
  sheetId: string,
  tab: string,
  column: string,
  value: string
): Promise<number | null> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${tab}!${column}:${column}`,
  });
  const rows = res.data.values || [];
  const target = value.trim().toLowerCase();
  for (let i = 0; i < rows.length; i++) {
    const cell = (rows[i]?.[0] ?? "").toString().trim().toLowerCase();
    if (cell === target) {
      return i + 1;
    }
  }
  return null;
}

async function appendRow(
  sheets: SheetsClient,
  sheetId: string,
  tab: string,
  values: string[][]
) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${tab}!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });
}

async function updateRow(
  sheets: SheetsClient,
  sheetId: string,
  tab: string,
  rowIndex: number,
  values: string[][],
  endColumn: string
) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `${tab}!A${rowIndex}:${endColumn}${rowIndex}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateLeadRow(row: LeadSheetRow): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!row.email || !validateEmail(row.email)) {
    errors.push("Invalid or missing email address");
  }
  if (!row.company) {
    errors.push("Missing company name");
  }
  if (!row.contactName) {
    errors.push("Missing contact name");
  }
  return { valid: errors.length === 0, errors };
}

export async function syncLeadToSheet(
  row: LeadSheetRow
): Promise<{ ok: boolean; error?: string }> {
  const startTime = Date.now();
  const sheetId = parseGoogleSheetId(process.env.GOOGLE_SHEET_ID);
  
  try {
    if (!sheetId) {
      throw new Error("GOOGLE_SHEET_ID missing or invalid");
    }

    const validation = validateLeadRow(row);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    const sheets = getSheetsClient();
    if (!sheets) {
      throw new Error("Google credentials missing");
    }

    const tab = process.env.GOOGLE_SHEET_TAB?.trim() || "Leads";
    const mode = (process.env.GOOGLE_SHEET_MODE || "upsert").toLowerCase();
    const values = buildLeadValues(row);

    if (mode === "append") {
      await appendRow(sheets, sheetId, tab, values);
    } else {
      const existing = await findRowByValue(sheets, sheetId, tab, "E", row.email);
      if (existing) {
        await updateRow(sheets, sheetId, tab, existing, values, "M");
      } else {
        await appendRow(sheets, sheetId, tab, values);
      }
    }

    await recordSyncMetric({
      type: "lead",
      entityId: row.firestoreDocId,
      status: "success",
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
    });

    return { ok: true };
  } catch (e) {
    console.error("[sheets] syncLeadToSheet", e);
    const errorMessage = e instanceof Error ? e.message : "Google Sheets request failed";
    
    await recordSyncMetric({
      type: "lead",
      entityId: row.firestoreDocId,
      status: "failed",
      errorMessage,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
    });

    return { ok: false, error: errorMessage };
  }
}

export async function syncCallToSheet(
  row: CallSheetRow
): Promise<{ ok: boolean; error?: string }> {
  const startTime = Date.now();
  const sheetId = parseGoogleSheetId(process.env.GOOGLE_SHEET_ID);
  
  try {
    if (!sheetId) {
      throw new Error("GOOGLE_SHEET_ID missing or invalid");
    }

    const sheets = getSheetsClient();
    if (!sheets) {
      throw new Error("Google credentials missing");
    }

    const tab = process.env.GOOGLE_SHEET_CALLS_TAB?.trim() || "Calls";
    const mode = (process.env.GOOGLE_SHEET_MODE || "upsert").toLowerCase();
    const values = buildCallValues(row);

    if (mode === "append") {
      await appendRow(sheets, sheetId, tab, values);
    } else {
      const existing = await findRowByValue(sheets, sheetId, tab, "B", row.callId);
      if (existing) {
        await updateRow(sheets, sheetId, tab, existing, values, "N");
      } else {
        await appendRow(sheets, sheetId, tab, values);
      }
    }

    await recordSyncMetric({
      type: "call",
      entityId: row.callId,
      status: "success",
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
    });

    return { ok: true };
  } catch (e) {
    console.error("[sheets] syncCallToSheet", e);
    const errorMessage = e instanceof Error ? e.message : "Google Sheets request failed";
    
    await recordSyncMetric({
      type: "call",
      entityId: row.callId,
      status: "failed",
      errorMessage,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
    });

    return { ok: false, error: errorMessage };
  }
}

export async function syncAnalysisToSheet(
  row: AnalysisSheetRow
): Promise<{ ok: boolean; error?: string }> {
  const startTime = Date.now();
  const sheetId = parseGoogleSheetId(process.env.GOOGLE_SHEET_ID);
  
  try {
    if (!sheetId) {
      throw new Error("GOOGLE_SHEET_ID missing or invalid");
    }

    const sheets = getSheetsClient();
    if (!sheets) {
      throw new Error("Google credentials missing");
    }

    const tab = process.env.GOOGLE_SHEET_ANALYSIS_TAB?.trim() || "Analyses";
    const mode = (process.env.GOOGLE_SHEET_MODE || "upsert").toLowerCase();
    const values = buildAnalysisValues(row);

    if (mode === "append") {
      await appendRow(sheets, sheetId, tab, values);
    } else {
      const existing = await findRowByValue(sheets, sheetId, tab, "B", row.analysisId);
      if (existing) {
        await updateRow(sheets, sheetId, tab, existing, values, "I");
      } else {
        await appendRow(sheets, sheetId, tab, values);
      }
    }

    await recordSyncMetric({
      type: "analysis",
      entityId: row.analysisId,
      status: "success",
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
    });

    return { ok: true };
  } catch (e) {
    console.error("[sheets] syncAnalysisToSheet", e);
    const errorMessage = e instanceof Error ? e.message : "Google Sheets request failed";
    
    await recordSyncMetric({
      type: "analysis",
      entityId: row.analysisId,
      status: "failed",
      errorMessage,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
    });

    return { ok: false, error: errorMessage };
  }
}

export async function getSyncMetrics(
  limit: number = 100
): Promise<SyncMetric[]> {
  if (!db) return [];
  try {
    const snapshot = await db
      .collection("syncMetrics")
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as SyncMetric));
  } catch (e) {
    console.error("[sheets] Failed to get sync metrics:", e);
    return [];
  }
}


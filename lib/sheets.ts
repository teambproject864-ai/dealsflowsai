import { google } from "googleapis";
import { parseGoogleSheetId } from "@/lib/google-sheet-id";
import { loadServiceAccount } from "@/lib/service-account";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

type SheetsClient = ReturnType<typeof google.sheets>;

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
  /** Stage / outcome (deal_status) */
  finalDecision: string;
  analysisSummary: string;
  conversationText: string;
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

function buildValues(row: LeadSheetRow): string[][] {
  return [
    [
      row.isoTime,
      row.firestoreDocId,
      row.company,
      row.contactName,
      row.email,
      row.phone,
      row.finalDecision,
      truncate(row.analysisSummary, 8000),
      truncate(row.conversationText, 45000),
      truncate(row.fullJson, 45000),
    ],
  ];
}

/** Find 1-based row index in column E matching email (skips non-email cells). */
async function findRowByEmail(
  sheets: SheetsClient,
  sheetId: string,
  tab: string,
  email: string
): Promise<number | null> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${tab}!E:E`,
  });
  const rows = res.data.values || [];
  const target = email.trim().toLowerCase();
  for (let i = 0; i < rows.length; i++) {
    const cell = (rows[i]?.[0] ?? "").toString().trim().toLowerCase();
    if (cell.includes("@") && cell === target) {
      return i + 1;
    }
  }
  return null;
}

async function appendLeadRow(
  sheets: SheetsClient,
  sheetId: string,
  tab: string,
  row: LeadSheetRow
) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${tab}!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: buildValues(row) },
  });
}

async function upsertLeadRow(
  sheets: SheetsClient,
  sheetId: string,
  tab: string,
  row: LeadSheetRow
) {
  const existing = await findRowByEmail(sheets, sheetId, tab, row.email);
  const values = buildValues(row);
  if (existing) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: `${tab}!A${existing}:J${existing}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });
  } else {
    await appendLeadRow(sheets, sheetId, tab, row);
  }
}

/**
 * Syncs one lead row. Default: upsert by email (column E) so the sheet stays one row per lead.
 * Set GOOGLE_SHEET_MODE=append to log every change as a new row instead.
 * Share the spreadsheet with your Firebase service account email (Editor).
 * Enable Google Sheets API in the GCP project.
 */
export async function syncLeadToSheet(
  row: LeadSheetRow
): Promise<{ ok: boolean; error?: string }> {
  const sheetId = parseGoogleSheetId(process.env.GOOGLE_SHEET_ID);
  if (!sheetId) {
    return {
      ok: false,
      error:
        "GOOGLE_SHEET_ID missing or invalid (use spreadsheet id or full docs.google.com URL)",
    };
  }

  const sheets = getSheetsClient();
  if (!sheets) {
    return { ok: false, error: "Google credentials missing" };
  }

  const tab = process.env.GOOGLE_SHEET_TAB?.trim() || "Sheet1";
  const mode = (process.env.GOOGLE_SHEET_MODE || "upsert").toLowerCase();

  try {
    if (mode === "append") {
      await appendLeadRow(sheets, sheetId, tab, row);
    } else {
      await upsertLeadRow(sheets, sheetId, tab, row);
    }
    return { ok: true };
  } catch (e) {
    console.error("[sheets] syncLeadToSheet", e);
    const msg = e instanceof Error ? e.message : "Google Sheets request failed";
    return { ok: false, error: msg };
  }
}

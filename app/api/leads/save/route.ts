import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { syncLeadToSheet, LeadSheetRow } from "@/lib/sheets";
import { getInMemoryLeads } from "@/lib/memory-storage";

const inMemoryLeads = getInMemoryLeads();

export async function POST(req: Request) {
  try {
    const companyData = await req.json();
    const leadId = uuidv4();
    
    inMemoryLeads.set(leadId, {
      ...companyData,
      id: leadId,
      createdAt: new Date().toISOString(),
      analysisId: "",
    });

    const now = new Date().toISOString();
    const leadRow: LeadSheetRow = {
      isoTime: now,
      firestoreDocId: leadId,
      company: companyData.companyName || "",
      contactName: companyData.contactName || "",
      email: companyData.contactEmail || "",
      phone: companyData.contactPhone || "",
      finalDecision: "",
      analysisSummary: "",
      conversationText: "",
      fullJson: JSON.stringify(companyData),
      lastUpdatedAt: now,
    };

    try {
      const syncResult = await syncLeadToSheet(leadRow);
      if (!syncResult.ok) {
        console.error("Lead sync to Google Sheets failed:", syncResult.error);
      }
    } catch (syncErr) {
      console.error("Google Sheets sync skipped (not configured):", syncErr);
    }

    return NextResponse.json({ 
      success: true, 
      leadId
    });
  } catch (error) {
    console.error("Error saving lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save lead" }, 
      { status: 500 }
    );
  }
}

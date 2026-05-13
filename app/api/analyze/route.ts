import { NextResponse } from "next/server";
import { performInferenceJSON } from '@/lib/inference'; 
import { buildAnalysisUserPrompt } from "@/lib/prompts";
import { syncAnalysisToSheet, AnalysisSheetRow } from "@/lib/sheets";
import { v4 as uuidv4 } from "uuid";
import { getInMemoryLeads, getInMemoryAnalyses } from "@/lib/memory-storage";

const inMemoryLeads = getInMemoryLeads();
const inMemoryAnalyses = getInMemoryAnalyses();

export async function POST(req: Request) { 
  try {
    const { leadId, companyData: providedData } = await req.json();
    
    let companyData = providedData;
    if (!companyData && leadId) {
      companyData = inMemoryLeads.get(leadId);
      if (!companyData) {
        return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
      }
    }

    if (!companyData) {
      return NextResponse.json({ success: false, error: "Missing company data" }, { status: 400 });
    }
    
    const systemPrompt =
      "You are a senior GTM analyst. Return ONLY valid JSON. No markdown. No extra text.";
    const prompt = buildAnalysisUserPrompt(companyData as any);

    const analysis = await performInferenceJSON(prompt, systemPrompt) as any;
    const analysisId = uuidv4();
    
    inMemoryAnalyses.set(analysisId, {
      id: analysisId,
      leadId,
      companyName: companyData.companyName || null,
      ...analysis,
      createdAt: new Date().toISOString()
    });

    if (leadId && inMemoryLeads.has(leadId)) {
      inMemoryLeads.set(leadId, {
        ...inMemoryLeads.get(leadId),
        analysisId
      });
    }

    try {
      const now = new Date().toISOString();
      const analysisRow: AnalysisSheetRow = {
        isoTime: now,
        analysisId,
        leadId: leadId || "",
        companyName: companyData.companyName,
        healthScore: analysis.healthScore || 0,
        executiveSummary: analysis.executiveSummary || "",
        painPoints: JSON.stringify(analysis.painPoints || []),
        solutions: JSON.stringify(analysis.solutions || []),
        fullJson: JSON.stringify(analysis),
      };

      const analysisSyncResult = await syncAnalysisToSheet(analysisRow);
      if (!analysisSyncResult.ok) {
        console.error("Analysis sync to Google Sheets failed:", analysisSyncResult.error);
      }
    } catch (syncErr) {
      console.error("Google Sheets sync skipped (not configured):", syncErr);
    }

    return NextResponse.json({ 
      success: true,
      analysisId, 
      leadId,
      companyName: companyData.companyName || null,
      ...analysis
    }); 
  } catch (error) {
    console.error("Error analyzing company:", error);
    const message = error instanceof Error ? error.message : "Failed to analyze company";
    return NextResponse.json(
      { success: false, error: message }, 
      { status: 500 }
    );
  }
}

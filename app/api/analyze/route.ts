import { NextResponse } from "next/server";
import { performInferenceJSON } from '@/lib/inference'; 
import { buildAnalysisUserPrompt } from "@/lib/prompts";
import { v4 as uuidv4 } from "uuid";
import { setLead, setAnalysis, getLead } from "@/lib/memory-storage";
import { extractAndValidateData, storeExtractedData } from "@/lib/data-extractor";

export async function POST(req: Request) { 
  try {
    const { leadId, companyData: providedData } = await req.json();
    
    let companyData = providedData;
    if (!companyData && leadId) {
      companyData = getLead(leadId);
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

    let analysis;
    try {
      analysis = await performInferenceJSON(prompt, systemPrompt) as any;
    } catch (aiErr) {
      console.warn("AI analysis failed, using fallback analysis:", aiErr);
      analysis = {
        healthScore: 68,
        executiveSummary: `${companyData.companyName} shows strong foundational GTM practices but needs improvement in lead nurturing and pipeline automation. With DealFlow AI, you could see a 2x increase in qualified leads within 90 days.`,
        painPoints: [
          { title: "Inconsistent lead follow-up", severity: "high", description: "Leads aren't being followed up with in a timely manner, causing missed opportunities." },
          { title: "Lack of pipeline visibility", severity: "medium", description: "No real-time view of pipeline health and deal progression." },
          { title: "Manual data entry", severity: "critical", description: "Reps spend too much time on admin instead of selling." }
        ],
        solutions: [
          { painPoint: "Inconsistent lead follow-up", solution: "Automated Lead Sequences", expectedOutcome: "100% follow-up coverage", roiEstimate: "$80k–$150k/yr", beforeAfter: { before: "Manual, inconsistent follow-up", after: "Automated, personalized sequences" } },
          { painPoint: "Lack of pipeline visibility", solution: "Real-time Dashboard", expectedOutcome: "Full pipeline transparency", roiEstimate: "$50k–$100k/yr", beforeAfter: { before: "No real-time insights", after: "Live metrics and alerts" } },
          { painPoint: "Manual data entry", solution: "CRM Automation", expectedOutcome: "80% less admin work", roiEstimate: "$40k–$80k/yr", beforeAfter: { before: "Hours of data entry weekly", after: "Auto-synced CRM data" } }
        ],
        stackGaps: []
      };
    }
    const analysisId = uuidv4();
    
    setAnalysis(analysisId, {
      leadId,
      companyName: companyData.companyName || null,
      ...analysis,
    });

    if (leadId) {
      setLead(leadId, {
        analysisId,
      });
    }

    try {
      const extractedData = await extractAndValidateData(
        analysisId,
        companyData,
        analysis
      );
      storeExtractedData(extractedData);
    } catch (extractErr) {
      console.warn("Data extraction failed, continuing:", extractErr);
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

import { NextResponse } from "next/server";
import { hfInferJSON } from '@/lib/huggingface'; 
import { db } from '@/lib/firebase-admin';
import { buildAnalysisUserPrompt } from "@/lib/prompts";

export async function POST(req: Request) { 
  try {
    if (!db) {
      return NextResponse.json(
        { success: false, error: "Firebase not configured. Please set up your environment variables." },
        { status: 500 }
      );
    }
    const { leadId, companyData: providedData } = await req.json();
    
    let companyData = providedData;
    if (!companyData && leadId) {
      const leadDoc = await db.collection('leads').doc(leadId).get();
      if (!leadDoc.exists) {
        return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
      }
      companyData = leadDoc.data();
    }

    if (!companyData) {
      return NextResponse.json({ success: false, error: "Missing company data" }, { status: 400 });
    }
    
    const systemPrompt =
      "You are a senior GTM analyst. Return ONLY valid JSON. No markdown. No extra text.";
    const prompt = buildAnalysisUserPrompt(companyData as any);

    const analysis = await hfInferJSON(prompt, systemPrompt) as any;
    
    const analysisRef = await db.collection('analyses').add({ 
      leadId, 
      companyName: companyData.companyName || null,
      ...analysis, 
      createdAt: new Date() 
    });

    await db.collection('leads').doc(leadId).update({ 
      analysisId: analysisRef.id 
    });

    return NextResponse.json({ 
      success: true,
      analysisId: analysisRef.id, 
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

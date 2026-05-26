import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { setLead } from "@/lib/memory-storage";

export async function POST(req: Request) {
  try {
    const companyData = await req.json();
    const leadId = uuidv4();
    
    setLead(leadId, {
      ...companyData,
      analysisId: "",
    });

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

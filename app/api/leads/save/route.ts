import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    if (!db) {
      return NextResponse.json(
        { success: false, error: "Firebase not configured. Please set up your environment variables." },
        { status: 500 }
      );
    }
    const companyData = await req.json();
    
    const leadRef = await db.collection("leads").add({
      ...companyData,
      createdAt: new Date(),
      analysisId: "",
    });

    return NextResponse.json({ 
      success: true, 
      leadId: leadRef.id 
    });
  } catch (error) {
    console.error("Error saving lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save lead" }, 
      { status: 500 }
    );
  }
}

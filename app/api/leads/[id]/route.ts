import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = params.id;
    const leadDoc = await db.collection("leads").doc(leadId).get();

    if (!leadDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      leadId: leadDoc.id,
      ...leadDoc.data(),
    });
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lead" },
      { status: 500 }
    );
  }
}

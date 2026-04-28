import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const analysisId = params.id;
    const analysisDoc = await db.collection("analyses").doc(analysisId).get();

    if (!analysisDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Analysis not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      analysisId: analysisDoc.id,
      ...analysisDoc.data(),
    });
  } catch (error) {
    console.error("Error fetching analysis:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analysis" },
      { status: 500 }
    );
  }
}

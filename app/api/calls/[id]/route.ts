import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const callId = params.id;
    const callDoc = await db.collection("calls").doc(callId).get();

    if (!callDoc.exists) {
      return NextResponse.json(
        { success: false, error: "Call not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      callId: callDoc.id,
      ...callDoc.data(),
    });
  } catch (error) {
    console.error("Error fetching call:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch call" },
      { status: 500 }
    );
  }
}

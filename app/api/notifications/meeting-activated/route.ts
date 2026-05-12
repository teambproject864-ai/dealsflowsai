import { NextRequest, NextResponse } from "next/server";
import { sendMeetingActivationNotification } from "@/lib/notifications";
import { isValidMeetingUrl } from "@/lib/meeting-utils";
import { db } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { callId, meetingUrl, persona } = await req.json();

    if (!callId || !meetingUrl || !persona) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isValidMeetingUrl(meetingUrl)) {
      return NextResponse.json({ error: "Invalid meeting URL" }, { status: 400 });
    }

    // Fetch call and lead details for the email
    const callDoc = await db.collection("calls").doc(callId).get();
    if (!callDoc.exists) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    const callData = callDoc.data()!;
    const leadDoc = await db.collection("leads").doc(callData.leadId).get();
    if (!leadDoc.exists) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const leadData = leadDoc.data()!;

    await sendMeetingActivationNotification({
      meetingUrl,
      leadName: leadData.contactName || "Unknown Lead",
      companyName: leadData.companyName || "Unknown Company",
      persona,
      callId,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API] Meeting activation notification error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

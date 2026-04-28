import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { createGoogleMeetLink } from "@/lib/google-meet";
import { sendEmailWithRetry } from "@/lib/notifications";
import { ensureBotForCall } from "@/lib/call-bot";
import { immediateCallSchema, CallRecord, LeadRecord } from "@/lib/types";

const DEFAULT_MAX_IMMEDIATE_CALLS = 3;

function parseMaxImmediateCalls() {
  const raw = process.env.MAX_IMMEDIATE_CALLS;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_MAX_IMMEDIATE_CALLS;
  return Math.floor(parsed);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = immediateCallSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request body", details: validated.error.format() },
        { status: 400 }
      );
    }

    const { leadId, analysisId, personaKey } = validated.data;

    const maxImmediateCalls = parseMaxImmediateCalls();
    const activeSnapshot = await db
      .collection("calls")
      .where("status", "==", "in-progress")
      .limit(50)
      .get();

    const now = Date.now();
    const recentThresholdMs = now - 2 * 60 * 1000;
    const activeImmediateCount = activeSnapshot.docs.reduce((count, doc) => {
      const data = doc.data() as CallRecord;
      if (data.callMode !== "immediate") return count;
      
      const lastSeenMs = data.updatedAtMs || 0;
      if (lastSeenMs && lastSeenMs < recentThresholdMs) return count;
      return count + 1;
    }, 0);

    if (activeImmediateCount >= maxImmediateCalls) {
      return NextResponse.json(
        {
          success: false,
          available: false,
          error: "No immediate slots available right now.",
        },
        { status: 409 }
      );
    }

    const callData: CallRecord = {
      leadId,
      analysisId,
      meetingUrl: "",
      guests: [],
      status: "in-progress",
      callMode: "immediate",
      agentPersona: personaKey || "praneeth_assist",
      dealProbability: 50,
      dealStatus: "interested",
      scheduledAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedAtMs: Date.now(),
    };

    const callRef = await db.collection("calls").add(callData);
    const callId = callRef.id;

    const recipient = process.env.ADMIN_NOTIFICATION_EMAIL || "praneeth@growstack.ai";
    let meetLink: string | null = null;

    try {
      const leadDoc = await db.collection("leads").doc(leadId).get();
      const lead = leadDoc.data() as LeadRecord | undefined;
      const companyName = lead?.companyName || "a prospect";

      const start = new Date();
      const end = new Date(start.getTime() + 30 * 60 * 1000);
      const title = `Immediate Call — ${companyName} x Dealflow.ai`;
      const descriptionHtml = [
        `<p><strong>Immediate Call</strong></p>`,
        `<p>Call ID: <strong>${callId}</strong></p>`,
        `<p>Join link will be active at the scheduled start time.</p>`,
      ].join("");

      const created = await createGoogleMeetLink({
        title,
        descriptionHtml,
        start,
        end,
      });

      meetLink = created.meetLink;

      await callRef.update({
        meetingUrl: meetLink,
        meetingProvider: "google_meet",
        meetingEventId: created.eventId,
        meetingCreatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedAtMs: Date.now(),
      });

      if (meetLink) {
        void ensureBotForCall({
          callId,
          meetingUrl: meetLink,
          personaKey: personaKey || "praneeth_assist",
          forceJoinNow: true,
          reason: "immediate_call_created",
        });
      }

      void (async () => {
        try {
          const emailBody = [
            `<p>Hi Praneeth,</p>`,
            `<p>An <strong>Immediate Call</strong> has been created.</p>`,
            `<p><strong>Title:</strong> ${title}</p>`,
            `<p><strong>Date/Time:</strong> ${start.toLocaleString()}</p>`,
            `<p><strong>Join:</strong> <a href="${meetLink}">${meetLink}</a></p>`,
            `<p><strong>Instructions:</strong> Click the link to join. The AI session is active in-app using Call ID <strong>${callId}</strong>.</p>`,
          ].join("");

          await sendEmailWithRetry({
            to: recipient,
            subject: `Immediate Call Link — ${companyName}`,
            body: emailBody,
          });

          await callRef.update({
            meetingEmailTo: recipient,
            meetingEmailSentAt: new Date().toISOString(),
            meetingEmailStatus: "sent",
            updatedAt: new Date().toISOString(),
            updatedAtMs: Date.now(),
          });

          await db.collection("audit_logs").add({
            type: "immediate_call_meeting_link",
            callId,
            leadId,
            analysisId,
            provider: "google_meet",
            status: "sent",
            recipient,
            meetLink,
            createdAt: new Date().toISOString(),
          });
        } catch (e: any) {
          await callRef.update({
            meetingEmailTo: recipient,
            meetingEmailStatus: "failed",
            meetingEmailError: e?.message || "failed",
            updatedAt: new Date().toISOString(),
            updatedAtMs: Date.now(),
          });
          await db.collection("audit_logs").add({
            type: "immediate_call_meeting_link",
            callId,
            leadId,
            analysisId,
            provider: "google_meet",
            status: "failed",
            recipient,
            error: e?.message || "failed",
            createdAt: new Date().toISOString(),
          });
        }
      })();
    } catch (e: any) {
      const msg = e?.message || "google_meet_create_failed";
      await callRef.update({
        status: "failed",
        error: msg,
        updatedAt: new Date().toISOString(),
        updatedAtMs: Date.now(),
      });
      await db.collection("audit_logs").add({
        type: "immediate_call_meeting_link",
        callId,
        leadId,
        analysisId,
        provider: "google_meet",
        status: "failed",
        recipient,
        error: msg,
        createdAt: new Date().toISOString(),
      });

      const status = msg.includes("Google Calendar API has not been used") ? 503 : 500;
      return NextResponse.json(
        {
          success: false,
          available: false,
          error: msg,
        },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      available: true,
      callId,
      meetingUrl: meetLink,
    });
  } catch (error: any) {
    console.error("Error creating immediate call:", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to create immediate call", message: error.message },
      { status: 500 }
    );
  }
}

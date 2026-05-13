// app/api/notifications/post-call/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { hfInfer } from '@/lib/huggingface';
import { sendEmailWithRetry, sendSMS } from '@/lib/notifications';
import { detectNoShow, hashRecipient, interpolateTemplate, redactMeetingLink } from '@/lib/post-meeting';
import { fetchGoogleCalendarEvent } from '@/lib/google-meet';
import { syncCallToSheet, CallSheetRow, syncLeadToSheet, LeadSheetRow } from '@/lib/sheets';

export async function POST(req: Request) {
  try {
    const { callId } = await req.json();
    if (!callId) return NextResponse.json({ error: "Missing callId" }, { status: 400 });

    const existing = await db
      .collection("summaries")
      .where("callId", "==", callId)
      .where("type", "==", "post-call")
      .limit(1)
      .get();
    if (!existing.empty) return NextResponse.json({ success: true, skipped: true });

    const [callDoc, transcriptDoc, notesDoc] = await Promise.all([
      db.collection('calls').doc(callId).get(),
      db.collection('transcripts').doc(callId).get(),
      db.collection('notes').doc(callId).get()
    ]);

    const callData = callDoc.data();
    const leadId = typeof callData?.leadId === "string" && callData.leadId ? callData.leadId : null;
    const leadDoc = leadId ? await db.collection('leads').doc(leadId).get() : null;
    const leadData = leadDoc?.exists ? leadDoc.data() : null;

    const segments = transcriptDoc.data()?.segments || [];
    const fullTranscriptText = segments.map((s: any) => `[${s.timestamp}] ${s.speaker}: ${s.text}`).join('\n');
    const attendees = Array.from(new Set(segments.map((s: any) => s.speaker))).join(', ');
    const notesData = notesDoc.data() || {};

    const appUrl = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "").trim();
    const companyName = leadData?.companyName || callData?.calendarEventTitle || "the client";
    const meetingLink = String(callData?.meetingUrl || "").trim();
    const redactedMeetingLink = meetingLink ? redactMeetingLink(meetingLink) : "";

    const leadEmail = String(leadData?.contactEmail || "").trim();
    const leadPhone = String(leadData?.contactPhone || "").trim();
    const guests = Array.isArray(callData?.guests) ? (callData.guests as any[]).map((g) => String(g || "").trim()) : [];
    const recipients = [leadEmail, ...guests].filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    const noShow = detectNoShow({
      segments,
      agentName: callData?.agentPersona ? String(callData.agentPersona) : undefined,
      minHumanSegments: 1,
    });

    await callDoc.ref.set(
      {
        postMeeting: {
          processedAt: new Date().toISOString(),
          noShowDetected: noShow.noShow,
          humanSpeakers: noShow.humanSpeakers,
          humanSegments: noShow.humanSegments,
        },
        updatedAt: new Date().toISOString(),
        updatedAtMs: Date.now(),
      },
      { merge: true }
    );

    const templatesDoc = await db.collection("notification_templates").doc("post_meeting").get().catch(() => null);
    const templates = templatesDoc?.exists ? (templatesDoc.data() as any) : {};
    const momSubjectTpl = String(templates?.momSubject || process.env.MOM_EMAIL_SUBJECT_TEMPLATE || "Minutes of Meeting: Dealflow.ai x {{companyName}}");
    const noShowSubjectTpl = String(templates?.noShowSubject || process.env.NO_SHOW_EMAIL_SUBJECT_TEMPLATE || "pls join the meeting and {{meetingLinkFull}}");

    let calendarMeta: any = null;
    const meetingProvider = String(callData?.meetingProvider || "").trim();
    const meetingEventId = String(callData?.meetingEventId || "").trim();
    if (meetingProvider === "google_meet" && meetingEventId) {
      try {
        calendarMeta = await fetchGoogleCalendarEvent({ eventId: meetingEventId });
        await callDoc.ref.set(
          {
            calendarEvent: {
              id: calendarMeta.id,
              summary: calendarMeta.summary || null,
              htmlLink: calendarMeta.htmlLink || null,
              start: calendarMeta.start || null,
              end: calendarMeta.end || null,
              attendeeCount: Array.isArray(calendarMeta.attendees) ? calendarMeta.attendees.length : 0,
              fetchedAt: new Date().toISOString(),
            },
          },
          { merge: true }
        );
      } catch (e: any) {
        await callDoc.ref.set(
          {
            calendarEvent: {
              id: meetingEventId,
              fetchError: e?.message || "calendar_fetch_failed",
              fetchedAt: new Date().toISOString(),
            },
          },
          { merge: true }
        );
      }
    }

    const prompt = `Generate a formal and professional Minutes of Meeting (MOM) for the call between DealFlow.ai and ${companyName}.
    
    Meeting Details:
    - Title: DealFlow.ai x ${companyName} Senior GTM Discovery
    - Date/Time: ${callData?.scheduledAt || 'N/A'}
    - Attendees: ${attendees || leadData?.contactName || "N/A"}
    - Call Status: ${callData?.dealStatus || 'in progress'}
    - Deal Probability: ${callData?.dealProbability}%
    - Full Transcript: ${fullTranscriptText}
    - Notes: ${JSON.stringify({
      buyingSignals: notesData?.buyingSignals || [],
      objections: notesData?.objections || [],
      keyMoments: notesData?.keyMoments || [],
    })}
    
    The MOM MUST include these specific sections:
    1. **Meeting Overview**: Title, Date, and Attendees.
    2. **Key Discussion Points**: Summary of the strategic GTM conversation.
    3. **Identified Pain Points**: Deep business challenges raised by ${companyName}.
    4. **Proposed Solutions (DealFlow.ai)**: Specific DealFlow.ai features/strategies mapped to each pain point.
    5. **Expected Outcomes (2X Impact)**: Explain how DealFlow.ai will deliver 2X growth, ROI, or efficiency for ${companyName}.
    6. **Decisions Made**: Key agreements or milestones reached.
    7. **Next Steps & Action Items**: Clear, numbered list with owners and deadlines.
    
    Rules: 
    - Use professional, business-standard language.
    - Reference ${companyName} by name.
    - Maintain a high-level strategic tone (Senior GTM Manager perspective).
    - The output will be sent as an HTML email, so use clear formatting.`;

    const summaryContent = await hfInfer(prompt, 'You are a Senior GTM Manager at DealFlow.ai.');

    const vars = {
      companyName,
      meetingLink: redactedMeetingLink,
      meetingLinkFull: meetingLink,
      callId: String(callId),
      appUrl,
    };

    const momSubject = interpolateTemplate(momSubjectTpl, vars);
    const momHtml = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.6; color: #0f172a;">
        <div style="margin-bottom: 18px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
          <div style="font-size: 13px; color: #475569;">Minutes of Meeting</div>
          <div style="font-size: 20px; font-weight: 700; margin-top: 4px;">DealFlow.ai × ${companyName}</div>
          ${meetingLink ? `<div style="margin-top: 10px;"><a href="${meetingLink}" style="display:inline-block; padding: 10px 14px; border-radius: 10px; background:#7c3aed; color:#fff; text-decoration:none; font-weight:600;">Join link</a></div>` : ""}
        </div>

        <div style="white-space: pre-wrap;">${String(summaryContent || "").trim()}</div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 18px 0;">
        <div style="font-size: 12px; color: #64748b;">
          Generated automatically after the meeting ended. ${appUrl ? `View details: ${appUrl}/meeting-agent/summary/${callId}` : ""}
        </div>
      </div>
    `;

    const momLogRef = db.collection("notification_logs").doc();
    await momLogRef.set({
      type: "mom_post_call",
      callId,
      leadId,
      recipientCount: recipients.length,
      recipientHashes: recipients.map(hashRecipient),
      status: "pending",
      attempts: 0,
      createdAt: new Date().toISOString(),
    });

    try {
      if (recipients.length > 0) {
        await sendEmailWithRetry({ to: recipients, subject: momSubject, body: momHtml });
        await momLogRef.update({ status: "success", sentAt: new Date().toISOString() });
        await db.collection("audit_logs").add({
          type: "mom_sent",
          callId,
          leadId,
          status: "sent",
          recipientCount: recipients.length,
          recipientHashes: recipients.map(hashRecipient),
          createdAt: new Date().toISOString(),
        });
      } else {
        await momLogRef.update({ status: "skipped", reason: "no_valid_recipients", sentAt: new Date().toISOString() });
        await db.collection("audit_logs").add({
          type: "mom_sent",
          callId,
          leadId,
          status: "skipped",
          recipientCount: 0,
          recipientHashes: [],
          reason: "no_valid_recipients",
          createdAt: new Date().toISOString(),
        });
      }
    } catch (e: any) {
      await momLogRef.update({ status: "failed", error: e?.message || "failed", failedAt: new Date().toISOString() });
      await db.collection("audit_logs").add({
        type: "mom_sent",
        callId,
        leadId,
        status: "failed",
        recipientCount: recipients.length,
        recipientHashes: recipients.map(hashRecipient),
        error: e?.message || "failed",
        createdAt: new Date().toISOString(),
      });
      throw e;
    }

    if (leadPhone) {
      sendSMS({
        to: leadPhone,
        message: `Hi ${leadData?.contactName || ""}, your MOM for ${companyName} is ready. ${appUrl ? `${appUrl}/meeting-agent/summary/${callId}` : ""}`.trim()
      }).catch((e) => console.error("post_call_sms_failed:", e?.message || e));
    }

    if (noShow.noShow && meetingLink && recipients.length) {
      const noShowSubject = interpolateTemplate(noShowSubjectTpl, vars);
      const noShowHtml = `
        <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.6; color: #0f172a;">
          <div style="padding: 16px; border: 1px solid #fee2e2; border-radius: 12px; background: #fff1f2;">
            <div style="font-weight: 700; color:#9f1239;">It looks like you didn&apos;t join the meeting</div>
            <div style="margin-top: 10px;">
              <a href="${meetingLink}" style="display:inline-block; padding: 10px 14px; border-radius: 10px; background:#0f172a; color:#fff; text-decoration:none; font-weight:700;">
                Join meeting
              </a>
            </div>
            <div style="margin-top: 10px; font-size: 12px; color:#475569;">
              Meeting link: <a href="${meetingLink}" style="color:#0f172a;">${redactedMeetingLink}</a>
            </div>
          </div>
          ${appUrl ? `<div style="margin-top: 14px; font-size: 12px; color:#64748b;">If the time no longer works, book a new slot: ${appUrl}/book-demo${callData?.analysisId ? `?analysisId=${encodeURIComponent(String(callData.analysisId))}` : "?skip=1"}</div>` : ""}
        </div>
      `;

      const nsLogRef = db.collection("notification_logs").doc();
      await nsLogRef.set({
        type: "no_show_followup",
        callId,
        leadId,
        recipientCount: recipients.length,
        recipientHashes: recipients.map(hashRecipient),
        status: "pending",
        attempts: 0,
        createdAt: new Date().toISOString(),
      });

      try {
        await sendEmailWithRetry({ to: recipients, subject: noShowSubject, body: noShowHtml });
        await nsLogRef.update({ status: "success", sentAt: new Date().toISOString() });
        await db.collection("audit_logs").add({
          type: "no_show_followup_sent",
          callId,
          leadId,
          status: "sent",
          recipientHashes: recipients.map(hashRecipient),
          meetingLink: redactedMeetingLink,
          createdAt: new Date().toISOString(),
        });
      } catch (e: any) {
        await nsLogRef.update({ status: "failed", error: e?.message || "failed", failedAt: new Date().toISOString() });
        await db.collection("audit_logs").add({
          type: "no_show_followup_sent",
          callId,
          leadId,
          status: "failed",
          recipientHashes: recipients.map(hashRecipient),
          meetingLink: redactedMeetingLink,
          error: e?.message || "failed",
          createdAt: new Date().toISOString(),
        });
      }
    }

    await db.collection('summaries').add({
      callId,
      type: 'post-call',
      content: summaryContent,
      sentTo: recipients.map(hashRecipient),
      sentAt: new Date().toISOString()
    });

    const now = new Date().toISOString();
    const durationMinutes = callData?.scheduledAt && callData?.endedAt 
      ? Math.round((new Date(callData.endedAt).getTime() - new Date(callData.scheduledAt).getTime()) / (1000 * 60)) 
      : undefined;

    const callRow: CallSheetRow = {
      isoTime: now,
      callId,
      leadId: callData?.leadId || "",
      status: callData?.status || "",
      meetingUrl: callData?.meetingUrl,
      scheduledAt: callData?.scheduledAt,
      startedAt: callData?.botJoinedAt,
      endedAt: callData?.endedAt,
      dealStatus: callData?.dealStatus,
      dealProbability: callData?.dealProbability,
      durationMinutes,
      participants: attendees,
      summary: summaryContent,
      fullJson: JSON.stringify(callData),
    };

    const callSyncResult = await syncCallToSheet(callRow);
    if (!callSyncResult.ok) {
      console.error("Call sync to Google Sheets failed:", callSyncResult.error);
    }

    if (leadData && leadId) {
      const leadRow: LeadSheetRow = {
        isoTime: now,
        firestoreDocId: leadId,
        company: leadData.companyName || "",
        contactName: leadData.contactName || "",
        email: leadData.contactEmail || "",
        phone: leadData.contactPhone || "",
        finalDecision: callData?.dealStatus || "",
        analysisSummary: "",
        conversationText: fullTranscriptText,
        fullJson: JSON.stringify(leadData),
        meetingUrl: callData?.meetingUrl,
        dealProbability: callData?.dealProbability,
        lastUpdatedAt: now,
      };

      const leadSyncResult = await syncLeadToSheet(leadRow);
      if (!leadSyncResult.ok) {
        console.error("Lead sync to Google Sheets failed (post-call):", leadSyncResult.error);
      }
    }

    return NextResponse.json({ success: true, callSyncResult });
  } catch (error: any) {
    console.error('Post-call notification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// app/api/notifications/pre-call/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { sendCombinedNotification, sendSMS } from '@/lib/notifications';
import { formatAnalysisReportHtml } from '@/lib/report-formatter';
import { AnalysisResult } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { callId } = await req.json();

    const callDoc = await db.collection('calls').doc(callId).get();
    const callData = callDoc.data();
    if (!callData) throw new Error('Call not found');

    const leadDoc = await db.collection('leads').doc(callData.leadId).get();
    const leadData = leadDoc.data();
    if (!leadData) throw new Error('Lead not found');

    // Fetch the analysis report
    let analysisData: AnalysisResult | null = null;
    if (callData.analysisId) {
      const analysisDoc = await db.collection('analyses').doc(callData.analysisId).get();
      if (analysisDoc.exists) {
        analysisData = analysisDoc.data() as AnalysisResult;
      }
    }

    if (!analysisData) {
      const analysisSnapshot = await db.collection('analyses')
        .where('leadId', '==', callData.leadId)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      if (!analysisSnapshot.empty) {
        analysisData = analysisSnapshot.docs[0].data() as AnalysisResult;
      }
    }

    if (!analysisData) {
      console.warn(`No analysis found for call ${callId}, sending basic notification`);
    }

    const reportHtml = analysisData 
      ? formatAnalysisReportHtml(analysisData)
      : '<p>Your custom analysis is being finalized and will be discussed during the call.</p>';

    await Promise.all([
      sendCombinedNotification({
        to: leadData.contactEmail,
        subject: `Meeting Confirmed: Dealflow.ai x ${leadData.companyName}`,
        meetingLink: callData.meetingUrl,
        reportHtml: reportHtml,
        callId,
        leadId: callData.leadId,
      }),
      sendSMS({
        to: leadData.contactPhone,
        message: `Hi ${leadData.contactName}, your meeting with Dealflow.ai is confirmed. Join here: ${callData.meetingUrl}. We've also emailed you a comprehensive analysis report.`
      }).catch(err => console.error('SMS delivery failed:', err.message))
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Pre-call notification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

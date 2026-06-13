import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { sendEmailWithRetry } from "@/lib/notifications";
import { type AgentAssignmentNotification, AGENT_FULL_NAMES } from "@/lib/types";

export const dynamic = "force-dynamic";

// CC recipients as per user request
const CC_RECIPIENTS = [
  "praneeth@growstack.ai",
  "praneethburada@gmail.com",
  "teambproject864@gmail.com",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      sessionId,
      agentKey,
      leadId,
      companyName,
      customerName,
      customerEmail,
      icpDocumentContent,
      sqlQueriesContent,
    } = body;
    
    if (!sessionId || !agentKey || !leadId || !companyName || !customerName || !customerEmail) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Get agent name from our agent list
    const agentName = AGENT_FULL_NAMES[agentKey as keyof typeof AGENT_FULL_NAMES] || "Agent";
    
    // Generate email HTML
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 700px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px; color: white; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">New Agent Assignment!</h1>
          <p style="margin-top: 8px; opacity: 0.9;">${agentName} has been assigned to ${companyName}</p>
        </div>
        
        <div style="padding: 32px; background: white;">
          <h2 style="color: #111827; margin-top: 0;">Session Details</h2>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <div style="display: grid; grid-template-columns: 150px 1fr; gap: 12px;">
              <div style="color: #6b7280;">Agent:</div>
              <div style="font-weight: 600; color: #111827;">${agentName}</div>
              
              <div style="color: #6b7280;">Company:</div>
              <div style="font-weight: 600; color: #111827;">${companyName}</div>
              
              <div style="color: #6b7280;">Customer:</div>
              <div style="font-weight: 600; color: #111827;">${customerName}</div>
              
              <div style="color: #6b7280;">Email:</div>
              <div style="font-weight: 600; color: #111827;">${customerEmail}</div>
              
              <div style="color: #6b7280;">Session ID:</div>
              <div style="font-weight: 600; color: #111827;">${sessionId}</div>
              
              <div style="color: #6b7280;">Lead ID:</div>
              <div style="font-weight: 600; color: #111827;">${leadId}</div>
              
              <div style="color: #6b7280;">Started At:</div>
              <div style="font-weight: 600; color: #111827;">${new Date().toLocaleString()}</div>
            </div>
          </div>
          
          ${icpDocumentContent ? `
          <div style="margin: 24px 0;">
            <h3 style="color: #111827;">ICP Document</h3>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; white-space: pre-wrap; font-size: 14px; color: #374151;">
              ${icpDocumentContent}
            </div>
          </div>
          ` : ''}
          
          ${sqlQueriesContent ? `
          <div style="margin: 24px 0;">
            <h3 style="color: #111827;">SQL Queries</h3>
            <div style="background: #f0fdfa; border: 1px solid #99f6e4; padding: 16px; border-radius: 8px; white-space: pre-wrap; font-size: 14px; color: #374151; font-family: 'Courier New', monospace;">
              ${sqlQueriesContent}
            </div>
          </div>
          ` : ''}
          
          <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 24px;">
            <p style="font-size: 14px; color: #6b7280;">
              This is an automated notification from the AI Revenue Agent System.
            </p>
          </div>
        </div>
      </div>
    `.trim();
    
    // Send the email
    await sendEmailWithRetry({
      to: CC_RECIPIENTS,
      subject: `[Agent Assignment] ${agentName} → ${companyName}`,
      body: emailHtml,
    });
    
    // Log the notification
    const logData: Omit<AgentAssignmentNotification, "sessionId"> & { sessionId: string; sentAt: string } = {
      sessionId,
      agentKey,
      leadId,
      companyName,
      customerName,
      customerEmail,
      startedAt: new Date().toISOString(),
      icpDocumentContent,
      sqlQueriesContent,
      sentAt: new Date().toISOString(),
    };
    
    await db.collection("agent_notifications").add(logData);
    
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[api/agents/notify] POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send notification" },
      { status: 500 }
    );
  }
}

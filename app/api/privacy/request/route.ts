// app/api/privacy/request/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";
import admin from "@/lib/firebase-admin";
import { checkRateLimitSensitive } from "@/lib/rate-limiter-middleware";
import { hashIp, decryptLead } from "@/lib/security";
import { getInMemoryLeads } from "@/lib/memory-storage";
import { ExtendedLeadRecord } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

// Helper to find lead ID by email
async function findLeadIdByEmail(email: string): Promise<string | null> {
  const emailLower = email.toLowerCase().trim();
  
  // 1. Check in-memory cache first
  const inMemoryLeads = getInMemoryLeads();
  for (const [leadId, lead] of inMemoryLeads.entries()) {
    const decrypted = decryptLead(lead);
    if (decrypted.contactEmail?.toLowerCase().trim() === emailLower) {
      return leadId;
    }
  }

  // 2. Fallback to Firestore
  const db = getDb();
  if (db) {
    const snap = await db.collection("leads").get();
    for (const doc of snap.docs) {
      const decrypted = decryptLead({ id: doc.id, ...doc.data() });
      if (decrypted.contactEmail?.toLowerCase().trim() === emailLower) {
        // Cache it in-memory
        inMemoryLeads.set(doc.id, { id: doc.id, ...doc.data() } as ExtendedLeadRecord);
        return doc.id;
      }
    }
  }

  return null;
}

export async function POST(req: Request) {
  const rateLimitResponse = await checkRateLimitSensitive(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const { name, email, requestType, message } = body;

    if (!email || !requestType) {
      return NextResponse.json(
        { success: false, error: "Email and request type are required." },
        { status: 400 }
      );
    }

    const validTypes = ["access", "rectify", "delete", "ccpa-opt-out"];
    if (!validTypes.includes(requestType)) {
      return NextResponse.json(
        { success: false, error: "Invalid request type." },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();
    const leadId = await findLeadIdByEmail(emailLower);
    const db = getDb();

    if (!db) {
      return NextResponse.json(
        { success: false, error: "Database not available." },
        { status: 500 }
      );
    }

    const ipRaw = req.headers.get("x-forwarded-for") ?? "unknown";
    const ipHash = hashIp(ipRaw);

    // If CCPA opt-out requested, apply consent flag immediately
    if (requestType === "ccpa-opt-out") {
      const targetId = leadId || `unauth-email-${Buffer.from(emailLower).toString("hex").slice(0, 32)}`;
      
      const consentRecord = {
        userId: targetId,
        email: emailLower,
        consentVersion: "ccpa-v1",
        purposes: ["opt-out"],
        doNotSell: true,
        consentedAt: admin.firestore.FieldValue.serverTimestamp(),
        ipHash,
        userAgent: req.headers.get("user-agent") ?? "unknown",
      };

      await db.collection("user_consent").doc(targetId).set(consentRecord, { merge: true });

      // Audit log
      await db.collection("audit_log").add({
        action: "CCPA_OPT_OUT_REQUESTED",
        userId: targetId,
        email: emailLower,
        ipHash,
        timestamp: new Date().toISOString(),
      });
    }

    // Persist privacy request details for manual or automated processing
    const requestId = uuidv4();
    const privacyRequest = {
      id: requestId,
      name: name || "Anonymous",
      email: emailLower,
      leadId: leadId || null,
      requestType,
      message: message || "",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await db.collection("privacy_requests").doc(requestId).set(privacyRequest);

    // Audit log for the request submission
    await db.collection("audit_log").add({
      action: `PRIVACY_${requestType.toUpperCase().replace("-", "_")}_SUBMITTED`,
      userId: leadId || emailLower,
      requestId,
      ipHash,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Your privacy request has been successfully recorded and queued for processing.",
      requestId,
    });
  } catch (error: any) {
    console.error("[privacy request POST] Error:", error?.message ?? error);
    return NextResponse.json(
      { success: false, error: "Failed to submit privacy request." },
      { status: 500 }
    );
  }
}

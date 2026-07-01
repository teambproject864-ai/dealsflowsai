import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";
import admin from "@/lib/firebase-admin";
import { hashIp } from "@/lib/security";
import { checkRateLimitSensitive } from "@/lib/rate-limiter-middleware";
import { logAuditEvent } from "@/lib/audit-logger";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * POST /api/consent
 * Records user consent (GDPR Art. 7 / CCPA).
 * Body: { consentVersion: string, purposes: string[] }
 *
 * GET /api/consent
 * Returns the current consent record for the authenticated user.
 */

export async function POST(req: Request) {
  const rateLimitResponse = await checkRateLimitSensitive(req);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }
    const uid = user.id;

    const { consentVersion, purposes, doNotSell } = await req.json();
    if (!consentVersion || !Array.isArray(purposes)) {
      return NextResponse.json(
        { success: false, error: "consentVersion and purposes[] are required." },
        { status: 400 }
      );
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ success: true, message: "Consent recorded (Firestore not configured)" });
    }

    const ipRaw = req.headers.get("x-forwarded-for") ?? "unknown";
    const consentRecord = {
      userId:          uid,
      consentVersion,
      purposes,
      doNotSell:       !!doNotSell,
      consentedAt:     admin.firestore.FieldValue.serverTimestamp(),
      ipHash:          hashIp(ipRaw),
      userAgent:       req.headers.get("user-agent") ?? "unknown",
    };

    await db.collection("user_consent").doc(uid).set(consentRecord, { merge: true });

    // Audit
    await logAuditEvent(req, uid, "CONSENT_RECORDED", { consentVersion, purposes, doNotSell: !!doNotSell });

    return NextResponse.json({ success: true, message: "Consent recorded." });
  } catch (error: any) {
    console.error("[consent POST] Error:", error?.message ?? error);
    return NextResponse.json(
      { success: false, error: "Failed to record consent." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }
    const uid = user.id;

    const db = getDb();
    if (!db) {
      return NextResponse.json({ success: true, consent: null });
    }

    const snap = await db.collection("user_consent").doc(uid).get();
    if (!snap.exists) {
      return NextResponse.json({ success: true, consent: null });
    }

    const data = snap.data();
    return NextResponse.json({
      success: true,
      consent: {
        consentVersion: data?.consentVersion,
        purposes:       data?.purposes,
        doNotSell:      data?.doNotSell ?? false,
        consentedAt:    data?.consentedAt,
      },
    });
  } catch (error: any) {
    console.error("[consent GET] Error:", error?.message ?? error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve consent." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import {
  getInMemoryCustomerCredentials,
  getInMemoryLeads,
} from "@/lib/memory-storage";
import { CustomerCredentials } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/auth";
import * as admin from "firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // ── Authentication ─────────────────────────────────────────
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { leadId, email, password } = body;

    if (!leadId || !email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (leadId, email)" },
        { status: 400 }
      );
    }

    const credentials: CustomerCredentials = {
      id: uuidv4(),
      leadId,
      email,
      // Hashed for real application
      passwordHash: password ? `hashed_${password}` : undefined,
      createdAt: new Date().toISOString(),
      isVerified: false,
    };

    const credsMap = getInMemoryCustomerCredentials();
    credsMap.set(credentials.id, credentials);

    // Save to Firestore
    if (db) {
      await db.collection("customer_credentials").doc(credentials.id).set(credentials);
    }

    // Also update lead record in Firestore and cache
    const leadsMap = getInMemoryLeads();
    let lead = leadsMap.get(leadId);
    if (!lead && db) {
      const doc = await db.collection("leads").doc(leadId).get();
      if (doc.exists) {
        lead = doc.data();
      }
    }

    if (lead) {
      const updatedLead = {
        ...lead,
        customerCredentialsId: credentials.id,
      };
      leadsMap.set(leadId, updatedLead);
      if (db) {
        await db.collection("leads").doc(leadId).set(updatedLead);
      }
    }

    return NextResponse.json({
      success: true,
      credentials: { ...credentials, passwordHash: undefined },
    });
  } catch (error) {
    console.error("[customer-credentials POST] failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create credentials" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  // ── Authentication ─────────────────────────────────────────
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");
    const email = searchParams.get("email");

    let creds: CustomerCredentials[] = [];

    // Retrieve from Firestore if available
    if (db) {
      let query: any = db.collection("customer_credentials");
      if (leadId) {
        query = query.where("leadId", "==", leadId);
      }
      if (email) {
        query = query.where("email", "==", email);
      }
      const snap = await query.get();
      snap.forEach((doc: any) => {
        creds.push(doc.data() as CustomerCredentials);
      });
    } else {
      creds = Array.from(getInMemoryCustomerCredentials().values());
      if (leadId) {
        creds = creds.filter(c => c.leadId === leadId);
      }
      if (email) {
        creds = creds.filter(c => c.email === email);
      }
    }

    // Return without password hash
    const sanitized = creds.map(c => ({ ...c, passwordHash: undefined }));
    return NextResponse.json({ success: true, credentials: sanitized });
  } catch (error) {
    console.error("[customer-credentials GET] failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch credentials" },
      { status: 500 }
    );
  }
}
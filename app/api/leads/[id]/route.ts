import { NextResponse } from "next/server";
import { getInMemoryLeads } from "@/lib/memory-storage";
import { db } from "@/lib/firebase-admin";
import { requireAuth } from "@/lib/auth";

const inMemoryLeads = getInMemoryLeads();

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // ── Authentication ─────────────────────────────────────────
  const { errorResponse } = await requireAuth(req);
  if (errorResponse) return errorResponse;

  try {
    const { id: leadId } = await params;
    
    // Check in-memory cache first
    let lead = inMemoryLeads.get(leadId);

    // If not found in cache, fetch from Firestore
    if (!lead && db) {
      const doc = await db.collection("leads").doc(leadId).get();
      if (doc.exists) {
        lead = doc.data();
        // Cache it locally
        inMemoryLeads.set(leadId, lead);
      }
    }

    if (!lead) {
      return NextResponse.json(
        { success: false, error: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      leadId,
      ...lead,
    });
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lead" },
      { status: 500 }
    );
  }
}


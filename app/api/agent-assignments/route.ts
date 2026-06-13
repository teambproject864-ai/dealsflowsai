import { NextResponse } from "next/server";
import {
  getInMemoryAgentAssignments,
  getInMemoryLeads,
} from "@/lib/memory-storage";
import { AgentAssignment, getAgentByKey } from "@/lib/types";
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
    const { leadId, agentKey } = body;

    if (!leadId || !agentKey) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (leadId, agentKey)" },
        { status: 400 }
      );
    }

    const agentProfile = getAgentByKey(agentKey as any);
    if (!agentProfile) {
      return NextResponse.json(
        { success: false, error: "Agent not found" },
        { status: 404 }
      );
    }

    const assignment: AgentAssignment = {
      id: uuidv4(),
      leadId,
      agentKey: agentKey as any,
      agentName: agentProfile.name,
      assignedAt: new Date().toISOString(),
      status: "active",
    };

    const assignmentsMap = getInMemoryAgentAssignments();
    assignmentsMap.set(assignment.id, assignment);

    // Save to Firestore
    if (db) {
      await db.collection("agent_assignments").doc(assignment.id).set(assignment);
    }

    // Also update the lead record in Firestore and cache
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
        assignedAgentKey: agentKey,
        agentAssignmentId: assignment.id,
      };
      leadsMap.set(leadId, updatedLead);
      if (db) {
        await db.collection("leads").doc(leadId).set(updatedLead);
      }
    }

    return NextResponse.json({ success: true, assignment });
  } catch (error) {
    console.error("[agent-assignments POST] failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to assign agent" },
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
    const agentKey = searchParams.get("agentKey");

    let assignments: AgentAssignment[] = [];

    // Retrieve from Firestore if available
    if (db) {
      let query: any = db.collection("agent_assignments");
      if (leadId) {
        query = query.where("leadId", "==", leadId);
      }
      if (agentKey) {
        query = query.where("agentKey", "==", agentKey);
      }
      const snap = await query.get();
      snap.forEach((doc: any) => {
        assignments.push(doc.data() as AgentAssignment);
      });
    } else {
      // Fallback to in-memory map
      assignments = Array.from(getInMemoryAgentAssignments().values());
      if (leadId) {
        assignments = assignments.filter(a => a.leadId === leadId);
      }
      if (agentKey) {
        assignments = assignments.filter(a => a.agentKey === agentKey);
      }
    }

    return NextResponse.json({ success: true, assignments });
  } catch (error) {
    console.error("[agent-assignments GET] failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!db) return NextResponse.json({ success: false, error: "firestore_unavailable" }, { status: 500 });
    const snap = await db.collection("rag_documents").orderBy("createdAtMs", "desc").limit(50).get();
    const documents = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    return NextResponse.json({ success: true, documents });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || "list_failed" }, { status: 500 });
  }
}


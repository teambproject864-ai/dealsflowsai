import { NextResponse } from "next/server";
import { getInMemoryLeads } from "@/lib/memory-storage";

const inMemoryLeads = getInMemoryLeads();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = params.id;
    const lead = inMemoryLeads.get(leadId);

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


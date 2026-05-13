import { NextResponse } from "next/server";

const PREDEFINED_TIME_SLOTS = [
  "slot-1", "slot-2", "slot-3", "slot-4", "slot-5", "slot-6", "slot-7",
  "slot-8", "slot-9", "slot-10", "slot-11", "slot-12", "slot-13", "slot-14"
];

const PREDEFINED_AGENTS = ["agent-praneeth", "agent-alex"];
const PREDEFINED_MEETING_TYPES = ["type-discovery", "type-demo"];

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, email, company, selectedTimeSlot, selectedAgent, selectedMeetingType } = data;

    const errors: Record<string, string> = {};

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      errors.name = "Name is required";
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Valid email is required";
    }

    if (!company || typeof company !== "string" || company.trim().length === 0) {
      errors.company = "Company name is required";
    }

    if (!selectedTimeSlot || typeof selectedTimeSlot !== "string" || !PREDEFINED_TIME_SLOTS.includes(selectedTimeSlot)) {
      errors.timeSlot = "Invalid time slot selected";
    }

    if (!selectedAgent || typeof selectedAgent !== "string" || !PREDEFINED_AGENTS.includes(selectedAgent)) {
      errors.agent = "Invalid agent selected";
    }

    if (!selectedMeetingType || typeof selectedMeetingType !== "string" || !PREDEFINED_MEETING_TYPES.includes(selectedMeetingType)) {
      errors.meetingType = "Invalid meeting type selected";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, error: Object.values(errors)[0], errors },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking validated successfully"
    });

  } catch (error) {
    console.error("Booking validation error:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request data" },
      { status: 400 }
    );
  }
}

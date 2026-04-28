import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log("Vapi.ai webhook received:", payload);
    
    // Handle Vapi.ai events (speech started, speech ended, etc.)
    // For now, just return a success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in voice webhook:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

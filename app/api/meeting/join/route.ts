import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { botId } = await req.json();
    console.log(`Triggering bot ${botId} to join call`);
    // Logic to tell Recall.ai bot to join the call
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in bot join:", error);
    return NextResponse.json({ error: "Join failed" }, { status: 500 });
  }
}

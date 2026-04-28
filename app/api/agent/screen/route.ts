// app/api/agent/screen/route.ts
import { NextResponse } from 'next/server';
import { navigateTo, getScreenshot } from '@/lib/screen-controller';

export async function POST(req: Request) {
  try {
    const { callId, url } = await req.json();
    if (!callId || !url) {
      return NextResponse.json({ error: 'Missing callId or url' }, { status: 400 });
    }
    await navigateTo(callId, url);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const callId = searchParams.get('callId');
  if (!callId) {
    return NextResponse.json({ error: 'Missing callId' }, { status: 400 });
  }
  const screenshot = await getScreenshot(callId);
  return NextResponse.json({ screenshot });
}

// app/api/notifications/daily-email-scheduler/route.ts
import { NextResponse } from 'next/server';
import { sendDailyEmailWithFallback, getSchedulerStatus, getEmailLogs, DailyEmailConfig } from '@/lib/daily-email-scheduler';
import { z } from 'zod';

const configSchema = z.object({
  recipientEmail: z.string().email().optional(),
  senderEmail: z.string().email().optional(),
  senderName: z.string().optional(),
  subject: z.string().optional(),
  fallbackEmail: z.string().email().optional(),
  enabled: z.enum(['true', 'false']).optional()
});

const triggerSchema = z.object({
  subject: z.string().optional(),
  body: z.string().optional(),
  fallbackEmail: z.string().email().optional()
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = Object.fromEntries(searchParams.entries());
    
    if (raw.action === 'logs') {
      const limit = parseInt(raw.limit || '30', 10);
      const logs = await getEmailLogs(limit);
      return NextResponse.json({ success: true, logs });
    }

    const status = await getSchedulerStatus();
    
    return NextResponse.json({
      success: true,
      status,
      message: 'Daily email scheduler is configured for 7:00 PM IST daily'
    });
  } catch (error: any) {
    console.error('[DailyEmailScheduler API] Status check failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const params = triggerSchema.parse(body);

    const config: DailyEmailConfig = {
      recipientEmail: ['praneethburada@gmail.com', 'praneeth@growstack.ai', 'teambproject864@gmail.com'],
      senderEmail: 'noreply@dealflow.ai',
      senderName: 'Dealflow.ai'
    };

    if (params.body) {
      config.bodyTemplate = () => params.body!;
    }

    const result = await sendDailyEmailWithFallback(
      config,
      params.fallbackEmail
    );

    return NextResponse.json({
      success: result.success,
      method: result.method,
      message: result.success 
        ? `Daily email sent successfully via ${result.method}`
        : `Failed to send email: ${result.error}`,
      logEntry: result.logEntry
    });
  } catch (error: any) {
    console.error('[DailyEmailScheduler API] Trigger failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// app/api/notifications/post-call-scheduler/route.ts
import { NextResponse } from 'next/server';
import { triggerEndOfDayReport, getSchedulerStatus } from '@/lib/post-call-scheduler';
import { z } from 'zod';

const querySchema = z.object({
  email: z.string().email().optional(),
  force: z.enum(['true', 'false']).optional()
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = Object.fromEntries(searchParams.entries());
    const params = querySchema.parse(raw);

    const status = await getSchedulerStatus();
    
    return NextResponse.json({
      success: true,
      status: status.isRunning ? 'running' : 'idle',
      lastRun: status.lastRun || null,
      message: status.isRunning 
        ? 'A batch run is currently in progress'
        : 'Scheduler is idle. POST to this endpoint to trigger end-of-day reports.'
    });
  } catch (error: any) {
    console.error('[Scheduler API] Status check failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = Object.fromEntries(searchParams.entries());
    const params = querySchema.parse(raw);

    const result = await triggerEndOfDayReport(params.email);

    return NextResponse.json({
      success: result.success,
      processed: result.processed,
      succeeded: result.succeeded,
      failed: result.failed,
      errors: result.errors,
      message: result.message
    });
  } catch (error: any) {
    console.error('[Scheduler API] End-of-day run failed:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

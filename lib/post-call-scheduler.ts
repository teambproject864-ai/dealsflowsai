// lib/post-call-scheduler.ts
import { executeEndOfDayEmailRun, processAndSendPostCallEmail } from './post-call-email';
import { db } from './firebase-admin';

export interface SchedulerConfig {
  defaultStakeholderEmail: string;
  batchSize?: number;
  retryAttempts?: number;
}

const DEFAULT_CONFIG: SchedulerConfig = {
  defaultStakeholderEmail: 'team@dealflow.ai',
  batchSize: 50,
  retryAttempts: 3
};

let isRunning = false;

export async function triggerEndOfDayReport(
  stakeholderEmail?: string,
  config: SchedulerConfig = DEFAULT_CONFIG
): Promise<{
  success: boolean;
  processed?: number;
  succeeded?: number;
  failed?: number;
  errors?: string[];
  message: string;
}> {
  if (isRunning) {
    return {
      success: false,
      message: 'A batch run is already in progress. Please wait for it to complete.'
    };
  }

  isRunning = true;
  const email = stakeholderEmail || config.defaultStakeholderEmail;

  try {
    console.log(`[Scheduler] Starting end-of-day report run for ${email}`);

    const result = await executeEndOfDayEmailRun(email);

    await logSchedulerEvent('END_OF_DAY_REPORT', {
      email,
      processed: result.processed,
      succeeded: result.succeeded,
      failed: result.failed
    });

    return {
      success: result.failed === 0,
      processed: result.processed,
      succeeded: result.succeeded,
      failed: result.failed,
      errors: result.errors,
      message: `Processed ${result.processed} calls. ${result.succeeded} succeeded, ${result.failed} failed.`
    };
  } catch (error: any) {
    console.error('[Scheduler] End-of-day report failed:', error);
    
    await logSchedulerEvent('SCHEDULER_ERROR', {
      email,
      error: error.message
    });

    return {
      success: false,
      message: `Scheduler error: ${error.message}`
    };
  } finally {
    isRunning = false;
  }
}

export async function triggerIndividualCallEmail(
  callId: string,
  stakeholderEmail: string
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await processAndSendPostCallEmail(callId, stakeholderEmail);

    await logSchedulerEvent('INDIVIDUAL_REPORT', {
      callId,
      email: stakeholderEmail,
      success: result.success,
      error: result.error
    });

    return {
      success: result.success,
      message: result.success 
        ? `Report for call ${callId} sent successfully to ${stakeholderEmail}`
        : `Failed to send report: ${result.error}`
    };
  } catch (error: any) {
    console.error('[Scheduler] Individual report failed:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

async function logSchedulerEvent(type: string, data: Record<string, any>) {
  try {
    await db.collection('scheduler_events').add({
      type,
      ...data,
      timestamp: new Date().toISOString(),
      version: 'ALMA-1.0'
    });
  } catch (err) {
    console.error('[Scheduler] Failed to log event:', err);
  }
}

export function isSchedulerRunning(): boolean {
  return isRunning;
}

export async function getSchedulerStatus(): Promise<{
  isRunning: boolean;
  lastRun?: {
    timestamp: string;
    email: string;
    processed: number;
    succeeded: number;
    failed: number;
  };
}> {
  try {
    const lastRunDoc = await db.collection('post_call_batch_runs')
      .orderBy('processedAt', 'desc')
      .limit(1)
      .get();

    if (lastRunDoc.empty) {
      return { isRunning };
    }

    const lastRunData = lastRunDoc.docs[0].data();
    return {
      isRunning,
      lastRun: {
        timestamp: lastRunData.processedAt,
        email: lastRunData.email,
        processed: lastRunData.processed,
        succeeded: lastRunData.succeeded,
        failed: lastRunData.failed
      }
    };
  } catch (err) {
    return { isRunning };
  }
}

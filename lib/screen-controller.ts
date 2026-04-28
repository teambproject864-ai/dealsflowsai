// lib/screen-controller.ts

export async function navigateTo(callId: string, url: string): Promise<void> {
  const workerUrl = process.env.SCREEN_SHARE_WORKER_URL;
  if (!workerUrl) {
    console.warn('SCREEN_SHARE_WORKER_URL not set. Screen navigation skipped.');
    return;
  }

  const response = await fetch(`${workerUrl}/navigate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callId, url })
  });

  if (!response.ok) {
    throw new Error(`Screen worker navigation failed: ${response.status}`);
  }
}

export async function getScreenshot(callId: string): Promise<string | null> {
  const workerUrl = process.env.SCREEN_SHARE_WORKER_URL;
  if (!workerUrl) return null;

  try {
    const response = await fetch(`${workerUrl}/screenshot/${callId}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.screenshot || null;
  } catch {
    return null;
  }
}

export async function deleteSession(callId: string): Promise<void> {
  const workerUrl = process.env.SCREEN_SHARE_WORKER_URL;
  if (!workerUrl) return;

  try {
    await fetch(`${workerUrl}/session/${callId}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Failed to delete screen session:', error);
  }
}

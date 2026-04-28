import http from 'http';
import express, { Request, Response } from 'express';
import { chromium, Browser, Page } from 'playwright';
import { ScreenSession } from '../lib/types';

const app = express();
app.use(express.json());

interface SessionData {
  browser: Browser;
  page: Page;
  lastActive: number;
}

const sessions: Record<string, SessionData> = {};
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

async function getOrCreateSession(callId: string): Promise<SessionData> {
  if (!sessions[callId]) {
    console.log(`[Worker] Creating new session for call ${callId}`);
    const browser = await chromium.launch({
      headless: true, // Headless by default for production stability
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--window-size=1280,720'
      ]
    });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Default navigation to avoid blank pages
    await page.goto('https://dealflow.ai', { waitUntil: 'networkidle' }).catch(err => {
      console.warn(`[Worker] Initial navigation failed for ${callId}:`, err.message);
    });

    sessions[callId] = { 
      browser, 
      page, 
      lastActive: Date.now() 
    };
  } else {
    sessions[callId].lastActive = Date.now();
  }
  return sessions[callId];
}

// Cleanup stale sessions every 5 minutes
setInterval(async () => {
  const now = Date.now();
  for (const [callId, session] of Object.entries(sessions)) {
    if (now - session.lastActive > SESSION_TIMEOUT) {
      console.log(`[Worker] Cleaning up stale session for ${callId}`);
      try {
        await session.browser.close();
        delete sessions[callId];
      } catch (err: any) {
        console.error(`[Worker] Error closing stale session ${callId}:`, err.message);
      }
    }
  }
}, 5 * 60 * 1000);

app.post('/navigate', async (req: Request, res: Response) => {
  const { callId, url } = req.body;
  if (!callId || !url) {
    return res.status(400).json({ error: 'callId and url required' });
  }

  try {
    const session = await getOrCreateSession(callId);
    console.log(`[Worker] Navigating ${callId} to ${url}`);
    await session.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    res.json({ success: true, navigatedTo: url });
  } catch (error: any) {
    console.error(`[Worker] Navigation error for ${callId}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/screenshot/:callId', async (req: Request, res: Response) => {
  const callId = req.params.callId as string;
  try {
    const session = sessions[callId];
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    session.lastActive = Date.now();
    const screenshot = await session.page.screenshot({ type: 'png' });
    const base64 = screenshot.toString('base64');
    res.json({ screenshot: `data:image/png;base64,${base64}` });
  } catch (error: any) {
    console.error(`[Worker] Screenshot error for ${callId}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/display/:callId', async (req: Request, res: Response) => {
  const callId = req.params.callId as string;
  try {
    await getOrCreateSession(callId);
    res.send(`
      <html>
        <head>
          <title>Screen Share: ${callId}</title>
          <style>body { margin:0; padding:0; background:#000; overflow:hidden; }</style>
        </head>
        <body>
          <iframe 
            id="display" 
            style="width:100vw;height:100vh;border:none;" 
            src="https://dealflow.ai">
          </iframe>
          <script>
            // Fallback for real-time updates if worker is proxied or directly accessed
            const ws = new WebSocket('ws://' + window.location.hostname + ':3001');
            ws.onmessage = (e) => {
              try {
                const data = JSON.parse(e.data);
                if (data.callId === "${callId}" && data.url) {
                  document.getElementById('display').src = data.url;
                }
              } catch (err) {
                console.error("WS parse error", err);
              }
            };
            ws.onclose = () => console.warn("Display WS closed");
          </script>
        </body>
      </html>
    `);
  } catch (error: any) {
    res.status(500).send(`Error launching display session: ${error.message}`);
  }
});

app.delete('/session/:callId', async (req: Request, res: Response) => {
  const callId = req.params.callId as string;
  if (sessions[callId]) {
    try {
      console.log(`[Worker] Explicitly closing session for ${callId}`);
      await sessions[callId].browser.close();
      delete sessions[callId];
    } catch (err: any) {
      console.error(`[Worker] Error closing session ${callId}:`, err.message);
    }
  }
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[Worker] Screen share worker running on port ${PORT}`);
});

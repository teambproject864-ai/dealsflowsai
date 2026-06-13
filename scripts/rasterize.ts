#!/usr/bin/env tsx
import { z } from 'zod';
import { chromium, Browser, Page } from 'playwright';
import fs from 'fs';
import path from 'path';
import os from 'os';

// --- Schemas ---
const RasterizeOptionsSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  output: z.string().min(1, 'Output path is required'),
  width: z.number().int().positive().default(1920),
  height: z.number().int().positive().default(1080),
  format: z.enum(['png', 'jpeg', 'pdf']).default('png'),
  quality: z.number().int().min(0).max(100).default(80),
  fullPage: z.boolean().default(false),
  waitFor: z.string().optional(),
  timeout: z.number().int().positive().default(30000),
});

// --- Logging ---
function log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
  const timestamp = new Date().toISOString();
  console[level](`[${timestamp}] [Rasterize] ${message}`);
}

// --- Core Functions ---
async function launchBrowser(): Promise<Browser> {
  log('Launching browser...');
  return await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
}

async function rasterizePage(
  page: Page,
  options: z.infer<typeof RasterizeOptionsSchema>
): Promise<Buffer> {
  log(`Navigating to ${options.url}...`);
  await page.goto(options.url, {
    waitUntil: options.waitFor ? 'networkidle' : 'domcontentloaded',
    timeout: options.timeout,
  });

  log('Page loaded. Taking screenshot...');

  if (options.format === 'pdf') {
    return await page.pdf({
      width: `${options.width}px`,
      height: `${options.height}px`,
      printBackground: true,
    });
  } else {
    return await page.screenshot({
      type: options.format,
      quality: options.format === 'jpeg' ? options.quality : undefined,
      fullPage: options.fullPage,
    });
  }
}

async function saveOutput(buffer: Buffer, outputPath: string) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, buffer);
  log(`Saved output to ${outputPath}`);
}

// --- Main ---
export async function rasterize(optionsInput: Partial<z.infer<typeof RasterizeOptionsSchema>> & { url: string; output: string }) {
  const options = RasterizeOptionsSchema.parse(optionsInput);
  const browser = await launchBrowser();

  try {
    const context = await browser.newContext({
      viewport: { width: options.width, height: options.height },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();
    const buffer = await rasterizePage(page, options);
    await saveOutput(buffer, options.output);
    return { success: true, outputPath: options.output };
  } finally {
    await browser.close();
  }
}

// --- CLI ---
function parseArgs() {
  const args: Record<string, any> = {};
  const rawArgs = process.argv.slice(2);

  for (let i = 0; i < rawArgs.length; i += 2) {
    const key = rawArgs[i].replace(/^--?/, '');
    const value = rawArgs[i + 1];

    if (key === 'fullPage') {
      args[key] = true;
      i--; // Since this flag doesn't take a value
    } else if (['width', 'height', 'quality', 'timeout'].includes(key)) {
      args[key] = parseInt(value, 10);
    } else {
      args[key] = value;
    }
  }

  return args;
}

async function main() {
  try {
    const args = parseArgs();
    if (!args.url || !args.output) {
      console.log(`
Web Page Rasterization Tool

Usage:
  tsx rasterize.ts --url <url> --output <path> [options]

Options:
  --url <url>            URL to rasterize (required)
  --output <path>        Output file path (required)
  --width <number>       Viewport width (default: 1920)
  --height <number>      Viewport height (default: 1080)
  --format <png|jpeg|pdf> Output format (default: png)
  --quality <0-100>     JPEG quality (default: 80)
  --fullPage            Capture full page (default: false)
  --waitFor             Wait for network idle (default: false)
  --timeout <ms>        Navigation timeout in ms (default: 30000)

Examples:
  tsx rasterize.ts --url https://example.com --output example.png
  tsx rasterize.ts --url https://example.com --output example.pdf --format pdf
  tsx rasterize.ts --url https://example.com --output fullpage.png --fullPage
      `);
      process.exit(1);
    }

    await rasterize(args as any);
  } catch (error: any) {
    log(`Error: ${error.message}`, 'error');
    if (error instanceof z.ZodError) {
      console.error('Validation Errors:', error.format());
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export default rasterize;

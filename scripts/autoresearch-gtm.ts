#!/usr/bin/env tsx
import { z } from 'zod';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// --- Schemas ---
const ResearchOptionsSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  output: z.string().min(1).optional(),
  verbose: z.boolean().default(false),
});

// --- Types ---
interface GtmTag {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive';
  firingTriggers: string[];
  blockingTriggers: string[];
}

interface GtmTrigger {
  id: string;
  name: string;
  type: string;
  conditions: string[];
}

interface GtmAuditReport {
  url: string;
  scannedAt: string;
  hasGtm: boolean;
  gtmContainerId?: string;
  gtmDataLayerPresent: boolean;
  tagsFound?: GtmTag[];
  triggersFound?: GtmTrigger[];
  issues: string[];
  recommendations: string[];
}

// --- Logging ---
let verboseMode = false;
function log(message: string, level: 'info' | 'warn' | 'error' | 'debug' = 'info') {
  const timestamp = new Date().toISOString();
  const shouldLog = level !== 'debug' || verboseMode;
  if (shouldLog) {
    console[level](`[${timestamp}] [AutoResearchGTM] ${message}`);
  }
}

// --- Core Functions ---
async function scanForGtm(url: string): Promise<GtmAuditReport> {
  log(`Starting GTM scan for ${url}`);
  const report: GtmAuditReport = {
    url,
    scannedAt: new Date().toISOString(),
    hasGtm: false,
    gtmDataLayerPresent: false,
    issues: [],
    recommendations: [],
  };

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await context.newPage();

    // Enable console and request logging
    page.on('console', msg => log(`[Page Console] ${msg.text()}`, 'debug'));

    log('Navigating to page...');
    await page.goto(url, { waitUntil: 'networkidle' });

    // 1. Check for GTM container script
    const containerId = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      const gtmScript = scripts.find(s => s.innerHTML.includes('GTM-') || s.src.includes('GTM-'));
      if (gtmScript) {
        const match = (gtmScript.innerHTML || gtmScript.src).match(/GTM-[A-Z0-9]+/);
        return match ? match[0] : null;
      }
      return null;
    });

    if (containerId) {
      report.hasGtm = true;
      report.gtmContainerId = containerId;
      log(`Found GTM container: ${containerId}`);
    } else {
      report.issues.push('No Google Tag Manager container found on page');
      report.recommendations.push('Add a GTM container to your site');
    }

    // 2. Check for dataLayer
    const hasDataLayer = await page.evaluate(() => {
      return typeof (window as any).dataLayer !== 'undefined';
    });

    report.gtmDataLayerPresent = hasDataLayer;
    if (!hasDataLayer && report.hasGtm) {
      report.issues.push('GTM container present but dataLayer not initialized');
      report.recommendations.push('Initialize the dataLayer before the GTM container script');
    }

    log('Scan completed');
  } finally {
    await browser.close();
  }

  return report;
}

async function saveReport(report: GtmAuditReport, outputPath?: string) {
  const json = JSON.stringify(report, null, 2);
  const finalPath = outputPath || `gtm-report-${Date.now()}.json`;
  const dir = path.dirname(finalPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(finalPath, json);
  log(`Report saved to ${finalPath}`);
  return finalPath;
}

// --- Main ---
export async function autoResearchGtm(optionsInput: z.infer<typeof ResearchOptionsSchema>) {
  const options = ResearchOptionsSchema.parse(optionsInput);
  verboseMode = options.verbose;
  const report = await scanForGtm(options.url);
  if (options.output) {
    await saveReport(report, options.output);
  }
  return report;
}

// --- CLI ---
function parseArgs() {
  const args: Record<string, any> = {};
  const rawArgs = process.argv.slice(2);

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      let value: any = true;
      if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith('--')) {
        value = rawArgs[i + 1];
        i++;
      }
      args[key] = value;
    }
  }

  return args;
}

async function main() {
  try {
    const args = parseArgs();
    const url = args.url || args._?.[0];
    if (!url) {
      console.log(`
Google Tag Manager Research & Audit Tool

Usage:
  tsx autoresearch-gtm.ts --url <url> [options]

Options:
  --url <url>     URL to scan for GTM (required)
  --output <path> Output JSON report file path
  --verbose       Show debug logging

Examples:
  tsx autoresearch-gtm.ts --url https://example.com
  tsx autoresearch-gtm.ts --url https://example.com --output report.json --verbose
      `);
      process.exit(1);
    }

    const report = await autoResearchGtm({
      url,
      output: args.output,
      verbose: !!args.verbose,
    });

    console.log('\n=== GTM Audit Report ===');
    console.log(`Scanned URL: ${report.url}`);
    console.log(`GTM Present: ${report.hasGtm}`);
    if (report.gtmContainerId) {
      console.log(`Container ID: ${report.gtmContainerId}`);
    }
    console.log(`Data Layer Present: ${report.gtmDataLayerPresent}`);
    console.log('\nIssues Found:');
    if (report.issues.length === 0) {
      console.log('  None!');
    } else {
      report.issues.forEach(issue => console.log(`  - ${issue}`));
    }
    console.log('\nRecommendations:');
    if (report.recommendations.length === 0) {
      console.log('  None!');
    } else {
      report.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
    console.log('\n');
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

export default autoResearchGtm;

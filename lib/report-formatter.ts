
import { AnalysisResult } from "./types";

/**
 * Formats the AnalysisResult into a professional HTML report for email delivery.
 */
export function formatAnalysisReportHtml(analysis: AnalysisResult): string {
  const { healthScore, executiveSummary, painPoints, missedRevenue, stackGaps, solutions } = analysis;

  const scoreColor = healthScore > 70 ? "#10b981" : healthScore > 40 ? "#f59e0b" : "#ef4444";

  return `
    <div style="font-family: sans-serif; color: #1f2937; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">GTM Strategy Analysis</h1>
        <p style="color: #e0e7ff; margin: 8px 0 0; font-size: 14px;">Comprehensive report for your upcoming call</p>
      </div>
      
      <div style="padding: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
          <div>
            <h2 style="margin: 0; font-size: 18px;">GTM Health Score</h2>
            <p style="margin: 4px 0 0; font-size: 12px; color: #6b7280;">Based on identified pain points and revenue gaps</p>
          </div>
          <div style="background-color: ${scoreColor}; color: #ffffff; padding: 12px 20px; border-radius: 50%; font-size: 24px; font-weight: bold;">
            ${healthScore}
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 16px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">Executive Summary</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">${executiveSummary}</p>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 16px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">Top Identified Pain Points</h3>
          <ul style="padding-left: 20px; margin: 0;">
            ${painPoints.map(p => `
              <li style="margin-bottom: 12px;">
                <strong style="color: ${p.severity === 'critical' ? '#ef4444' : '#1f2937'};">${p.title} (${p.severity.toUpperCase()})</strong>
                <p style="margin: 4px 0 0; font-size: 14px; color: #4b5563;">${p.description}</p>
              </li>
            `).join('')}
          </ul>
        </div>

        <div style="margin-bottom: 24px; background-color: #fffbeb; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <h3 style="font-size: 16px; margin-top: 0;">Potential Missed Revenue</h3>
          ${missedRevenue.map(m => `
            <div style="margin-bottom: 8px;">
              <span style="font-size: 14px; font-weight: bold; color: #b45309;">${m.label}: ${m.estimate}</span>
              <p style="margin: 2px 0 0; font-size: 12px; color: #92400e;">${m.detail}</p>
            </div>
          `).join('')}
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 16px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">Proposed Solutions</h3>
          ${solutions.map(s => `
            <div style="margin-bottom: 16px; padding: 12px; background-color: #f9fafb; border-radius: 8px;">
              <p style="margin: 0; font-size: 14px;"><strong>Challenge:</strong> ${s.painPoint}</p>
              <p style="margin: 4px 0 0; font-size: 14px;"><strong>Solution:</strong> ${s.solution}</p>
              <p style="margin: 4px 0 0; font-size: 14px; color: #059669;"><strong>Expected ROI:</strong> ${s.roiEstimate}</p>
            </div>
          `).join('')}
        </div>

        ${stackGaps.length > 0 ? `
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 16px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">Stack Gaps</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${stackGaps.map(gap => `
                <span style="background-color: #f3f4f6; color: #4b5563; padding: 4px 12px; border-radius: 9999px; font-size: 12px;">${gap}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
      
      <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">&copy; ${new Date().getFullYear()} Dealflow.ai. All rights reserved.</p>
      </div>
    </div>
  `;
}

/**
 * Formats the AnalysisResult into a concise text summary for meeting preparation.
 */
export function formatAnalysisSummaryText(analysis: AnalysisResult): string {
  const { healthScore, executiveSummary, painPoints = [], missedRevenue = [], stackGaps = [], solutions = [] } = analysis;

  let summary = `GTM ANALYSIS SUMMARY (Health Score: ${healthScore}/100)\n\n`;

  summary += `EXECUTIVE SUMMARY:\n${executiveSummary}\n\n`;

  if (painPoints.length > 0) {
    summary += `KEY PAIN POINTS:\n`;
    painPoints.slice(0, 3).forEach((p: any) => {
      summary += `- ${p.title} (${p.severity}): ${p.description}\n`;
    });
    summary += `\n`;
  }

  if (missedRevenue.length > 0) {
    summary += `REVENUE IMPACT:\n`;
    missedRevenue.forEach((m: any) => {
      summary += `- ${m.label}: ${m.estimate}\n`;
    });
    summary += `\n`;
  }

  if (solutions.length > 0) {
    summary += `RECOMMENDED SOLUTIONS:\n`;
    solutions.slice(0, 2).forEach((s: any) => {
      summary += `- ${s.solution} (Expected ROI: ${s.roiEstimate})\n`;
    });
    summary += `\n`;
  }

  if (stackGaps.length > 0) {
    summary += `STACK GAPS: ${stackGaps.join(', ')}\n\n`;
  }

  summary += `Prepared by Dealflow.ai`;

  return summary;
}

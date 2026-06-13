import { AnalysisResult } from "./types";

export function formatAnalysisReportHtml(analysis: AnalysisResult): string {
  const {
    healthScore = 0,
    gtmPlan = "",
    idealCustomerProfiles = [],
    comprehensiveBrandOverview = "",
    strategicOutreachApproach = "",
    marketDifferentiationTriggers = [],
    goToMarketCoreFramework = "",
    customerJourneyPipeline = [],
  } = analysis;

  const scoreColor = healthScore > 70 ? "#10b981" : healthScore > 40 ? "#f59e0b" : "#ef4444";

  const sectionList = (items: { title: string; content: string }[]) =>
    items
      .map(
        (item) => `
      <li style="margin-bottom: 12px;">
        <strong>${item.title}</strong>
        <p style="margin: 4px 0 0; font-size: 14px; color: #4b5563;">${item.content}</p>
      </li>`
      )
      .join("");

  return `
    <div style="font-family: sans-serif; color: #1f2937; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background-color: #4f46e5; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">GTM Strategy Analysis</h1>
        <p style="color: #e0e7ff; margin: 8px 0 0; font-size: 14px;">Derived from your company website</p>
      </div>
      
      <div style="padding: 24px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
          <div>
            <h2 style="margin: 0; font-size: 18px;">GTM Health Score</h2>
          </div>
          <div style="background-color: ${scoreColor}; color: #ffffff; padding: 12px 20px; border-radius: 50%; font-size: 24px; font-weight: bold;">
            ${healthScore}
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 16px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">Complete GTM Plan</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">${gtmPlan}</p>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 16px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">Comprehensive Brand Overview</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">${comprehensiveBrandOverview}</p>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 16px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">Ideal Customer Profiles</h3>
          <ul style="padding-left: 20px; margin: 0;">${sectionList(idealCustomerProfiles)}</ul>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 16px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">Strategic Outreach Approach</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">${strategicOutreachApproach}</p>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 16px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">Market Differentiation Triggers</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${marketDifferentiationTriggers
              .map(
                (t) =>
                  `<span style="background-color: #f3f4f6; color: #4b5563; padding: 4px 12px; border-radius: 9999px; font-size: 12px;">${t}</span>`
              )
              .join("")}
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 16px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">Go-To-Market Core Framework</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">${goToMarketCoreFramework}</p>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="font-size: 16px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">Customer Journey Pipeline</h3>
          <ul style="padding-left: 20px; margin: 0;">${sectionList(customerJourneyPipeline)}</ul>
        </div>
      </div>
      
      <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">&copy; ${new Date().getFullYear()} Dealflow.ai. All rights reserved.</p>
      </div>
    </div>
  `;
}

export function formatAnalysisSummaryText(analysis: AnalysisResult): string {
  const {
    healthScore = 0,
    gtmPlan = "",
    idealCustomerProfiles = [],
    comprehensiveBrandOverview = "",
    strategicOutreachApproach = "",
    marketDifferentiationTriggers = [],
    goToMarketCoreFramework = "",
    customerJourneyPipeline = [],
  } = analysis;

  let summary = `GTM ANALYSIS SUMMARY (Health Score: ${healthScore}/100)\n\n`;
  summary += `COMPLETE GTM PLAN:\n${gtmPlan}\n\n`;
  summary += `COMPREHENSIVE BRAND OVERVIEW:\n${comprehensiveBrandOverview}\n\n`;

  if (idealCustomerProfiles.length > 0) {
    summary += `IDEAL CUSTOMER PROFILES:\n`;
    idealCustomerProfiles.slice(0, 3).forEach((icp) => {
      summary += `- ${icp.title}: ${icp.content}\n`;
    });
    summary += `\n`;
  }

  summary += `STRATEGIC OUTREACH APPROACH:\n${strategicOutreachApproach}\n\n`;

  if (marketDifferentiationTriggers.length > 0) {
    summary += `MARKET DIFFERENTIATION TRIGGERS:\n${marketDifferentiationTriggers.join("; ")}\n\n`;
  }

  summary += `GO-TO-MARKET CORE FRAMEWORK:\n${goToMarketCoreFramework}\n\n`;

  if (customerJourneyPipeline.length > 0) {
    summary += `CUSTOMER JOURNEY PIPELINE:\n`;
    customerJourneyPipeline.forEach((stage) => {
      summary += `- ${stage.title}: ${stage.content}\n`;
    });
    summary += `\n`;
  }

  summary += `Prepared by Dealflow.ai`;
  return summary;
}

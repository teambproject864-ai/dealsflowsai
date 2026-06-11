import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { z } from "zod";
import { performDynamicInferenceJSON } from "@/lib/ai-provider-router";
import * as cheerio from "cheerio";

// Zod schemas for tables
const Table1FirmographicEntry = z.object({
  priorityTier: z.string(),
  industryVertical: z.string(),
  companySize: z.string(),
  arrRange: z.string(),
  location: z.string(),
  keyDecisionMakerDemographics: z.string(),
  notes: z.string(),
});

const Table2PainPointEntry = z.object({
  painPoint: z.string(),
  severity: z.string(),
  businessImpact: z.string(),
  rootCause: z.string(),
  dealFlowAISolution: z.string(),
});

const Table3DecisionMakerEntry = z.object({
  role: z.string(),
  influenceScore: z.string(),
  coreDecisionRole: z.string(),
  top3Priorities: z.string(),
  dealFlowAIMessagingFocus: z.string(),
});

const Table4LeadScoringEntry = z.object({
  category: z.string(),
  criterion: z.string(),
  points: z.string(),
});

const Table5ChannelEntry = z.object({
  channel: z.string(),
  icpSegmentsBestFor: z.string(),
  monthlyLeadVolume: z.string(),
  conversionRate: z.string(),
  costPerAcquisition: z.string(),
  ltvToCacRatio: z.string(),
  budgetAllocation: z.string(),
  optimizationRecommendations: z.string(),
});

export const AnalysisState = Annotation.Root({
  companyData: Annotation<any>(),
  websiteContent: Annotation<string>(),
  analysisResult: Annotation<any>(),
  error: Annotation<string>(),
});

async function scrapeWebsiteNode(state: typeof AnalysisState.State) {
  const scrapeStartTime = Date.now();
  try {
    console.log("[analysisGraph] Starting website scraping...");
    const url = state.companyData?.websiteUrl;
    if (!url) {
      console.log("[analysisGraph] No website provided, skipping scrape");
      return { websiteContent: "No website provided." };
    }

    let fullUrl = url.startsWith("http") ? url : `https://${url}`;

    // Try with https first, then http if that fails
    let response: Response | undefined;
    let lastError: Error | undefined;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for scraping

    try {
      response = await fetch(fullUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5"
        },
        signal: controller.signal,
      });
    } catch (error) {
      lastError = error as Error;
      // If https failed and we didn't start with http, try http
      if (fullUrl.startsWith("https://")) {
        fullUrl = fullUrl.replace("https://", "http://");
        console.log(`[analysisGraph] HTTPS failed, trying HTTP: ${fullUrl}`);
        try {
          const httpController = new AbortController();
          const httpTimeoutId = setTimeout(() => httpController.abort(), 15000);
          response = await fetch(fullUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
            signal: httpController.signal,
          });
          clearTimeout(httpTimeoutId);
        } catch (httpError) {
          lastError = httpError as Error;
        }
      }
    }
    clearTimeout(timeoutId);

    if (!response || !response.ok) {
      const status = response?.status || "unknown";
      const statusText = response?.statusText || lastError?.message || "Unknown error";
      const errorMsg = `Failed to scrape website: HTTP ${status} - ${statusText}`;
      console.warn(`[analysisGraph] ${errorMsg}`);
      return { websiteContent: errorMsg };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Only keep relevant content
    $("script, style, noscript, iframe, img, svg, header, footer, nav, aside").remove();

    // Extract text from main content areas
    const selectors = ["main", "article", "section", "div[role='main']", "#content", ".content", "body"];
    let text = "";
    for (const selector of selectors) {
      const el = $(selector).first();
      if (el.length > 0) {
        text = el.text();
        break;
      }
    }
    
    // Fallback to body if no main content found
    if (!text) {
      text = $("body").text();
    }
    
    // Clean up whitespace
    text = text.replace(/\s+/g, " ").trim();

    // Truncate to a reasonable length
    const MAX_CONTENT_LENGTH = 6000;
    const truncatedText = text.length > MAX_CONTENT_LENGTH ? text.substring(0, MAX_CONTENT_LENGTH) + " [content truncated]" : text;

    console.log(`[analysisGraph] Scraping complete. Extracted ${truncatedText.length} characters in ${Date.now() - scrapeStartTime}ms`);
    return { websiteContent: truncatedText };
  } catch (error) {
    console.error("[analysisGraph] Scraping error:", error);
    return {
      websiteContent: `Failed to scrape website: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

async function analyzeCompany(state: typeof AnalysisState.State) {
  const analyzeStartTime = Date.now();
  try {
    console.log("[analysisGraph] Starting AI GTM analysis...");
    const companyName = state.companyData?.companyName || "Unknown Company";
    const websiteUrl = state.companyData?.websiteUrl || "";
    const additionalLeadDetails = state.companyData?.additionalDetails || "";
    const websiteContent = state.websiteContent;

    const systemPrompt = `You are DealFlow AI's senior GTM strategist, an expert in B2B SaaS GTM analysis. You MUST return ONLY valid JSON, NO EXPLANATIONS, NO MARKDOWN, NO TEXT OUTSIDE OF JSON.

You will generate all 11 sections for a complete GTM analysis tailored EXCLUSIVELY to the provided company (${companyName}), using data from their website and any additional customer-provided lead details.`;

    const userPrompt = `
Given this information:
Company Name: ${companyName}
Website URL: ${websiteUrl}
Additional Lead Details: ${additionalLeadDetails}
Website Content (scraped): ${websiteContent}

Generate a complete DealFlow AI GTM analysis with ALL of these fields, formatted strictly as valid JSON:
1. executiveSummary: string (Concise, DealFlow AI-specific, ~150 words)
2. icpDefinition: { 
  inclusionCriteria: string[], 
  exclusionCriteria: string[] 
}
3. table1FirmographicDemographic: array of objects matching Table1FirmographicEntry
4. behavioralPsychographicTraits: { 
  observableBehavioralPatterns: string[], 
  corePsychographicAttributes: string[] 
}
5. table2PainPointAnalysis: array of objects matching Table2PainPointEntry
6. table3DecisionMakerInfluence: array of objects matching Table3DecisionMakerEntry
7. purchasingJourneyMapping: array of { stage: string, duration: string, customerActions: string, customerNeedsQuestions: string, channelPreferences: string, dealFlowAIAssetsEngagement: string }
8. table4LeadScoringFramework: { 
  criteria: array of Table4LeadScoringEntry, 
  qualificationThresholds: { mql: string, sql: string, sal: string } 
}
9. table5ChannelEffectiveness: array of Table5ChannelEntry
10. crossTeamAlignmentGuidelines: { 
  raciFramework: any[], 
  communicationCadenceSlas: any[], 
  sharedSLAs: string[] 
}
11. icpValidationChecklist: { 
  preQualificationChecklist: string[], 
  quarterlyValidationReview: string[], 
  dataSourcesForValidation: string[], 
  icpUpdateTriggers: string[] 
}

Make sure all tables are fully populated with realistic DealFlow AI-specific data tailored to ${companyName}.`;

    const rawResult = await performDynamicInferenceJSON(userPrompt, systemPrompt, { requestType: "gtm-analysis" });
    
    console.log("[analysisGraph] Received AI GTM analysis, validating...");
    
    const validatedResult = z.object({
      executiveSummary: z.string(),
      icpDefinition: z.object({
        inclusionCriteria: z.array(z.string()),
        exclusionCriteria: z.array(z.string()),
      }),
      table1FirmographicDemographic: z.array(Table1FirmographicEntry),
      behavioralPsychographicTraits: z.object({
        observableBehavioralPatterns: z.array(z.string()),
        corePsychographicAttributes: z.array(z.string()),
      }),
      table2PainPointAnalysis: z.array(Table2PainPointEntry),
      table3DecisionMakerInfluence: z.array(Table3DecisionMakerEntry),
      purchasingJourneyMapping: z.array(z.object({
        stage: z.string(),
        duration: z.string(),
        customerActions: z.string(),
        customerNeedsQuestions: z.string(),
        channelPreferences: z.string(),
        dealFlowAIAssetsEngagement: z.string(),
      })),
      table4LeadScoringFramework: z.object({
        criteria: z.array(Table4LeadScoringEntry),
        qualificationThresholds: z.object({
          mql: z.string(),
          sql: z.string(),
          sal: z.string(),
        }),
      }),
      table5ChannelEffectiveness: z.array(Table5ChannelEntry),
      crossTeamAlignmentGuidelines: z.object({
        raciFramework: z.array(z.any()),
        communicationCadenceSlas: z.array(z.any()),
        sharedSLAs: z.array(z.string()),
      }),
      icpValidationChecklist: z.object({
        preQualificationChecklist: z.array(z.string()),
        quarterlyValidationReview: z.array(z.string()),
        dataSourcesForValidation: z.array(z.string()),
        icpUpdateTriggers: z.array(z.string()),
      }),
    }).parse(rawResult);

    console.log(`[analysisGraph] Complete GTM analysis done in ${Date.now() - analyzeStartTime}ms`);
    return { analysisResult: validatedResult };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to generate GTM analysis";
    console.error("[analysisGraph] Node execution error:", error);
    return { error: errorMessage };
  }
}

const builder = new StateGraph(AnalysisState)
  .addNode("scraper", scrapeWebsiteNode)
  .addNode("analyzer", analyzeCompany)
  .addEdge(START, "scraper")
  .addEdge("scraper", "analyzer")
  .addEdge("analyzer", END);

export const analysisGraph = builder.compile();

import { NextResponse } from "next/server";
import { scrapeUrl, compareData } from "@/lib/scraper";

export async function POST(req: Request) {
  try {
    const { url, userData } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const scrapedData = await scrapeUrl(url);
    const comparison = compareData(scrapedData, userData || {});

    return NextResponse.json({
      success: true,
      scrapedData,
      comparison,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("API Error in analyze-url:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to analyze URL" 
    }, { status: 500 });
  }
}

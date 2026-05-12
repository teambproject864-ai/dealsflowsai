import * as cheerio from 'cheerio';

export interface ScrapedData {
  url: string;
  title: string;
  description: string;
  textContent: string;
  images: string[];
  links: string[];
  metadata: Record<string, string>;
}

export async function scrapeUrl(url: string): Promise<ScrapedData> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract basic info
    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content') || 
                        $('meta[property="og:description"]').attr('content') || '';
    
    // Extract text content (cleaned)
    $('script, style, nav, footer, header').remove();
    const textContent = $('body').text().replace(/\s+/g, ' ').trim();

    // Extract images
    const images: string[] = [];
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      if (src) {
        try {
          images.push(new URL(src, url).href);
        } catch (e) {
          images.push(src);
        }
      }
    });

    // Extract links
    const links: string[] = [];
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !href.startsWith('#')) {
        try {
          links.push(new URL(href, url).href);
        } catch (e) {
          links.push(href);
        }
      }
    });

    // Extract all metadata
    const metadata: Record<string, string> = {};
    $('meta').each((_, el) => {
      const name = $(el).attr('name') || $(el).attr('property');
      const content = $(el).attr('content');
      if (name && content) {
        metadata[name] = content;
      }
    });

    return {
      url,
      title,
      description,
      textContent,
      images: Array.from(new Set(images)),
      links: Array.from(new Set(links)),
      metadata
    };
  } catch (error) {
    console.error(`Scraping error for ${url}:`, error);
    throw error;
  }
}

export interface ComparisonResult {
  similarityScore: number;
  matches: string[];
  discrepancies: {
    field: string;
    expected: any;
    found: any;
  }[];
  stats: {
    wordCount: number;
    imageCount: number;
    linkCount: number;
  };
}

export function compareData(scraped: ScrapedData, userData: any): ComparisonResult {
  const discrepancies: any[] = [];
  const matches: string[] = [];
  let score = 0;

  // Simple field comparison
  const fieldsToCompare = ['title', 'description'];
  fieldsToCompare.forEach(field => {
    if (userData[field]) {
      if (scraped[field as keyof ScrapedData] === userData[field]) {
        matches.push(field);
        score += 20;
      } else {
        discrepancies.push({
          field,
          expected: userData[field],
          found: scraped[field as keyof ScrapedData]
        });
      }
    }
  });

  // Text content similarity (Jaccard or similar - here simplified)
  if (userData.textContent && scraped.textContent) {
    const userText = String(userData.textContent).toLowerCase();
    const scrapedText = scraped.textContent.toLowerCase();
    
    const userWords = new Set(userText.split(/\W+/));
    const scrapedWords = new Set(scrapedText.split(/\W+/));
    
    const intersection = new Set([...userWords].filter(x => scrapedWords.has(x)));
    const union = new Set([...userWords, ...scrapedWords]);
    
    const textSimilarity = (intersection.size / union.size) * 100;
    score += textSimilarity * 0.6; // 60% weight to text similarity
  }

  return {
    similarityScore: Math.min(100, Math.round(score)),
    matches,
    discrepancies,
    stats: {
      wordCount: scraped.textContent.split(/\s+/).length,
      imageCount: scraped.images.length,
      linkCount: scraped.links.length
    }
  };
}

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { logger } from "@/lib/logger";
import { sanitizeUserInput } from "@/lib/security";

// Fallback demo data for graceful degradation
function getDemoEnrichment(url: string): any {
  const domain = url.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
  
  return {
    summary: `${domain} is a technology platform focused on innovation and growth. The company provides solutions for modern digital challenges.`,
    whatTheyDo: [
      "Develops cutting-edge technology solutions",
      "Serves a global customer base",
      "Focuses on scalability and performance",
      "Provides developer-friendly tools and APIs"
    ],
    keywords: ["Technology", "Innovation", "Platform", "Digital", "Solutions", "Growth", "Development", "API"],
    signals: ["Active website", "Professional design", "Content available", "Established presence"]
  };
}

function cleanHTML(html: string): string {
  // Remove script, style, and noscript tags
  let cleaned = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, '');
  cleaned = cleaned.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
  
  // Try to extract main content area
  const mainMatch = cleaned.match(/<main[\s\S]*?<\/main>/i);
  if (mainMatch) {
    cleaned = mainMatch[0];
  } else {
    const bodyMatch = cleaned.match(/<body[\s\S]*?<\/body>/i);
    if (bodyMatch) {
      cleaned = bodyMatch[0];
    }
  }
  
  // Remove HTML tags to get visible text
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');
  
  // Clean up whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
}

function extractJSON(text: string): any {
  // Remove markdown code blocks
  text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  
  // Try to find JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  throw new Error("No valid JSON found");
}

function validateEnrichment(data: any): any {
  return {
    summary: data.summary || "No summary available",
    whatTheyDo: Array.isArray(data.whatTheyDo) ? data.whatTheyDo : ["Information not available"],
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    signals: Array.isArray(data.signals) ? data.signals : []
  };
}

export async function POST(req: Request) {
  const startTime = Date.now();
  let retryAttempts = 0;
  
  try {
    const { url } = await req.json();
    
    // Sanitize and validate URL
    const sanitizedUrl = sanitizeUserInput(url);
    if (!sanitizedUrl || !sanitizedUrl.startsWith('http')) {
      logger.warn('Invalid URL provided', { url: sanitizedUrl });
      throw new Error('Invalid URL format');
    }
    
    logger.info('Enrichment started', { url: sanitizedUrl });

    // Check if API key is configured or has quota
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("your")) {
      logger.warn('OpenAI API key not configured, using demo mode', { url: sanitizedUrl });
      return NextResponse.json({
        data: getDemoEnrichment(sanitizedUrl),
        source: sanitizedUrl,
        timestamp: new Date().toISOString(),
        demo: true
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Fetch website with timeout and retry
    let response;
    let retryCount = 0;
    const maxRetries = 1;
    
    while (retryCount <= maxRetries) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        
        response = await fetch(sanitizedUrl, { 
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        clearTimeout(timeout);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Website not found (404). Unable to access content.");
          }
          if (response.status === 403) {
            throw new Error("Access denied. Website may block automated requests.");
          }
          throw new Error(`Failed to fetch website: ${response.status}`);
        }
        
        break; // Success, exit retry loop
      } catch (error: any) {
        retryCount++;
        retryAttempts = retryCount;
        if (retryCount > maxRetries) {
          logger.error('Fetch failed after retries', { url: sanitizedUrl, retries: retryCount, error: error.message });
          throw error;
        }
        logger.warn('Fetch retry', { url: sanitizedUrl, attempt: retryCount });
        // Wait 1 second before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const html = await response!.text();
    
    // Edge case: Check for extremely large responses
    const htmlSizeInMB = new Blob([html]).size / (1024 * 1024);
    if (htmlSizeInMB > 5) {
      logger.warn('Large HTML response detected', { url: sanitizedUrl, sizeMB: htmlSizeInMB.toFixed(2) });
    }
    
    // Clean HTML before sending to model
    const cleanedText = cleanHTML(html);
    
    if (cleanedText.length < 100) {
      logger.warn('Insufficient content extracted', { url: sanitizedUrl, length: cleanedText.length });
      throw new Error("Limited extractable content detected. Website may be JavaScript-heavy or empty.");
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1, // Low temperature for consistency
      messages: [
        {
          role: "system",
          content: "You are a startup intelligence analyst. Extract structured data and return ONLY valid JSON, no markdown, no extra text. Follow the exact schema provided.",
        },
        {
          role: "user",
          content: `Extract from this startup website:

1. Summary (2 sentences)
2. What they do (3-6 bullet points)
3. Keywords (5-10 relevant keywords)
4. Signals (2-5 signals like "Careers page exists", "Blog exists", "Actively hiring")

Return ONLY this JSON structure:
{
  "summary": "...",
  "whatTheyDo": ["..."],
  "keywords": ["..."],
  "signals": ["..."]
}

Website content:
${cleanedText.slice(0, 12000)}`,
        },
      ],
    });

    const result = completion.choices[0].message.content;
    if (!result) {
      logger.error('Empty AI response', { url: sanitizedUrl });
      throw new Error("Empty response from AI");
    }
    
    // Edge case: Check for extremely large AI responses
    const responseSizeInKB = new Blob([result]).size / 1024;
    if (responseSizeInKB > 100) {
      logger.warn('Large AI response', { url: sanitizedUrl, sizeKB: responseSizeInKB.toFixed(2) });
    }

    // Bulletproof JSON parsing
    let parsed;
    try {
      parsed = extractJSON(result);
    } catch (parseError) {
      logger.error('JSON parse error', { url: sanitizedUrl, error: parseError });
      throw new Error("Failed to parse AI response");
    }

    // Validate and sanitize
    const validated = validateEnrichment(parsed);
    
    const duration = Date.now() - startTime;
    logger.info('Enrichment completed', { 
      url: sanitizedUrl, 
      durationMs: duration,
      retries: retryAttempts,
      tokensUsed: completion.usage?.total_tokens || 0
    });

    return NextResponse.json({
      data: validated,
      source: sanitizedUrl,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error('Enrichment failed', { 
      error: error.message,
      durationMs: duration,
      retries: retryAttempts
    });
    
    // If quota exceeded or API error, return demo data
    if (error.message?.includes('quota') || error.message?.includes('429') || error.message?.includes('billing')) {
      const { url } = await req.json();
      const sanitizedUrl = sanitizeUserInput(url);
      logger.warn('API quota exceeded, using demo mode', { url: sanitizedUrl });
      return NextResponse.json({
        data: getDemoEnrichment(sanitizedUrl),
        source: sanitizedUrl,
        timestamp: new Date().toISOString(),
        demo: true
      });
    }
    
    // Return graceful fallback
    return NextResponse.json(
      { 
        error: error.message || "Enrichment failed. Please try again.",
        fallback: true
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const html = await response.text();
    const cleaned = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 15000);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(`Analyze this startup website and extract key information.

Website content:
${cleaned}

Provide a JSON response with:
1. summary: A 2-sentence overview of what the company does
2. whatTheyDo: Array of 4-6 specific bullet points about their products/services
3. keywords: Array of 8-10 relevant industry keywords (e.g., "AI", "SaaS", "B2B", "Climate", "Fintech")
4. signals: Array of 3-5 traction signals found (e.g., "Hiring engineers", "Series A funded", "500+ customers", "YC backed")

Return ONLY valid JSON in this exact format:
{
  "summary": "string",
  "whatTheyDo": ["string"],
  "keywords": ["string"],
  "signals": ["string"]
}`);

    const text = result.response.text();
    
    const jsonMatch = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim().match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }
    
    const data = JSON.parse(jsonMatch[0]);
    
    // Ensure all fields exist
    const enrichedData = {
      summary: data.summary || "No summary available",
      whatTheyDo: Array.isArray(data.whatTheyDo) && data.whatTheyDo.length > 0 ? data.whatTheyDo : ["Information not available"],
      keywords: Array.isArray(data.keywords) && data.keywords.length > 0 ? data.keywords : ["Startup", "Technology"],
      signals: Array.isArray(data.signals) && data.signals.length > 0 ? data.signals : ["Active website"]
    };

    return NextResponse.json({ 
      data: enrichedData,
      timestamp: new Date().toISOString(),
      source: url
    });
  } catch (error: any) {
    console.error("Enrichment error:", error);
    return NextResponse.json(
      { error: "Enrichment failed", details: error.message },
      { status: 500 }
    );
  }
}

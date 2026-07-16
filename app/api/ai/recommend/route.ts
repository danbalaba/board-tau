import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import redis, { cache } from "@/lib/redis";
import { strictLimiter } from "@/lib/rate-limit";
import { captureAIGeneration } from "@/lib/posthog-ai";
import { getCurrentUser } from "@/services/user";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await strictLimiter.limit(`ai_recommend_ratelimit_${ip}`);
    
    if (!success) {
      return NextResponse.json(
        { message: "Showing alternatives." },
        { status: 429 }
      );
    }
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { message: "We found some alternatives that might interest you." },
        { status: 500 }
      );
    }

    const { searchParams, results } = await req.json();

    if (!searchParams || !results || results.length === 0) {
      return NextResponse.json({ message: "No recommendations available." }, { status: 400 });
    }

    // Check Cache
    const resultIds = results.map((l: any) => l.id).sort().join("_");
    const searchParamsString = JSON.stringify(searchParams);
    const cacheKey = cache.generateKey("ai:recommend", { ids: resultIds, p: searchParamsString });
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const userQuery = [
      searchParams.roomType, 
      searchParams.category,
      searchParams.amenities ? 'specific amenities' : '',
      searchParams.maxPrice ? `budget up to ₱${searchParams.maxPrice}` : ""
    ].filter(Boolean).join(", ") || "a specific property";

    const systemPrompt = `
      You are a helpful and empathetic property advisor for BoardTAU, a boarding house search platform for Filipino students. 
      A student searched for: "${userQuery}".
      Unfortunately, we couldn't find an exact match for their strict filters, so we are showing them the closest relaxed alternatives.
      
      Your goal is to provide ONE short, empathetic sentence (max 15 words) in English explaining why we are showing these alternatives and highlighting why they are still a great choice for a student.
      Example: "We couldn't find a Solo room under ₱2,000, but here are excellent bedspaces that fit your budget."
      Example: "No exact matches near your university, but these highly-rated properties are just a short commute away."
      
      CRITICAL INSTRUCTIONS:
      1. Return raw JSON: { "message": "Your sentence here" }
      2. No markdown codeblocks (\`\`\`json).
      3. STRICTLY NO EMOJIS. Be warm and helpful.
    `;

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: { responseMimeType: "application/json" }
    });

    const t0 = Date.now();
    const aiResult = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }]
    });
    const latency = (Date.now() - t0) / 1000;

    const response = await aiResult.response;
    const text = response.text();

    // Capture LLM generation analytics
    const user = await getCurrentUser();
    const distinctId = user?.id ?? `anon:${ip}`;
    await captureAIGeneration({
      distinctId,
      model: "gemini-3-flash-preview",
      spanName: "ai_recommend",
      input: [{ role: "user", content: userQuery }],
      output: text,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      latencySeconds: latency,
    });

    try {
      const parsed = JSON.parse(text);
      if (parsed && parsed.message) {
        await cache.set(cacheKey, parsed, 86400); // cache for 24h
      }
      return NextResponse.json(parsed);
    } catch(e) {
      return NextResponse.json({ message: "We found some great alternatives for you." });
    }

  } catch (error) {
    console.error("AI Recommend Error:", error);
    return NextResponse.json({ message: "We found some great alternatives for you." }, { status: 500 });
  }
}

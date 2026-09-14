import { NextResponse } from "next/server";
import { z } from "zod";
import redis, { cache } from "@/lib/redis";
import { strictLimiter } from "@/lib/rate-limit";
import { generateAIResponse } from "@/lib/ai/ai-provider";
import { sanitizeAIOutput } from "@/lib/security/sanitize";

const aiRecommendSchema = z.object({
  message: z.string(),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await strictLimiter.limit(`ai_recommend_ratelimit_${ip}`);
    
    if (!success) {
      return NextResponse.json(
        { message: "We found some great alternatives for you." },
        { status: 429 }
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

    const categoryText = searchParams.propertyType || searchParams.categories || searchParams.category;
    const userQuery = [
      searchParams.roomType ? `${searchParams.roomType} room` : "", 
      categoryText ? `${categoryText}` : "",
      searchParams.college ? `near ${searchParams.college}` : "",
      searchParams.amenities || searchParams.roomAmenities || searchParams.rules ? 'specific preferences' : '',
      searchParams.maxPrice ? `budget up to ₱${searchParams.maxPrice}` : ""
    ].filter(Boolean).join(", ") || "a specific property";

    const systemPrompt = `
      You are a helpful and empathetic property advisor for BoardTAU, a boarding house search platform for Filipino students. 
      A student searched for: "${userQuery}".
      Unfortunately, we couldn't find an exact match for their strict filters, so we are showing them the closest relaxed alternatives.
      
      Your goal is to provide ONE short, empathetic sentence (max 15 words) in English explaining why we are showing these alternatives and highlighting why they are still a great choice for a student.
      Example: "We couldn't find a Solo room under ₱2,000, but here are excellent bedspaces that fit your budget."
      Example: "No exact matches near CBM, but these highly-rated properties are just a short walk away."
      
      CRITICAL INSTRUCTIONS:
      1. Return raw JSON: { "message": "Your sentence here" }
      2. No markdown codeblocks (\`\`\`json).
      3. STRICTLY NO EMOJIS. Be warm and helpful.
    `;

    const aiResult = await generateAIResponse({
      prompt: systemPrompt,
      schema: aiRecommendSchema,
      spanName: "ai_recommend",
    });

    if (aiResult.data && aiResult.data.message) {
      aiResult.data.message = sanitizeAIOutput(aiResult.data.message);
      await cache.set(cacheKey, aiResult.data, 604800); // 7 Days TTL
      return NextResponse.json(aiResult.data);
    }

    return NextResponse.json({ message: "We found some great alternatives for you." });

  } catch (error) {
    console.error("AI Recommend Error:", error);
    return NextResponse.json({ message: "We found some great alternatives for you." }, { status: 500 });
  }
}

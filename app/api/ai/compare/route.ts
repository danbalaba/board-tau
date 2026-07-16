import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import redis, { cache } from "@/lib/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { captureAIGeneration } from "@/lib/posthog-ai";
import { getCurrentUser } from "@/services/user";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await ratelimit.limit(`ai_compare_ratelimit_${ip}`);
    
    if (!success) {
      return NextResponse.json(
        { reply: "You are doing this too fast. Please wait a moment.", suggestedPrompts: [] },
        { status: 429 }
      );
    }
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { reply: "System Error: Gemini API Key is missing. Please check your .env file." },
        { status: 500 }
      );
    }

    const { listings, userMessage } = await req.json();

    if (!listings || !userMessage) {
      return NextResponse.json({ reply: "Missing listings or message." }, { status: 400 });
    }

    // Check Cache
    const listingIds = listings.map((l: any) => l.id).sort().join("_");
    const cacheKey = cache.generateKey("ai:compare", { ids: listingIds, q: userMessage.toLowerCase().trim() });
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Format the listings data beautifully so Gemini understands it perfectly
    const formattedListings = listings.map((l: any) => {
      const id = l.id;
      const title = l.title;
      const price = l.price;
      const region = l.region;
      
      const features = l.features || {};
      const rules = l.rules || {};
      const category = l.categories?.[0]?.category?.name || "Listing";

      const availableRoomsCount = l.rooms ? l.rooms.filter((r:any) => r.status === "AVAILABLE").length : 0;
      
      // Basic rules summary
      let rulesText = "Standard rules apply.";
      if (rules) {
        let rs = [];
        if (rules.femaleOnly) rs.push("Strictly Female Only");
        if (rules.maleOnly) rs.push("Strictly Male Only");
        if (rules.noCurfew) rs.push("No Curfew");
        if (rules.visitorsAllowed) rs.push("Visitors Allowed");
        if (rules.petsAllowed) rs.push("Pets Allowed");
        if (rs.length > 0) rulesText = rs.join(", ");
      }

      let safetyText = "Standard safety.";
      if (features) {
        let sf = [];
        if (features.cctv) sf.push("CCTV");
        if (features.security24h) sf.push("24h Security");
        if (features.fireSafety) sf.push("Fire Safety Ready");
        if (sf.length > 0) safetyText = sf.join(", ");
      }

      return `
      ID: ${id}
      Listing Title: ${title}
      Category: ${category}
      Price: ₱${price}/mo
      Location: ${region}
      Available Rooms: ${availableRoomsCount}
      Safety & Reassurance: ${safetyText}
      Policies & Rules: ${rulesText}
      Description: ${l.description || "N/A"}
      `;
    }).join("\n\n--------------------------\n\n");

    const systemPrompt = `
      You are a professional, helpful, and friendly property advisor for BoardTAU (a boarding house system). 
      The user is comparing the following properties:
      
      ${formattedListings}
      
      Your goal is to answer their questions based ONLY on the property data provided above. 
      Keep your answer concise, easy to read, and formatted with markdown if necessary (bullet points are great).
      
      CRITICAL INSTRUCTIONS:
      1. You MUST return your response as a raw JSON object (without markdown blocks like \`\`\`json) with the following structure:
         {
           "reply": "Your markdown formatted reply here",
           "suggestedPrompts": ["Follow up question 1?", "Follow up question 2?"]
         }
      2. If you are making a strong recommendation for a specific property, OR if the user expresses they want to proceed with a property, you MUST include a booking action button in your \`reply\` using this exact markdown link syntax: [BOOK: {Listing Title}](/listings/{ID})
      3. Do not include markdown codeblocks (\`\`\`json) in your final output, just raw valid JSON.
      4. STRICTLY NO EMOJIS. Do not use any emojis in your \`reply\` or your \`suggestedPrompts\`. Keep it 100% professional.
    `;

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: { responseMimeType: "application/json" }
    });

    const t0 = Date.now();
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nUser Question: ${userMessage}` }] }]
    });
    const latency = (Date.now() - t0) / 1000;

    const response = await result.response;
    const text = response.text();

    // Capture LLM generation analytics
    const user = await getCurrentUser();
    const distinctId = user?.id ?? `anon:${ip}`;
    await captureAIGeneration({
      distinctId,
      model: "gemini-3-flash-preview",
      spanName: "ai_compare",
      input: [{ role: "user", content: userMessage }],
      output: text,
      inputTokens: response.usageMetadata?.promptTokenCount,
      outputTokens: response.usageMetadata?.candidatesTokenCount,
      latencySeconds: latency,
    });

    try {
      const parsed = JSON.parse(text);

      // Save successful response to cache for 24 hours
      if (parsed && parsed.reply) {
        await cache.set(cacheKey, parsed, 86400);
      }

      return NextResponse.json(parsed);
    } catch(e) {
      // Fallback if AI fails to return strict JSON
      return NextResponse.json({ reply: text, suggestedPrompts: [] });
    }

  } catch (error) {
    console.error("AI Compare Error:", error);
    return NextResponse.json({ reply: "Sorry, I ran into an issue while analyzing the properties. Please try again later." }, { status: 500 });
  }
}

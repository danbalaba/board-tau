import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import redis, { cache } from "@/lib/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { captureAIGeneration } from "@/lib/posthog-ai";
import { getCurrentUser } from "@/services/user";
import { z } from "zod";
import { sanitizeSearchQuery, detectPromptInjection, sanitizeAIOutput } from "@/lib/security/sanitize";

const aiCompareSchema = z.object({
  reply: z.string(),
  suggestedPrompts: z.array(z.string()).optional().default([])
});

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

    let { listings, userMessage } = await req.json();

    if (!listings || !userMessage) {
      return NextResponse.json({ reply: "Missing listings or message." }, { status: 400 });
    }

    // OWASP: Sanitize the user message & check prompt injection
    userMessage = sanitizeSearchQuery(userMessage, 300);

    const injectionCheck = detectPromptInjection(userMessage);
    if (injectionCheck.isInjection) {
      return NextResponse.json({
        reply: "System security policies strictly prohibit system override or secret extraction prompts.",
        suggestedPrompts: []
      });
    }

    // Check Cache
    const listingIds = listings.map((l: any) => l.id).sort().join("_");
    const cacheKey = cache.generateKey("ai:compare", { ids: listingIds, q: userMessage.toLowerCase().trim() });
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Format the listings data dynamically supporting Super Admin Taxonomy & Relational Models
    const formattedListings = listings.map((l: any) => {
      const id = l.id;
      const title = l.title;
      const price = l.price;
      const region = l.region || "Camiling, Tarlac";
      const propertyType = l.propertyType?.name || (Array.isArray(l.category) ? l.category.join(", ") : l.category) || "Property";
      
      // Dynamic Attributes (Relational DynamicAttribute & ListingAttributeLink)
      const attributes = l.listingLinks?.map((link: any) => link.attribute) || [];
      const amenities = attributes.filter((a: any) => a.type === "AMENITY").map((a: any) => a.name);
      const rules = attributes.filter((a: any) => a.type === "RULE").map((a: any) => a.name);
      const features = attributes.filter((a: any) => a.type === "FEATURE").map((a: any) => a.name);

      // Legacy/Direct array fallbacks
      const allAmenities = [...new Set([...amenities, ...(l.amenities_list || [])])].join(", ") || "Standard amenities";
      
      // Rules summary
      let rulesText = rules.length > 0 ? rules.join(", ") : "Standard rules apply.";
      if (l.rules) {
        let rs = [...rules];
        if (l.rules.femaleOnly) rs.push("Strictly Female Only");
        if (l.rules.maleOnly) rs.push("Strictly Male Only");
        if (l.rules.noCurfew) rs.push("No Curfew");
        if (l.rules.visitorsAllowed) rs.push("Visitors Allowed");
        if (l.rules.petsAllowed) rs.push("Pets Allowed");
        if (l.rules.customRules?.length) rs.push(...l.rules.customRules);
        rulesText = [...new Set(rs)].join(", ");
      }

      // Features summary
      let safetyText = features.length > 0 ? features.join(", ") : "Standard safety.";
      if (l.features) {
        let sf = [...features];
        if (l.features.cctv) sf.push("CCTV");
        if (l.features.security24h) sf.push("24h Security");
        if (l.features.fireSafety) sf.push("Fire Safety Ready");
        if (l.features.customFeatures?.length) sf.push(...l.features.customFeatures);
        safetyText = [...new Set(sf)].join(", ");
      }

      // Dynamic Room Breakdown (RoomTypeDefinition & Flat-Rate vs Per-Head)
      const roomSummaries = (l.rooms || []).map((r: any) => {
        const typeName = r.roomTypeDefinition?.name || r.name || "Room";
        const pricingModel = r.roomTypeDefinition?.isFlatRate ? "Flat Rate (Entire Unit)" : "Per-Head Bedspace";
        return `- ${typeName} (${pricingModel}): ₱${r.price}/mo | Capacity: ${r.capacity} pax | Available Slots: ${r.availableSlots}`;
      }).join("\n      ");

      return `
      ID: ${id}
      Listing Title: ${title}
      Property Type: ${propertyType}
      Base Price: ₱${price}/mo
      Location: ${region}
      
      Room Options & Pricing Structure:
      ${roomSummaries || "Standard Room Options"}
      
      Shared & Property Amenities: ${allAmenities}
      Safety & Reassurance: ${safetyText}
      Policies & House Rules: ${rulesText}
      Description: ${l.description || "N/A"}
      `;
    }).join("\n\n--------------------------\n\n");

    const systemPrompt = `
      You are a professional, helpful, and friendly property advisor for BoardTAU (a boarding house system for TAU students). 
      The user is comparing the following properties:
      
      ${formattedListings}
      
      Your goal is to answer their questions based ONLY on the property data provided above. 
      Keep your answer concise, easy to read, and formatted with markdown if necessary (bullet points are great).
      
      CRITICAL INSTRUCTIONS:
      1. You MUST return your response as a raw JSON object with the following structure:
         {
           "reply": "Your markdown formatted reply here",
           "suggestedPrompts": ["Follow up question 1?", "Follow up question 2?"]
         }
      2. If you are making a strong recommendation for a specific property, OR if the user expresses they want to proceed with a property, you MUST include a booking action button in your \`reply\` using this exact markdown link syntax: [BOOK: {Listing Title}](/listings/{ID})
      3. Do not include markdown codeblocks (\`\`\`json) in your final output, just raw valid JSON.
      4. STRICTLY NO EMOJIS. Do not use any emojis in your \`reply\` or your \`suggestedPrompts\`. Keep it 100% professional.
    `;

    const { generateAIResponse } = await import("@/lib/ai/ai-provider");
    const aiResult = await generateAIResponse({
      prompt: `User Question: ${userMessage}`,
      systemInstruction: systemPrompt,
      schema: aiCompareSchema,
      spanName: "ai_compare"
    });

    if (aiResult.data) {
      aiResult.data.reply = sanitizeAIOutput(aiResult.data.reply);
      // Save successful response to cache for 7 Days
      await cache.set(cacheKey, aiResult.data, 604800);
      return NextResponse.json(aiResult.data);
    }

    return NextResponse.json({ reply: sanitizeAIOutput(aiResult.rawText) || "Sorry, I ran into an issue while analyzing the properties.", suggestedPrompts: [] });

  } catch (error) {
    console.error("AI Compare Error:", error);
    return NextResponse.json({ reply: "Sorry, I ran into an issue while analyzing the properties. Please try again later." }, { status: 500 });
  }
}

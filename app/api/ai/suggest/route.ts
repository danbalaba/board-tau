import { NextRequest, NextResponse } from "next/server";
import redis, { cache } from "@/lib/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { generateAIResponse } from "@/lib/ai/ai-provider";
import { sanitizeAIOutput } from "@/lib/security/sanitize";
import { z } from "zod";

const aiSuggestSchema = z.array(
  z.object({
    id: z.string(),
    reason: z.string(),
  })
);

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await ratelimit.limit(`ai_suggest_ratelimit_${ip}`);
    
    if (!success) {
      return NextResponse.json({ suggestions: [] }, { status: 429 });
    }
    
    const { listings, searchParams } = await req.json();

    if (!listings || listings.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    const listingIds = listings.map((l: any) => l.id).sort().join("_");
    const cacheKey = cache.generateKey("ai:suggest", { ids: listingIds, params: searchParams });
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Build a compact listing summary supporting Super Admin taxonomy
    const listingSummaries = listings.slice(0, 6).map((l: any, i: number) => {
      const propType = l.propertyType?.name || (Array.isArray(l.category) ? l.category.join(", ") : l.category) || "Property";
      const roomTypes = l.rooms?.map((r: any) => {
        const name = r.roomTypeDefinition?.name || r.name || "Room";
        const rateType = r.roomTypeDefinition?.isFlatRate ? "Flat Rate" : "Per Head";
        return `${name} (${rateType})`;
      }).join(", ") || "Standard Rooms";

      const attributes = l.listingLinks?.map((link: any) => link.attribute?.name).filter(Boolean) || [];
      const amenitiesText = [...new Set([...attributes, ...(l.amenities_list || [])])].slice(0, 5).join(", ") || "N/A";

      return {
        index: i + 1,
        id: l.id,
        title: l.title,
        price: l.price,
        propertyType: propType,
        region: l.region || "Camiling, Tarlac",
        amenities: amenitiesText,
        roomTypes: roomTypes,
      };
    });

    const userWants: string[] = [];
    if (searchParams.roomType) userWants.push(`${searchParams.roomType} room`);
    if (searchParams.propertyType || searchParams.categories) userWants.push(`${searchParams.propertyType || searchParams.categories}`);
    if (searchParams.college) userWants.push(`near ${searchParams.college}`);
    if (searchParams.amenities) userWants.push(searchParams.amenities);
    if (searchParams.maxPrice) userWants.push(`budget up to ₱${searchParams.maxPrice}/month`);
    const userQuery = userWants.length > 0 ? userWants.join(", ") : "a comfortable boarding house";

    const systemPrompt = `
You are a helpful assistant for BoardTAU, a boarding house search platform for Filipino students.

A student searched for: "${userQuery}".
No exact matches were found, so we are showing them the closest alternatives.

Here are ${listingSummaries.length} alternatives:
${listingSummaries.map((l: any) => `${l.index}. ID: "${l.id}" | "${l.title}" | Type: ${l.propertyType} | ₱${l.price}/mo | ${l.region} | Amenities: ${l.amenities} | Rooms: ${l.roomTypes}`).join("\n")}

For each listing, write ONE very short sentence (max 10 words) in English that explains why it's a good alternative for this student's needs. Be warm, helpful, and specific to the student's search.

Return ONLY a valid JSON array with no extra text:
[{ "id": "listing_id_here", "reason": "Your short reason here." }]
`;

    const aiResult = await generateAIResponse({
      prompt: systemPrompt,
      schema: aiSuggestSchema,
      spanName: "ai_suggest",
    });

    const suggestions = (aiResult.data || []).map((s: any) => ({
      id: s.id,
      reason: sanitizeAIOutput(s.reason),
    }));

    if (suggestions && suggestions.length > 0) {
      await cache.set(cacheKey, { suggestions }, 604800); // 7 Days TTL
    }

    return NextResponse.json({ suggestions });

  } catch (err: any) {
    console.error("AI Suggest API Error:", err.message);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/lib/db";
import redis, { cache } from "@/lib/redis";
import { Ratelimit } from "@upstash/ratelimit";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ listingId: string }> }
) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await ratelimit.limit(`recommendations_ratelimit_${ip}`);
    
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { listingId } = await params;
    const cacheKey = `recommendations:${listingId}`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      return NextResponse.json({ data: cachedData, source: "cache" });
    }

    // 1. Fetch the source listing to know its attributes
    const sourceListing = await db.listing.findUnique({
      where: { id: listingId },
      include: {
        rooms: {
          where: { status: "AVAILABLE" }
        }
      }
    });

    if (!sourceListing) {
      return NextResponse.json({ data: [] });
    }

    const categories = Array.isArray(sourceListing.category)
      ? sourceListing.category
      : (typeof sourceListing.category === 'string' ? [sourceListing.category] : []);

    const price = sourceListing.price || (sourceListing.rooms.length > 0 ? sourceListing.rooms[0].price : 0);

    // 2. Build scoring pipeline to find similar listings
    const pipeline: any[] = [
      {
        $match: {
          _id: { $ne: { $oid: listingId } },
          status: "active",
        }
      },
      {
        $addFields: {
          categoryMatchScore: {
            $cond: [
              { $gt: [{ $size: { $setIntersection: ["$category", categories] } }, 0] },
              15,
              0
            ]
          },
          priceMatchScore: {
            $cond: [
              {
                $and: [
                  { $gte: ["$price", price * 0.7] },
                  { $lte: ["$price", price * 1.3] }
                ]
              },
              10,
              0
            ]
          },
          ratingScore: {
            $multiply: [{ $ifNull: ["$rating", 4.0] }, 2]
          }
        }
      },
      {
        $addFields: {
          finalScore: {
            $add: ["$categoryMatchScore", "$priceMatchScore", "$ratingScore"]
          }
        }
      },
      { $sort: { finalScore: -1 } },
      { $limit: 4 },
      {
        $lookup: {
          from: "Room",
          localField: "_id",
          foreignField: "listingId",
          as: "rooms_list"
        }
      }
    ];

    const rawResults = await db.listing.aggregateRaw({ pipeline });

    const unwrapMongoNumber = (val: any): number | null => {
      if (val == null) return null;
      if (typeof val === 'number') return val;
      if (typeof val === 'object') {
        if ('$numberDouble' in val) return parseFloat(val['$numberDouble']);
        if ('$numberInt' in val) return parseInt(val['$numberInt']);
        if ('$numberLong' in val) return parseInt(val['$numberLong']);
        if ('$numberDecimal' in val) return parseFloat(val['$numberDecimal']);
      }
      return null;
    };

    let data = (rawResults as unknown as any[]).map((doc: any) => ({
      ...doc,
      id: doc._id['$oid'] || doc._id.toString(),
      _id: undefined,
      rooms: doc.rooms_list || [],
      categories: (doc.category || []).map((c: string) => ({ name: c, label: c })),
      rating: unwrapMongoNumber(doc.rating),
      reviewCount: unwrapMongoNumber(doc.reviewCount) ?? 0,
      price: unwrapMongoNumber(doc.price) ?? doc.price,
      aiHighlight: null as string | null,
    }));

    if (data.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // 3. AI Enrichment
    let highlightMap = new Map();
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-3-flash-preview",
        systemInstruction: `You are an AI assistant for a boarding house platform.
Your job is to read a source listing that the user is currently viewing, and a list of alternative recommendations.
For each recommendation, provide ONE short sentence (max 8 words) explaining why it is a good alternative. 
You MUST return raw JSON as an array of objects: [{ "id": "listing_id", "reason": "Your 8-word reason here" }]`,
        generationConfig: { responseMimeType: "application/json" }
      });

      const sourceInfo = `Source Listing: "${sourceListing.title}" (Category: ${categories.join(", ")}, Price: ₱${price})`;
      const recommendationsInfo = data.map((l: any, i: number) =>
        `Recommendation ${i + 1} - ID:"${l.id}" | "${l.title}" | ₱${l.price}/mo | Categories: ${(l.category || []).join(", ")}`
      ).join("\n");

      const prompt = `${sourceInfo}\n\nRecommendations:\n${recommendationsInfo}\n\nGenerate the JSON output.`;

      const aiResponse = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error("AI_TIMEOUT")), 5000))
      ]) as any;

      const text = aiResponse.response.text().trim();
      const suggestions = JSON.parse(text);
      highlightMap = new Map(suggestions.map((s: any) => [s.id, s.reason]));
    } catch (aiErr: any) {
      console.error("AI_RECOMMENDATION_FAILED:", aiErr.message);
    }

    const enrichedData = data.map((item: any) => ({
      ...item,
      aiHighlight: highlightMap.get(item.id) || "A great alternative choice.",
    }));

    await cache.set(cacheKey, enrichedData, 86400);

    return NextResponse.json({ data: enrichedData, source: "ai_generated" });

  } catch (error) {
    console.error("[RECOMMENDATIONS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

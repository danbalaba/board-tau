import { db as prisma } from "@/lib/db";
import { cache } from "@/lib/redis";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * THE JOIN PIPELINE
 */
const JOIN_STAGES = [
  {
    $lookup: {
      from: "Room",
      localField: "_id",
      foreignField: "listingId",
      as: "rooms_list",
      pipeline: [
        {
          $match: { isArchived: false }
        }
      ]
    }
  },
  {
    $lookup: {
      from: "ListingRule",
      localField: "_id",
      foreignField: "listingId",
      as: "_rules"
    }
  },
  {
    $addFields: {
      rules_doc: { $arrayElemAt: ["$_rules", 0] }
    }
  },
  {
    $lookup: {
      from: "ListingFeature",
      localField: "_id",
      foreignField: "listingId",
      as: "_features"
    }
  },
  {
    $addFields: {
      features_doc: { $arrayElemAt: ["$_features", 0] }
    }
  }
];

function buildHardFilters(params: any, isRelaxed: boolean = false) {
  const match: any = {};
  match.status = "active";

  if (params.amenities && !isRelaxed) {
    const amenitiesArr = Array.isArray(params.amenities) ? params.amenities : [params.amenities];
    match.amenities_list = { $all: amenitiesArr };
  }

  if (params.minPrice || params.maxPrice) {
    const p: any = {};
    if (params.minPrice) p.$gte = Number(params.minPrice);
    if (params.maxPrice) p.$lte = Number(params.maxPrice);
    match.$or = [{ price: p }, { "rooms_list.price": p }];
  }

  if (params.roomType || params.roomAmenities || params.bedType) {
    const roomMatch: any = { status: "AVAILABLE" };
    if (params.roomType) roomMatch.roomType = params.roomType;
    if (params.bedType) roomMatch.bedType = params.bedType;
    if (params.bathroomArrangement) roomMatch.bathroomArrangement = params.bathroomArrangement;

    if (params.roomAmenities && !isRelaxed) {
      const roomAmArr = Array.isArray(params.roomAmenities) ? params.roomAmenities : [params.roomAmenities];
      roomMatch.amenityNames = { $all: roomAmArr };
    }

    match.rooms_list = {
      $elemMatch: {
        ...roomMatch,
        ...(params.capacity && { capacity: { $gte: Number(params.capacity) } }),
        ...(params.availableSlots && { availableSlots: { $gte: Number(params.availableSlots) } })
      }
    };
  }

  if (params.femaleOnly === "true") match["rules_doc.femaleOnly"] = true;
  if (params.maleOnly === "true") match["rules_doc.maleOnly"] = true;
  if (params.visitorsAllowed === "true") match["rules_doc.visitorsAllowed"] = true;
  if (params.petsAllowed === "true") match["rules_doc.petsAllowed"] = true;
  if (params.smokingAllowed === "true") match["rules_doc.smokingAllowed"] = true;
  if (params.noCurfew === "true") match["rules_doc.noCurfew"] = true;

  return { $match: match };
}

function buildScoringEngine(params: any) {
  const scoreConditions: any[] = [];
  if (params.cctv === "true") scoreConditions.push({ $cond: [{ $eq: ["$features_doc.cctv", true] }, 15, 0] });
  if (params.security24h === "true") scoreConditions.push({ $cond: [{ $eq: ["$features_doc.security24h", true] }, 10, 0] });
  if (params.fireSafety === "true") scoreConditions.push({ $cond: [{ $eq: ["$features_doc.fireSafety", true] }, 10, 0] });
  if (params.floodFree === "true") scoreConditions.push({ $cond: [{ $eq: ["$features_doc.floodFree", true] }, 10, 0] });
  if (params.backupPower === "true") scoreConditions.push({ $cond: [{ $eq: ["$features_doc.backupPower", true] }, 10, 0] });
  if (params.nearTransport === "true") scoreConditions.push({ $cond: [{ $eq: ["$features_doc.nearTransport", true] }, 10, 0] });

  scoreConditions.push({ $multiply: [{ $ifNull: ["$rating", 4.8] }, 2] });

  return {
    $addFields: {
      finalScore: { $add: scoreConditions.length > 0 ? scoreConditions : [0] }
    }
  };
}

export async function executeComplexSearch(searchParams: Record<string, string>) {
  const cacheKey = cache.generateKey("search", searchParams);
  const cached = await cache.get(cacheKey);

  if (cached) return cached;

  const runPipeline = async (params: any, isRelaxed: boolean) => {
    try {
      const pipeline: any[] = [];
      
      if (params.originLat && params.originLng) {
        const radiusInMeters = (params.isUnlimitedDistance === "true" 
          ? 1000000 
          : (Number(isRelaxed ? 20 : (params.distance || 10))) * 1000);
        
        const earlyMatch: any = { status: "active" };
        if (params.category) earlyMatch.category = { $in: [params.category] };

        pipeline.push({
          $geoNear: {
            near: { type: "Point", coordinates: [Number(params.originLng), Number(params.originLat)] },
            distanceField: "distanceToCollege",
            maxDistance: radiusInMeters,
            spherical: true,
            query: earlyMatch
          }
        });
      } else {
        const baseMatch: any = { status: "active" };
        if (params.category) baseMatch.category = { $in: [params.category] };
        pipeline.push({ $match: baseMatch });
      }

      pipeline.push(...JOIN_STAGES);
      pipeline.push(buildHardFilters(params, isRelaxed));
      pipeline.push(buildScoringEngine(params));

      const page = Math.max(1, Number(params.page || 1));
      const limit = Number(params.limit || 20);
      const skip = (page - 1) * limit;

      pipeline.push({ $sort: { finalScore: -1 } });
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });
      pipeline.push({
        $project: {
          _rules: 0,
          _features: 0,
          rooms_list: 0
        }
      });

      const rawResults = await prisma.listing.aggregateRaw({ pipeline });

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

      const data = (rawResults as unknown as any[]).map((doc: any) => ({
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

      const result = { 
        data, 
        relaxed: isRelaxed,
        nextCursor: data.length === limit ? `page:${page + 1}` : null,
      };

      if (result.data.length === 0 && !isRelaxed) {
        return await runPipeline(searchParams, true);
      }

      // HI-2 OPTIMIZATION: Removed blocking AI logic from hot path.
      // Callers should use enrichSearchResultsWithAI asynchronously.
      
      await cache.set(cacheKey, result, 300);
      return result;
    } catch (err: any) {
      console.error("SEARCH_ENGINE_FAILURE:", err.message);
      return { data: [], relaxed: false, error: true };
    }
  };

  return await runPipeline(searchParams, false);
}

/**
 * HI-2 FIX: Asynchronous AI enrichment for search results.
 * This runs in a separate process/fetch to prevent blocking the initial result set.
 */
export async function enrichSearchResultsWithAI(
  results: any[],
  searchParams: Record<string, string>
) {
  if (results.length === 0) return [];

  const buildTemplateReason = (listing: any, p: any): string => {
    const reasons = [];
    if (p.roomType) reasons.push(`Has ${p.roomType.toLowerCase()} rooms available`);
    if (listing.amenities_list?.includes("WiFi")) reasons.push("with fast WiFi");
    if (listing.price && p.maxPrice && listing.price <= Number(p.maxPrice)) reasons.push("fits your budget");
    if (listing.rating && listing.rating >= 4.5) reasons.push("highly rated by students");
    return reasons.length > 0 ? reasons.join(" · ") + "." : "A great alternative close to your location.";
  };

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const userQuery = [
      searchParams.roomType, 
      searchParams.amenities, 
      searchParams.maxPrice ? `budget up to ₱${searchParams.maxPrice}` : ""
    ].filter(Boolean).join(", ") || "a comfortable place";

    const top6 = results.slice(0, 6);
    const listingSummaries = top6.map((l: any, i: number) =>
      `${i + 1}. ID:"${l.id}" | "${l.title}" | ₱${l.price}/mo | Amenities: ${(l.amenities_list || []).slice(0, 4).join(", ")}`
    ).join("\n");

    const prompt = `Student searched for: "${userQuery}". No exact matches. 
      Provide ONE short sentence (max 8 words) for each alternative listing explaining why it's a good match.
      Return ONLY JSON: [{ "id": "listing_id", "reason": "reason" }]
      Listings:
      ${listingSummaries}`;

    const aiResponse = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) => setTimeout(() => reject(new Error("AI_TIMEOUT")), 4500))
    ]) as any;

    const text = aiResponse.response.text().trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]);
      const reasonMap = new Map(suggestions.map((s: any) => [s.id, s.reason]));
      return results.map((listing: any) => ({
        ...listing,
        aiHighlight: reasonMap.get(listing.id) || buildTemplateReason(listing, searchParams),
      }));
    }
  } catch (aiErr: any) {
    console.error("AI_ENRICHMENT_FAILED:", aiErr.message);
  }

  // Fallback to templates if AI fails
  return results.map((listing: any) => ({
    ...listing,
    aiHighlight: buildTemplateReason(listing, searchParams),
  }));
}

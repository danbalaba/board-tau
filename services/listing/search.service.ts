import { db as prisma } from "@/lib/db";
import { cache } from "@/lib/redis";

/**
 * THE JOIN PIPELINE
 * We removed the slow Category, ListingAmenity, and Feature joins.
 * We now only join Room and ListingRule for hard filters.
 * Everything else is now in the main Listing document for speed.
 */
const JOIN_STAGES = [
  // 1. Join Rooms
  {
    $lookup: {
      from: "Room",
      localField: "_id",
      foreignField: "listingId",
      as: "rooms_list"
    }
  },
  // 2. Join ListingRule (Still needed for hard gender filters)
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
  }
];

/**
 * THE MATCH PIPELINE (Hard Filters)
 */
function buildHardFilters(params: any) {
  const match: any = {};
  match.status = "active";

  // Category Filter (Denormalized)
  if (params.category) {
    match.category = { $in: [params.category] };
  }

  // Budget Filter
  if (params.minPrice || params.maxPrice) {
    const p: any = {};
    if (params.minPrice) p.$gte = Number(params.minPrice);
    if (params.maxPrice) p.$lte = Number(params.maxPrice);
    match.$or = [{ price: p }, { "rooms_list.price": p }];
  }

  // Room Type & Availability Filter
  if (params.roomType) {
    match.rooms_list = {
      $elemMatch: {
        roomType: params.roomType,
        status: "AVAILABLE",
        ...(params.capacity && { capacity: { $gte: Number(params.capacity) } }),
        ...(params.availableSlots && { availableSlots: { $gte: Number(params.availableSlots) } })
      }
    };
  }

  // Mandatory Rule Filters (Female Only / Male Only)
  if (params.femaleOnly === "true") match["rules_doc.femaleOnly"] = true;
  if (params.maleOnly === "true") match["rules_doc.maleOnly"] = true;

  return { $match: match };
}

/**
 * THE HEURISTIC SCORING ENGINE (Soft Filters / User Preferences)
 * Uses the Philippine-context multipliers from reference docs.
 */
function buildScoringEngine(params: any) {
  const scoreConditions: any[] = [];

  // 1. Amenities (Denormalized Match)
  if (params.amenities) {
    const amenitiesArr = Array.isArray(params.amenities) ? params.amenities : [params.amenities];
    amenitiesArr.forEach((amenity: string) => {
      scoreConditions.push({
        $cond: [{ $in: [amenity, { $ifNull: ["$amenities_list", []] }] }, 10, 0]
      });
    });
  }

  // 2. High-Value Multipliers (Features/Security)
  // Note: These are now checked in the amenities_list for speed if denormalized
  // OR we default to small boosts if present in the text
  if (params.cctv === "true") scoreConditions.push({ $cond: [{ $regexMatch: { input: "$title", regex: "cctv", options: "i" } }, 15, 0] });
  if (params.security24h === "true") scoreConditions.push({ $cond: [{ $regexMatch: { input: "$description", regex: "security", options: "i" } }, 10, 0] });
  if (params.nearTransport === "true") scoreConditions.push({ $cond: [{ $regexMatch: { input: "$description", regex: "transport|tricycle", options: "i" } }, 10, 0] });

  // 3. Rule Preferences
  if (params.petsAllowed === "true") scoreConditions.push({ $cond: [{ $eq: ["$rules_doc.petsAllowed", true] }, 5, 0] });
  if (params.visitorsAllowed === "true") scoreConditions.push({ $cond: [{ $eq: ["$rules_doc.visitorsAllowed", true] }, 5, 0] });

  // 4. Rating Boost
  scoreConditions.push({ $multiply: [{ $ifNull: ["$rating", 4.8] }, 2] });

  return {
    $addFields: {
      finalScore: { $add: scoreConditions.length > 0 ? scoreConditions : [0] }
    }
  };
}

/**
 * THE MAIN SEARCH ORCHESTRATOR
 */
export async function executeComplexSearch(searchParams: Record<string, string>) {
  // Try Cache First
  const cacheKey = cache.generateKey("search", searchParams);
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const runPipeline = async (params: any, isRelaxed: boolean) => {
    const pipeline: any[] = [];

    // 1. GEO NEAR
    if (params.originLat && params.originLng) {
      pipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [Number(params.originLng), Number(params.originLat)] },
          distanceField: "distanceToCollege",
          maxDistance: params.isUnlimitedDistance === "true" 
            ? 1000000 
            : (Number(isRelaxed ? 20 : (params.distance || 10))) * 1000,
          spherical: true,
          query: { status: "active" }
        }
      });
    }

    // 2. JOIN REMAINING DATA
    pipeline.push(...JOIN_STAGES);

    // 3. HARD FILTER
    pipeline.push(buildHardFilters(params));

    // 4. SCORING
    pipeline.push(buildScoringEngine(params));

    // 5. SORT & LIMIT
    pipeline.push({ $sort: { finalScore: -1 } });
    pipeline.push({ $limit: 20 });

    const rawResults = await prisma.listing.aggregateRaw({ pipeline });

    const data = (rawResults as unknown as any[]).map((doc: any) => ({
      ...doc,
      id: doc._id['$oid'] || doc._id.toString(),
      _id: undefined,
      rooms: doc.rooms_list || [],
      categories: (doc.category || []).map((c: string) => ({ name: c, label: c }))
    }));

    return { data, relaxed: isRelaxed };
  };

  try {
    let result = await runPipeline(searchParams, false);

    if (result.data.length === 0) {
      result = await runPipeline(searchParams, true);
    }

    // Save to Cache (TTL 5 mins for search results)
    await cache.set(cacheKey, result, 300);

    return result;
  } catch (err: any) {
    console.error("SEARCH_ENGINE_FAILURE:", err.message);
    return { data: [], relaxed: false, error: true };
  }
}

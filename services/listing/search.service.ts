import { db as prisma } from "@/lib/db";
import { ROOM_TYPES } from "@/data/roomTypes";

/**
 * THE JOIN PIPELINE
 * Since MongoDB documents in our schema are separated into Room, ListingAmenity, etc.,
 * we must use $lookup to "JOIN" them into the Listing document before we can filter them.
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
  // 2. Join ListingAmenity (Boolean fields: wifi, parking, airConditioning, laundry)
  {
    $lookup: {
      from: "ListingAmenity",
      localField: "_id",
      foreignField: "listingId",
      as: "_amenities"
    }
  },
  // 3. Join ListingRule (Boolean fields: femaleOnly, maleOnly, visitorsAllowed, petsAllowed, smokingAllowed)
  {
    $lookup: {
      from: "ListingRule",
      localField: "_id",
      foreignField: "listingId",
      as: "_rules"
    }
  },
  // 4. Join ListingFeature (Scoring fields: security24h, cctv, nearTransport, studyFriendly)
  {
    $lookup: {
      from: "ListingFeature",
      localField: "_id",
      foreignField: "listingId",
      as: "_features"
    }
  },
  // 5. Join Categories (Double Lookup: ListingCategory -> Category)
  {
    $lookup: {
      from: "ListingCategory",
      localField: "_id",
      foreignField: "listingId",
      as: "_cat_links"
    }
  },
  {
    $lookup: {
      from: "Category",
      localField: "_cat_links.categoryId",
      foreignField: "_id",
      as: "categories_list"
    }
  },
  // 6. Flatten Joins for easier $match/Scoring access
  {
    $addFields: {
      amenities_doc: { $arrayElemAt: ["$_amenities", 0] },
      rules_doc: { $arrayElemAt: ["$_rules", 0] },
      features_doc: { $arrayElemAt: ["$_features", 0] }
    }
  }
];

/**
 * THE MATCH PIPELINE (Hard Filters)
 */
function buildHardFilters(params: any) {
  const match: any = {};
  match.status = "active";

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
 * This prevents "0 Results" by converting amenities/preferences into a numeric score.
 * Results with ALL preferences found will have the highest matchScore.
 */
function buildScoringEngine(params: any) {
  const scoreConditions = [];

  // Map boolean amenities in the DB (ListingAmenity)
  if (params.amenities) {
      const amenitiesList = Array.isArray(params.amenities) ? params.amenities : [params.amenities];

      if (amenitiesList.includes("WiFi")) {
          scoreConditions.push({ $cond: [{ $eq: ["$amenities_doc.wifi", true] }, 20, 0] });
      }
      if (amenitiesList.includes("Laundry Area")) {
          scoreConditions.push({ $cond: [{ $eq: ["$amenities_doc.laundry", true] }, 10, 0] });
      }
      if (amenitiesList.includes("Parking")) {
          scoreConditions.push({ $cond: [{ $eq: ["$amenities_doc.parking", true] }, 10, 0] });
      }
  }

  // Security Boosts (ListingFeature)
  if (params.security24h === "true") {
    scoreConditions.push({ $cond: [{ $eq: ["$features_doc.security24h", true] }, 15, 0] });
  }
  if (params.cctv === "true") {
    scoreConditions.push({ $cond: [{ $eq: ["$features_doc.cctv", true] }, 10, 0] });
  }

  // Rule Preferences (ListingRule)
  if (params.petsAllowed === "true") {
      scoreConditions.push({ $cond: [{ $eq: ["$rules_doc.petsAllowed", true] }, 5, 0] });
  }
  if (params.visitorsAllowed === "true") {
      scoreConditions.push({ $cond: [{ $eq: ["$rules_doc.visitorsAllowed", true] }, 5, 0] });
  }

  // Environment & Proximity (ListingFeature)
  if (params.studyFriendly === "true") {
    scoreConditions.push({ $cond: [{ $eq: ["$features_doc.studyFriendly", true] }, 5, 0] });
  }
  if (params.nearTransport === "true") {
    scoreConditions.push({ $cond: [{ $eq: ["$features_doc.nearTransport", true] }, 5, 0] });
  }

  // Rating Multiplier (Max 25 points)
  scoreConditions.push({ $multiply: [{ $ifNull: ["$rating", 0] }, 5] });

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
  const runPipeline = async (params: any, isRelaxed: boolean) => {
    const pipeline: any[] = [];

    // 1. GEO NEAR (MUST BE FIRST)
    if (params.originLat && params.originLng) {
      pipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [Number(params.originLng), Number(params.originLat)] },
          distanceField: "distanceToCollege",
          maxDistance: (Number(isRelaxed ? 20 : (params.distance || 5))) * 1000,
          spherical: true,
          query: { status: "active" }
        }
      });
    }

    // 2. JOIN DATA
    pipeline.push(...JOIN_STAGES);

    // 3. HARD FILTER (Only Price/RoomType/Status/Restricted Gender)
    pipeline.push(buildHardFilters(params));

    // 4. SCORING (Amenities/Preferences/Proximity)
    pipeline.push(buildScoringEngine(params));

    // 5. SORT & LIMIT
    pipeline.push({ $sort: { finalScore: -1 } });
    pipeline.push({ $limit: 16 });

    const rawResults = await prisma.listing.aggregateRaw({ pipeline });

    // Map MongoDB IDs back to Prisma-friendly format
    const data = (rawResults as unknown as any[]).map((doc: any) => ({
      ...doc,
      id: doc._id['$oid'] || doc._id.toString(),
      _id: undefined,
      rooms: doc.rooms_list || [],
      categories: doc.categories_list || []
    }));

    return { data, relaxed: isRelaxed };
  };

  try {
    let result = await runPipeline(searchParams, false);

    // If no results, try relaxing
    if (result.data.length === 0) {
      console.log("[BoardTAU] Search: 0 Results found. Running relaxed query...");
      result = await runPipeline(searchParams, true);
    }

    return result;
  } catch (err: any) {
    console.error("SEARCH_ENGINE_FAILURE:", err.message);
    return { data: [], relaxed: false, error: true };
  }
}

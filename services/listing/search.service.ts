import { db as prisma } from "@/lib/db";
import { cache } from "@/lib/redis";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * THE JOIN PIPELINE
 * We removed the slow Category, ListingAmenity, and Feature joins.
 * We now only join Room and ListingRule for hard filters.
 * Everything else is now in the main Listing document for speed.
 */
const JOIN_STAGES = [
  // 1. Join Rooms WITH their amenity names embedded (via RoomAmenityType)
  {
    $lookup: {
      from: "Room",
      localField: "_id",
      foreignField: "listingId",
      as: "rooms_list",
      pipeline: [
        {
          $lookup: {
            from: "RoomAmenity",
            localField: "_id",
            foreignField: "roomId",
            as: "_roomAmenityRefs"
          }
        },
        {
          $lookup: {
            from: "RoomAmenityType",
            localField: "_roomAmenityRefs.amenityTypeId",
            foreignField: "_id",
            as: "_amenityTypes"
          }
        },
        {
          $addFields: {
            // Flat array of lowercase names: ['desk', 'ac', 'wifi', etc.]
            amenityCodes: { $map: { input: "$_amenityTypes", as: "t", in: "$$t.name" } }
          }
        }
      ]
    }
  },
  // 2. Join ListingRule (Needed for hard gender filters & visitor scoring)
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
  // 3. Join ListingFeature (Needed for advanced security scoring)
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

/**
 * THE MATCH PIPELINE (Hard Filters / Dealbreakers)
 * If these don't match, the listing is REMOVED from the results.
 */
function buildHardFilters(params: any, isRelaxed: boolean = false) {
  const match: any = {};
  match.status = "active";

  // 1. Listing-Level Amenity Filters
  // ⚡ RELAXED MODE: Skip this filter — too strict, caused zero results
  if (params.amenities && !isRelaxed) {
    const amenitiesArr = Array.isArray(params.amenities) ? params.amenities : [params.amenities];
    match.amenities_list = { $all: amenitiesArr };
  }

  // 2. Budget Filter — ALWAYS apply (user's hard limit)
  if (params.minPrice || params.maxPrice) {
    const p: any = {};
    if (params.minPrice) p.$gte = Number(params.minPrice);
    if (params.maxPrice) p.$lte = Number(params.maxPrice);
    match.$or = [{ price: p }, { "rooms_list.price": p }];
  }

  // 3. Deep Room-Level Filtering
  if (params.roomType || params.roomAmenities || params.bedType) {
    const roomMatch: any = { status: "AVAILABLE" };

    // Room type is kept even in relaxed mode (Solo/Duo is a hard preference)
    if (params.roomType) roomMatch.roomType = params.roomType;
    if (params.bedType) roomMatch.bedType = params.bedType;

    // ⚡ RELAXED MODE: Skip room amenity filter — this was causing zero results
    if (params.roomAmenities && !isRelaxed) {
      const roomAmArr = Array.isArray(params.roomAmenities) ? params.roomAmenities : [params.roomAmenities];
      roomMatch.amenityCodes = { $all: roomAmArr };
    }

    match.rooms_list = {
      $elemMatch: {
        ...roomMatch,
        ...(params.capacity && { capacity: { $gte: Number(params.capacity) } }),
        ...(params.availableSlots && { availableSlots: { $gte: Number(params.availableSlots) } })
      }
    };
  }

  // 4. Mandatory Rule Filters — always apply
  if (params.femaleOnly === "true") match["rules_doc.femaleOnly"] = true;
  if (params.maleOnly === "true") match["rules_doc.maleOnly"] = true;

  return { $match: match };
}

/**
 * THE HEURISTIC SCORING ENGINE (Soft Filters / Quality Multipliers)
 * These do NOT remove listings. They only determine the Sort Order (Ranking).
 */
function buildScoringEngine(params: any) {
  const scoreConditions: any[] = [];

  // 1. Safety & Security Priority (Only if selected)
  if (params.cctv === "true") {
    scoreConditions.push({ $cond: [{ $eq: ["$features_doc.cctv", true] }, 15, 0] });
  }
  if (params.security24h === "true") {
    scoreConditions.push({ $cond: [{ $eq: ["$features_doc.security24h", true] }, 10, 0] });
  }

  // 2. Commute & Study Priority (Only if selected)
  if (params.nearTransport === "true") {
    scoreConditions.push({ $cond: [{ $eq: ["$features_doc.nearTransport", true] }, 10, 0] });
  }
  if (params.studyFriendly === "true") {
    scoreConditions.push({ $cond: [{ $eq: ["$features_doc.studyFriendly", true] }, 5, 0] });
  }

  // 3. Baseline Quality (The 4.8 Fresh Listing Rule)
  // Rating multiplied by 2 provides the foundation (scale of 0-10)
  scoreConditions.push({ $multiply: [{ $ifNull: ["$rating", 4.8] }, 2] });

  const scoringStage = {
    $addFields: {
      finalScore: { $add: scoreConditions.length > 0 ? scoreConditions : [0] }
    }
  };

  return scoringStage;
}

/**
 * THE MAIN SEARCH ORCHESTRATOR
 */
export async function executeComplexSearch(searchParams: Record<string, string>) {
  const isDebug = process.env.DEBUG_SEARCH === "true";

  if (isDebug) {
    console.log("\n--- 🔍 SEARCH DEBUG SESSION START ---");
    console.log("🔍 Incoming Search Params:", JSON.stringify(searchParams, null, 2));
  }

  // Try Cache First
  const cacheKey = cache.generateKey("search", searchParams);
  const cached = await cache.get(cacheKey);

  if (isDebug) {
    console.log("🧠 Cache Key:", cacheKey);
    console.log("⚡ Cache Hit:", !!cached);
  }

  if (cached) {
    if (isDebug) console.log("--- 🔍 SEARCH DEBUG SESSION END (FROM CACHE) ---\n");
    return cached;
  }

  const runPipeline = async (params: any, isRelaxed: boolean) => {
    const pipeline: any[] = [];
    const debugMetadata: any = { stages: [] };

    // 1. GEO NEAR or BASE MATCH (The Indexed Entry Stage)
    if (params.originLat && params.originLng) {
      const radiusInMeters = (params.isUnlimitedDistance === "true" 
        ? 1000000 
        : (Number(isRelaxed ? 20 : (params.distance || 10))) * 1000);
      
      const earlyMatch: any = { status: "active" };
      if (params.category) {
        earlyMatch.category = { $in: [params.category] };
      }

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
      // Fallback for searches without coordinates (e.g. Any College)
      // We still want Stage 1 to use an Index for status and category
      const baseMatch: any = { status: "active" };
      if (params.category) {
        baseMatch.category = { $in: [params.category] };
      }
      pipeline.push({ $match: baseMatch });
    }

    // 2. JOIN REMAINING DATA
    pipeline.push(...JOIN_STAGES);

    // 3. HARD FILTER (Room-level and Rule-level filters)
    // Pass isRelaxed so amenity-only filters are skipped in fallback mode
    pipeline.push(buildHardFilters(params, isRelaxed));

    // 4. SCORING
    pipeline.push(buildScoringEngine(params));

    // 5. SORT & PAGINATION
    const page = Math.max(1, Number(params.page || 1));
    const limit = Number(params.limit || 20);
    const skip = (page - 1) * limit;

    pipeline.push({ $sort: { finalScore: -1 } });
    
    // Total count stage (optional but good for debugging)
    if (isDebug) {
       console.log(`📏 Pagination: Page ${page}, Skip ${skip}, Limit ${limit}`);
    }

    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // 6. CLEANUP (Projection)
    // We remove the large raw join arrays to keep the response light
    pipeline.push({
      $project: {
        _rules: 0,
        _features: 0,
        rooms_list: 0
      }
    });

    if (isDebug) {
      console.log("🧱 Aggregation Pipeline:");
      pipeline.forEach((stage, index) => {
        console.log(`Stage ${index + 1} (${Object.keys(stage)[0]}):`, JSON.stringify(stage, null, 2));
      });

      // Stage-by-Stage Debug Execution
      let tempPipeline: any[] = [];
      for (let i = 0; i < pipeline.length; i++) {
        tempPipeline.push(pipeline[i]);
        const partialResults = await (prisma as any).listing.aggregateRaw({ pipeline: tempPipeline });
        const count = Array.isArray(partialResults) ? partialResults.length : 0;
        console.log(`📊 After Stage ${i + 1} (${Object.keys(pipeline[i])[0]}): ${count} results`);
        debugMetadata.stages.push({
          stage: i + 1,
          type: Object.keys(pipeline[i])[0],
          count: count
        });
      }
    }

    const rawResults = await prisma.listing.aggregateRaw({ pipeline });

    // Helper to unwrap MongoDB extended JSON number types (e.g. { '$numberDouble': 3.8 })
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
      // Explicitly unwrap MongoDB extended JSON for numeric fields shown in UI
      rating: unwrapMongoNumber(doc.rating),
      reviewCount: unwrapMongoNumber(doc.reviewCount) ?? 0,
      price: unwrapMongoNumber(doc.price) ?? doc.price,
      // aiHighlight will be injected by Gemini after relaxed search
      aiHighlight: null as string | null,
    }));

    if (data.length === 0) {
      console.warn("❌ [DEBUG] ZERO RESULTS - Possible over-filtering detected");
    }

    const pageNumber = page;
    const hasMore = data.length === limit;

    const result = { 
      data, 
      relaxed: isRelaxed,
      nextCursor: hasMore ? `page:${pageNumber + 1}` : null,
      ...(isDebug && { 
        debug: {
          totalStages: pipeline.length,
          finalCount: data.length,
          usedRelaxed: isRelaxed,
          page: pageNumber,
          limit: limit,
          stageAnalysis: debugMetadata.stages
        } 
      })
    };

    return result;
  };

  try {
    let result = await runPipeline(searchParams, false);

    if (result.data.length === 0) {
      if (isDebug) console.log("⚠️ [DEBUG] No results found. Triggering relaxed search...");
      result = await runPipeline(searchParams, true);

      // ✨ GEMINI AI: Enrich relaxed results with AI-generated reasons
      if (result.data.length > 0) {
        // Smart template fallback — used if Gemini is unavailable
        const buildTemplateReason = (listing: any, params: any): string => {
          const reasons = [];
          if (params.roomType) reasons.push(`Has ${params.roomType.toLowerCase()} rooms available`);
          if (listing.amenities_list?.includes("WiFi")) reasons.push("with fast WiFi");
          if (listing.price && params.maxPrice && listing.price <= Number(params.maxPrice))
            reasons.push("fits your budget");
          if (listing.rating && listing.rating >= 4.5) reasons.push("highly rated by students");
          return reasons.length > 0
            ? reasons.join(" · ") + "."
            : "A great alternative close to your location.";
        };

        try {
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
          const model = genAI.getGenerativeModel(
            { model: "gemini-2.0-flash" },
            { apiVersion: "v1" }
          );

          const userWants: string[] = [];
          if (searchParams.roomType) userWants.push(`${searchParams.roomType} room`);
          if (searchParams.amenities) userWants.push(String(searchParams.amenities));
          if (searchParams.roomAmenities) userWants.push(String(searchParams.roomAmenities));
          if (searchParams.maxPrice) userWants.push(`budget up to ₱${searchParams.maxPrice}/month`);
          const userQuery = userWants.join(", ") || "a comfortable boarding house";

          const top6 = result.data.slice(0, 6);
          const listingSummaries = top6.map((l: any, i: number) =>
            `${i + 1}. ID:"${l.id}" | "${l.title}" | ₱${l.price}/mo | ${l.region} | Amenities: ${(l.amenities_list || []).slice(0, 4).join(", ")}`
          ).join("\n");

          const prompt = `You are a helpful assistant for BoardTAU, a student boarding house platform in the Philippines.
A student searched for: "${userQuery}" but no exact matches were found.
Here are the closest alternatives:
${listingSummaries}

For each listing, write ONE short sentence (max 10 words) explaining why it's a good alternative.
Return ONLY a valid JSON array, no extra text:
[{ "id": "listing_id", "reason": "Short reason here." }]`;

          const geminiResult = await model.generateContent(prompt);
          const text = geminiResult.response.text().trim();
          const jsonMatch = text.match(/\[[\s\S]*\]/);

          if (jsonMatch) {
            const suggestions = JSON.parse(jsonMatch[0]);
            const reasonMap = new Map(suggestions.map((s: any) => [s.id, s.reason]));
            result.data = result.data.map((listing: any) => ({
              ...listing,
              aiHighlight: reasonMap.get(listing.id) || buildTemplateReason(listing, searchParams),
            }));
            if (isDebug) console.log(`🤖 Gemini enriched ${suggestions.length} listings with AI reasons.`);
          }
        } catch (aiErr: any) {
          // Non-fatal: use smart template reasons instead
          console.warn("⚠️ Gemini unavailable, using template reasons:", aiErr.message.split("\n")[0]);
          result.data = result.data.map((listing: any) => ({
            ...listing,
            aiHighlight: buildTemplateReason(listing, searchParams),
          }));
        }
      }

    }

    if (isDebug) {
      console.log(`📊 Final Results Count: ${result.data.length}`);
      console.log("--- 🔍 SEARCH DEBUG SESSION END ---\n");
    }

    // Save to Cache (TTL 5 mins for search results)
    await cache.set(cacheKey, result, 300);

    return result;
  } catch (err: any) {
    console.error("SEARCH_ENGINE_FAILURE:", err.message);
    return { data: [], relaxed: false, error: true };
  }
}

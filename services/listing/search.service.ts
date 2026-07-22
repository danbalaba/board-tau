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

  if (params.q) {
    const regex = { $regex: params.q, $options: "i" };
    match.$and = match.$and || [];
    match.$and.push({
      $or: [
        { title: regex },
        { description: regex },
        { category: { $elemMatch: { $regex: params.q, $options: "i" } } }
      ]
    });
  }

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

  scoreConditions.push({ $multiply: [{ $ifNull: ["$rating", 3.5] }, 2] });

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
      
      if (params.bounds) {
        // bounds format: west,south,east,north (lng,lat,lng,lat)
        const [w, s, e, n] = params.bounds.split(',').map(Number);
        
        const baseMatch: any = { status: "active" };
        if (params.category) baseMatch.category = { $in: Array.isArray(params.category) ? params.category : [params.category] };

        // Security Guardrail: Validate numbers and restrict to max ~0.5 degrees diff to prevent DOS
        if (!isNaN(w) && !isNaN(s) && !isNaN(e) && !isNaN(n) && 
            Math.abs(e - w) <= 0.5 && Math.abs(n - s) <= 0.5) {
          
          baseMatch.location = {
            $geoWithin: {
              $box: [
                [w, s], // bottom-left (west, south)
                [e, n]  // top-right (east, north)
              ]
            }
          };
        }
        pipeline.push({ $match: baseMatch });
      } else if (params.originLat && params.originLng) {
        const radiusInMeters = (params.isUnlimitedDistance === "true" 
          ? 1000000 
          : (Number(isRelaxed ? 20 : (params.distance || 10))) * 1000);
        
        const earlyMatch: any = { status: "active" };
        if (params.category) earlyMatch.category = { $in: Array.isArray(params.category) ? params.category : [params.category] };

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
        if (params.category) baseMatch.category = { $in: Array.isArray(params.category) ? params.category : [params.category] };
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
          _features: 0
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
        rooms: (doc.rooms_list || []).map((r: any) => ({
          ...r,
          id: r._id?.['$oid'] || r._id?.toString(),
          _id: undefined,
          price: unwrapMongoNumber(r.price) ?? r.price,
          capacity: unwrapMongoNumber(r.capacity),
          availableSlots: unwrapMongoNumber(r.availableSlots),
        })),
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

      await cache.set(cacheKey, result, 300);
      return result;
    } catch (err: any) {
      console.error("SEARCH_ENGINE_FAILURE:", err.message);
      return { data: [], relaxed: false, error: true };
    }
  };

  return await runPipeline(searchParams, false);
}

export async function executeComplexSearchCount(searchParams: Record<string, string>) {
  const cacheKey = cache.generateKey("search_count", searchParams);
  const cached = await cache.get(cacheKey);

  if (cached) return cached;

  try {
    const pipeline: any[] = [];
    
    if (searchParams.bounds) {
      const [w, s, e, n] = searchParams.bounds.split(',').map(Number);
      
      const baseMatch: any = { status: "active" };
      if (searchParams.category) baseMatch.category = { $in: Array.isArray(searchParams.category) ? searchParams.category : [searchParams.category] };

      if (!isNaN(w) && !isNaN(s) && !isNaN(e) && !isNaN(n) && 
          Math.abs(e - w) <= 0.5 && Math.abs(n - s) <= 0.5) {
        baseMatch.location = {
          $geoWithin: {
            $box: [
              [w, s],
              [e, n]
            ]
          }
        };
      }
      pipeline.push({ $match: baseMatch });
    } else if (searchParams.originLat && searchParams.originLng) {
      const radiusInMeters = (searchParams.isUnlimitedDistance === "true" 
        ? 1000000 
        : (Number(searchParams.distance || 10)) * 1000);
      
      const earlyMatch: any = { status: "active" };
      if (searchParams.category) earlyMatch.category = { $in: Array.isArray(searchParams.category) ? searchParams.category : [searchParams.category] };

      pipeline.push({
        $geoNear: {
          near: { type: "Point", coordinates: [Number(searchParams.originLng), Number(searchParams.originLat)] },
          distanceField: "distanceToCollege",
          maxDistance: radiusInMeters,
          spherical: true,
          query: earlyMatch
        }
      });
    } else {
      const baseMatch: any = { status: "active" };
      if (searchParams.category) baseMatch.category = { $in: Array.isArray(searchParams.category) ? searchParams.category : [searchParams.category] };
      pipeline.push({ $match: baseMatch });
    }

    pipeline.push(...JOIN_STAGES);
    pipeline.push(buildHardFilters(searchParams, false));
    pipeline.push({ $count: "totalMatches" });

    const rawResults = await prisma.listing.aggregateRaw({ pipeline }) as unknown as any[];
    
    const count = rawResults.length > 0 ? rawResults[0].totalMatches : 0;
    const result = { count };

    await cache.set(cacheKey, result, 60); // Cache count for 60 seconds
    return result;
  } catch (err: any) {
    console.error("SEARCH_COUNT_FAILURE:", err.message);
    return { count: 0, error: true };
  }
}

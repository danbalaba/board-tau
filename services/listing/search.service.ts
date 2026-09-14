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
        },
        {
          $lookup: {
            from: "RoomAttributeLink",
            localField: "_id",
            foreignField: "roomId",
            as: "roomLinks"
          }
        }
      ]
    }
  },
  {
    $lookup: {
      from: "ListingAttributeLink",
      localField: "_id",
      foreignField: "listingId",
      as: "listingLinks"
    }
  },
  {
    $lookup: {
      from: "PropertyType",
      localField: "propertyTypeId",
      foreignField: "_id",
      as: "propertyTypeArr"
    }
  }
];

import { escapeRegexString } from "@/lib/security/sanitize";

function buildHardFilters(params: any, isRelaxed: boolean = false) {
  const match: any = {};
  match.status = "ACTIVE";

  if (params.amenities && !isRelaxed) {
    const amenitiesArr = Array.isArray(params.amenities) ? params.amenities : [params.amenities];
    match.amenities_list = { $in: amenitiesArr };
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
    if (params.bedType && params.bedType !== "ANY") roomMatch.bedType = params.bedType;
    if (params.bathroomArrangement) roomMatch.bathroomArrangement = params.bathroomArrangement;

    if (params.roomAmenities && !isRelaxed) {
      const roomAmArr = Array.isArray(params.roomAmenities) ? params.roomAmenities : [params.roomAmenities];
      roomMatch.amenityNames = { $in: roomAmArr };
    }

    match.rooms_list = {
      $elemMatch: {
        ...roomMatch,
        ...(params.capacity && { capacity: { $gte: Number(params.capacity) } }),
        ...(params.availableSlots && { availableSlots: { $gte: Number(params.availableSlots) } })
      }
    };
  }

  // Instead of boolean checks, frontend should pass attributes array.
  // We check if the listing has all the required attribute IDs
  if (params.attributes && !isRelaxed) {
    const attrArr = Array.isArray(params.attributes) ? params.attributes : [params.attributes];
    match["listingLinks.attributeId"] = { $all: attrArr.map((id: string) => ({ $oid: id })) };
  }

  if (params.q) {
    const cleanQ = escapeRegexString(params.q);
    const regex = { $regex: cleanQ, $options: "i" };
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
  // or we can pass bonus features as IDs in params.
  if (params.bonusAttributes) {
    const bonusArr = Array.isArray(params.bonusAttributes) ? params.bonusAttributes : [params.bonusAttributes];
    bonusArr.forEach((id: string) => {
       scoreConditions.push({ $cond: [{ $in: [{ $oid: id }, "$listingLinks.attributeId"] }, 10, 0] });
    });
  }

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
        
        const baseMatch: any = { status: "ACTIVE" };
        if (params.category) {
          const catNames = Array.isArray(params.category) ? params.category : [params.category];
          const pts = await prisma.propertyType.findMany({ where: { name: { in: catNames } }, select: { id: true } });
          baseMatch.propertyTypeId = pts.length ? { $in: pts.map(pt => ({ $oid: pt.id })) } : null;
        }

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
        
        const earlyMatch: any = { status: "ACTIVE" };
        if (params.category) {
          const catNames = Array.isArray(params.category) ? params.category : [params.category];
          const pts = await prisma.propertyType.findMany({ where: { name: { in: catNames } }, select: { id: true } });
          earlyMatch.propertyTypeId = pts.length ? { $in: pts.map(pt => ({ $oid: pt.id })) } : null;
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
        const baseMatch: any = { status: "ACTIVE" };
        if (params.category) {
          const catNames = Array.isArray(params.category) ? params.category : [params.category];
          const pts = await prisma.propertyType.findMany({ where: { name: { in: catNames } }, select: { id: true } });
          baseMatch.propertyTypeId = pts.length ? { $in: pts.map(pt => ({ $oid: pt.id })) } : null;
        }
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
        propertyType: doc.propertyTypeArr && doc.propertyTypeArr.length > 0 
          ? { name: doc.propertyTypeArr[0].name, icon: doc.propertyTypeArr[0].icon } 
          : null,
        propertyTypeArr: undefined,
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

      await cache.set(cacheKey, result, 1800); // 30 Mins TTL
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
      
      const baseMatch: any = { status: "ACTIVE" };
      if (searchParams.category) {
        const catNames = Array.isArray(searchParams.category) ? searchParams.category : [searchParams.category];
        const pts = await prisma.propertyType.findMany({ where: { name: { in: catNames } }, select: { id: true } });
        baseMatch.propertyTypeId = pts.length ? { $in: pts.map(pt => ({ $oid: pt.id })) } : null;
      }

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
      
      const earlyMatch: any = { status: "ACTIVE" };
      if (searchParams.category) {
        const catNames = Array.isArray(searchParams.category) ? searchParams.category : [searchParams.category];
        const pts = await prisma.propertyType.findMany({ where: { name: { in: catNames } }, select: { id: true } });
        earlyMatch.propertyTypeId = pts.length ? { $in: pts.map(pt => ({ $oid: pt.id })) } : null;
      }

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
      const baseMatch: any = { status: "ACTIVE" };
      if (searchParams.category) {
        const catNames = Array.isArray(searchParams.category) ? searchParams.category : [searchParams.category];
        const pts = await prisma.propertyType.findMany({ where: { name: { in: catNames } }, select: { id: true } });
        baseMatch.propertyTypeId = pts.length ? { $in: pts.map(pt => ({ $oid: pt.id })) } : null;
      }
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

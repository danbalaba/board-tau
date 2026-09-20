import { db as prisma } from "@/lib/db";
import { cache } from "@/lib/redis";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { escapeRegexString } from "@/lib/security/sanitize";

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
        },
        {
          $lookup: {
            from: "RoomTypeDefinition",
            localField: "roomTypeDefinitionId",
            foreignField: "_id",
            as: "roomTypeArr"
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

async function resolvePropertyTypeIds(params: any): Promise<{ $in: any[] } | null> {
  const catParam = params.categories || params.category;
  if (!catParam) return null;

  const rawNames = Array.isArray(catParam) ? catParam : String(catParam).split(",");
  const catNames = rawNames.map((s: any) => String(s).trim()).filter(Boolean);

  if (catNames.length === 0) return null;

  const pts = await prisma.propertyType.findMany({
    where: {
      OR: catNames.map(name => ({
        name: { equals: name, mode: "insensitive" }
      }))
    },
    select: { id: true }
  });

  return pts.length ? { $in: pts.map(pt => ({ $oid: pt.id })) } : null;
}

async function resolveRoomTypeIds(params: any): Promise<{ $in: any[] } | null> {
  if (!params.roomType) return null;
  const rawNames = Array.isArray(params.roomType) ? params.roomType : String(params.roomType).split(",");
  const typeNames = rawNames.map((s: any) => String(s).trim()).filter(Boolean);

  if (typeNames.length === 0) return null;

  const rts = await prisma.roomTypeDefinition.findMany({
    where: {
      OR: [
        { name: { in: typeNames } },
        { name: { contains: typeNames[0], mode: "insensitive" } }
      ]
    },
    select: { id: true }
  });

  return rts.length ? { $in: rts.map(rt => ({ $oid: rt.id })) } : null;
}

async function resolveAttributeObjectIds(items: any[]): Promise<{ $oid: string }[]> {
  if (!items || items.length === 0) return [];
  const clean = items.map((s: any) => String(s).trim()).filter(Boolean);
  if (clean.length === 0) return [];

  const isObjectId = (str: string) => /^[0-9a-fA-F]{24}$/.test(str);
  const directIds = clean.filter(isObjectId);
  const namesOrKeys = clean.filter(s => !isObjectId(s));

  let fetchedIds: string[] = [];
  if (namesOrKeys.length > 0) {
    const attrs = await prisma.dynamicAttribute.findMany({
      where: {
        OR: [
          { name: { in: namesOrKeys } },
          { subGroupKey: { in: namesOrKeys } }
        ]
      },
      select: { id: true }
    });
    fetchedIds = attrs.map(a => a.id);
  }

  const allUniqueIds = Array.from(new Set([...directIds, ...fetchedIds]));
  return allUniqueIds.map(id => ({ $oid: id }));
}

async function buildHardFiltersAsync(params: any, isRelaxed: boolean = false) {
  const match: any = {};
  match.status = "ACTIVE";

  const andConditions: any[] = [];

  // Step 6: Property Facilities Filtering (ListingAttributeLink)
  if (params.amenities && !isRelaxed) {
    const rawArr = Array.isArray(params.amenities) ? params.amenities : String(params.amenities).split(",");
    const resolvedOids = await resolveAttributeObjectIds(rawArr);

    if (resolvedOids.length > 0) {
      andConditions.push({
        $or: [
          { "listingLinks.attributeId": { $in: resolvedOids } },
          { amenities_list: { $in: rawArr.map((s: any) => String(s).trim()).filter(Boolean) } }
        ]
      });
    }
  }

  // Step 4: Budget Filtering (Listing Price OR Room Price)
  if (params.minPrice || params.maxPrice) {
    const p: any = {};
    if (params.minPrice && !isNaN(Number(params.minPrice))) p.$gte = Number(params.minPrice);
    if (params.maxPrice && !isNaN(Number(params.maxPrice))) p.$lte = Number(params.maxPrice);
    if (Object.keys(p).length > 0) {
      andConditions.push({
        $or: [{ price: p }, { "rooms_list.price": p }]
      });
    }
  }

  // Step 3 & 7: Room Config & Room Amenities Filtering
  const bathChoice = params.bathroomChoice || params.bathroomArrangement;
  if (
    params.roomType ||
    params.roomAmenities ||
    params.bedType ||
    params.capacity ||
    params.availableSlots ||
    bathChoice ||
    params.kitchenChoice === "PRIVATE" ||
    (params.minPrice || params.maxPrice)
  ) {
    const roomMatch: any = { status: "AVAILABLE" };
    const roomAndConditions: any[] = [];

    // Cohesion Fix: Ensure room price condition is checked inside roomMatch when filtering rooms
    if (params.minPrice || params.maxPrice) {
      const rp: any = {};
      if (params.minPrice && !isNaN(Number(params.minPrice))) rp.$gte = Number(params.minPrice);
      if (params.maxPrice && !isNaN(Number(params.maxPrice))) rp.$lte = Number(params.maxPrice);
      if (Object.keys(rp).length > 0) roomMatch.price = rp;
    }

    if (params.roomType) {
      const resolvedRoomTypeOids = await resolveRoomTypeIds(params);
      if (resolvedRoomTypeOids) {
        roomAndConditions.push({
          $or: [
            { roomTypeDefinitionId: resolvedRoomTypeOids },
            { roomType: params.roomType },
            { name: { $regex: params.roomType, $options: "i" } }
          ]
        });
      } else {
        roomAndConditions.push({
          $or: [
            { roomType: params.roomType },
            { name: { $regex: params.roomType, $options: "i" } }
          ]
        });
      }
    }

    if (params.bedType && params.bedType !== "ANY") {
      roomMatch.bedType = params.bedType;
    }
    if (bathChoice && bathChoice !== "ANY") {
      roomMatch.bathroomArrangement = bathChoice;
    }
    if (params.capacity && !isNaN(Number(params.capacity))) roomMatch.capacity = { $gte: Number(params.capacity) };
    if (params.availableSlots && !isNaN(Number(params.availableSlots))) roomMatch.availableSlots = { $gte: Number(params.availableSlots) };

    // Private Kitchenette room filter
    if (params.kitchenChoice === "PRIVATE" && !isRelaxed) {
      const resolvedKitchenOids = await resolveAttributeObjectIds(["KITCHEN_PRIVATE", "Kitchen Sink", "Cooking Stove Provided", "Personal Refrigerator"]);
      if (resolvedKitchenOids.length > 0) {
        roomAndConditions.push({
          $or: [
            { "roomLinks.attributeId": { $in: resolvedKitchenOids } },
            { amenityNames: { $in: ["Kitchen Sink", "Cooking Stove Provided", "Personal Refrigerator"] } }
          ]
        });
      }
    }

    // Step 7: In-Unit Comfort Room Amenities (RoomAttributeLink)
    if (params.roomAmenities && !isRelaxed) {
      const rawRoomAmArr = Array.isArray(params.roomAmenities)
        ? params.roomAmenities
        : String(params.roomAmenities).split(",").map((s: string) => s.trim());
      
      const resolvedRoomAttrOids = await resolveAttributeObjectIds(rawRoomAmArr);

      if (resolvedRoomAttrOids.length > 0) {
        roomAndConditions.push({
          $or: [
            { "roomLinks.attributeId": { $in: resolvedRoomAttrOids } },
            { amenityNames: { $in: rawRoomAmArr } }
          ]
        });
      }
    }

    if (roomAndConditions.length > 0) {
      roomMatch.$and = roomAndConditions;
    }

    match.rooms_list = {
      $elemMatch: roomMatch
    };
  }

  // Step 8: House Rules Filtering (ListingAttributeLink)
  if ((params.rules || params.femaleOnly || params.maleOnly || params.petsAllowed || params.noCurfew || params.visitorsAllowed || params.genderPolicy || params.curfewPolicy || params.visitorPolicy || params.kitchenChoice === "SHARED") && !isRelaxed) {
    const rawRules = Array.isArray(params.rules) ? params.rules : (params.rules ? String(params.rules).split(",") : []);
    if (params.femaleOnly === "true" || params.genderPolicy === "FEMALE_ONLY") rawRules.push("female-only", "Female-Only Property");
    if (params.maleOnly === "true" || params.genderPolicy === "MALE_ONLY") rawRules.push("male-only", "Male-Only Property");
    if (params.petsAllowed === "true") rawRules.push("pets-allowed", "Pets Allowed");
    if (params.noCurfew === "true" || params.curfewPolicy === "NO_CURFEW") rawRules.push("no-curfew", "24/7 Open Gate Access (No Curfew)");
    if (params.visitorsAllowed === "true" || params.visitorPolicy === "VISITORS_ALLOWED") rawRules.push("visitors-allowed", "Visitors Allowed");
    if (params.kitchenChoice === "SHARED") rawRules.push("KITCHEN_SHARED", "Shared Dining Area & Table Set");

    const resolvedRuleOids = await resolveAttributeObjectIds(rawRules);
    if (resolvedRuleOids.length > 0) {
      andConditions.push({
        "listingLinks.attributeId": { $in: resolvedRuleOids }
      });
    }
  }

  // Step 9: Security & Safety Features Filtering (ListingAttributeLink)
  if ((params.advanced || params.security24h || params.cctv || params.fireSafety || params.floodFree || params.backupPower) && !isRelaxed) {
    const rawAdvanced = Array.isArray(params.advanced) ? params.advanced : (params.advanced ? String(params.advanced).split(",") : []);
    if (params.security24h === "true") rawAdvanced.push("security24h", "24/7 Security Guard");
    if (params.cctv === "true") rawAdvanced.push("cctv", "CCTV Cameras");
    if (params.fireSafety === "true") rawAdvanced.push("fireSafety", "Fire Extinguisher Provided");
    if (params.floodFree === "true") rawAdvanced.push("floodFree", "Flood-Free Area");
    if (params.backupPower === "true") rawAdvanced.push("backupPower", "Backup Generator");

    const resolvedAdvancedOids = await resolveAttributeObjectIds(rawAdvanced);
    if (resolvedAdvancedOids.length > 0) {
      andConditions.push({
        $or: [
          { "listingLinks.attributeId": { $in: resolvedAdvancedOids } },
          { "rooms_list.roomLinks.attributeId": { $in: resolvedAdvancedOids } }
        ]
      });
    }
  }

  // Multi-Level Dynamic Attribute Filtering (Listing & Room attribute links)
  if (params.attributes && !isRelaxed) {
    const rawAttrArr = Array.isArray(params.attributes) ? params.attributes : String(params.attributes).split(",");
    const resolvedOids = await resolveAttributeObjectIds(rawAttrArr);

    if (resolvedOids.length > 0) {
      resolvedOids.forEach((oid: any) => {
        andConditions.push({
          $or: [
            { "listingLinks.attributeId": oid },
            { "rooms_list.roomLinks.attributeId": oid }
          ]
        });
      });
    }
  }

  const keywordQuery = params.q || params.query || params.search || params.keyword;
  if (keywordQuery) {
    const tokens = String(keywordQuery).split(/\s+/).map((t: string) => t.trim()).filter((t: string) => t.length > 1);

    if (tokens.length > 0 && !isRelaxed) {
      const qOrs = tokens.map((token: string) => {
        const cleanToken = escapeRegexString(token);
        const regex = { $regex: cleanToken, $options: "i" };
        return [
          { title: regex },
          { description: regex },
          { region: regex },
          { address: regex },
          { category: regex }
        ];
      }).flat();
      andConditions.push({ $or: qOrs });
    }
  }

  if (andConditions.length > 0) {
    match.$and = andConditions;
  }

  return { $match: match };
}


function buildScoringEngine(params: any) {
  const scoreConditions: any[] = [];

  const keywordQuery = params.q || params.query || params.search || params.keyword;
  if (keywordQuery) {
    const tokens = String(keywordQuery).split(/\s+/).map((t: string) => t.trim()).filter((t: string) => t.length > 1);
    tokens.forEach((token: string) => {
      const cleanToken = escapeRegexString(token);
      scoreConditions.push({
        $cond: [{ $regexMatch: { input: "$title", regex: cleanToken, options: "i" } }, 15, 0]
      });
      scoreConditions.push({
        $cond: [{ $regexMatch: { input: "$description", regex: cleanToken, options: "i" } }, 5, 0]
      });
    });
  }

  if (params.bonusAttributes) {
    const bonusArr = Array.isArray(params.bonusAttributes) ? params.bonusAttributes : [params.bonusAttributes];
    bonusArr.forEach((id: string) => {
      scoreConditions.push({ $cond: [{ $in: [{ $oid: id }, "$listingLinks.attributeId"] }, 10, 0] });
    });
  }

  // Base score from rating
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
      const resolvedPropTypeId = await resolvePropertyTypeIds(params);

      if (params.bounds) {
        // bounds format: west,south,east,north (lng,lat,lng,lat)
        const [w, s, e, n] = params.bounds.split(',').map(Number);
        
        const baseMatch: any = { status: "ACTIVE" };
        if (resolvedPropTypeId) {
          baseMatch.propertyTypeId = resolvedPropTypeId;
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
        if (resolvedPropTypeId) {
          earlyMatch.propertyTypeId = resolvedPropTypeId;
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
        if (resolvedPropTypeId) {
          baseMatch.propertyTypeId = resolvedPropTypeId;
        }
        pipeline.push({ $match: baseMatch });
      }

      pipeline.push(...JOIN_STAGES);
      const hardFilters = await buildHardFiltersAsync(params, isRelaxed);
      pipeline.push(hardFilters);
      pipeline.push(buildScoringEngine(params));


      const rawPage = Number(params.page);
      const page = (!isNaN(rawPage) && rawPage >= 1) ? Math.floor(rawPage) : 1;

      const rawLimit = Number(params.limit);
      const limit = (!isNaN(rawLimit) && rawLimit >= 1) ? Math.min(Math.floor(rawLimit), 100) : 20;

      const skip = (page - 1) * limit;

      let sortStage: any = { finalScore: -1 };
      if (params.sortBy === "price_asc") sortStage = { price: 1, finalScore: -1 };
      else if (params.sortBy === "price_desc") sortStage = { price: -1, finalScore: -1 };
      else if (params.sortBy === "rating_desc") sortStage = { rating: -1, finalScore: -1 };
      else if (params.sortBy === "distance" && (params.originLat && params.originLng)) sortStage = { distanceToCollege: 1, finalScore: -1 };

      pipeline.push({ $sort: sortStage });
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
    const resolvedPropTypeId = await resolvePropertyTypeIds(searchParams);

    if (searchParams.bounds) {
      const [w, s, e, n] = searchParams.bounds.split(',').map(Number);
      
      const baseMatch: any = { status: "ACTIVE" };
      if (resolvedPropTypeId) {
        baseMatch.propertyTypeId = resolvedPropTypeId;
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
      if (resolvedPropTypeId) {
        earlyMatch.propertyTypeId = resolvedPropTypeId;
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
      if (resolvedPropTypeId) {
        baseMatch.propertyTypeId = resolvedPropTypeId;
      }
      pipeline.push({ $match: baseMatch });
    }

    pipeline.push(...JOIN_STAGES);
    const hardFilters = await buildHardFiltersAsync(searchParams, false);
    pipeline.push(hardFilters);
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


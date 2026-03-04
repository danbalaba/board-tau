import { db } from "@/lib/db";
import { LISTINGS_BATCH, TAU_COORDINATES } from "@/utils/constants";
import { haversineKm } from "@/utils/helper";

// Generate AI-ready embedding text
const generateEmbeddingText = (listing: any): string => {
  const parts = [
    listing.title,
    listing.description,
    ...listing.amenities,
    listing.roomType || "",
    listing.category,
    listing.femaleOnly ? "female only" : "",
    listing.maleOnly ? "male only" : "",
    listing.visitorsAllowed ? "visitors allowed" : "",
    listing.petsAllowed ? "pets allowed" : "",
    listing.smokingAllowed ? "smoking allowed" : "",
    listing.security24h ? "24/7 security" : "",
    listing.cctv ? "CCTV" : "",
    listing.fireSafety ? "fire safety" : "",
    listing.nearTransport ? "near public transport" : "",
    listing.studyFriendly ? "study friendly" : "",
    listing.quietEnvironment ? "quiet environment" : "",
    listing.flexibleLease ? "flexible lease" : "",
  ];

  return parts.filter(Boolean).join(" ").toLowerCase();
};

// Fallback search function when no primary matches found
// Implements incremental filter relaxation with strict prioritization
export const getFallbackListings = async (parsedQuery: any) => {
  console.log("🔄 FALLBACK: Parsed Query Received:", parsedQuery);

  const {
    userId,
    roomCount,
    guestCount,
    bathroomCount,
    country,
    category,
    categories: categoriesArr,
    minPrice,
    maxPrice,
    amenities,
    roomType,
    distance,
    originLat,
    originLng,
    femaleOnly,
    maleOnly,
    visitorsAllowed,
    petsAllowed,
    smokingAllowed,
    security24h,
    cctv,
    fireSafety,
    nearTransport,
    studyFriendly,
    quietEnvironment,
    flexibleLease,
    moveInDate,
    stayDuration,
  } = parsedQuery;

  // Handle gender filter conflicts immediately
  if (femaleOnly && maleOnly) {
    console.log("🔄 FALLBACK: Gender filters conflict - returning no results");
    return {
      type: "closest",
      message: "No listings match both gender filters",
      listings: [],
      nextCursor: null,
    };
  }

  let where: any = {};

  // Public listing: only show active (approved) listings - NEVER relax this
  const includeAllStatuses = parsedQuery.includeAllStatuses;
  if (!includeAllStatuses) {
    where.status = "active";
  }

  if (userId) {
    where.userId = userId;
  }

  // PRIORITY 1: Keep strict filters (never relax these)
  // - Gender restrictions (must match at least one if specified)
  if (femaleOnly) {
    where.femaleOnly = true;
  } else if (maleOnly) {
    where.maleOnly = true;
  }

  // - Category (keep strict to maintain relevance)
  if (categoriesArr && Array.isArray(categoriesArr) && categoriesArr.length > 0) {
    where.category = { in: categoriesArr };
  } else if (category) {
    where.category = category;
  }

  // PRIORITY 2: Relax price range moderately (±20% maximum)
  const fallbackPriceCond: { gte?: number; lte?: number } = {};
  if (minPrice != null && minPrice > 0) {
    fallbackPriceCond.gte = Math.floor(minPrice * 0.8); // Relax 20% lower
  }
  if (maxPrice != null && maxPrice > 0) {
    fallbackPriceCond.lte = Math.ceil(maxPrice * 1.2); // Relax 20% higher
  }
  if (Object.keys(fallbackPriceCond).length) {
    where.price = fallbackPriceCond;
  }

  // PRIORITY 3: Relax room/guest/bathroom counts (allow -1)
  if (roomCount != null && roomCount > 0) {
    where.roomCount = { gte: Math.max(1, roomCount - 1) };
  }
  if (guestCount != null && guestCount > 0) {
    where.guestCount = { gte: Math.max(1, guestCount - 1) };
  }
  if (bathroomCount != null && bathroomCount > 0) {
    where.bathroomCount = { gte: Math.max(1, bathroomCount - 1) };
  }

  const fallbackQuery: any = {
    where,
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      rooms: true,
      images: true,
      amenities: true,
      rules: true,
      features: true,
      categories: {
        include: {
          category: true,
        },
      },
    },
  };

  console.log("🔄 FALLBACK: Prisma Query (with relaxed filters):", fallbackQuery);

  let fallbackCandidates = await db.listing.findMany(fallbackQuery);

  console.log("🔄 FALLBACK: Initial Candidates Found:", fallbackCandidates.length);

  const lat = originLat != null ? originLat : TAU_COORDINATES[0];
  const lng = originLng != null ? originLng : TAU_COORDINATES[1];

  // PRIORITY 4: Relax distance filter (max 2x original or 20km, whichever is smaller)
  const MAX_FALLBACK_DISTANCE = 20;
  fallbackCandidates = fallbackCandidates.filter((listing) => {
    if ((listing as any).latitude == null || (listing as any).longitude == null) return false;
    const dist = haversineKm(lat, lng, (listing as any).latitude, (listing as any).longitude);
    const maxAllowedDist = distance ? Math.min(distance * 2, MAX_FALLBACK_DISTANCE) : MAX_FALLBACK_DISTANCE;
    return dist <= maxAllowedDist;
  });

  console.log("🔄 FALLBACK: Candidates after distance filter:", fallbackCandidates.length);

  // If still no candidates, return empty results instead of all listings
  if (fallbackCandidates.length === 0) {
    console.log("🔄 FALLBACK: No candidates found even with relaxed filters");
    return {
      type: "closest",
      message: "No listings found within relaxed search parameters",
      listings: [],
      nextCursor: null,
    };
  }

  // Calculate fallback scores with strict prioritization
  const scoredFallbackListings = fallbackCandidates.map((listing) => {
    const distanceKm = haversineKm(lat, lng, (listing as any).latitude || 0, (listing as any).longitude || 0);
    let score = 0;

    // 1. Price match (40% weight) - prioritize staying close to original range
    if (minPrice != null && maxPrice != null) {
      const userPriceRange = maxPrice - minPrice;
      const userPriceMid = (minPrice + maxPrice) / 2;
      const priceDiff = Math.abs(listing.price - userPriceMid);
      const priceScore = Math.max(0, 100 - (priceDiff / userPriceRange) * 100);
      score += priceScore * 0.40;
    }

    // 2. Distance match (30% weight) - prioritize closer listings
    const maxDist = distance ? Math.min(distance * 2, MAX_FALLBACK_DISTANCE) : MAX_FALLBACK_DISTANCE;
    const distanceScore = Math.max(0, 100 - (distanceKm / maxDist) * 100);
    score += distanceScore * 0.30;

    // 3. Room type match (10% weight) - check if any room matches the requested type
    let roomTypeScore = 50;
    if (roomType && (listing as any).rooms && Array.isArray((listing as any).rooms) && (listing as any).rooms.some((room: any) => room.roomType === roomType)) {
      roomTypeScore = 100;
    }
    score += roomTypeScore * 0.10;

    // 4. Amenities match (10% weight) - prioritize listings with requested amenities
    let amenitiesScore = 50;
    if (amenities && Array.isArray(amenities) && amenities.length > 0) {
      const amenitiesMatch = amenities.filter((amenity: string) => {
        const amenityKey = amenity.toLowerCase().replace(/\s+/g, '');
        switch(amenityKey) {
          case 'wifi':
            return (listing as any).amenities?.wifi;
          case 'parking':
            return (listing as any).amenities?.parking;
          case 'pool':
            return (listing as any).amenities?.pool;
          case 'gym':
            return (listing as any).amenities?.gym;
          case 'airconditioning':
          case 'airconditioner':
            return (listing as any).amenities?.airConditioning;
          case 'laundry':
            return (listing as any).amenities?.laundry;
          default:
            return false;
        }
      }).length;
      amenitiesScore = (amenitiesMatch / amenities.length) * 100;
    }
    score += amenitiesScore * 0.10;

    // 5. Rules/features match (10% weight)
    let rulesFeaturesScore = 50;
    const rulesFeatures = [
      { key: "visitorsAllowed", value: visitorsAllowed },
      { key: "petsAllowed", value: petsAllowed },
      { key: "smokingAllowed", value: smokingAllowed },
      { key: "security24h", value: security24h },
      { key: "cctv", value: cctv },
      { key: "fireSafety", value: fireSafety },
      { key: "nearTransport", value: nearTransport },
      { key: "studyFriendly", value: studyFriendly },
      { key: "quietEnvironment", value: quietEnvironment },
      { key: "flexibleLease", value: flexibleLease },
    ];

    let matchedCount = 0;
    let totalCount = 0;

    rulesFeatures.forEach((rule) => {
      if (rule.value) {
        totalCount++;
        if (listing[rule.key as keyof typeof listing]) {
          matchedCount++;
        }
      }
    });

    if (totalCount > 0) {
      rulesFeaturesScore = (matchedCount / totalCount) * 100;
    }
    score += rulesFeaturesScore * 0.10;

    const embeddingText = generateEmbeddingText(listing);

    return {
      ...listing,
      score: Math.round(score),
      embeddingText,
    };
  });

  // Sort by score descending
  const sortedFallbackListings = scoredFallbackListings.sort((a: any, b: any) => b.score - a.score);

  // Apply minimum score threshold to avoid returning irrelevant listings
  const MIN_SCORE_THRESHOLD = 40;
  const relevantListings = sortedFallbackListings.filter((listing: any) => listing.score >= MIN_SCORE_THRESHOLD);

  console.log("🔄 FALLBACK: Relevant Listings (score ≥ 40):", relevantListings.length);

  // Pagination
  const paginatedFallbackListings = relevantListings.slice(0, LISTINGS_BATCH);
  let nextCursor = null;
  if (relevantListings.length > LISTINGS_BATCH) {
    nextCursor = relevantListings[LISTINGS_BATCH - 1].id;
  }

  console.log("🔄 FALLBACK: Final Results Returned:", paginatedFallbackListings.length);

  return {
    type: "closest",
    message: paginatedFallbackListings.length > 0
      ? "No exact matches found. Showing closest listings within relaxed parameters."
      : "No listings found within relaxed search parameters",
    listings: paginatedFallbackListings,
    nextCursor,
  };
};

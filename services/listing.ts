import { db } from "@/lib/db";
import { LISTINGS_BATCH, TAU_COORDINATES } from "@/utils/constants";
import { haversineKm } from "@/utils/helper";
import { getCurrentUser } from "./user";

// Fallback search function when no primary matches found
const getFallbackListings = async (parsedQuery: any) => {
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

  let where: any = {};

  // Public listing: only show active (approved) listings
  const includeAllStatuses = parsedQuery.includeAllStatuses;
  if (!includeAllStatuses) {
    where.status = "active";
  }

  if (userId) {
    where.userId = userId;
  }

  // Relaxed price range (±20%)
  const fallbackPriceCond: { gte?: number; lte?: number } = {};
  if (minPrice != null && minPrice > 0) {
    fallbackPriceCond.gte = Math.floor(minPrice * 0.8);
  }
  if (maxPrice != null && maxPrice > 0) {
    fallbackPriceCond.lte = Math.ceil(maxPrice * 1.2);
  }
  if (Object.keys(fallbackPriceCond).length) {
    where.price = fallbackPriceCond;
  }

  // Relaxed room count and guest count
  if (roomCount != null && roomCount > 0) {
    where.roomCount = { gte: Math.max(1, roomCount - 1) };
  }
  if (guestCount != null && guestCount > 0) {
    where.guestCount = { gte: Math.max(1, guestCount - 1) };
  }
  if (bathroomCount != null && bathroomCount > 0) {
    where.bathroomCount = { gte: Math.max(1, bathroomCount - 1) };
  }

  if (categoriesArr && Array.isArray(categoriesArr) && categoriesArr.length > 0) {
    where.category = { in: categoriesArr };
  } else if (category) {
    where.category = category;
  }

  const fallbackQuery: any = {
    where,
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      rooms: true,
      images: true,
    },
  };

  let fallbackCandidates = await db.listing.findMany(fallbackQuery);

  const lat = originLat != null ? originLat : TAU_COORDINATES[0];
  const lng = originLng != null ? originLng : TAU_COORDINATES[1];

  // Relax distance filter up to 20km
  const MAX_FALLBACK_DISTANCE = 20;
  fallbackCandidates = fallbackCandidates.filter((listing) => {
    if (!listing.latlng || listing.latlng.length < 2) return false;
    const [listingLat, listingLng] = listing.latlng;
    const dist = haversineKm(lat, lng, listingLat, listingLng);
    return dist <= (distance ? Math.max(distance * 2, MAX_FALLBACK_DISTANCE) : MAX_FALLBACK_DISTANCE);
  });

  // Calculate fallback scores
  const scoredFallbackListings = fallbackCandidates.map((listing) => {
    const distanceKm = haversineKm(lat, lng, listing.latlng[0], listing.latlng[1]);
    let score = 0;

    // Price score (30%)
    if (minPrice != null && maxPrice != null) {
      const userPriceRange = maxPrice - minPrice;
      const userPriceMid = (minPrice + maxPrice) / 2;
      const priceDiff = Math.abs(listing.price - userPriceMid);
      const priceScore = Math.max(0, 100 - (priceDiff / userPriceRange) * 100);
      score += priceScore * 0.30;
    }

    // Distance score (30%)
    const maxDist = distance ? Math.max(distance * 2, MAX_FALLBACK_DISTANCE) : MAX_FALLBACK_DISTANCE;
    const distanceScore = Math.max(0, 100 - (distanceKm / maxDist) * 100);
    score += distanceScore * 0.30;

    // Room type score (10%)
    let roomTypeScore = 50;
    if (roomType && listing.roomType === roomType) {
      roomTypeScore = 100;
    }
    score += roomTypeScore * 0.10;

    // Amenities score (15%)
    let amenitiesScore = 50;
    if (amenities && Array.isArray(amenities) && amenities.length > 0) {
      const amenitiesMatch = amenities.filter((amenity: string) =>
        listing.amenities.includes(amenity)
      ).length;
      amenitiesScore = (amenitiesMatch / amenities.length) * 100;
    }
    score += amenitiesScore * 0.15;

    // Rules/features score (15%)
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
    score += rulesFeaturesScore * 0.15;

    const embeddingText = generateEmbeddingText(listing);

    return {
      ...listing,
      score: Math.round(score),
      embeddingText,
    };
  });

  const sortedFallbackListings = scoredFallbackListings.sort((a: any, b: any) => b.score - a.score);
  const paginatedFallbackListings = sortedFallbackListings.slice(0, LISTINGS_BATCH);
  let nextCursor = null;
  if (sortedFallbackListings.length > LISTINGS_BATCH) {
    nextCursor = sortedFallbackListings[LISTINGS_BATCH - 1].id;
  }

  return {
    type: "closest",
    message: "No exact matches found. Showing closest listings.",
    listings: paginatedFallbackListings,
    nextCursor,
  };
};

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

export const getListings = async (query?: {
  [key: string]: string | string[] | undefined | null;
}) => {
  try {
    // Parse query parameters with proper type conversion
    const parsedQuery = {
      // Numbers
      roomCount: query?.roomCount ? parseInt(query.roomCount as string) : undefined,
      guestCount: query?.guestCount ? parseInt(query.guestCount as string) : undefined,
      bathroomCount: query?.bathroomCount ? parseInt(query.bathroomCount as string) : undefined,
      minPrice: query?.minPrice ? parseInt(query.minPrice as string) : undefined,
      maxPrice: query?.maxPrice ? parseInt(query.maxPrice as string) : undefined,
      distance: query?.distance ? parseInt(query.distance as string) : undefined,
      originLat: query?.originLat ? parseFloat(query.originLat as string) : undefined,
      originLng: query?.originLng ? parseFloat(query.originLng as string) : undefined,

      // Booleans
      femaleOnly: query?.femaleOnly === "true",
      maleOnly: query?.maleOnly === "true",
      visitorsAllowed: query?.visitorsAllowed === "true",
      petsAllowed: query?.petsAllowed === "true",
      smokingAllowed: query?.smokingAllowed === "true",
      security24h: query?.security24h === "true",
      cctv: query?.cctv === "true",
      fireSafety: query?.fireSafety === "true",
      nearTransport: query?.nearTransport === "true",
      studyFriendly: query?.studyFriendly === "true",
      quietEnvironment: query?.quietEnvironment === "true",
      flexibleLease: query?.flexibleLease === "true",

      // Arrays
      amenities: Array.isArray(query?.amenities) ? query.amenities :
                 typeof query?.amenities === "string" ? [query.amenities] : undefined,
      categories: Array.isArray(query?.categories) ? query.categories :
                   typeof query?.categories === "string" ? [query.categories] : undefined,

      // Strings
      userId: query?.userId,
      country: query?.country,
      startDate: query?.startDate,
      endDate: query?.endDate,
      category: query?.category,
      cursor: query?.cursor,
      roomType: query?.roomType,
      moveInDate: query?.moveInDate,
      stayDuration: query?.stayDuration,
    };

    const {
      userId,
      roomCount,
      guestCount,
      bathroomCount,
      country,
      startDate,
      endDate,
      category,
      categories: categoriesArr,
      cursor,
      minPrice,
      maxPrice,
      amenities,
      roomType,
      distance,
      originLat,
      originLng,
      // Rules / Preferences
      femaleOnly,
      maleOnly,
      visitorsAllowed,
      petsAllowed,
      smokingAllowed,
      // Advanced Filters
      security24h,
      cctv,
      fireSafety,
      nearTransport,
      studyFriendly,
      quietEnvironment,
      flexibleLease,
      // Availability
      moveInDate,
      stayDuration,
    } = parsedQuery;

    // Calculate availability dates if provided
    let availabilityStartDate: string | null = null;
    let availabilityEndDate: string | null = null;
    if (moveInDate && stayDuration) {
      const moveIn = typeof moveInDate === 'string' ? moveInDate : String(moveInDate);
      const durationStr = typeof stayDuration === 'string' ? stayDuration : String(stayDuration);

      // Handle YYYY-MM format (e.g., "2026-04") by adding day 1
      const normalizedMoveIn = moveIn.includes('-') && moveIn.length === 7 ? `${moveIn}-01` : moveIn;

      availabilityStartDate = normalizedMoveIn;
      const start = new Date(normalizedMoveIn);

      // Parse duration: "short-term" (3 months), "long-term" (12 months), or numeric
      let duration: number;
      if (durationStr === "short-term") {
        duration = 3;
      } else if (durationStr === "long-term") {
        duration = 12;
      } else {
        duration = parseInt(durationStr) || 1;
      }

      const end = new Date(start);
      end.setMonth(start.getMonth() + duration);
      availabilityEndDate = end.toISOString().split('T')[0];
    }

    // Tier 1: Primary Filters (Required - must match strictly)
    let where: any = {};

    // Public listing: only show active (approved) listings unless includeAllStatuses is set (admin)
    const includeAllStatuses = query?.includeAllStatuses === "true";
    if (!includeAllStatuses) {
      where.status = "active";
    }

    if (userId) {
      where.userId = userId;
    }

    // Price range (strict)
    const priceCond: { gte?: number; lte?: number } = {};
    if (minPrice != null && minPrice > 0) priceCond.gte = minPrice;
    if (maxPrice != null && maxPrice > 0) priceCond.lte = maxPrice;
    if (Object.keys(priceCond).length) where.price = priceCond;

    // Guest count (strict)
    if (guestCount != null && guestCount > 0) {
      where.guestCount = { gte: guestCount };
    }

    // Room type (strict)
    if (roomType) {
      where.roomType = roomType;
    }

    // Gender restrictions (strict) - mutually exclusive
    if (femaleOnly) {
      where.femaleOnly = true;
    } else if (maleOnly) {
      where.maleOnly = true;
    }

    if (categoriesArr && Array.isArray(categoriesArr) && categoriesArr.length > 0) {
      where.category = { in: categoriesArr };
    } else if (category) {
      where.category = category;
    }

    // Availability filtering (strict)
    if (availabilityStartDate && availabilityEndDate) {
      where.NOT = {
        reservations: {
          some: {
            OR: [
              { endDate: { gte: new Date(availabilityStartDate) }, startDate: { lte: new Date(availabilityStartDate) } },
              { startDate: { lte: new Date(availabilityEndDate) }, endDate: { gte: new Date(availabilityEndDate) } },
            ],
          },
        },
      };
    }

    // Get primary filter matches
    const primaryQuery: any = {
      where,
      take: 200,
      orderBy: { createdAt: "desc" },
      include: {
        rooms: true,
        images: true,
      },
    };

    let primaryListings = await db.listing.findMany(primaryQuery);

    // If no primary listings found, trigger fallback immediately
    if (primaryListings.length === 0) {
      return await getFallbackListings(parsedQuery);
    }

    const lat = originLat != null ? originLat : TAU_COORDINATES[0];
    const lng = originLng != null ? originLng : TAU_COORDINATES[1];

    // Apply distance filter (strict)
    if (distance != null && distance >= 0) {
      primaryListings = primaryListings.filter((listing) => {
        if (!listing.latlng || listing.latlng.length < 2) return false;
        const [listingLat, listingLng] = listing.latlng;
        return haversineKm(lat, lng, listingLat, listingLng) <= distance;
      });
    }

    // Calculate scores for all primary listings (including secondary filter scoring)
    const scoredListings = primaryListings.map((listing) => {
      const distanceKm = haversineKm(lat, lng, listing.latlng[0], listing.latlng[1]);

      // Calculate secondary filter scores
      let score = 100; // Base score for meeting primary filters
      let secondaryScore = 0;
      let secondaryTotal = 0;

      // Amenities match (secondary filter)
      if (amenities && Array.isArray(amenities) && amenities.length > 0) {
        secondaryTotal += amenities.length;
        const amenitiesMatch = amenities.filter((amenity: string) =>
          listing.amenities.includes(amenity)
        ).length;
        secondaryScore += amenitiesMatch;
      }

      // Rules match (secondary filter)
      const rules = [
        { key: "visitorsAllowed", value: visitorsAllowed },
        { key: "petsAllowed", value: petsAllowed },
        { key: "smokingAllowed", value: smokingAllowed },
      ];

      // Advanced features match (secondary filter)
      const advancedFeatures = [
        { key: "security24h", value: security24h },
        { key: "cctv", value: cctv },
        { key: "fireSafety", value: fireSafety },
        { key: "nearTransport", value: nearTransport },
        { key: "studyFriendly", value: studyFriendly },
        { key: "quietEnvironment", value: quietEnvironment },
        { key: "flexibleLease", value: flexibleLease },
      ];

      [...rules, ...advancedFeatures].forEach((rule) => {
        if (rule.value) {
          secondaryTotal++;
          if ((listing as any)[rule.key]) {
            secondaryScore++;
          }
        }
      });

      // Calculate final score with secondary filter contribution
      if (secondaryTotal > 0) {
        const secondaryPercentage = (secondaryScore / secondaryTotal) * 50; // 50% of total score is secondary
        score = 50 + secondaryPercentage; // 50% for primary, 50% for secondary
      }

      const embeddingText = generateEmbeddingText(listing);

      return {
        ...listing,
        score: Math.round(score),
        embeddingText,
      };
    });

    // Sort by score descending, then price ascending, then distance ascending
    const sortedListings = scoredListings.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (a.price !== b.price) {
        return a.price - b.price;
      }
      const distA = haversineKm(lat, lng, a.latlng[0], a.latlng[1]);
      const distB = haversineKm(lat, lng, b.latlng[0], b.latlng[1]);
      return distA - distB;
    });



    // Pagination
    let paginatedListings: any[] = [];
    let nextCursor = null;

    if (cursor) {
      // Get listings after cursor
      const cursorIndex = sortedListings.findIndex(listing => listing.id === cursor);
      if (cursorIndex !== -1 && cursorIndex < sortedListings.length - 1) {
        paginatedListings = sortedListings.slice(cursorIndex + 1, cursorIndex + 1 + LISTINGS_BATCH);
        if (cursorIndex + 1 + LISTINGS_BATCH < sortedListings.length) {
          nextCursor = paginatedListings[paginatedListings.length - 1].id;
        }
      }
    } else {
      // Get first page
      paginatedListings = sortedListings.slice(0, LISTINGS_BATCH);
      if (sortedListings.length > LISTINGS_BATCH) {
        nextCursor = paginatedListings[paginatedListings.length - 1].id;
      }
    }

    // Fallback logic: If no listings match primary filters, relax filters
    if (paginatedListings.length === 0 && sortedListings.length === 0) {
      return await getFallbackListings(parsedQuery);
    }

    // Determine response type
    const hasExactMatches = sortedListings.some(listing => listing.score === 100);

    return {
      type: hasExactMatches ? "exact" : "closest",
      message: hasExactMatches
        ? "Exact matches found"
        : "No exact match, showing closest listings",
      listings: paginatedListings,
      nextCursor,
    };
  } catch (error) {
    console.error("Search error:", error);
    return {
      type: "exact",
      listings: [],
      nextCursor: null,
    };
  }
};

export const getListingById = async (id: string) => {
  const listing = await db.listing.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      reservations: {
        select: {
          startDate: true,
          endDate: true,
        },
      },
      images: {
        orderBy: {
          order: "asc",
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      rooms: true,
    },
  });

  return listing;
};

export const createListing = async (data: { [x: string]: any }) => {
  const {
    category,
    location: { region, label: country, latlng },
    guestCount,
    bathroomCount,
    roomCount,
    image: imageSrc,
    price,
    title,
    description,
    amenities,
    roomType,
    // Rules / Preferences
    femaleOnly,
    maleOnly,
    visitorsAllowed,
    petsAllowed,
    smokingAllowed,
    // Advanced Filters
    security24h,
    cctv,
    fireSafety,
    nearTransport,
    studyFriendly,
    quietEnvironment,
    flexibleLease,
  } = data;

  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized!");

  const listing = await db.listing.create({
    data: {
      title,
      description,
      imageSrc,
      category,
      roomCount,
      bathroomCount,
      guestCount,
      country,
      region,
      latlng,
      price: parseInt(price, 10),
      userId: user.id,
      amenities,
      roomType,
      // Rules / Preferences
      femaleOnly,
      maleOnly,
      visitorsAllowed,
      petsAllowed,
      smokingAllowed,
      // Advanced Filters
      security24h,
      cctv,
      fireSafety,
      nearTransport,
      studyFriendly,
      quietEnvironment,
      flexibleLease,
    },
  });

  return listing;
};

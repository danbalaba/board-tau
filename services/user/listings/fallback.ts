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
export const getFallbackListings = async (parsedQuery: any) => {
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

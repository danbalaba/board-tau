import { db } from "@/lib/db";
import { LISTINGS_BATCH, TAU_COORDINATES } from "@/utils/constants";
import { haversineKm } from "@/utils/helper";
import { getCurrentUser } from "../user";
import { getFallbackListings } from "./fallback";
import { cache } from "@/lib/redis";

// Generate AI-ready embedding text
const generateEmbeddingText = (listing: any): string => {
  const parts = [
    listing.title,
    listing.description,
    // BoardTAU Philippine-specific context
    ...(listing.amenities_list || []),
    ...(listing.category || []),
    // Detailed rules
    listing.rules?.femaleOnly ? "female only boarding house" : "",
    listing.rules?.maleOnly ? "male only boarding house" : "",
    listing.rules?.visitorsAllowed ? "visitors allowed" : "visitors strictly prohibited",
    listing.rules?.petsAllowed ? "pet friendly" : "",
    // High-value safety features
    listing.features?.security24h ? "24/7 security guard" : "",
    listing.features?.cctv ? "CCTV monitoring" : "",
    listing.features?.nearTransport ? "near public transport tricycle" : "",
    listing.features?.studyFriendly ? "quiet study friendly environment" : "",
  ];

  return parts.filter(Boolean).join(" ").toLowerCase();
};

export const getListings = async (query?: {
  [key: string]: string | string[] | undefined | null;
}) => {
  try {
    // 1. Generate stable cache key
    const cacheKey = cache.generateKey('listings', query);

    // 2. Try to get from cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Parse query parameters with proper type conversion
    const parsedQuery = {
      // Numbers
      minPrice: query?.minPrice ? parseInt(query.minPrice as string) : undefined,
      maxPrice: query?.maxPrice ? parseInt(query.maxPrice as string) : undefined,
      distance: query?.distance ? parseInt(query.distance as string) : undefined,
      originLat: query?.originLat ? parseFloat(query.originLat as string) : undefined,
      originLng: query?.originLng ? parseFloat(query.originLng as string) : undefined,
      capacity: query?.capacity ? parseInt(query.capacity as string) : undefined,
      availableSlots: query?.availableSlots ? parseInt(query.availableSlots as string) : undefined,
      roomSize: query?.roomSize ? parseFloat(query.roomSize as string) : undefined,

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
      roomAmenities: Array.isArray(query?.roomAmenities) ? query.roomAmenities :
                 typeof query?.roomAmenities === "string" ? [query.roomAmenities] : undefined,
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
      bedType: query?.bedType,
      moveInDate: query?.moveInDate,
      stayDuration: query?.stayDuration,
    };

    const {
      userId,
      country,
      startDate,
      endDate,
      category,
      categories: categoriesArr,
      cursor,
      minPrice,
      maxPrice,
      amenities,
      roomAmenities,
      roomType,
      bedType,
      capacity,
      availableSlots,
      roomSize,
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

    // Validate inputs
    if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
      console.log("⚠️ PRICE RANGE INVALID: minPrice > maxPrice");
      return {
        type: "exact",
        message: "Minimum price cannot be greater than maximum price",
        listings: [],
        nextCursor: null,
      };
    }

    if (femaleOnly && maleOnly) {
      console.log("⚠️ CONFLICTING GENDER FILTERS: Both maleOnly and femaleOnly are true");
      return {
        type: "exact",
        message: "No listings match both gender filters",
        listings: [],
        nextCursor: null,
      };
    }

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

    // Tier 1: Primary Filters (Room-level - strict)
    const roomWhere: any = {};

    if (roomType) {
      roomWhere.roomType = roomType;
    }

    if (bedType) {
      roomWhere.bedType = bedType;
    }

    if (capacity != null && capacity > 0) {
      roomWhere.capacity = { gte: capacity };
    }

    if (availableSlots != null && availableSlots > 0) {
      roomWhere.availableSlots = { gte: availableSlots };
    }

    if (roomSize != null && roomSize > 0) {
      roomWhere.size = { gte: roomSize };
    }

    const roomPriceCond: { gte?: number; lte?: number } = {};
    if (minPrice != null && minPrice > 0) roomPriceCond.gte = minPrice;
    if (maxPrice != null && maxPrice > 0) roomPriceCond.lte = maxPrice;
    if (Object.keys(roomPriceCond).length) roomWhere.price = roomPriceCond;

    if (roomAmenities && Array.isArray(roomAmenities) && roomAmenities.length > 0) {
      roomWhere.amenities = { hasEvery: roomAmenities };
    }

    // Tier 2: Listing-level Filters (secondary)
    const listingWhere: any = {};

    // Public listing: only show active (approved) listings unless includeAllStatuses is set (admin)
    const includeAllStatuses = query?.includeAllStatuses === "true";
    if (!includeAllStatuses) {
      listingWhere.status = "active";
    }

    if (userId) {
      listingWhere.userId = userId;
    }

    if (categoriesArr && Array.isArray(categoriesArr) && categoriesArr.length > 0) {
      // Use denormalized category array for fast search
      listingWhere.category = { hasSome: categoriesArr };
    } else if (category) {
      listingWhere.category = { hasSome: [category] };
    }

    if (amenities && Array.isArray(amenities) && amenities.length > 0) {
      // Use denormalized amenities_list array
      listingWhere.amenities_list = { hasSome: amenities };
    }

    // Gender restrictions (listing-level)
    if (femaleOnly) {
      listingWhere.femaleOnly = true;
    } else if (maleOnly) {
      listingWhere.maleOnly = true;
    }

    // Other listing-level rules
    if (visitorsAllowed) listingWhere.visitorsAllowed = true;
    if (petsAllowed) listingWhere.petsAllowed = true;
    if (smokingAllowed) listingWhere.smokingAllowed = true;
    if (security24h) listingWhere.security24h = true;
    if (cctv) listingWhere.cctv = true;
    if (fireSafety) listingWhere.fireSafety = true;
    if (nearTransport) listingWhere.nearTransport = true;
    if (studyFriendly) listingWhere.studyFriendly = true;
    if (quietEnvironment) listingWhere.quietEnvironment = true;
    if (flexibleLease) listingWhere.flexibleLease = true;

    // Availability filtering (strict)
    if (availabilityStartDate && availabilityEndDate) {
      listingWhere.NOT = {
        reservations: {
          some: {
            OR: [
              { endDate: { gte: new Date(availabilityStartDate) }, startDate: { lte: new Date(availabilityStartDate) } },
              { startDate: { lte: new Date(availabilityEndDate) }, endDate: { gte: new Date(availabilityEndDate) } },
              { startDate: { gte: new Date(availabilityStartDate) }, endDate: { lte: new Date(availabilityEndDate) } },
            ],
          },
        },
      };
    }

    // Query listings with rooms that match all primary filters
     const primaryQuery: any = {
      where: {
        ...listingWhere,
        rooms: {
          some: {
            ...roomWhere,
          },
        },
      },
      take: 200,
      orderBy: { createdAt: "desc" },
      include: {
        rooms: {
          where: roomWhere,
        },
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

    let primaryListings = await db.listing.findMany(primaryQuery);

    // If no primary listings found, trigger fallback immediately
    if (primaryListings.length === 0) {
      const fallbackResult = await getFallbackListings(parsedQuery);
      
      // Cache fallback results for a shorter time (2 minutes)
      await cache.set(cacheKey, fallbackResult, 120);
      
      return fallbackResult;
    }

    const lat = originLat != null ? originLat : TAU_COORDINATES[0];
    const lng = originLng != null ? originLng : TAU_COORDINATES[1];

     // Apply distance filter (strict)
    if (distance != null && distance >= 0) {
      primaryListings = primaryListings.filter((listing) => {
        if ((listing as any).latitude == null || (listing as any).longitude == null) return false;
        return haversineKm(lat, lng, (listing as any).latitude, (listing as any).longitude) <= distance;
      });
    }

    // Calculate scores for all primary listings (Heuristic v2.0)
    const scoredListings = primaryListings.map((listing) => {
      // 1. Calculate Secondary Filter Scores (Weighted 50%)
      let secondaryScore = 0;
      let secondaryTotal = 0;

      // Amenities match (secondary filter score)
      if (amenities && Array.isArray(amenities) && amenities.length > 0) {
        secondaryTotal += amenities.length;
        const amenitiesMatch = amenities.filter((a: string) => 
          (listing as any).amenities_list?.some((la: string) => la.toLowerCase() === a.toLowerCase())
        ).length;
        secondaryScore += amenitiesMatch;
      }

      // Rules / General Filters match
      const secondaries = [
        { val: visitorsAllowed, key: "visitorsAllowed", type: 'rule' },
        { val: petsAllowed, key: "petsAllowed", type: 'rule' },
        { val: smokingAllowed, key: "smokingAllowed", type: 'rule' },
      ];

      secondaries.forEach((s) => {
        if (s.val) {
          secondaryTotal++;
          if ((listing as any).rules?.[s.key]) secondaryScore++;
        }
      });

      // Calculate secondary contribution (max 50 points)
      const secondaryPoints = secondaryTotal > 0 
        ? (secondaryScore / secondaryTotal) * 50 
        : 50; // Full points if no secondary filters selected

      // 2. Advanced Feature Multipliers (Bonus Points - Up to +40 based on docs)
      // These are applied even if the user DIDN'T explicitly filter for them.
      // But if they DID filter for them (in advancedSelected), we give them more weight.
      
      let bonusPoints = 0;
      const f = (listing as any).features;
      if (f?.cctv) bonusPoints += 15;
      if (f?.security24h) bonusPoints += 10;
      if (f?.nearTransport) bonusPoints += 10;
      if (f?.studyFriendly) bonusPoints += 5;

      // 3. Final Heuristic Score (Base 50 for Primary + max 50 for Secondary + Bonus)
      // We cap the total score at 100 for display normalization.
      const finalScore = Math.min(100, (50 + secondaryPoints + (bonusPoints / 40) * 10));

      const embeddingText = generateEmbeddingText(listing);

      return {
        ...listing,
        score: Math.round(finalScore),
        embeddingText,
      };
    });

    // Sort by score descending, then price ascending, then distance ascending
    const sortedListings = scoredListings.sort((a: any, b: any) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // Find the minimum room price for each listing
      const minRoomPriceA = Math.min(...a.rooms.map((room: any) => room.price));
      const minRoomPriceB = Math.min(...b.rooms.map((room: any) => room.price));
      if (minRoomPriceA !== minRoomPriceB) {
        return minRoomPriceA - minRoomPriceB;
      }
      const distA = haversineKm(lat, lng, a.latitude, a.longitude);
      const distB = haversineKm(lat, lng, b.latitude, b.longitude);
      return distA - distB;
    });

    // Pagination
    let paginatedListings: any[] = [];
    let nextCursor = null;

    if (cursor) {
      // Get listings after cursor
      const cursorIndex = sortedListings.findIndex((listing) => listing.id === cursor);
      if (cursorIndex !== -1) {
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

    const response = {
      type: "exact" as const,
      message: "Showing exact matches",
      listings: paginatedListings,
      nextCursor,
    };

    // Cache the result for 10 minutes
    await cache.set(cacheKey, response, 600);

    return response;
  } catch (error) {
    console.error("Error getting listings:", error);
    return {
      type: "error",
      message: "Failed to get listings",
      listings: [],
      nextCursor: null,
    };
  }
};

export const getListingById = async (id: string) => {
  const cacheKey = `listing:id:${id}`;
  
  // Try cache
  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

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
      rooms: {
        include: {
          images: true,
        },
      },
      amenities: true,
      rules: true,
      features: true,
      categories: {
        include: {
          category: true,
        },
      },
    },
  });

  if (listing) {
    // Cache individual listing for 30 minutes
    await cache.set(cacheKey, listing, 1800);
  }

  return listing;
};

export const createListing = async (data: { [x: string]: any }) => {
  const {
    category,
    location: { region, label: country, latlng },
    roomCount,
    bathroomCount,
    guestCount = 1,
    image: imageSrc,
    price,
    title,
    description,
    amenities,
    rooms,
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
      roomCount,
      bathroomCount,

      country,
      region,
      latitude: latlng[0],
      longitude: latlng[1],
      location: {
        type: "Point",
        coordinates: [latlng[0], latlng[1]],
      },
      price: parseInt(price, 10),
      userId: user.id,
      category: Array.isArray(category) ? category : category ? [category] : [],
      amenities_list: Array.isArray(amenities) ? amenities : [],
      amenities: {
        create: {
          wifi: amenities.includes("WiFi"),
          parking: amenities.includes("Parking"),
          cookingAllowed: amenities.includes("Kitchen Access") || amenities.includes("Kitchen / Cooking Allowed"),
          waterDispenser: amenities.includes("Water Dispenser"),
          sariSariStore: amenities.includes("Store Nearby") || amenities.includes("Sari-Sari Store / Canteen Nearby"),
          commonTV: amenities.includes("Common TV"),
          kitchen: amenities.includes("Kitchen Access"),
          gated: amenities.includes("Gated / Secure"),
          airConditioning: amenities.includes("Air conditioning"),
          laundry: amenities.includes("Laundry area") || amenities.includes("Laundry Area / Sampayan"),
        },
      } as any,
      rules: {
        create: {
          femaleOnly,
          maleOnly,
          visitorsAllowed,
          petsAllowed,
          smokingAllowed,
        },
      } as any,
      features: {
        create: {
          security24h,
          cctv,
          fireSafety,
          nearTransport,
          studyFriendly,
          quietEnvironment,
          flexibleLease,
        },
      } as any,
      rooms: {
        create: rooms,
      },
    } as any,
  });

  // ⚡ INVALDATION: Clear all listings caches when a new listing is created
  await cache.delPattern("listings:*");

  return listing;
};

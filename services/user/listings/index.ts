import { db } from "@/lib/db";
import { LISTINGS_BATCH } from "@/utils/constants";
import { cache } from "@/lib/redis";

/**
 * Get active listings for the initial home page feed and simple listing queries
 */
export const getListings = async (query?: {
  [key: string]: string | string[] | undefined | null;
}) => {
  try {
    const cacheKey = cache.generateKey("listings", query);
    const cachedData = await cache.get(cacheKey);
    if (cachedData && Array.isArray(cachedData.listings) && cachedData.listings.length > 0) {
      return cachedData;
    } else if (cachedData) {
      await cache.del(cacheKey);
    }

    const cursor = typeof query?.cursor === "string" ? query.cursor : undefined;
    const userId = typeof query?.userId === "string" ? query.userId : undefined;
    const propertyTypeId = typeof query?.propertyTypeId === "string" ? query.propertyTypeId : undefined;
    const includeAllStatuses = query?.includeAllStatuses === "true";

    const where: any = {};
    if (!includeAllStatuses) {
      where.status = "ACTIVE";
    }
    if (userId) {
      where.userId = userId;
    }
    if (propertyTypeId) {
      where.propertyTypeId = propertyTypeId;
    }

    const limit = LISTINGS_BATCH;
    const listings = await db.listing.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        rooms: {
          where: { isArchived: false },
          include: {
            images: true,
            roomTypeDefinition: true,
            roomLinks: {
              include: { attribute: true },
            },
          },
        },
        images: {
          orderBy: { order: "asc" },
        },
        listingLinks: {
          include: { attribute: true },
        },
        propertyType: true,
        reviews: {
          where: { status: "approved" },
          select: { rating: true },
        },
      },
    });

    const hasMore = listings.length > limit;
    const items = hasMore ? listings.slice(0, limit) : listings;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    const response = {
      type: "exact" as const,
      message: "Showing active listings",
      listings: items,
      nextCursor,
    };

    if (response.listings.length > 0) {
      await cache.set(cacheKey, response, 600);
    }

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

/**
 * Fetch a single listing by ID with full relations for detail view
 */
export const getListingById = async (id: string) => {
  const cacheKey = `listing:id:${id}`;

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
          id: true,
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
        where: {
          status: "approved",
        },
        select: {
          id: true,
          rating: true,
          comment: true,
          images: true,
          videos: true,
          likedIds: true,
          response: true,
          respondedAt: true,
          createdAt: true,
          cleanliness: true,
          accuracy: true,
          communication: true,
          location: true,
          value: true,
          reservationId: true,
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
          roomTypeDefinition: true,
          roomLinks: {
            include: { attribute: true },
          },
        },
      },
      listingLinks: { include: { attribute: true } },
      propertyType: true,
      leaseContracts: {
        include: {
          signatures: true,
        },
      },
    },
  });

  if (listing) {
    await cache.set(cacheKey, listing, 1800);
  }

  return listing;
};

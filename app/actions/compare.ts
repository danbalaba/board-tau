"use server";

import { db } from "@/lib/db";
import { cache } from "@/lib/redis";

export async function getComparedListings(ids: string[]) {
  if (!ids || ids.length === 0) return [];

  // Deterministic cache key based on sorted listing IDs
  const sortedIds = [...ids].sort().join("_");
  const cacheKey = cache.generateKey("compare:listings", { ids: sortedIds });

  try {
    // 1. Check Redis cache first
    const cachedData = await cache.get(cacheKey);
    if (cachedData && Array.isArray(cachedData) && cachedData.length === ids.length) {
      // Re-order to match requested array order
      return ids
        .map((id) => cachedData.find((l: any) => l.id === id))
        .filter(Boolean);
    }

    // 2. Cache miss: Query PostgreSQL database
    const listings = await db.listing.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: {
        user: {
          select: { name: true, image: true }
        },
        reviews: true,
        images: true,
        propertyType: true,
        listingLinks: {
          include: { attribute: true }
        },
        rooms: {
          where: {
            status: "AVAILABLE",
            isArchived: false,
          },
          include: {
            roomLinks: {
              include: { attribute: true }
            }
          }
        },
      },
    });

    const orderedListings = ids
      .map((id) => listings.find((l: any) => l.id === id))
      .filter(Boolean);

    // 3. Store in Redis for 30 minutes (1800s)
    if (orderedListings.length > 0) {
      await cache.set(cacheKey, orderedListings, 1800);
    }

    return orderedListings;
  } catch (error) {
    console.error("Error fetching compared listings:", error);
    return [];
  }
}


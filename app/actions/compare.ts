"use server";

import { db } from "@/lib/db";

export async function getComparedListings(ids: string[]) {
  if (!ids || ids.length === 0) return [];

  try {
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
        amenities: true,
        rules: true,
        reviews: true,
        features: true,
        images: true,
        categories: {
          include: { category: true }
        },
        rooms: {
          where: {
            status: "AVAILABLE",
            isArchived: false,
          },
        },
      },
    });

    // Ensure we return them in the same order they were selected
    return ids
      .map((id) => listings.find((l: any) => l.id === id))
      .filter(Boolean);
  } catch (error) {
    console.error("Error fetching compared listings:", error);
    return [];
  }
}

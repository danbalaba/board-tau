"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "../user";
import { revalidatePath } from "next/cache";

export const getFavorites = async () => {
  try {
    const user = await getCurrentUser();
    console.log("getFavorites - user:", user);

    if (!user) return [];
    const data = await db.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        favoriteIds: true,
      },
    });

    console.log("getFavorites - data:", data);
    return data?.favoriteIds ?? [];
  } catch (error) {
    console.error("getFavorites - error:", error);
    return [];
  }
};

export const updateFavorite = async ({
  listingId,
  favorite,
}: {
  listingId: string;
  favorite: boolean;
}) => {
  try {
    if (!listingId || typeof listingId !== "string") {
      throw new Error("Invalid ID");
    }

    const favorites = await getFavorites();
    const currentUser = await getCurrentUser();
    
    console.log("Current user in updateFavorite:", currentUser);
    console.log("Current user ID:", currentUser?.id);
    console.log("Favorites:", favorites);

    if (!currentUser) {
      throw new Error("Please sign in to favorite the listing!");
    }
    
    if (!currentUser.id) {
      console.error("User object has no ID:", currentUser);
      throw new Error("Session error: User ID not found. Please sign out and sign in again.");
    }

    let newFavorites;
    let hasFavorited;

    if (!favorite) {
      newFavorites = favorites.filter((id) => id !== listingId);
      hasFavorited = false;
    } else {
      if (favorites.includes(listingId)) {
        newFavorites = [...favorites];
      } else {
        newFavorites = [listingId, ...favorites];
      }
      hasFavorited = true;
    }

    console.log("Updating user:", currentUser.id);
    console.log("New favorites:", newFavorites);
    
    // First verify the user exists in the database
    const userExists = await db.user.findUnique({
      where: { id: currentUser.id },
      select: { id: true, deletedAt: true },
    });
    
    console.log("User exists check:", userExists);
    
    if (!userExists) {
      console.error("User not found in database:", currentUser.id);
      throw new Error("User not found. Please sign out and sign in again.");
    }
    
    if (userExists.deletedAt) {
      console.error("User is soft-deleted:", currentUser.id);
      throw new Error("Your account has been deactivated. Please contact support.");
    }
    
    try {
      await db.user.update({
        where: {
          id: currentUser.id,
        },
        data: {
          favoriteIds: newFavorites,
        },
      });
      console.log("Update successful");
    } catch (dbError) {
      console.error("Database update error:", dbError);
      throw dbError;
    }

    revalidatePath("/");
    revalidatePath(`/listings/${listingId}`);
    revalidatePath("/favorites");

    return {
      hasFavorited,
    };
  } catch (error: any) {
    console.error("Favorite error:", error);
    // Return a more descriptive error message
    if (error.message?.includes("Please sign in")) {
      throw new Error("Please sign in to favorite the listing!");
    }
    throw new Error(error.message || "Failed to favorite listing");
  }
};

export const getFavoriteListings = async () => {
  try {
    const favoriteIds = await getFavorites();
    const favorites = await db.listing.findMany({
      where: {
        id: {
          in: [...(favoriteIds || [])],
        },
      },
    });

    return favorites;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

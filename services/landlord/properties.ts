"use server";

import { db } from "@/lib/db";
import { requireLandlord } from "@/lib/landlord";
import { LISTINGS_BATCH } from "@/utils/constants";
import { revalidatePath } from "next/cache";

export const getLandlordProperties = async (args?: { cursor?: string }) => {
  const landlord = await requireLandlord();

  const { cursor } = args || {};

  const filterQuery: any = {
    where: {
      userId: landlord.id,
    },
    take: LISTINGS_BATCH,
    orderBy: { createdAt: "desc" },
    include: {
      rooms: true,
      images: true,
    },
  };

  if (cursor) {
    filterQuery.cursor = { id: cursor };
    filterQuery.skip = 1;
  }

  const properties = await db.listing.findMany(filterQuery);

  const nextCursor =
    properties.length === LISTINGS_BATCH
      ? properties[LISTINGS_BATCH - 1].id
      : null;

  return {
    listings: properties,
    nextCursor,
  };
};

export const createProperty = async (data: any) => {
  const landlord = await requireLandlord();

  try {
    const {
      title,
      description,
      price,
      roomCount,
      bathroomCount,
      guestCount,
      category,
      roomType,
      country,
      region,
      latlng,
      amenities,
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
      images,
      rooms,
    } = data;

    // Create listing with pending status (needs admin approval)
    const listing = await db.listing.create({
      data: {
        title,
        description,
        price,
        roomCount,
        bathroomCount,
        guestCount,
        category,
        roomType,
        country,
        region,
        latlng,
        amenities,
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
        userId: landlord.id,
        status: "pending",
        imageSrc: images[0] || "",
        images: images.map((url: string, index: number) => ({
          url,
          order: index,
        })),
        rooms: rooms ? {
          create: rooms.map((room: any) => ({
            name: room.name,
            price: room.price,
            capacity: room.capacity,
            availableSlots: room.availableSlots,
            roomType: room.roomType,
            status: room.availableSlots > 0 ? "available" : "full",
          })),
        } : undefined,
      },
    });

    revalidatePath("/landlord/properties");

    return {
      success: true,
      data: listing,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create property",
    };
  }
};

export const updateProperty = async (propertyId: string, data: any) => {
  const landlord = await requireLandlord();

  try {
    const {
      title,
      description,
      price,
      roomCount,
      bathroomCount,
      guestCount,
      category,
      roomType,
      country,
      region,
      latlng,
      amenities,
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
      images,
      rooms,
    } = data;

    const listing = await db.listing.update({
      where: {
        id: propertyId,
        userId: landlord.id,
      },
      data: {
        title,
        description,
        price,
        roomCount,
        bathroomCount,
        guestCount,
        category,
        roomType,
        country,
        region,
        latlng,
        amenities,
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
        imageSrc: images[0] || "",
        images: {
          deleteMany: {},
          create: images.map((url: string, index: number) => ({
            url,
            order: index,
          })),
        },
        status: "pending", // Require re-approval when updated
      },
    });

    // Update rooms if provided
    if (rooms) {
      // Delete existing rooms
      await db.room.deleteMany({
        where: { listingId: propertyId },
      });

      // Create new rooms
      await db.room.createMany({
        data: rooms.map((room: any) => ({
          listingId: propertyId,
          name: room.name,
          price: room.price,
          capacity: room.capacity,
          availableSlots: room.availableSlots,
          roomType: room.roomType,
          status: room.availableSlots > 0 ? "available" : "full",
        })),
      });
    }

    revalidatePath("/landlord/properties");

    return {
      success: true,
      data: listing,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update property",
    };
  }
};

export const deleteProperty = async (propertyId: string) => {
  const landlord = await requireLandlord();

  try {
    await db.listing.deleteMany({
      where: {
        id: propertyId,
        userId: landlord.id,
      },
    });

    revalidatePath("/landlord/properties");

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete property",
    };
  }
};

export const updateListingStatus = async (propertyId: string, status: "active" | "inactive") => {
  const landlord = await requireLandlord();

  try {
    const listing = await db.listing.update({
      where: {
        id: propertyId,
        userId: landlord.id,
      },
      data: {
        status,
      },
    });

    revalidatePath("/landlord/properties");

    return {
      success: true,
      data: listing,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update status",
    };
  }
};

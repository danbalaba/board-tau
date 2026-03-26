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

export const getLandlordPropertyById = async (id: string) => {
  const landlord = await requireLandlord();

  const property = await db.listing.findFirst({
    where: {
      id,
      userId: landlord.id,
    },
    include: {
      amenities: true,
      rules: true,
      features: true,
      categories: {
        include: {
          category: true,
        },
      },
      images: true,
      rooms: true,
    },
  });

  return property;
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
      category,
    } = data;

    console.log("DEBUG: createProperty decoupled-start");
    
    // 0. Prepare safe data
    const safePrice = Number(price) || 0;
    const safeRoomCount = Number(roomCount) || 1;
    const safeBathroomCount = Number(bathroomCount) || 0;
    const safeLat = latlng?.[1] ?? 14.5995;
    const safeLng = latlng?.[0] ?? 120.9842;
    const safeAmenities = Array.isArray(amenities) ? amenities : [];
    const safeImages = Array.isArray(images) ? images : [];
    const safeCategory = Array.isArray(category) ? category : [];
    const safeRooms = Array.isArray(rooms) ? rooms : [];

    // 1. Create base listing
    const listing = await db.listing.create({
      data: {
        title: title || "Untitled Property",
        description: description || "",
        price: safePrice,
        roomCount: safeRoomCount,
        bathroomCount: safeBathroomCount,
        country: country || "Philippines",
        region: region || "",
        latitude: safeLat,
        longitude: safeLng,
        location: {
          type: "Point",
          coordinates: [safeLng, safeLat],
        },
        userId: landlord.id,
        status: "pending",
        imageSrc: safeImages[0] || "",
      },
    });
    console.log("DEBUG: Base listing created:", listing.id);

    // 2. Create Amenities
    await db.listingAmenity.create({
      data: {
        listingId: listing.id,
        wifi: safeAmenities.some((a: string) => String(a).toLowerCase().includes("wifi")),
        parking: safeAmenities.some((a: string) => String(a).toLowerCase().includes("parking")),
        pool: safeAmenities.some((a: string) => String(a).toLowerCase().includes("pool")),
        gym: safeAmenities.some((a: string) => String(a).toLowerCase().includes("gym")),
        airConditioning: safeAmenities.some((a: string) => String(a).toLowerCase().includes("air cond")),
        laundry: safeAmenities.some((a: string) => String(a).toLowerCase().includes("laundry")),
      }
    });
    console.log("DEBUG: Amenities created");

    // 3. Create Rules
    await db.listingRule.create({
      data: {
        listingId: listing.id,
        femaleOnly: !!femaleOnly,
        maleOnly: !!maleOnly,
        visitorsAllowed: visitorsAllowed !== false,
        petsAllowed: !!petsAllowed,
        smokingAllowed: !!smokingAllowed,
      }
    });
    console.log("DEBUG: Rules created");

    // 4. Create Features
    await db.listingFeature.create({
      data: {
        listingId: listing.id,
        security24h: !!security24h,
        cctv: !!cctv,
        fireSafety: !!fireSafety,
        nearTransport: nearTransport !== false,
        studyFriendly: studyFriendly !== false,
        quietEnvironment: !!quietEnvironment,
        flexibleLease: flexibleLease !== false,
      }
    });
    console.log("DEBUG: Features created");

    // 5. Create Categories
    if (safeCategory.length > 0) {
      for (const cat of safeCategory) {
        const categoryRecord = await db.category.upsert({
          where: { name: String(cat) },
          update: {},
          create: {
            name: String(cat),
            label: String(cat),
            icon: "default-icon",
          },
        });
        
        await db.listingCategory.create({
          data: {
            listingId: listing.id,
            categoryId: categoryRecord.id,
          }
        });
      }
      console.log("DEBUG: Categories created");
    }

    // 6. Create Images
    if (safeImages.length > 0) {
      for (let i = 0; i < safeImages.length; i++) {
        await db.listingImage.create({
          data: {
            listingId: listing.id,
            url: safeImages[i],
            order: i,
          }
        });
      }
      console.log("DEBUG: Images created");
    }

    // 7. Create Rooms
    if (safeRooms.length > 0) {
      for (const room of safeRooms) {
        // Normalize BedType to uppercase Enum member
        let bedType = "SINGLE";
        const bt = String(room.bedType || "").toUpperCase();
        if (bt.includes("DOUBLE")) bedType = "DOUBLE";
        else if (bt.includes("QUEEN")) bedType = "QUEEN";
        else if (bt.includes("BUNK")) bedType = "BUNK";

        const createdRoom = await db.room.create({
          data: {
            listingId: listing.id,
            name: room.name || "Room",
            price: Number(room.price) || 0,
            capacity: Number(room.capacity) || 1,
            availableSlots: Number(room.availableSlots) || 1,
            roomType: (room.roomType || "SOLO").toUpperCase() === "BEDSPACE" ? "BEDSPACE" : "SOLO",
            bedType: bedType as any,
            size: Number(room.size) || 0,
            reservationFee: Number(room.reservationFee) || 0,
            status: Number(room.availableSlots) > 0 ? "AVAILABLE" : "FULL",
          }
        });

        // Room Images
        if (room.images && room.images.length > 0) {
          for (let i = 0; i < room.images.length; i++) {
            await db.roomImage.create({
              data: {
                roomId: createdRoom.id,
                url: room.images[i],
                order: i,
              }
            });
          }
        }

        // Room Amenities
        if (room.amenities && room.amenities.length > 0) {
          for (const amenityName of room.amenities) {
            const amenityRecord = await db.roomAmenityType.upsert({
              where: { name: String(amenityName) },
              update: {},
              create: {
                name: String(amenityName),
                icon: "default-icon",
              },
            });

            await db.roomAmenity.create({
              data: {
                roomId: createdRoom.id,
                amenityTypeId: amenityRecord.id,
              }
            });
          }
        }
      }
      console.log("DEBUG: Rooms created");
    }

    revalidatePath("/landlord/properties");

    return {
      success: true,
      data: listing,
    };
  } catch (error) {
    console.error("DEBUG: createProperty error:", error);
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

    // First verify ownership and load current relations
    const existing = await db.listing.findFirst({
      where: {
        id: propertyId,
        userId: landlord.id,
      },
      include: {
        amenities: true,
        rules: true,
        features: true,
      }
    });

    if (!existing) {
      return { success: false, error: "Property not found or unauthorized" };
    }

    // Ensure numeric values are safe
    const safePrice = Number(price) || 0;
    const safeRoomCount = Number(roomCount) || 1;
    const safeBathroomCount = Number(bathroomCount) || 1;
    const safeLat = latlng?.[1] ?? 14.5995;
    const safeLng = latlng?.[0] ?? 120.9842;
    const safeAmenities = Array.isArray(amenities) ? amenities : [];
    const safeImages = Array.isArray(images) ? images : [];
    const safeCategory = Array.isArray(category) ? category : [];

    // 1. Update base listing
    const listing = await db.listing.update({
      where: {
        id: propertyId,
      },
      data: {
        title: title || existing.title,
        description: description || existing.description,
        price: safePrice,
        roomCount: safeRoomCount,
        bathroomCount: safeBathroomCount,
        country: country || existing.country,
        region: region || existing.region,
        latitude: safeLat,
        longitude: safeLng,
        location: {
          type: "Point",
          coordinates: [safeLng, safeLat],
        },
        imageSrc: safeImages[0] || existing.imageSrc,
        status: "pending", // Re-verify on edit
      },
    });

    console.log("DEBUG: Base listing updated:", listing.id);

    // 2. Update/Create Amenities
    if (amenities) {
      await db.listingAmenity.upsert({
        where: { listingId: propertyId },
        update: {
          wifi: safeAmenities.some((a: string) => String(a).toLowerCase().includes("wifi")),
          parking: safeAmenities.some((a: string) => String(a).toLowerCase().includes("parking")),
          pool: safeAmenities.some((a: string) => String(a).toLowerCase().includes("pool")),
          gym: safeAmenities.some((a: string) => String(a).toLowerCase().includes("gym")),
          airConditioning: safeAmenities.some((a: string) => String(a).toLowerCase().includes("air cond")),
          laundry: safeAmenities.some((a: string) => String(a).toLowerCase().includes("laundry")),
        },
        create: {
          listingId: propertyId,
          wifi: safeAmenities.some((a: string) => String(a).toLowerCase().includes("wifi")),
          parking: safeAmenities.some((a: string) => String(a).toLowerCase().includes("parking")),
          pool: safeAmenities.some((a: string) => String(a).toLowerCase().includes("pool")),
          gym: safeAmenities.some((a: string) => String(a).toLowerCase().includes("gym")),
          airConditioning: safeAmenities.some((a: string) => String(a).toLowerCase().includes("air cond")),
          laundry: safeAmenities.some((a: string) => String(a).toLowerCase().includes("laundry")),
        }
      });
    }

    // 3. Update/Create Rules
    await db.listingRule.upsert({
      where: { listingId: propertyId },
      update: {
        femaleOnly: !!femaleOnly,
        maleOnly: !!maleOnly,
        visitorsAllowed: visitorsAllowed !== false,
        petsAllowed: !!petsAllowed,
        smokingAllowed: !!smokingAllowed,
      },
      create: {
        listingId: propertyId,
        femaleOnly: !!femaleOnly,
        maleOnly: !!maleOnly,
        visitorsAllowed: visitorsAllowed !== false,
        petsAllowed: !!petsAllowed,
        smokingAllowed: !!smokingAllowed,
      }
    });

    // 4. Update/Create Features
    await db.listingFeature.upsert({
      where: { listingId: propertyId },
      update: {
        security24h: !!security24h,
        cctv: !!cctv,
        fireSafety: !!fireSafety,
        nearTransport: nearTransport !== false,
        studyFriendly: studyFriendly !== false,
        quietEnvironment: !!quietEnvironment,
        flexibleLease: flexibleLease !== false,
      },
      create: {
        listingId: propertyId,
        security24h: !!security24h,
        cctv: !!cctv,
        fireSafety: !!fireSafety,
        nearTransport: nearTransport !== false,
        studyFriendly: studyFriendly !== false,
        quietEnvironment: !!quietEnvironment,
        flexibleLease: flexibleLease !== false,
      }
    });

    // 5. Update Categories
    if (category) {
      await db.listingCategory.deleteMany({
        where: { listingId: propertyId },
      });
      for (const cat of safeCategory) {
        const categoryRecord = await db.category.upsert({
          where: { name: String(cat) },
          update: {},
          create: {
            name: String(cat),
            label: String(cat),
            icon: "default-icon",
          },
        });
        await db.listingCategory.create({
          data: {
            listingId: propertyId,
            categoryId: categoryRecord.id,
          }
        });
      }
    }

    // 6. Update Images
    if (images) {
      await db.listingImage.deleteMany({
        where: { listingId: propertyId },
      });
      for (let i = 0; i < safeImages.length; i++) {
        await db.listingImage.create({
          data: {
            listingId: propertyId,
            url: safeImages[i],
            order: i,
          }
        });
      }
    }

    // Update rooms if provided
    if (rooms) {
      // Delete existing rooms
      await db.room.deleteMany({
        where: { listingId: propertyId },
      });

      // Create new rooms
      for (const room of rooms) {
        // Normalize BedType
        let bedType = "SINGLE";
        const bt = String(room.bedType || "").toUpperCase();
        if (bt.includes("DOUBLE")) bedType = "DOUBLE";
        else if (bt.includes("QUEEN")) bedType = "QUEEN";
        else if (bt.includes("BUNK")) bedType = "BUNK";
        else if (bt.includes("SINGLE")) bedType = "SINGLE";

        const createdRoom = await db.room.create({
          data: {
            listingId: propertyId,
            name: room.name || "Room",
            price: Number(room.price) || 0,
            capacity: Number(room.capacity) || 1,
            availableSlots: Number(room.availableSlots) || 1,
            roomType: (room.roomType || "SOLO").toUpperCase() === "BEDSPACE" ? "BEDSPACE" : "SOLO",
            bedType: bedType as any,
            size: Number(room.size) || 0,
            reservationFee: Number(room.reservationFee) || 0,
            status: Number(room.availableSlots) > 0 ? "AVAILABLE" : "FULL",
            images: {
              create: (room.images || []).map((url: string, idx: number) => ({
                url,
                order: idx,
              })),
            },
          },
        });

        // Room Amenities
        if (room.amenities && room.amenities.length > 0) {
          for (const amenityName of room.amenities) {
            const amenityRecord = await db.roomAmenityType.upsert({
              where: { name: String(amenityName) },
              update: {},
              create: {
                name: String(amenityName),
                icon: "default-icon",
              },
            });

            await db.roomAmenity.create({
              data: {
                roomId: createdRoom.id,
                amenityTypeId: amenityRecord.id,
              }
            });
          }
        }
      }
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

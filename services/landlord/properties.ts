"use server";

import { db } from "@/lib/db";
import { requireLandlord } from "@/lib/landlord";
import { LISTINGS_BATCH } from "@/utils/constants";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { autoCategorizeListing } from "@/utils/categorizer";

export type LandlordPropertyResult = {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  roomCount: number;
  bathroomCount: number;
  imageSrc: string;
  createdAt: Date;
  isArchived: boolean;
  region?: string;
  country?: string;
  amenities?: {
    wifi: boolean;
    parking: boolean;
    pool: boolean;
    gym: boolean;
    airConditioning: boolean;
    laundry: boolean;
  } | null;
  rules?: {
    femaleOnly: boolean;
    maleOnly: boolean;
    visitorsAllowed: boolean;
    petsAllowed: boolean;
    smokingAllowed: boolean;
  } | null;
  features?: {
    security24h: boolean;
    cctv: boolean;
    fireSafety: boolean;
    nearTransport: boolean;
    studyFriendly: boolean;
    quietEnvironment: boolean;
    flexibleLease: boolean;
  } | null;
  categories?: {
    category: {
      name: string;
      label: string;
    };
  }[];
  rooms?: {
    id: string;
    name: string;
    price: number;
    capacity: number;
    availableSlots: number;
    roomType: string;
    bedType: string;
    size: number | null;
    reservationFee: number;
    amenities?: {
      amenityType: {
        name: string;
      };
    }[];
    images?: {
      url: string;
    }[];
  }[];
  images?: {
    url: string;
  }[];
  user?: {
    businessName: string | null;
    phoneNumber: string | null;
    email: string | null;
  } | null;
};

export type LandlordPropertiesResult = {
  listings: LandlordPropertyResult[];
  nextCursor: string | null;
};

export const getLandlordProperties = async (args?: { cursor?: string }): Promise<LandlordPropertiesResult> => {
  const landlord = await requireLandlord();

  const { cursor } = args || {};

  const filterQuery: Prisma.ListingFindManyArgs = {
    where: {
      userId: landlord.id,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      status: true,
      roomCount: true,
      bathroomCount: true,
      imageSrc: true,
      createdAt: true,
      isArchived: true,
      region: true,
      country: true,
      amenities: true,
      rules: true,
      features: true,
      amenities_list: true,
      rooms: {
        select: {
          id: true,
          name: true,
          price: true,
          capacity: true,
          availableSlots: true,
          roomType: true,
          bedType: true,
          size: true,
          images: {
            select: {
              url: true,
            }
          }
        }
      },
      categories: {
        include: {
          category: true,
        },
      },
      images: {
        select: {
          url: true,
          roomType: true,
          caption: true,
        }
      },
    }
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
    listings: properties as any,
    nextCursor,
  };
};

export const getLandlordPropertiesMinimal = async (): Promise<{ id: string; title: string }[]> => {
  const landlord = await requireLandlord();

  const properties = await db.listing.findMany({
    where: {
      userId: landlord.id,
    },
    select: {
      id: true,
      title: true,
      bathroomCount: true,
    },
    orderBy: { title: "asc" },
  });

  return properties;
};

export const getAllLandlordProperties = async (): Promise<LandlordPropertyResult[]> => {
  const landlord = await requireLandlord();

  // ============================================================
  // OPTIMIZED: Lightweight select instead of 6-level deep include
  // Callers (KBar, PDF report) only need: title, price, status,
  // region, roomCount, bathroomCount, createdAt, categories
  // ============================================================
  const properties = await db.listing.findMany({
    where: {
      userId: landlord.id,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      status: true,
      roomCount: true,
      bathroomCount: true,
      imageSrc: true,
      createdAt: true,
      isArchived: true,
      region: true,
      country: true,
      categories: {
        select: {
          category: {
            select: { name: true, label: true }
          }
        }
      },
      // Only fetch room count/summary — not full room + amenity + image trees
      rooms: {
        select: {
          id: true,
          name: true,
          price: true,
          capacity: true,
          availableSlots: true,
          roomType: true,
        }
      },
    },
  });

  return properties as any as LandlordPropertyResult[];
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
      flexibleLease,
      noCurfew,
      floodFree,
      backupPower,
      customRules,
      customFeatures,
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
    
    // SERVER-SIDE AUTO-CATEGORIZATION: Overrides frontend selection
    const safeCategory = autoCategorizeListing(data);
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
        imageSrc: typeof safeImages[0] === 'object' ? (safeImages[0] as any).url : (safeImages[0] || ""),
        category: safeCategory,
        amenities_list: safeAmenities,
        businessInfo: {
          ...data.businessInfo,
          documents: data.documents
        },
      } as any,
    });

    // 2-7. Parallelize dependent creations
    const dependentOperations: Promise<any>[] = [];

    // Amenities
    dependentOperations.push(db.listingAmenity.create({
      data: {
        listingId: listing.id,
        wifi: safeAmenities.some((a: string) => String(a).toLowerCase().includes("wifi")),
        parking: safeAmenities.some((a: string) => String(a).toLowerCase().includes("parking")),
        pool: safeAmenities.some((a: string) => String(a).toLowerCase().includes("pool")),
        gym: safeAmenities.some((a: string) => String(a).toLowerCase().includes("gym")),
        airConditioning: safeAmenities.some((a: string) => String(a).toLowerCase().includes("air cond")),
        laundry: safeAmenities.some((a: string) => String(a).toLowerCase().includes("laundry")),
        cookingAllowed: safeAmenities.some((a: string) => String(a).toLowerCase().includes("cook") || String(a).toLowerCase().includes("kitchen")),
        waterDispenser: safeAmenities.some((a: string) => String(a).toLowerCase().includes("water")),
        sariSariStore: safeAmenities.some((a: string) => String(a).toLowerCase().includes("store") || String(a).toLowerCase().includes("canteen")),
        commonTV: safeAmenities.some((a: string) => String(a).toLowerCase().includes("tv")),
        kitchen: safeAmenities.some((a: string) => String(a).toLowerCase().includes("kitchen")),
        gated: safeAmenities.some((a: string) => String(a).toLowerCase().includes("gate")),
        customAmenities: safeAmenities.filter((a: string) => a.includes('|')),
      } as any
    }));

    // Rules
    dependentOperations.push(db.listingRule.create({
      data: {
        listingId: listing.id,
        femaleOnly: !!femaleOnly,
        maleOnly: !!maleOnly,
        visitorsAllowed: visitorsAllowed !== false,
        petsAllowed: !!petsAllowed,
        smokingAllowed: !!smokingAllowed,
        noCurfew: !!noCurfew,
        customRules: customRules || [],
      }
    }));

    // Features
    dependentOperations.push(db.listingFeature.create({
      data: {
        listingId: listing.id,
        security24h: !!security24h,
        cctv: !!cctv,
        fireSafety: !!fireSafety,
        nearTransport: nearTransport !== false,
        floodFree: !!floodFree,
        backupPower: !!backupPower,
        customFeatures: customFeatures || [],
      }
    }));

    // Categories
    if (safeCategory.length > 0) {
      dependentOperations.push((async () => {
        for (const cat of safeCategory) {
          const categoryRecord = await db.category.upsert({
            where: { name: String(cat) },
            update: {},
            create: { name: String(cat), label: String(cat), icon: "default-icon" },
          });
          await db.listingCategory.create({
            data: { listingId: listing.id, categoryId: categoryRecord.id }
          });
        }
      })());
    }

    // Images
    if (safeImages.length > 0) {
      dependentOperations.push(Promise.all(safeImages.map((img: any, idx: number) => {
        const url = typeof img === 'object' ? img.url : img;
        const roomType = typeof img === 'object' ? img.category : "General";
        return db.listingImage.create({
          data: {
            listingId: listing.id,
            url,
            order: idx,
            roomType: roomType || "General"
          }
        });
      })));
    }

    // Rooms (Complex sub-creation)
    if (safeRooms.length > 0) {
      // DEADLOCK PROTECTION: Pre-process all unique amenities across all rooms
      const allRoomAmenities = new Set<string>();
      safeRooms.forEach((room: any) => {
        (room.amenities || []).forEach((a: string) => allRoomAmenities.add(a));
      });

      // Upsert all unique amenities sequentially to avoid write conflicts
      const amenityMap: Record<string, string> = {};
      for (const a of Array.from(allRoomAmenities)) {
        const [label, iconName] = a.includes('|') ? a.split('|') : [a, 'default-icon'];
        const rec = await db.roomAmenityType.upsert({
          where: { name: String(label) },
          update: { icon: iconName },
          create: { name: String(label), icon: iconName }
        });
        amenityMap[a] = rec.id;
      }

      dependentOperations.push(Promise.all(safeRooms.map(async (room: any) => {
        let bedType = "SINGLE";
        const bt = String(room.bedType || "").toUpperCase();
        if (bt.includes("DOUBLE")) bedType = "DOUBLE";
        else if (bt.includes("QUEEN")) bedType = "QUEEN";
        else if (bt.includes("BUNK")) bedType = "BUNK";

        const createdRoom = await db.room.create({
          data: {
            listingId: listing.id,
            name: room.name || "Room",
            description: room.description || "",
            price: Number(room.price) || 0,
            capacity: Number(room.capacity) || 1,
            availableSlots: Number(room.availableSlots) || 1,
            roomType: (room.roomType || "SOLO").toUpperCase() === "BEDSPACE" ? "BEDSPACE" : "SOLO",
            bathroomArrangement: room.bathroomArrangement || "PRIVATE_CR",
            bedType: bedType as any,
            bedCount: Number(room.bedCount) || 1,
            size: Number(room.size) || 0,
            reservationFee: Number(room.reservationFee) || 0,
            status: Number(room.availableSlots) > 0 ? "AVAILABLE" : "FULL",
            images: {
              create: (room.images || []).map((url: string, idx: number) => ({ url, order: idx }))
            },
            amenities: {
              create: (room.amenities || []).map((a: string) => ({
                amenityTypeId: amenityMap[a]
              }))
            }
          }
        });
        return createdRoom;
      })));
    }

    // Execute all in parallel
    await Promise.all(dependentOperations);

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
    
    // SERVER-SIDE AUTO-CATEGORIZATION: Overrides frontend selection
    const safeCategory = autoCategorizeListing(data);

    // OPTIMIZATION: Only update listing if values actually changed
    const titleChanged = title !== undefined && title !== existing.title;
    const descriptionChanged = description !== undefined && description !== existing.description;
    const priceChanged = safePrice !== existing.price;
    const roomCountChanged = safeRoomCount !== existing.roomCount;
    const bathroomCountChanged = safeBathroomCount !== existing.bathroomCount;
    const countryChanged = country !== undefined && country !== existing.country;
    const regionChanged = region !== undefined && region !== existing.region;
    const imageChanged = safeImages.length > 0 && safeImages[0] !== existing.imageSrc;

    // 1. Update base listing (only if something changed)
    const listingUpdateData: any = {};
    if (titleChanged) listingUpdateData.title = title;
    if (descriptionChanged) listingUpdateData.description = description;
    if (priceChanged) listingUpdateData.price = safePrice;
    if (roomCountChanged) listingUpdateData.roomCount = safeRoomCount;
    if (bathroomCountChanged) listingUpdateData.bathroomCount = safeBathroomCount;
    if (countryChanged) listingUpdateData.country = country;
    if (regionChanged) listingUpdateData.region = region;
    if (imageChanged) {
      listingUpdateData.imageSrc = typeof safeImages[0] === 'object' ? (safeImages[0] as any).url : safeImages[0];
    }
    listingUpdateData.latitude = safeLat;
    listingUpdateData.longitude = safeLng;
    listingUpdateData.location = { type: "Point", coordinates: [safeLng, safeLat] };
    listingUpdateData.status = "pending";
    listingUpdateData.category = safeCategory;
    listingUpdateData.amenities_list = safeAmenities;
    if (data.businessInfo) {
      listingUpdateData.businessInfo = {
        ...data.businessInfo,
        documents: data.documents
      };
    }

    const listing = Object.keys(listingUpdateData).length > 0
      ? await db.listing.update({
          where: { id: propertyId },
          data: listingUpdateData as any,
        })
      : existing;

    // OPTIMIZATION: Run independent database operations in PARALLEL
    const updatePromises: Promise<any>[] = [];

    // 2. Update/Create Amenities (only if provided)
    if (amenities !== undefined && existing.amenities) {
      updatePromises.push(
        db.listingAmenity.upsert({
          where: { listingId: propertyId },
          update: {
            wifi: safeAmenities.includes('wifi'),
            parking: safeAmenities.includes('parking'),
            pool: safeAmenities.includes('pool'),
            gym: safeAmenities.includes('gym'),
            airConditioning: safeAmenities.includes('airConditioning'),
            laundry: safeAmenities.includes('laundry'),
            cookingAllowed: safeAmenities.includes('cookingAllowed'),
            waterDispenser: safeAmenities.includes('waterDispenser'),
            sariSariStore: safeAmenities.includes('sariSariStore'),
            commonTV: safeAmenities.includes('commonTV'),
            kitchen: safeAmenities.includes('kitchen'),
            gated: safeAmenities.includes('gated'),
            customAmenities: data.customAmenities || [],
          } as any,
          create: {
            listingId: propertyId,
            wifi: safeAmenities.includes('wifi'),
            parking: safeAmenities.includes('parking'),
            pool: safeAmenities.includes('pool'),
            gym: safeAmenities.includes('gym'),
            airConditioning: safeAmenities.includes('airConditioning'),
            laundry: safeAmenities.includes('laundry'),
            cookingAllowed: safeAmenities.includes('cookingAllowed'),
            waterDispenser: safeAmenities.includes('waterDispenser'),
            sariSariStore: safeAmenities.includes('sariSariStore'),
            commonTV: safeAmenities.includes('commonTV'),
            kitchen: safeAmenities.includes('kitchen'),
            gated: safeAmenities.includes('gated'),
            customAmenities: data.customAmenities || [],
          } as any
        })
      );
    }

    // 3. Update/Create Rules (always update if provided)
    if (femaleOnly !== undefined || maleOnly !== undefined || visitorsAllowed !== undefined ||
        petsAllowed !== undefined || smokingAllowed !== undefined || data.noCurfew !== undefined) {
      updatePromises.push(
        db.listingRule.upsert({
          where: { listingId: propertyId },
          update: {
            femaleOnly: !!femaleOnly,
            maleOnly: !!maleOnly,
            visitorsAllowed: visitorsAllowed !== false,
            petsAllowed: !!petsAllowed,
            smokingAllowed: !!smokingAllowed,
            noCurfew: !!data.noCurfew,
            customRules: data.customRules || [],
          },
          create: {
            listingId: propertyId,
            femaleOnly: !!femaleOnly,
            maleOnly: !!maleOnly,
            visitorsAllowed: visitorsAllowed !== false,
            petsAllowed: !!petsAllowed,
            smokingAllowed: !!smokingAllowed,
            noCurfew: !!data.noCurfew,
            customRules: data.customRules || [],
          }
        })
      );
    }

    // 4. Update/Create Features (always update if provided)
    if (security24h !== undefined || cctv !== undefined || fireSafety !== undefined ||
        nearTransport !== undefined || data.floodFree !== undefined || data.backupPower !== undefined) {
      updatePromises.push(
        db.listingFeature.upsert({
          where: { listingId: propertyId },
          update: {
            security24h: !!security24h,
            cctv: !!cctv,
            fireSafety: !!fireSafety,
            nearTransport: nearTransport !== false,
            floodFree: !!data.floodFree,
            backupPower: !!data.backupPower,
            customFeatures: data.customFeatures || [],
          },
          create: {
            listingId: propertyId,
            security24h: !!security24h,
            cctv: !!cctv,
            fireSafety: !!fireSafety,
            nearTransport: nearTransport !== false,
            floodFree: !!data.floodFree,
            backupPower: !!data.backupPower,
            customFeatures: data.customFeatures || [],
          }
        })
      );
    }

    // 5. Update Categories (always update because autoCategorizer depends on other fields)
    updatePromises.push(
        (async () => {
          await db.listingCategory.deleteMany({ where: { listingId: propertyId } });
          const categoryPromises = safeCategory.map(async (cat: string) => {
            const categoryRecord = await db.category.upsert({
              where: { name: String(cat) },
              update: {},
              create: { name: String(cat), label: String(cat), icon: "default-icon" },
            });
            return db.listingCategory.create({
              data: { listingId: propertyId, categoryId: categoryRecord.id }
            });
          });
          await Promise.all(categoryPromises);
        })()
      );

    // 6. Update Images (only if provided and changed)
    if (images !== undefined && safeImages.length > 0) {
      updatePromises.push(
        (async () => {
          await db.listingImage.deleteMany({ where: { listingId: propertyId } });
          const imagePromises = safeImages.map((img: any, idx: number) => {
            const url = typeof img === 'object' ? img.url : img;
            const roomType = typeof img === 'object' ? img.category : "General";
            return db.listingImage.create({
              data: {
                listingId: propertyId,
                url,
                order: idx,
                roomType: roomType || "General"
              }
            });
          });
          await Promise.all(imagePromises);
        })()
      );
    }

    // Execute all parallel operations
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    // 7. Update rooms if provided (needs to be sequential for proper ordering)
    if (rooms !== undefined) {
      await db.room.deleteMany({ where: { listingId: propertyId } });

      // DEADLOCK PROTECTION: Pre-process all unique amenities across all rooms
      const allRoomAmenities = new Set<string>();
      rooms.forEach((room: any) => {
        (room.amenities || []).forEach((a: string) => allRoomAmenities.add(a));
      });

      const amenityMap: Record<string, string> = {};
      // HI-3 FIX: Parallelize amenity type upserts
      await Promise.all(Array.from(allRoomAmenities).map(async (a) => {
        const [label, iconName] = a.includes('|') ? a.split('|') : [a, 'default-icon'];
        const rec = await db.roomAmenityType.upsert({
          where: { name: String(label) },
          update: { icon: iconName },
          create: { name: String(label), icon: iconName }
        });
        amenityMap[a] = rec.id;
      }));

      // HI-3 FIX: Parallelize room creations
      await Promise.all(rooms.map(async (room: any) => {
        let bedType = "SINGLE";
        const bt = String(room.bedType || "").toUpperCase();
        if (bt.includes("DOUBLE")) bedType = "DOUBLE";
        else if (bt.includes("QUEEN")) bedType = "QUEEN";
        else if (bt.includes("BUNK")) bedType = "BUNK";
        else if (bt.includes("SINGLE")) bedType = "SINGLE";

        return db.room.create({
          data: {
            listingId: propertyId,
            name: room.name || "Room",
            description: room.description || "",
            price: Number(room.price) || 0,
            capacity: Number(room.capacity) || 1,
            availableSlots: Number(room.availableSlots) || 1,
            roomType: (room.roomType || "SOLO").toUpperCase() === "BEDSPACE" ? "BEDSPACE" : "SOLO",
            bathroomArrangement: room.bathroomArrangement || "PRIVATE_CR",
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
            amenities: {
              create: (room.amenities || []).map((a: string) => ({
                amenityTypeId: amenityMap[a]
              }))
            }
          },
        });
      }));
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

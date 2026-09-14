"use server";

import { db } from "@/lib/db";
import { requireLandlord } from "@/lib/landlord";
import { LISTINGS_BATCH } from "@/utils/constants";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { autoCategorizeListing } from "@/utils/categorizer";
import { clearLandlordCache } from "@/services/landlord/analytics";

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
  listingLinks?: {
    attribute: {
      id: string;
      name: string;
      icon: string | null;
    };
  }[];
  propertyType?: {
    id?: string;
    name: string;
    icon: string | null;
  } | null;
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
      rejectionReason: true,
      region: true,
      country: true,
      location: true,
      amenities_list: true,
      rooms: {
        select: {
          id: true,
          name: true,
          price: true,
          capacity: true,
          availableSlots: true,
          bathroomArrangement: true,
          bedType: true,
          bedCount: true,
          size: true,
          amenityNames: true,
          reservationFee: true,
          roomTypeDefinitionId: true,
          roomLinks: {
            include: {
              attribute: true,
            },
          },
          images: {
            select: {
              url: true,
            }
          }
        }
      },
      listingLinks: {
        include: {
          attribute: true,
        },
      },
      propertyType: true,
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
      propertyType: {
        select: {
          name: true,
          icon: true
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
      listingLinks: {
        include: { attribute: true },
      },
      propertyType: true,
      rooms: {
        include: {
          roomLinks: {
            include: { attribute: true },
          },
          images: true,
        },
      },
      images: {
        orderBy: { order: "asc" }
      },
      leaseContracts: {
        include: { signatures: true }
      }
    },
  });

  return property;
};

const normalizePropertyTitle = (title: string): string => {
  if (!title) return '';
  return title.toLowerCase().replace(/[^a-z0-9]/gi, '').trim();
};

export const createProperty = async (data: any) => {
  const landlord = await requireLandlord();

  try {
    const {
      title, description, price, roomCount, bathroomCount, country, region,
      city, address, zipCode, location_address, images, features, amenities,
      category, latitude, longitude, customTerms, femaleOnly, noCurfew,
      visitorsAllowed, petsAllowed, security24h, cctv, fireSafety,
      propertyTypeId, isDraft, draftStep, businessInfo, latlng, customRules,
      customFeatures, customAmenities, rooms, depositAmount, moveOutNoticeDays,
      customContractClauses, landlordSignatureBase64
    } = data;

    // Check for duplicate property title under the same landlord using normalized comparison
    const normalizedNewTitle = normalizePropertyTitle(title);
    if (normalizedNewTitle) {
      const landlordProperties = await db.listing.findMany({
        where: {
          userId: landlord.id,
          deletedAt: null
        },
        select: { id: true, title: true }
      });

      const isDuplicate = landlordProperties.some(
        (l) => normalizePropertyTitle(l.title) === normalizedNewTitle
      );

      if (isDuplicate) {
        throw new Error('A property with a similar title already exists in your account. Please use a unique title.');
      }
    }

    const safeRooms = Array.isArray(rooms) ? rooms : [];
    const validRoomPrices = safeRooms
      .map((r: any) => Number(r.price))
      .filter((p: number) => !isNaN(p) && p > 0);
    const lowestRoomPrice = validRoomPrices.length > 0 ? Math.min(...validRoomPrices) : 0;
    const safePrice = lowestRoomPrice > 0 ? lowestRoomPrice : (Number(price) || 0);

    const safeRoomCount = Number(roomCount) || 1;
    const safeBathroomCount = Number(bathroomCount) || 0;
    const safeLat = latlng?.[1] ?? 14.5995;
    const safeLng = latlng?.[0] ?? 120.9842;
    const safeAmenities = Array.isArray(amenities) ? amenities : [];
    const safeImages = Array.isArray(images) ? images : [];

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
          address: data.address || "",
          city: data.city || "Camiling",
          zipCode: data.zipCode || "2306",
        },
        userId: landlord.id,
        status: "PENDING",
        imageSrc: (() => {
          const exteriorPhoto = safeImages.find((img: any) => typeof img === 'object' && (img.category === 'Exterior' || img.roomType === 'Exterior'));
          if (exteriorPhoto) return typeof exteriorPhoto === 'object' ? exteriorPhoto.url : exteriorPhoto;
          return typeof safeImages[0] === 'object' ? (safeImages[0] as any).url : (safeImages[0] || "");
        })(),
        propertyTypeId: propertyTypeId,
        amenities_list: safeAmenities,
        customClauses: customContractClauses || [],
        businessInfo: { ...data.businessInfo, documents: data.documents },
        leaseContracts: {
          create: {
            landlordId: landlord.id,
            depositAmount: Number(depositAmount) || 0,
            moveOutNoticeDays: Number(moveOutNoticeDays) || 30,
            pdfUrl: data.pdfUrl || null,
            ...(landlordSignatureBase64 ? {
              signatures: {
                create: {
                  signerId: landlord.id,
                  signerType: "LANDLORD",
                  signatureUrl: landlordSignatureBase64,
                }
              }
            } : {})
          }
        },
        
        listingLinks: {
          create: safeAmenities.filter((id: string) => typeof id === 'string' && !id.includes('|')).map((id: string) => ({ attributeId: id }))
        },

        images: {
          create: safeImages.map((img: any, idx: number) => ({
            url: typeof img === 'object' ? img.url : img,
            order: idx,
            roomType: typeof img === 'object' ? (img.category || img.roomType || "Other") : "Other"
          }))
        },
        rooms: {
          create: safeRooms.map((room: any) => {
            let bedType = "SINGLE";
            const bt = String(room.bedType || "").toUpperCase();
            if (bt.includes("DOUBLE")) bedType = "DOUBLE";
            else if (bt.includes("QUEEN")) bedType = "QUEEN";
            else if (bt.includes("BUNK")) bedType = "BUNK";

            const rawAmenities: any[] = Array.isArray(room.amenities) ? room.amenities : Array.isArray(room.attributes) ? room.attributes : [];
            const validAttributeIds = rawAmenities
              .map(item => {
                if (typeof item === 'string') {
                  if (!item.includes('|') && item.length === 24) return item;
                  return null;
                }
                if (typeof item === 'object' && item !== null) {
                  const targetId = item.attributeId || item.id;
                  if (typeof targetId === 'string' && targetId.length === 24) return targetId;
                }
                return null;
              })
              .filter((id): id is string => typeof id === 'string' && id.length === 24);

            const customAmenityNames = rawAmenities
              .filter(id => typeof id === 'string' && id.includes('|'))
              .map(id => id.split('|')[0]);

            return {
              name: room.name || "Room",
              description: room.description || "",
              price: Number(room.price) || 0,
              capacity: Number(room.capacity) || 1,
              availableSlots: Number(room.availableSlots) || 1,
              bathroomArrangement: room.bathroomArrangement || "PRIVATE_CR",
              bedType: bedType as any,
              bedCount: Number(room.bedCount) || 1,
              size: Number(room.size) || 0,
              reservationFee: Number(room.reservationFee) || 0,
              status: Number(room.availableSlots) > 0 ? "AVAILABLE" : "FULL",
              amenityNames: customAmenityNames,
              images: {
                create: (room.images || []).map((url: string, idx: number) => ({ url, order: idx }))
              },
              roomTypeDefinitionId: room.roomType,
              roomLinks: validAttributeIds.length > 0 ? {
                create: validAttributeIds.map(id => ({ attributeId: id }))
              } : undefined,
            };
          })
        }
      } as any
    });

    // Notify Super Admin team of new property submission
    try {
      const admins = await db.user.findMany({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] }, isActive: true },
        select: { id: true, email: true, name: true }
      });
      const { createNotification } = await import('@/services/notification');
      const { sendAdminNewListingAlert } = await import('@/services/email/notifications');

      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          type: 'inquiry',
          title: 'New Property Pending Verification 🔔',
          description: `Landlord host ${landlord.name || 'Landlord'} submitted property "${listing.title}" for review.`,
          link: '/admin/moderation/listings'
        });
        await sendAdminNewListingAlert(admin, landlord.name || 'Landlord', listing.title);
      }
    } catch (adminNotifErr) {
      console.error('Failed to notify admins of new listing:', adminNotifErr);
    }

    await clearLandlordCache(landlord.id);
    revalidatePath("/landlord/properties");
    return { success: true, data: listing };
  } catch (error) {
    console.error("DEBUG: createProperty error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to create property" };
  }
};

export const updateProperty = async (propertyId: string, data: any) => {
  const landlord = await requireLandlord();

  try {
    const {
      title, description, price, roomCount, bathroomCount, propertyTypeId,
      country, region, latlng, amenities, images, rooms,
      depositAmount, moveOutNoticeDays, customContractClauses, landlordSignatureBase64
    } = data;

    const existing = await db.listing.findFirst({
      where: { id: propertyId, userId: landlord.id },
      include: { listingLinks: true, rooms: true }
    });

    if (!existing) return { success: false, error: "Property not found or unauthorized" };

    const safeRooms = Array.isArray(rooms) ? rooms : [];
    const validRoomPrices = safeRooms
      .map((r: any) => Number(r.price))
      .filter((p: number) => !isNaN(p) && p > 0);
    const lowestRoomPrice = validRoomPrices.length > 0 ? Math.min(...validRoomPrices) : 0;
    const safePrice = lowestRoomPrice > 0 ? lowestRoomPrice : (Number(price) || Number(existing.price) || 0);

    const safeRoomCount = Number(roomCount) || 1;
    const safeBathroomCount = Number(bathroomCount) || 1;
    const safeLat = latlng?.[1] ?? 14.5995;
    const safeLng = latlng?.[0] ?? 120.9842;
    const safeAmenities = Array.isArray(amenities) ? amenities : [];
    const safeImages = Array.isArray(images) ? images : [];


    const updateData: any = {
      title: title !== undefined ? title : existing.title,
      description: description !== undefined ? description : existing.description,
      price: safePrice,
      roomCount: safeRoomCount,
      bathroomCount: safeBathroomCount,
      country: country !== undefined ? country : existing.country,
      region: region !== undefined ? region : existing.region,
      latitude: safeLat,
      longitude: safeLng,
      location: { type: "Point", coordinates: [safeLng, safeLat] },
      status: "PENDING",
      amenities_list: safeAmenities,
    };

    if (propertyTypeId !== undefined) {
      updateData.propertyTypeId = propertyTypeId;
    }

    if (safeImages.length > 0) {
      const exteriorPhoto = safeImages.find((img: any) => typeof img === 'object' && (img.category === 'Exterior' || img.roomType === 'Exterior'));
      if (exteriorPhoto) {
        updateData.imageSrc = typeof exteriorPhoto === 'object' ? exteriorPhoto.url : exteriorPhoto;
      } else {
        updateData.imageSrc = typeof safeImages[0] === 'object' ? (safeImages[0] as any).url : safeImages[0];
      }
    }
    if (data.businessInfo) {
      updateData.businessInfo = { ...data.businessInfo, documents: data.documents };
    }
    
    if (customContractClauses !== undefined) {
      updateData.customClauses = customContractClauses;
    }

    if (safeAmenities.length > 0) {
      updateData.listingLinks = {
        deleteMany: {},
        create: safeAmenities.filter((id: string) => typeof id === 'string' && !id.includes('|')).map((id: string) => ({ attributeId: id })),
      };
    }

    if (images !== undefined && safeImages.length > 0) {
      updateData.images = {
        deleteMany: {},
        create: safeImages.map((img: any, idx: number) => ({
          url: typeof img === 'object' ? img.url : img,
          order: idx,
          roomType: typeof img === 'object' ? (img.category || img.roomType || "Other") : "Other"
        }))
      };
    }

    if (rooms !== undefined) {
      updateData.rooms = {
        deleteMany: {},
        create: rooms.map((room: any) => {
          let bedType = "SINGLE";
          const bt = String(room.bedType || "").toUpperCase();
          if (bt.includes("DOUBLE")) bedType = "DOUBLE";
          else if (bt.includes("QUEEN")) bedType = "QUEEN";
          else if (bt.includes("BUNK")) bedType = "BUNK";

          const rawAmenities: any[] = Array.isArray(room.amenities) ? room.amenities : Array.isArray(room.attributes) ? room.attributes : [];
          const validAttributeIds = rawAmenities
            .map(item => {
              if (typeof item === 'string') {
                if (!item.includes('|') && item.length === 24) return item;
                return null;
              }
              if (typeof item === 'object' && item !== null) {
                const targetId = item.attributeId || item.id;
                if (typeof targetId === 'string' && targetId.length === 24) return targetId;
              }
              return null;
            })
            .filter((id): id is string => typeof id === 'string' && id.length === 24);

          const customAmenityNames = rawAmenities
            .filter(id => typeof id === 'string' && id.includes('|'))
            .map(id => id.split('|')[0]);

          return {
            name: room.name || "Room",
            description: room.description || "",
            price: Number(room.price) || 0,
            capacity: Number(room.capacity) || 1,
            availableSlots: Number(room.availableSlots) || 1,
            bathroomArrangement: room.bathroomArrangement || "PRIVATE_CR",
            bedType: bedType as any,
            bedCount: Number(room.bedCount) || 1,
            size: Number(room.size) || 0,
            reservationFee: Number(room.reservationFee) || 0,
            status: Number(room.availableSlots) > 0 ? "AVAILABLE" : "FULL",
            amenityNames: customAmenityNames,
            images: {
              create: (room.images || []).map((url: string, idx: number) => ({ url, order: idx }))
            },
            roomTypeDefinitionId: room.roomType,
            roomLinks: validAttributeIds.length > 0 ? {
              create: validAttributeIds.map(id => ({ attributeId: id }))
            } : undefined,
          };
        })
      };
    }

    const listing = await db.listing.update({
      where: { id: propertyId },
      data: updateData as any,
    });

    if (depositAmount !== undefined || moveOutNoticeDays !== undefined || customContractClauses !== undefined) {
      const leaseContract = await db.leaseContract.findFirst({
        where: { listingId: propertyId }
      });
      if (leaseContract) {
        await db.leaseContract.update({
          where: { id: leaseContract.id },
          data: {
            depositAmount: depositAmount !== undefined ? Number(depositAmount) : leaseContract.depositAmount,
            moveOutNoticeDays: moveOutNoticeDays !== undefined ? Number(moveOutNoticeDays) : leaseContract.moveOutNoticeDays,
          }
        });
        if (customContractClauses !== undefined) {
          await db.listing.update({
            where: { id: propertyId },
            data: { customClauses: customContractClauses }
          });
        }
        if (landlordSignatureBase64) {
           const existingSignature = await db.contractSignature.findFirst({
             where: { contractId: leaseContract.id, signerType: "LANDLORD" }
           });
           if (!existingSignature) {
             await db.contractSignature.create({
               data: {
                 contractId: leaseContract.id,
                 signerId: landlord.id,
                 signerType: "LANDLORD",
                 signatureUrl: landlordSignatureBase64
               }
             });
           } else if (existingSignature.signatureUrl !== landlordSignatureBase64) {
             await db.contractSignature.update({
               where: { id: existingSignature.id },
               data: { signatureUrl: landlordSignatureBase64 }
             });
           }
        }
      } else {
        await db.leaseContract.create({
          data: {
            listingId: propertyId,
            landlordId: landlord.id,
            depositAmount: Number(depositAmount) || 0,
            moveOutNoticeDays: Number(moveOutNoticeDays) || 30,
            ...(landlordSignatureBase64 ? {
              signatures: {
                create: {
                  signerId: landlord.id,
                  signerType: "LANDLORD",
                  signatureUrl: landlordSignatureBase64,
                }
              }
            } : {})
          }
        });
      }
    }

    return { success: true, data: listing };
  } catch (error) {
    console.error("DEBUG: updateProperty error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to update property" };
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

export const updateListingStatus = async (propertyId: string, isArchived: boolean) => {
  const landlord = await requireLandlord();

  try {
    const listing = await db.listing.update({
      where: {
        id: propertyId,
      },
      data: { status: isArchived ? 'UNPUBLISHED' : 'ACTIVE' },
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

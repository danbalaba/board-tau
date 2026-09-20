import { db } from "@/lib/db";
import { requireLandlord } from "@/lib/landlord";

export async function getLandlordRooms(args?: { 
  cursor?: string;
  listingId?: string;
  roomType?: string;
  capacity?: number;
  isArchived?: boolean;
  sortBy?: string;
  search?: string;
}) {
  try {
    const landlord = await requireLandlord();
    const { cursor, listingId, roomType, capacity, isArchived, sortBy, search } = args || {};
    const batchSize = 12;

    const where: any = {
      listing: { userId: landlord.id }
    };

    if (listingId && listingId !== 'all') where.listingId = listingId;
    if (roomType && roomType !== 'all') where.roomType = roomType;
    if (capacity && !isNaN(Number(capacity))) where.capacity = Number(capacity);
    if (isArchived !== undefined) where.isArchived = isArchived;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { listing: { title: { contains: search, mode: 'insensitive' } } }
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    else if (sortBy === 'price_desc') orderBy = { price: 'desc' };
    else if (sortBy === 'oldest') orderBy = { createdAt: 'asc' };
    else if (sortBy === 'status') orderBy = { status: 'asc' };

    const rooms = await db.room.findMany({
      where,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            region: true,
            status: true,
            propertyTypeId: true,
            bathroomCount: true,
            propertyType: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        images: true,
        roomLinks: {
          include: { attribute: true }
        },
        roomTypeDefinition: true
      },
      orderBy
    });

    const formattedRooms = rooms.map((room: any) => ({
      ...room,
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString(),
      propertyId: room.listingId,
      propertyTitle: room.listing?.title,
      propertyRegion: room.listing?.region,
      propertyStatus: room.listing?.status,
      propertyTypeId: room.listing?.propertyTypeId || room.listing?.propertyType?.id || null,
      roomType: room.roomTypeDefinitionId || room.roomTypeDefinition?.code || room.roomTypeDefinition?.name || '',
      imageSrc: room.images[0]?.url || null,
      images: room.images.map((img: any) => img.url),
      amenities: room.roomLinks.map((rl: any) => rl.attribute)
    }));

    return {
      rooms: formattedRooms,
      nextCursor: null
    };
  } catch (error: any) {
    console.error("Error fetching landlord rooms:", error);
    return { rooms: [], nextCursor: null };
  }
}

export async function createLandlordRoom(data: any) {
  const landlord = await requireLandlord();

  const listing = await db.listing.findFirst({
    where: { id: data.listingId, userId: landlord.id }
  });

  if (!listing) {
    throw new Error('Property not found or unauthorized');
  }

  const imageUrls: string[] = Array.isArray(data.images) ? data.images : [];

  // Resolve dynamic attribute IDs for room attribute links safely
  const resolvedAttributeIds: string[] = [];
  if (Array.isArray(data.amenities) && data.amenities.length > 0) {
    for (const item of data.amenities) {
      if (!item) continue;
      const strVal = String(item).trim();
      
      // Try finding by ID
      const byId = await db.dynamicAttribute.findUnique({ where: { id: strVal } });
      if (byId) {
        resolvedAttributeIds.push(byId.id);
        continue;
      }

      // Try finding by name
      let cleanName = strVal;
      let iconName = "HelpCircle";
      if (strVal.includes("||")) {
        [cleanName, iconName] = strVal.split("||").map((s) => s.trim());
      } else if (strVal.includes("|")) {
        [cleanName, iconName] = strVal.split("|").map((s) => s.trim());
      }

      const byName = await db.dynamicAttribute.findFirst({ where: { name: cleanName } });
      if (byName) {
        resolvedAttributeIds.push(byName.id);
        continue;
      }

      // Upsert custom room amenity attribute
      const newAttr = await db.dynamicAttribute.create({
        data: {
          name: cleanName,
          icon: iconName || "HelpCircle",
          type: "ROOM_AMENITY",
          isActive: true,
          description: ""
        }
      });
      resolvedAttributeIds.push(newAttr.id);
    }
  }

  const room = await db.room.create({
    data: {
      listingId: data.listingId,
      name: data.name,
      description: data.description || "",
      roomTypeDefinitionId: data.roomType,
      bathroomArrangement: data.bathroomArrangement || "PRIVATE_CR",
      bedType: data.bedType,
      bedCount: Number(data.bedCount) || 1,
      capacity: Number(data.capacity),
      availableSlots: Number(data.availableSlots),
      price: Number(data.price),
      reservationFee: Number(data.reservationFee),
      size: Number(data.size) || 0,
      status: Number(data.availableSlots) === 0 ? 'FULL' : 'AVAILABLE',
      amenityNames: data.amenities || [],
      roomLinks: {
        create: resolvedAttributeIds.map((attrId: string) => ({
          attributeId: attrId
        }))
      }
    }
  });

  // Save uploaded image URLs to the RoomImage table
  if (imageUrls.length > 0) {
    await db.roomImage.createMany({
      data: imageUrls.map((url: string, idx: number) => ({
        roomId: room.id,
        url,
        caption: 'Room Photo',
        order: idx,
      })),
    });
  }

  return room;
}


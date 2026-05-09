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
      take: batchSize + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        listing: {
          select: {
            title: true,
            region: true,
            status: true
          }
        },
        images: true,
        amenities: {
          include: { amenityType: true }
        }
      },
      orderBy
    });

    const hasMore = rooms.length > batchSize;
    const nextCursor = hasMore ? rooms[batchSize - 1].id : null;
    const list = rooms.slice(0, batchSize);

    const formattedRooms = list.map((room) => ({
      ...room,
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString(),
      propertyId: room.listingId,
      propertyTitle: room.listing.title,
      propertyRegion: room.listing.region,
      propertyStatus: room.listing.status,
      imageSrc: room.images[0]?.url || null,
      images: room.images.map(img => img.url),
    }));

    return {
      rooms: formattedRooms,
      nextCursor
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

  const room = await db.room.create({
    data: {
      listingId: data.listingId,
      name: data.name,
      description: data.description || "",
      roomType: data.roomType,
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
      amenities: {
        create: await Promise.all((data.amenities || []).map(async (a: string) => {
          const rec = await db.roomAmenityType.upsert({
            where: { name: String(a) },
            update: {},
            create: { name: String(a), icon: "default-icon" }
          });
          return { amenityTypeId: rec.id };
        }))
      }
    }
  });

  // Save uploaded image URLs to the RoomImage table
  const imageUrls: string[] = Array.isArray(data.images) ? data.images : [];
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

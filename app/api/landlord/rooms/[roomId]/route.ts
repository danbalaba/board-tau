import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireLandlord } from "@/lib/landlord";
import { cache } from "@/lib/redis";
import { backendClient } from "@/lib/edgestore-server";

// GET /api/landlord/rooms/[roomId] — fetch single room details
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const landlord = await requireLandlord();
    const { roomId } = await params;

    const room = await db.room.findFirst({
      where: { id: roomId, listing: { userId: landlord.id } },
      include: {
        listing: {
          select: {
            title: true,
            region: true,
            status: true,
            userId: true
          }
        },
        images: true,
        amenities: {
          include: { amenityType: true }
        }
      }
    });

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found or unauthorized" },
        { status: 404 }
      );
    }

    const formattedRoom = {
      ...room,
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString(),
      propertyId: room.listingId,
      propertyTitle: room.listing.title,
      propertyRegion: room.listing.region,
      propertyStatus: room.listing.status,
      imageSrc: room.images[0]?.url || null,
      images: room.images.map(img => img.url),
    };

    return NextResponse.json({ success: true, room: formattedRoom });
  } catch (error: any) {
    console.error("[ROOM_GET]", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/landlord/rooms/[roomId] — update room details + images
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const landlord = await requireLandlord();
    const { roomId } = await params;
    const body = await request.json();

    // Verify ownership
    const existing = await db.room.findFirst({
      where: { id: roomId, listing: { userId: landlord.id } },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Room not found or unauthorized" },
        { status: 404 }
      );
    }

    // Build update payload (only include defined fields)
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.roomType !== undefined) updateData.roomType = body.roomType;
    if (body.bathroomArrangement !== undefined) updateData.bathroomArrangement = body.bathroomArrangement;
    if (body.bedType !== undefined) updateData.bedType = body.bedType;
    if (body.bedCount !== undefined) updateData.bedCount = Number(body.bedCount);
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.capacity !== undefined) updateData.capacity = Number(body.capacity);
    if (body.availableSlots !== undefined) updateData.availableSlots = Number(body.availableSlots);
    if (body.reservationFee !== undefined) updateData.reservationFee = Number(body.reservationFee);
    if (body.size !== undefined) updateData.size = body.size ? Number(body.size) : null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.amenities !== undefined) updateData.amenityNames = body.amenities;

    const room = await db.room.update({
      where: { id: roomId },
      data: updateData,
    });

    // Replace images if provided
    if (Array.isArray(body.images)) {
      await db.roomImage.deleteMany({ where: { roomId } });
      if (body.images.length > 0) {
        await db.roomImage.createMany({
          data: body.images.map((url: string, idx: number) => ({
            roomId,
            url,
            caption: "Room Photo",
            order: idx,
          })),
        });
      }
    }

    // Replace amenities if provided
    if (Array.isArray(body.amenities)) {
      await db.roomAmenity.deleteMany({ where: { roomId } });
      if (body.amenities.length > 0) {
        const newAmenitiesData = await Promise.all(body.amenities.map(async (a: string) => {
          const rec = await db.roomAmenityType.upsert({
            where: { name: String(a) },
            update: {},
            create: { name: String(a), icon: "default-icon" }
          });
          return { roomId, amenityTypeId: rec.id };
        }));
        await db.roomAmenity.createMany({ data: newAmenitiesData });
      }
    }

    // Invalidate the cache for the parent listing so tenant-side updates immediately
    if (existing.listingId) {
      await cache.del(`listing:id:${existing.listingId}`);
    }

    return NextResponse.json({ success: true, room });
  } catch (error: any) {
    console.error("[ROOM_PATCH]", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/landlord/rooms/[roomId] — permanent delete
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const landlord = await requireLandlord();
    const { roomId } = await params;

    const existing = await db.room.findFirst({
      where: { id: roomId, listing: { userId: landlord.id } },
      include: { images: true }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Room not found or unauthorized" },
        { status: 404 }
      );
    }

    // 1. Wipe all images from EdgeStore
    const imageUrls = existing.images.map(img => img.url).filter(Boolean);
    
    if (imageUrls.length > 0) {
      console.log(`🛡️ SECURITY PURGE: Wiping ${imageUrls.length} images for Room ${roomId}`);
      
      const extractRealUrl = (url: string) => {
        let targetUrl = url;
        if (url.includes('/api/edgestore/proxy-file')) {
          try {
            const urlObj = url.startsWith('http') 
              ? new URL(url) 
              : new URL(url, process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000');
            const extractedUrl = urlObj.searchParams.get('url');
            if (extractedUrl) targetUrl = extractedUrl;
          } catch (err) {
            console.error("Failed to parse proxied URL during room purge:", url);
          }
        }
        return targetUrl;
      };

      await Promise.all(
        imageUrls.map(url => {
          const targetUrl = extractRealUrl(url);
          if (targetUrl.startsWith('http')) {
            return (backendClient.publicFiles as any).deleteFile({ url: targetUrl }).catch((err: any) => {
              console.error(`Failed to delete file from EdgeStore: ${targetUrl}`, err);
            });
          }
          return Promise.resolve();
        })
      );
    }

    // 2. Database deletion (images and amenities will cascade if schema is set, but better safe)
    await db.room.delete({ where: { id: roomId } });

    // Invalidate the cache for the parent listing so tenant-side updates immediately
    if (existing.listingId) {
      await cache.del(`listing:id:${existing.listingId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[ROOM_DELETE]", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

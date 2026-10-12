import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/services/user";
import { cache } from "@/lib/redis";
import { safeDeleteEdgeStoreFiles } from "@/lib/edgestore-server";
import { hasPermission } from "@/lib/rbac";

// GET /api/landlord/rooms/[roomId] — fetch single room details
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const permitted = await hasPermission(user.id, "VIEW_ROOMS");
    if (!permitted) return NextResponse.json({ success: false, message: "Forbidden: Missing VIEW_ROOMS" }, { status: 403 });

    const { roomId } = await params;

    const room = await db.room.findFirst({
      where: { id: roomId, listing: { userId: user.id } },
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
        roomLinks: {
          include: { attribute: true }
        },
        roomTypeDefinition: true
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
      roomType: room.roomTypeDefinitionId || (room.roomTypeDefinition as any)?.code || room.roomTypeDefinition?.name || '',
      imageSrc: room.images[0]?.url || null,
      images: room.images.map((img: any) => img.url),
      amenities: room.roomLinks.map((rl: any) => rl.attribute)
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
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const permitted = await hasPermission(user.id, "UPDATE_ROOM");
    if (!permitted) return NextResponse.json({ success: false, message: "Forbidden: Missing UPDATE_ROOM" }, { status: 403 });

    const { roomId } = await params;
    const body = await request.json();

    // Verify ownership
    const existing = await db.room.findFirst({
      where: { id: roomId, listing: { userId: user.id } },
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
    if (body.roomType !== undefined) updateData.roomTypeDefinitionId = body.roomType;
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
      await db.roomAttributeLink.deleteMany({ where: { roomId } });
      if (body.amenities.length > 0) {
        const newAmenitiesData = await Promise.all(body.amenities.map(async (a: string) => {
          if (!a) return null;
          const strVal = String(a).trim();
          
          const byId = await db.dynamicAttribute.findUnique({ where: { id: strVal } });
          if (byId) return { roomId, attributeId: byId.id };

          let cleanName = strVal;
          let iconName = "HelpCircle";
          if (strVal.includes("||")) {
            [cleanName, iconName] = strVal.split("||").map(s => s.trim());
          } else if (strVal.includes("|")) {
            [cleanName, iconName] = strVal.split("|").map(s => s.trim());
          }

          const rec = await db.dynamicAttribute.upsert({
            where: { name: cleanName },
            update: {},
            create: { name: cleanName, icon: iconName || "HelpCircle", type: "ROOM_AMENITY", isActive: true, description: "" }
          });
          return { roomId, attributeId: rec.id };
        }));
        const validLinks = newAmenitiesData.filter(Boolean) as { roomId: string; attributeId: string }[];
        if (validLinks.length > 0) {
          await db.roomAttributeLink.createMany({ data: validLinks });
        }
      }
    }


    // Invalidate the cache for the parent listing so tenant-side updates immediately
    if (existing.listingId) {
      await cache.del(`listing:id:${existing.listingId}`);
      await cache.delPattern("listings:*");
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
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const permitted = await hasPermission(user.id, "UPDATE_ROOM");
    if (!permitted) return NextResponse.json({ success: false, message: "Forbidden: Missing UPDATE_ROOM" }, { status: 403 });

    const { roomId } = await params;

    const existing = await db.room.findFirst({
      where: { id: roomId, listing: { userId: user.id } },
      include: { images: true }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Room not found or unauthorized" },
        { status: 404 }
      );
    }

    // Guard: Prevent deletion if there are active checked-in or reserved stays
    const activeStay = await db.reservation.findFirst({
      where: {
        roomId,
        status: { in: ["RESERVED", "CHECKED_IN"] }
      }
    });

    if (activeStay) {
      return NextResponse.json(
        { success: false, message: "Cannot delete a room with active or confirmed guest reservations. Please complete or cancel bookings first." },
        { status: 400 }
      );
    }

    // 1. Wipe all images from EdgeStore safely
    const imageUrls = existing.images.map((img: any) => img.url).filter(Boolean);
    if (imageUrls.length > 0) {
      await safeDeleteEdgeStoreFiles('publicFiles', imageUrls);
    }

    // 2. Database deletion (cascades sub-records in DB)
    await db.room.delete({ where: { id: roomId } });

    // Decrement roomCount and invalidate the cache for the parent listing
    if (existing.listingId) {
      await db.listing.update({
        where: { id: existing.listingId },
        data: { roomCount: { decrement: 1 } }
      }).catch((err) => console.error("[ROOM_DELETE] Failed to decrement roomCount:", err));

      await cache.del(`listing:id:${existing.listingId}`);
      await cache.delPattern("listings:*");
    }

    return NextResponse.json({ success: true, message: "Room deleted successfully." });
  } catch (error: any) {
    console.error("[ROOM_DELETE]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete room" },
      { status: 500 }
    );
  }
}

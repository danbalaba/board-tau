import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/services/user";
import { createNotification, broadcastStatusChange } from "@/services/notification";
import { encryptEntityId } from "@/lib/encryption";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const {
      listingId,
      roomId,
      moveInDate,
      stayDuration,
      occupantsCount,
      role,
      hasPets,
      smokes,
      contactMethod,
      message,
    } = data;

    // Validate required fields
    if (!listingId || !roomId || !moveInDate || !stayDuration || !role || !contactMethod) {
      const missingFields = [];
      if (!listingId) missingFields.push("listingId");
      if (!roomId) missingFields.push("roomId");
      if (!moveInDate) missingFields.push("moveInDate");
      if (!stayDuration) missingFields.push("stayDuration");
      if (!role) missingFields.push("role");
      if (!contactMethod) missingFields.push("contactMethod");
      return NextResponse.json({ error: "Missing required fields", missingFields }, { status: 400 });
    }

    // Get room details to calculate total price
    const room = await db.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Optional: Check if room has available slots before creating reservation
    if (room.availableSlots <= 0) {
      return NextResponse.json({ error: "Room is fully booked" }, { status: 400 });
    }

    // Create reservation directly
    const startDate = new Date(moveInDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + parseInt(stayDuration));

    const reservation = await db.reservation.create({
      data: {
        userId: user.id,
        listingId,
        roomId,
        startDate,
        endDate,
        durationInDays: parseInt(stayDuration) * 30, // Convert months to days
        totalPrice: room.price * parseInt(stayDuration),
        status: "PENDING_PAYMENT",
        paymentStatus: "PENDING",
      },
      include: {
        listing: { 
          select: { 
            id: true, 
            userId: true, 
            title: true, 
            imageSrc: true 
          } 
        },
        user: { select: { id: true, name: true, email: true, image: true } },
        room: { select: { id: true, name: true, price: true } }
      }
    }) as any;

    // Notify the Landlord
    await createNotification({
      userId: reservation.listing.userId,
      type: "reservation",
      title: "New Direct Booking",
      description: `${user.name || 'A student'} has initiated a direct booking for ${reservation.listing.title}.`,
      link: `/landlord/bookings?id=${encryptEntityId(reservation.id)}`
    });

    await broadcastStatusChange({
      tenantId: user.id,
      landlordId: reservation.listing.userId,
      entityType: "reservation",
      entityId: reservation.id,
      status: "PENDING_PAYMENT",
      payload: reservation,
    });

    return NextResponse.json(reservation);
  } catch (error: any) {
    console.error("Error creating reservation directly:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}

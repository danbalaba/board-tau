import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/services/user";

export async function POST(request: Request) {
  try {
    console.log("Received reservation request");
    
    const user = await getCurrentUser();
    console.log("Current user:", user);

    if (!user) {
      console.log("No user found - returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    console.log("Reservation data:", data);

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
      console.log("Missing fields:", missingFields);
      return NextResponse.json({ error: "Missing required fields", missingFields }, { status: 400 });
    }

    // Get room details to calculate total price
    const room = await db.room.findUnique({
      where: { id: roomId },
    });
    console.log("Room details:", room);

    if (!room) {
      console.log("Room not found");
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Optional: Check if room has available slots before creating reservation
    if (room.availableSlots <= 0) {
      console.log("Room has no available slots");
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
        status: "PENDING",
        paymentStatus: "PENDING",
      },
    });

    console.log("Reservation created successfully:", reservation);
    return NextResponse.json(reservation);
  } catch (error: any) {
    console.error("Error creating reservation directly:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}

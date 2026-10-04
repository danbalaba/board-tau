import { NextResponse } from "next/server";
import { requireLandlord } from "@/lib/landlord";
import { db } from "@/lib/db";
import { z } from "zod";

const WalkInSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required"),
  roomId: z.string().min(1, "Room ID is required"),
  guestName: z.string().min(1, "Guest name is required"),
  guestContact: z.string().optional().nullable(),
  guestEmail: z.string().optional().nullable(),
  startDate: z.string().min(1, "Check-in date is required"),
  endDate: z.string().min(1, "Check-out date is required"),
  occupantsCount: z.number().min(1, "At least 1 occupant is required"),
  paymentType: z.enum(["DIRECT_RENT", "RESERVATION_FEE"]).optional().default("DIRECT_RENT"),
  securityDeposit: z.number().optional().default(0),
  totalPrice: z.number().min(0, "Total price must be valid"),
  isSoloBuyout: z.boolean().optional().default(false),
  notes: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const landlord = await requireLandlord();
    const body = await request.json();

    const validatedData = WalkInSchema.parse(body);

    // Verify ownership of the listing
    const listing = await db.listing.findFirst({
      where: {
        id: validatedData.listingId,
        userId: landlord.id,
      },
      include: {
        rooms: {
          where: { id: validatedData.roomId },
          include: {
            roomTypeDefinition: true,
          }
        },
      },
    });

    if (!listing) {
      return new NextResponse("Unauthorized or Listing Not Found", { status: 403 });
    }

    if (listing.rooms.length === 0) {
      return new NextResponse("Room Not Found in Listing", { status: 404 });
    }

    const room = listing.rooms[0];
    const isFlatRate = Boolean(room.roomTypeDefinition?.isFlatRate);

    if (validatedData.isSoloBuyout && !isFlatRate) {
      if (room.availableSlots < room.capacity) {
        return new NextResponse("Solo buyout requires all room beds to be currently available", { status: 400 });
      }
    } else if (room.availableSlots < validatedData.occupantsCount) {
      return new NextResponse("Not enough available slots in this room", { status: 400 });
    }

    const moveIn = new Date(validatedData.startDate);
    const checkOut = new Date(validatedData.endDate);

    const durationInDays = Math.max(
      1,
      Math.ceil((checkOut.getTime() - moveIn.getTime()) / (1000 * 60 * 60 * 24))
    );

    // Format guest contact text if email or notes are also provided
    let fullContact = validatedData.guestContact || "";
    if (validatedData.guestEmail) {
      fullContact = fullContact ? `${fullContact} | ${validatedData.guestEmail}` : validatedData.guestEmail;
    }
    if (validatedData.notes) {
      fullContact = fullContact ? `${fullContact} (Notes: ${validatedData.notes})` : `Notes: ${validatedData.notes}`;
    }

    const isDirectRent = validatedData.paymentType === "DIRECT_RENT";

    // Create the Reservation
    // Walk-ins created by landlords in-person immediately reserve the room slots
    const reservation = await db.$transaction(async (tx) => {
      const createdReservation = await tx.reservation.create({
        data: {
          isWalkIn: true,
          guestName: validatedData.guestName,
          guestContact: fullContact || null,
          listingId: validatedData.listingId,
          roomId: validatedData.roomId,
          startDate: moveIn,
          endDate: checkOut,
          durationInDays,
          totalPrice: validatedData.totalPrice,
          occupantsCount: validatedData.occupantsCount,
          isSoloBuyout: validatedData.isSoloBuyout,
          status: "RESERVED",
          paymentStatus: "PAID",
          paymentMethod: "CASH",
        },
      });

      // Update room available slots immediately for walk-ins
      const slotsToDeduct = validatedData.isSoloBuyout ? room.availableSlots : Math.min(room.availableSlots, validatedData.occupantsCount);
      const newAvailableSlots = Math.max(0, room.availableSlots - slotsToDeduct);
      await tx.room.update({
        where: { id: room.id },
        data: {
          availableSlots: newAvailableSlots,
          status: newAvailableSlots === 0 ? "FULL" : "AVAILABLE",
        },
      });

      return createdReservation;
    });

    return NextResponse.json(reservation);
  } catch (error: any) {
    console.error("WALK_IN_CREATE_ERROR", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { requireLandlord } from "@/lib/landlord";
import { db } from "@/lib/db";
import { z } from "zod";

const WalkInSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required"),
  roomId: z.string().min(1, "Room ID is required"),
  guestName: z.string().min(1, "Guest name is required"),
  guestContact: z.string().optional().nullable(),
  startDate: z.string().min(1, "Check-in date is required"),
  endDate: z.string().min(1, "Check-out date is required"),
  occupantsCount: z.number().min(1, "At least 1 occupant is required"),
  totalPrice: z.number().min(0, "Total price must be valid"),
  guestPhotoUrl: z.string().optional().nullable(),
  guestIdUrl: z.string().optional().nullable(),
  isSoloBuyout: z.boolean().optional().default(false),
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

    if (room.availableSlots < validatedData.occupantsCount) {
      return new NextResponse("Not enough available slots in this room", { status: 400 });
    }

    const moveIn = new Date(validatedData.startDate);
    const checkOut = new Date(validatedData.endDate);

    const durationInDays = Math.ceil(
      (checkOut.getTime() - moveIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Create the Reservation as PENDING_PAYMENT
    // The slots will be subtracted when the landlord clicks "Confirm Payment" 
    // which transitions this to RESERVED via updateBookingStatus.
    const reservation = await db.reservation.create({
      data: {
        isWalkIn: true,
        guestName: validatedData.guestName,
        guestContact: validatedData.guestContact || null,
        guestPhotoUrl: validatedData.guestPhotoUrl || null,
        guestIdUrl: validatedData.guestIdUrl || null,
        listingId: validatedData.listingId,
        roomId: validatedData.roomId,
        startDate: moveIn,
        endDate: checkOut,
        durationInDays,
        totalPrice: validatedData.totalPrice,
        occupantsCount: validatedData.occupantsCount,
        isSoloBuyout: validatedData.isSoloBuyout,
        status: "PENDING_PAYMENT",
        paymentStatus: "PENDING",
      },
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

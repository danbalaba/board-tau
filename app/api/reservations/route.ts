import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/services/user";

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
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create the reservation request (inquiry)
    const reservationRequest = await db.inquiry.create({
      data: {
        listingId,
        roomId,
        userId: user.id,
        moveInDate,
        stayDuration,
        occupantsCount,
        role,
        hasPets,
        smokes,
        contactMethod,
        message,
        status: "PENDING",
        paymentStatus: "UNPAID",
      },
    });

    return NextResponse.json(reservationRequest);
  } catch (error) {
    console.error("Error creating reservation request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Reservation request ID is required" }, { status: 400 });
    }

    const { status } = await request.json();

    if (!status || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Valid status (pending/approved/rejected) is required" }, { status: 400 });
    }

    // Get the reservation request
    const reservationRequest = await db.inquiry.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!reservationRequest) {
      return NextResponse.json({ error: "Reservation request not found" }, { status: 404 });
    }

    // Check if the current user is the landlord of the listing
    if (reservationRequest.listing.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update the reservation request status
    const updatedReservationRequest = await db.inquiry.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedReservationRequest);
  } catch (error) {
    console.error("Error updating reservation request status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all reservation requests for the landlord's listings
    const reservationRequests = await db.inquiry.findMany({
      where: {
        listing: { userId: user.id },
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            imageSrc: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reservationRequests);
  } catch (error) {
    console.error("Error getting reservation requests:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

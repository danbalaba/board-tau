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

    // Create the inquiry
    const inquiry = await db.inquiry.create({
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

    return NextResponse.json(inquiry);
  } catch (error) {
    console.error("Error creating inquiry:", error);
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
      return NextResponse.json({ error: "Inquiry ID is required" }, { status: 400 });
    }

    const { status } = await request.json();

    if (!status || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Valid status (pending/approved/rejected) is required" }, { status: 400 });
    }

    // Get the inquiry
    const inquiry = await db.inquiry.findUnique({
      where: { id },
      include: { listing: true, room: true },
    });

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Check if the current user is the landlord of the listing
    if (inquiry.listing.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update the inquiry status
    const updatedInquiry = await db.inquiry.update({
      where: { id },
      data: { status },
    });

    // If approved, create a reservation
    if (status === "APPROVED") {
      const moveInDate = new Date(inquiry.moveInDate);
      const endDate = new Date(moveInDate);
      endDate.setMonth(endDate.getMonth() + inquiry.stayDuration);

      const totalPrice = inquiry.room.price * inquiry.stayDuration; // Calculate total price

      await db.reservation.create({
        data: {
          userId: inquiry.userId,
          listingId: inquiry.listingId,
          roomId: inquiry.roomId,
          inquiryId: inquiry.id,
          startDate: moveInDate,
          endDate,
          durationInDays: inquiry.stayDuration * 30, // Convert months to days
          totalPrice,
          status: "CONFIRMED",
          paymentStatus: "PENDING",
        },
      });
    }

    return NextResponse.json(updatedInquiry);
  } catch (error) {
    console.error("Error updating inquiry status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all inquiries for the current user
    const inquiries = await db.inquiry.findMany({
      where: {
        userId: user.id,
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(inquiries);
  } catch (error) {
    console.error("Error getting inquiries:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/services/user";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: inquiryId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find the inquiry
    const inquiry = await db.inquiry.findUnique({
      where: { id: inquiryId },
      include: {
        listing: true,
        room: true,
      },
    });

    if (!inquiry) {
      return NextResponse.json(
        { message: "Inquiry not found" },
        { status: 404 }
      );
    }

    // Check if the current user is the landlord
    if (inquiry.listing.userId !== user.id) {
      return NextResponse.json(
        { message: "Only the landlord can approve inquiries" },
        { status: 403 }
      );
    }

    // Check if the inquiry is in PENDING status
    if (inquiry.status !== "PENDING") {
      return NextResponse.json(
        { message: "Only pending inquiries can be approved" },
        { status: 400 }
      );
    }

    // Update inquiry to APPROVED
    const updatedInquiry = await db.inquiry.update({
      where: { id: inquiryId },
      data: {
        status: "APPROVED" as any,
        isApproved: true,
        approvedBy: user.id,
        approvedAt: new Date(),
      },
    });

    // Calculate total price based on reservation fee
    const totalPrice = (inquiry as any).reservationFee || 0;

    // Calculate start and end dates and duration
    const startDate = new Date(inquiry.moveInDate);
    const endDate = new Date(inquiry.checkOutDate);
    const durationDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Create reservation with PENDING_PAYMENT status
    const reservation = await db.reservation.create({
      data: {
        userId: inquiry.userId,
        listingId: inquiry.listingId,
        roomId: inquiry.roomId,
        inquiryId: inquiry.id,
        startDate,
        endDate,
        durationInDays: durationDays,
        totalPrice,
        status: "PENDING_PAYMENT" as any,
        paymentStatus: "PENDING" as any,
      },
    });

    return NextResponse.json({
      inquiry: updatedInquiry,
      reservation,
    });
  } catch (error) {
    console.error("Error approving inquiry:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

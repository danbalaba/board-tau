import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/services/user";
import { sendReservationNotificationEmail } from "@/services/email/notifications";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reservationId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find the reservation
    const reservation = await db.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return NextResponse.json(
        { message: "Reservation not found" },
        { status: 404 }
      );
    }

    // Check if the user owns the reservation
    if (reservation.userId !== user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if the reservation can be cancelled
    const currentStatus = reservation.status as string;
    if (currentStatus !== "PENDING_PAYMENT" && currentStatus !== "RESERVED") {
      return NextResponse.json(
        { message: "Only pending payment or reserved reservations can be cancelled" },
        { status: 400 }
      );
    }

    // Get reason from body
    const body = await request.json();
    const { reason } = body;

    // Update the reservation status to CANCELLED and store the reason
    const updatedReservation = await db.reservation.update({
      where: { id: reservationId },
      data: {
        status: "CANCELLED",
        cancellationReason: reason || "No reason specified",
      },
      include: {
        listing: true,
        user: true,
      }
    });

    // IMPORTANT: Release the room slots!
    // Since this is a student cancel, we must add the occupants back.
    const occupants = (updatedReservation as any).occupantsCount || 1;
    await db.room.update({
      where: { id: updatedReservation.roomId },
      data: {
        availableSlots: { increment: occupants },
        status: "AVAILABLE"
      }
    });

    // Notify Landlord
    try {
      const landlord = await db.user.findUnique({
        where: { id: updatedReservation.listing.userId },
        select: { email: true, name: true }
      });

      if (landlord && landlord.email) {
        await sendReservationNotificationEmail(
          landlord,
          updatedReservation.listing,
          "CANCELLED",
          "Booking Withdrawn",
          `${updatedReservation.user.name} has cancelled their reservation for ${updatedReservation.listing.title}. Reason: ${reason || 'No reason specified'}. The room is now available for others.`,
          true
        );
      }

      // Notify Tenant (Confirmation Receipt)
      if (updatedReservation.user && updatedReservation.user.email) {
        await sendReservationNotificationEmail(
          updatedReservation.user,
          updatedReservation.listing,
          "CANCELLED",
          "Reservation Cancellation Receipt", // More clear
          `This email confirms that your reservation for ${updatedReservation.listing.title} has been cancelled. If you have already paid a reservation fee, please contact the landlord for refund inquiries as per the policy.`,
          false
        );
      }
    } catch (e) {
      console.error("Cancel notify error:", e);
    }

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

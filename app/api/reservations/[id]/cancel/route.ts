import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/services/user";

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

    // Update the reservation status to CANCELLED
    const updatedReservation = await db.reservation.update({
      where: { id: reservationId },
      data: {
        status: "CANCELLED" as any,
      },
    });

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

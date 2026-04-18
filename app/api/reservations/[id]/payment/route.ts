import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/services/user";
import { createStripeCheckoutSession } from "@/services/payments/stripe";
import { createPayMongoCheckoutSession } from "@/services/payments/paymongo";

export async function POST(
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
      include: {
        inquiry: true,
        listing: true,
        room: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { message: "Reservation not found" },
        { status: 404 }
      );
    }

    // Check if the current user owns the reservation
    if (reservation.userId !== user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if the reservation is in PENDING_PAYMENT status
    if ((reservation.status as string) !== "PENDING_PAYMENT") {
      return NextResponse.json(
        { message: "Reservation is not pending payment" },
        { status: 400 }
      );
    }

    // Get payment method from request
    let paymentMethod;
    try {
      const data = await request.json();
      paymentMethod = data.paymentMethod;
    } catch (e) {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    // Handle different payment methods
    if (paymentMethod === "STRIPE" || !paymentMethod) {
      if (!reservation.inquiryId) {
        return NextResponse.json(
          { message: "No associated inquiry found for this reservation" },
          { status: 400 }
        );
      }

      // Create Stripe checkout session
      const stripeSession = await createStripeCheckoutSession(reservation.inquiryId);

      return NextResponse.json(stripeSession);
    } else if (paymentMethod === "GCASH" || paymentMethod === "MAYA") {
      if (!reservation.inquiryId) {
        return NextResponse.json(
          { message: "No associated inquiry found for this reservation" },
          { status: 400 }
        );
      }

      // Create PayMongo checkout session
      const paymongoSession = await createPayMongoCheckoutSession({
        amount: reservation.totalPrice,
        description: `Reservation for ${reservation.listing.title} - ${reservation.room.name}`,
        name: user.name || "BoardTAU User",
        email: user.email || "",
        inquiryId: reservation.inquiryId,
        paymentMethod: paymentMethod as "GCASH" | "MAYA",
      });

      return NextResponse.json(paymongoSession);
    } else {
      return NextResponse.json(
        { message: "Invalid payment method" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
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
      include: {
        listing: true,
        room: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { message: "Reservation not found" },
        { status: 404 }
      );
    }

    // Check if the current user owns the reservation
    if (reservation.userId !== user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Return payment options
    return NextResponse.json({
      reservationId: reservation.id,
      totalPrice: reservation.totalPrice,
      status: reservation.status,
      paymentStatus: reservation.paymentStatus,
      paymentMethods: [
        {
          id: "STRIPE",
          name: "Credit/Debit Card (Stripe)",
          enabled: true,
        },
        {
          id: "GCASH",
          name: "GCash",
          enabled: true,
        },
        {
          id: "MAYA",
          name: "Maya",
          enabled: true,
        },
      ],
    });
  } catch (error) {
    console.error("Error getting payment options:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

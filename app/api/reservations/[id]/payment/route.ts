import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/services/user";
import { createStripeCheckoutSession } from "@/services/payments/stripe";

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
    const data = await request.json();
    const { paymentMethod } = data;

    // Handle different payment methods
    if (paymentMethod === "STRIPE" || !paymentMethod) {
      // Use Stripe for payment
      // For this, we need to find the associated inquiry
      if (!reservation.inquiryId) {
        return NextResponse.json(
          { message: "No associated inquiry found" },
          { status: 400 }
        );
      }

      // Create Stripe checkout session
      const stripeSession = await createStripeCheckoutSession(reservation.inquiryId);

      return NextResponse.json(stripeSession);
    } else if (paymentMethod === "GCASH" || paymentMethod === "MAYA") {
      // GCash and Maya are placeholders - coming soon
      return NextResponse.json(
        { message: `${paymentMethod} payment is coming soon. Please use Stripe for now.` },
        { status: 400 }
      );
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
          enabled: false,
          comingSoon: true,
        },
        {
          id: "MAYA",
          name: "Maya",
          enabled: false,
          comingSoon: true,
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

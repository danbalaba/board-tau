import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/services/user";

export const createStripeCheckoutSession = async (inquiryId: string) => {
  // Check if Stripe is configured
  if (!stripe) {
    throw new Error("Stripe not configured");
  }

  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get the reservation request (inquiry)
  const inquiry = await db.inquiry.findUnique({
    where: { id: inquiryId },
    include: {
      listing: true,
      room: true,
    },
  });

  if (!inquiry) {
    throw new Error("Reservation request not found");
  }

  // Check if the inquiry is approved and unpaid
  if (inquiry.status !== "APPROVED" || (inquiry as any).paymentStatus === "PAID") {
    throw new Error("Reservation request is not approved or already paid");
  }

  // Check if the current user is the one who made the reservation
  if (inquiry.userId !== user.id) {
    throw new Error("Unauthorized");
  }

  // Use the fixed reservation fee stored in the inquiry
  const totalPrice = (inquiry as any).reservationFee || 0;

  // Create Stripe product
  const product = await stripe.products.create({
    name: inquiry.listing.title,
    description: `Reservation for ${inquiry.listing.title} - ${inquiry.room?.name}`,
    images: [inquiry.listing.imageSrc],
    default_price_data: {
      currency: "PHP",
      unit_amount: totalPrice * 100,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:3000');

  // Create Stripe checkout session
  const stripeSession = await stripe.checkout.sessions.create({
    success_url: `${baseUrl}/reservations`,
    cancel_url: `${baseUrl}/listings/${inquiry.listingId}`,
    payment_method_types: ['card'],
    mode: 'payment',
    metadata: {
      inquiryId,
      listingId: inquiry.listingId,
      roomId: inquiry.roomId,
      userId: user.id,
      totalPrice: String(totalPrice),
    },
    line_items: [{ price: product.default_price as string, quantity: 1 }],
    allow_promotion_codes: true,
    locale: 'auto',
    shipping_address_collection: { allowed_countries: [] },
  });

  return { url: stripeSession.url };
};

const getDurationMonths = (duration: number): number => {
  const durationMap: Record<number, number> = {
    1: 1,
    3: 3,
    6: 6,
    12: 12,
  };

  return durationMap[duration] || 1;
};

export const handleStripeWebhook = async (session: any) => {
  const { inquiryId, listingId, roomId, userId, totalPrice } = session.metadata || {};

  if (!inquiryId || !listingId || !roomId || !userId || !totalPrice) {
    throw new Error("Invalid session metadata");
  }

  // Update the inquiry payment status
  await db.inquiry.update({
    where: { id: inquiryId },
    data: {
      paymentStatus: "PAID",
      status: "APPROVED",
    },
  });

  // Lock the room/bedspace to prevent double booking
  const room = await db.room.findUnique({ where: { id: roomId } });
  if (room) {
    const newAvailableSlots = room.availableSlots - 1;
    const newStatus = newAvailableSlots <= 0 ? "FULL" : "AVAILABLE";

    await db.room.update({
      where: { id: roomId },
      data: {
        availableSlots: newAvailableSlots,
        status: newStatus,
      },
    });
  }

  // Update the existing reservation record
  await db.reservation.update({
    where: { inquiryId: inquiryId },
    data: {
      status: "RESERVED",
      paymentStatus: "PAID",
    },
  });

  return { success: true };
};

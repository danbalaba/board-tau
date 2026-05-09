import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/services/user";
import { 
  sendReservationNotificationEmail,
  sendReservationFeeEmail
} from "@/services/email/notifications";
import { createNotification } from "@/services/notification";

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

  // 1. Idempotency Check: Prevent duplicate processing
  const existingInquiry = await db.inquiry.findUnique({
    where: { id: inquiryId },
    select: { paymentStatus: true }
  });

  if ((existingInquiry as any)?.paymentStatus === "PAID") {
    console.log(`ℹ️ Webhook: Payment already processed for Inquiry ${inquiryId}. Skipping...`);
    return { success: true };
  }

  // Update the inquiry payment status
  await db.inquiry.update({
    where: { id: inquiryId },
    data: {
      paymentStatus: "PAID",
      status: "APPROVED",
    },
  });

  // 1. ATOMIC STATUS UPDATE: Only proceed if the reservation is still PENDING_PAYMENT
  let updatedReservation;
  try {
    updatedReservation = await db.reservation.update({
      where: {
        inquiryId: inquiryId,
        status: "PENDING_PAYMENT"
      },
      data: {
        status: "RESERVED",
        paymentStatus: "PAID",
      },
      include: {
        listing: true,
        user: true,
        room: true
      }
    });
  } catch (error) {
    console.log(`ℹ️ Webhook: Reservation ${inquiryId} already finalized. Skipping inventory update.`);
    return { success: true };
  }

  // 2. INVENTORY LOCK: Only happens ONCE because of the atomic status check above
  if (updatedReservation.room) {
    // CRITICAL: Fetch count from Inquiry to ensure source-of-truth accuracy
    const sourceInquiry = await db.inquiry.findUnique({
      where: { id: updatedReservation.inquiryId as string },
      select: { occupantsCount: true }
    });

    const slotsToSubtract = Number(sourceInquiry?.occupantsCount || updatedReservation.occupantsCount) || 1;

    // 2. HARD FLOOR: Fetch current slots to ensure we don't go negative
    const currentRoom = await db.room.findUnique({
      where: { id: updatedReservation.roomId },
      select: { availableSlots: true }
    });

    const currentSlots = currentRoom?.availableSlots || 0;
    const finalSubtraction = Math.min(currentSlots, slotsToSubtract);

    const updatedRoom = await db.room.update({
      where: { id: updatedReservation.roomId },
      data: {
        availableSlots: { decrement: finalSubtraction },
      },
    });

    // 3. AUTO-CLOSE: If slots hit 0, mark as FULL
    if (updatedRoom.availableSlots <= 0) {
      await db.room.update({
        where: { id: updatedReservation.roomId },
        data: { status: "FULL" },
      });
    }

    // CRITICAL: Invalidate Cache
    const { revalidatePath } = await import("next/cache");
    const { cache } = await import("@/lib/redis");
    revalidatePath(`/listings/${listingId}`);
    try {
      await cache.del(`listing:id:${listingId}`);
      await cache.delPattern("listings:*");
    } catch (e) { console.error("Cache clear error in Stripe webhook:", e); }
  }

  // 4. Trigger Email Notifications
  try {
    // Get Landlord
    const landlord = await db.user.findUnique({
      where: { id: updatedReservation.listing.userId },
      select: { email: true, name: true }
    });

    // Notify Tenant Email & In-app
    if (updatedReservation.user.email) {
      await sendReservationNotificationEmail(
        updatedReservation.user,
        updatedReservation.listing,
        "RESERVED",
        "Booking Confirmed!",
        `Success! Your reservation for ${updatedReservation.listing.title} is now confirmed. We look forward to your stay!`
      );

      // In-app for Tenant
      await createNotification({
        userId: updatedReservation.userId,
        type: 'reservation',
        title: 'Booking Confirmed!',
        description: `Your reservation for ${updatedReservation.listing.title} is now secured and confirmed.`,
        link: `/reservations?id=${updatedReservation.id}`
      });
    }

    // Notify Landlord Email (Premium Template) & In-app
    if (landlord && landlord.email) {
      await sendReservationFeeEmail(
        landlord,
        updatedReservation.user,
        updatedReservation.listing,
        updatedReservation.totalPrice
      );

      // In-app for Landlord
      await createNotification({
        userId: updatedReservation.listing.userId,
        type: 'reservation',
        title: 'New Confirmed Reservation',
        description: `${updatedReservation.user.name} has secured their reservation for ${updatedReservation.listing.title} via Stripe.`,
        link: `/landlord/reservations`
      });
    }
  } catch (emailError) {
    console.error("Failed to send reservation confirmation emails:", emailError);
  }

  return { success: true };
};

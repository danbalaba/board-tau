import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleStripeWebhook } from "@/services/payments/stripe";
import { 
  sendReservationNotificationEmail, 
  sendReservationFeeEmail 
} from "@/services/email/notifications";
import { createNotification } from "@/services/notification";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const eventType = payload.data.attributes.type;
    const resourceId = payload.data.attributes.resource.id;
    const checkoutSessionId = payload.data.attributes.resource.attributes.checkout_session_id;
    
    // Extract metadata (inquiryId) from the PayMongo checkout session
    const metadata = payload.data.attributes.resource.attributes.metadata;
    const inquiryId = metadata?.inquiryId;

    switch (eventType) {
      case "checkout_session.payment.paid":
        if (!inquiryId) {
          console.error("No inquiryId found in PayMongo webhook metadata");
          return NextResponse.json({ message: "Invalid metadata" }, { status: 400 });
        }

        console.log(`Payment confirmed for inquiry: ${inquiryId}`);

        const inquiry = await db.inquiry.findUnique({
          where: { id: inquiryId },
          include: { listing: true, room: true }
        });

        if (inquiry) {
          let updatedReservation;
          try {
            const pendingReservation = await db.reservation.findFirst({
              where: { inquiryId: inquiryId, status: "PENDING_PAYMENT" }
            });
            
            if (!pendingReservation) {
              console.log(`ℹ️ PayMongo: Reservation ${inquiryId} already finalized. Skipping inventory update.`);
              return NextResponse.json({ ok: true });
            }

            updatedReservation = await db.reservation.update({
              where: { id: pendingReservation.id },
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
            console.log(`ℹ️ PayMongo: Reservation update error. Skipping.`);
            return NextResponse.json({ ok: true });
          }

          // 2. INVENTORY LOCK: Only happens if this webhook was the first to flip the status
          if (updatedReservation.room) {
            const slotsToSubtract = Number(updatedReservation.occupantsCount) || 1;
            
            const updatedRoom = await db.room.update({
              where: { id: updatedReservation.roomId },
              data: {
                availableSlots: { decrement: slotsToSubtract },
              },
            });

            if (updatedRoom.availableSlots <= 0) {
              await db.room.update({
                where: { id: updatedReservation.roomId },
                data: { status: "FULL" },
              });
            }

            // CRITICAL: Invalidate Cache
            const { revalidatePath } = await import("next/cache");
            const { cache } = await import("@/lib/redis");
            revalidatePath(`/listings/${updatedReservation.listingId}`);
            try {
              await cache.del(`listing:id:${updatedReservation.listingId}`);
              await cache.delPattern("listings:*");
            } catch (e) { console.error("Cache clear error in Paymongo webhook:", e); }
          }

          // Trigger Notifications
          try {
            const landlord = await db.user.findUnique({
              where: { id: updatedReservation.listing.userId },
              select: { email: true, name: true }
            });

            // Tenant Email & In-app
            if (updatedReservation.user?.email) {
              await sendReservationNotificationEmail(
                updatedReservation.user!,
                updatedReservation.listing,
                "RESERVED",
                "Booking Confirmed!",
                `Your payment was successful! Your reservation for ${updatedReservation.listing.title} is now secured.`
              );

              // In-app for Tenant
              await createNotification({
                userId: updatedReservation.userId!,
                type: 'reservation',
                title: 'Booking Confirmed!',
                description: `Payment successful! Your reservation for ${updatedReservation.listing.title} is now secured.`,
                link: `/reservations?id=${updatedReservation.id}`
              });
            }

            // Landlord Email (Premium Template) & In-app
            if (landlord && landlord.email) {
              await sendReservationFeeEmail(
                landlord,
                updatedReservation.user!,
                updatedReservation.listing,
                updatedReservation.totalPrice
              );

              // In-app for Landlord
              await createNotification({
                userId: updatedReservation.listing.userId,
                type: 'reservation',
                title: 'New Confirmed Reservation',
                description: `${updatedReservation.user?.name} has secured their reservation for ${updatedReservation.listing.title} via PayMongo.`,
                link: `/landlord/reservations`
              });
            }
          } catch (notifErr) {
            console.error("Failed PayMongo notifications:", notifErr);
          }

        }
        break;

      case "checkout_session.expired":
        if (inquiryId) {
          console.log(`Checkout session expired for inquiry: ${inquiryId}`);
          // Mark the reservation as EXPIRED
          await db.reservation.updateMany({
            where: { inquiryId: inquiryId },
            data: {
              status: "EXPIRED",
              paymentStatus: "FAILED",
            },
          });
        }
        break;

      case "payment.failed":
        if (inquiryId) {
          console.log(`Payment failed for inquiry: ${inquiryId}`);
          await db.reservation.updateMany({
            where: { inquiryId: inquiryId },
            data: {
              status: "PENDING_PAYMENT", // Keep it pending so they can try again
              paymentStatus: "FAILED",
            },
          });
        }
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("PayMongo Webhook Error:", err.message);
    return NextResponse.json({ message: "Webhook handler failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleStripeWebhook } from "@/services/payments/stripe";
import { sendReservationNotificationEmail } from "@/services/email/notifications";
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
          await db.inquiry.update({
            where: { id: inquiryId },
            data: {
              paymentStatus: "PAID",
              status: "APPROVED",
            },
          });

          // Update reservation
          const updatedReservation = await db.reservation.update({
            where: { inquiryId: inquiryId },
            data: {
              status: "RESERVED",
              paymentStatus: "PAID",
            },
            include: {
              listing: true,
              user: true,
            }
          });

          // Trigger Notifications
          try {
            const landlord = await db.user.findUnique({
              where: { id: updatedReservation.listing.userId },
              select: { email: true, name: true }
            });

            // Tenant Email & In-app
            if (updatedReservation.user.email) {
              await sendReservationNotificationEmail(
                updatedReservation.user,
                updatedReservation.listing,
                "RESERVED",
                "Booking Confirmed!",
                `Your payment was successful! Your reservation for ${updatedReservation.listing.title} is now secured.`
              );

              // In-app for Tenant
              await createNotification({
                userId: updatedReservation.userId,
                type: 'reservation',
                title: 'Booking Confirmed!',
                description: `Payment successful! Your reservation for ${updatedReservation.listing.title} is now secured.`,
                link: `/reservations?id=${updatedReservation.id}`
              });
            }

            // Landlord Email & In-app
            if (landlord && landlord.email) {
              await sendReservationNotificationEmail(
                landlord,
                updatedReservation.listing,
                "RESERVED",
                "New Confirmed Reservation",
                `${updatedReservation.user.name} has successfully paid the reservation via PayMongo for ${updatedReservation.listing.title}.`,
                true
              );

              // In-app for Landlord
              await createNotification({
                userId: updatedReservation.listing.userId,
                type: 'reservation',
                title: 'New Confirmed Reservation',
                description: `${updatedReservation.user.name} has secured their reservation for ${updatedReservation.listing.title} via PayMongo.`,
                link: `/landlord/reservations`
              });
            }
          } catch (notifErr) {
            console.error("Failed PayMongo notifications:", notifErr);
          }

          // Update room available slots
          if (inquiry.roomId) {
            const room = await db.room.findUnique({ where: { id: inquiry.roomId } });
            if (room) {
              const newAvailableSlots = room.availableSlots - 1;
              await db.room.update({
                where: { id: inquiry.roomId },
                data: {
                  availableSlots: newAvailableSlots,
                  status: newAvailableSlots <= 0 ? "FULL" : "AVAILABLE",
                },
              });
            }
          }
        }
        break;

      case "checkout_session.expired":
        if (inquiryId) {
          console.log(`Checkout session expired for inquiry: ${inquiryId}`);
          // Mark the reservation as EXPIRED
          await db.reservation.update({
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
          await db.reservation.update({
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

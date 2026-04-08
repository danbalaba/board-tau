import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleStripeWebhook } from "@/services/payments/stripe";

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
          await db.reservation.update({
            where: { inquiryId: inquiryId },
            data: {
              status: "RESERVED",
              paymentStatus: "PAID",
            },
          });

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

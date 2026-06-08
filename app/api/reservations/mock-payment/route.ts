import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { sendReservationNotificationEmail } from "@/services/email/notifications";
import { createNotification } from "@/services/notification";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const inquiryId = searchParams.get("inquiryId");
  const status = searchParams.get("status");
  const method = searchParams.get("method");

  if (status === "success" && inquiryId) {
    console.log(`Simulating success for ${method} on inquiry: ${inquiryId}`);

    const inquiry = await db.inquiry.findUnique({
      where: { id: inquiryId },
      include: { listing: true, room: true },
    });

    if (inquiry) {
      // Simulate what the webhook would do
      // 1. ATOMIC STATUS UPDATE: Only proceed if the reservation is still PENDING_PAYMENT
      let updatedReservation;
      try {
        updatedReservation = await db.reservation.update({
          where: { 
            inquiryId: inquiry.id,
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
        console.log(`ℹ️ Mock: Reservation ${inquiry.id} already finalized. Skipping inventory update.`);
        return NextResponse.json({ success: true, message: "Already paid" });
      }

      // 2. INVENTORY LOCK: Only happens ONCE because of the atomic status check above
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
        } catch (e) { console.error("Cache clear error in Mock Payment:", e); }
      }

      // 🔥 Trigger Email Notifications
      try {
        const landlord = await db.user.findUnique({
          where: { id: updatedReservation.listing.userId },
          select: { email: true, name: true }
        });

        if (updatedReservation.user.email) {
          await sendReservationNotificationEmail(
            updatedReservation.user,
            updatedReservation.listing,
            "RESERVED",
            "Booking Confirmed!",
            `Success! Your simulated payment was accepted. Your reservation for ${updatedReservation.listing.title} is now confirmed.`
          );

          // In-app for Tenant
          await createNotification({
            userId: updatedReservation.userId,
            type: 'reservation',
            title: 'Booking Confirmed!',
            description: `Your reservation for ${updatedReservation.listing.title} is now secured and confirmed (Simulated).`,
            link: `/reservations?id=${updatedReservation.id}`
          });
        }

        if (landlord && landlord.email) {
          await sendReservationNotificationEmail(
            landlord,
            updatedReservation.listing,
            "RESERVED",
            "New Confirmed Reservation (Mock)",
            `${updatedReservation.user.name} has paid the reservation fee for ${updatedReservation.listing.title} using ${method}.`,
            true
          );

          // In-app for Landlord
          await createNotification({
            userId: updatedReservation.listing.userId,
            type: 'reservation',
            title: 'New Confirmed Reservation (Mock)',
            description: `${updatedReservation.user.name} has secured their reservation for ${updatedReservation.listing.title} via ${method}.`,
            link: `/landlord/reservations`
          });
        }
      } catch (e) {
        console.error("Mock notification error:", e);
      }
    }
  }

  // Redirect to reservations page with a success message
  redirect(`/reservations?status=${status}&method=${method}`);
}

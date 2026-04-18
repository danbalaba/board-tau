import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { sendReservationNotificationEmail } from "@/services/email/notifications";

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
        }
      } catch (e) {
        console.error("Mock notification error:", e);
      }

      // Update room availability
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
  }

  // Redirect to reservations page with a success message
  redirect(`/reservations?status=${status}&method=${method}`);
}

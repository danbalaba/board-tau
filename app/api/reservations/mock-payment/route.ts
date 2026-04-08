import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

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
      await db.reservation.update({
        where: { inquiryId: inquiryId },
        data: {
          status: "RESERVED",
          paymentStatus: "PAID",
        },
      });

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

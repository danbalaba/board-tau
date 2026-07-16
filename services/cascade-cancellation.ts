import { db } from "@/lib/db";
import { sendReservationNotificationEmail } from "@/services/email/notifications";
import { createNotification } from "@/services/notification";
import { baseUrl } from "@/services/email/constants";

export async function executeCascadeCancellation(userId: string, reason: string = "User suspended for community guidelines violation.", isPermanentBan: boolean = false) {
  console.log(`Executing cascade cancellation for user: ${userId}`);

  // 1. Fetch user data to use in notifications
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true }
  });

  if (!user) return;
  const userName = user.name || "A user";

  // Note: We deliberately do NOT cancel PENDING inquiries for temporary suspensions. 
  // However, if it's a permanent ban, we DO cancel them because the user is never coming back.
  if (isPermanentBan) {
    const pendingInquiries = await db.inquiry.findMany({
      where: { userId, status: 'PENDING' },
      include: {
        listing: { select: { title: true, userId: true } }
      }
    });

    for (const inquiry of pendingInquiries) {
      await db.inquiry.update({
        where: { id: inquiry.id },
        data: { 
          status: 'CANCELLED',
          cancellationReason: reason
        }
      });

      const landlord = await db.user.findUnique({
        where: { id: inquiry.listing.userId },
        select: { id: true, email: true, name: true }
      });

      if (landlord) {
        if (landlord.email) {
          await sendReservationNotificationEmail(
            landlord,
            inquiry.listing,
            "CANCELLED",
            "System Alert: Inquiry Cancelled",
            `The inquiry for ${inquiry.listing.title} by ${userName} has been forcefully cancelled by the system because the user's account was permanently banned.`,
            true,
            `${baseUrl}/landlord/inquiries`,
            "Manage Inquiries"
          );
        }

        await createNotification({
          userId: landlord.id,
          type: "inquiry",
          title: "System Alert: Inquiry Cancelled",
          description: `The inquiry for ${inquiry.listing.title} by ${userName} was forcefully cancelled due to a safety violation.`,
          link: `/landlord/inquiries`
        });
      }
    }
  }

  // 3. Find and cancel PENDING or RESERVED reservations
  const activeReservations = await db.reservation.findMany({
    where: { 
      userId, 
      status: { in: ['PENDING_PAYMENT', 'RESERVED'] } 
    },
    include: {
      listing: { select: { title: true, userId: true } },
      room: { select: { id: true, capacity: true } }
    }
  });

  for (const reservation of activeReservations) {
    // Update reservation to CANCELLED
    await db.reservation.update({
      where: { id: reservation.id },
      data: { 
        status: 'CANCELLED',
        cancellationReason: reason
      }
    });

    // We do NOT refund the reservation fee (per policy)
    // We must restore the available slots in the room if it was RESERVED
    if (reservation.status === 'RESERVED') {
      const occupantsCount = reservation.occupantsCount || 1;
      const slotDelta = reservation.isSoloBuyout ? reservation.room.capacity : occupantsCount;

      await db.room.update({
        where: { id: reservation.roomId },
        data: {
          availableSlots: {
            increment: slotDelta
          }
        }
      });
    }

    // Notify the landlord
    const landlord = await db.user.findUnique({
      where: { id: reservation.listing.userId },
      select: { id: true, email: true, name: true }
    });

    if (landlord) {
      if (landlord.email) {
        await sendReservationNotificationEmail(
          landlord,
          reservation.listing,
          "CANCELLED",
          "System Alert: Booking Cancelled",
          `The reservation for ${reservation.listing.title} by ${userName} has been forcefully cancelled by the system because the user's account was suspended for violating community guidelines. Your room is now available for new bookings.`,
          true,
          `${baseUrl}/landlord/reservations`,
          "Manage Reservations"
        );
      }

      await createNotification({
        userId: landlord.id,
        type: "reservation",
        title: "System Alert: Booking Cancelled",
        description: `The reservation for ${reservation.listing.title} by ${userName} was forcefully cancelled. The room is now available.`,
        link: `/landlord/reservations`
      });
    }
  }
}

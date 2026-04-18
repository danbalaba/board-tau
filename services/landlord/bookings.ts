"use server";

import { db } from "@/lib/db";
import { requireLandlord } from "@/lib/landlord";
import { createNotification } from "@/services/notification";
import { sendReservationNotificationEmail, baseUrl } from "@/services/email/notifications";
import { revalidatePath } from "next/cache";
import { cache } from "@/lib/redis";

export const getLandlordBookings = async (args?: {
  cursor?: string;
  status?: string;
  paymentStatus?: string;
  isArchived?: string;
}) => {
  const landlord = await requireLandlord();

  const { cursor, status, paymentStatus, isArchived } = args || {};

  const where: any = {
    listing: {
      userId: landlord.id,
    },
  };

  if (status) {
    where.status = status;
  }

  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }

  if (isArchived !== undefined) {
    where.isArchived = isArchived === 'true';
  } else {
    where.isArchived = false;
  }

  const reservations = await db.reservation.findMany({
    where,
    take: 20 + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      listing: {
        select: {
          id: true,
          title: true,
          imageSrc: true,
        },
      },
      room: {
        select: {
          id: true,
          name: true,
          price: true,
          reservationFee: true,
        },
      },
    },
  });

  const nextCursor = reservations.length > 20 ? reservations[20 - 1].id : null;
  const list = reservations.slice(0, 20).map(reservation => ({
    ...reservation,
    moveInDate: reservation.startDate,
    stayDuration: (reservation as any).durationInDays || 0,
  }));

  return { bookings: list, nextCursor };
};

export const getBookingDetails = async (bookingId: string) => {
  const landlord = await requireLandlord();

  const booking = await db.reservation.findFirst({
    where: {
      id: bookingId,
      listing: {
        userId: landlord.id,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      listing: {
        select: {
          id: true,
          title: true,
          imageSrc: true,
          description: true,
          amenities: true,
        },
      },
      room: {
        select: {
          id: true,
          name: true,
          price: true,
          reservationFee: true,
        },
      },
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  return {
    ...booking,
    moveInDate: booking.startDate,
    stayDuration: (booking as any).durationInDays || 0,
  };
};

export const updateBookingStatus = async (
  bookingId: string,
  status: "PENDING_PAYMENT" | "RESERVED" | "CHECKED_IN" | "COMPLETED" | "CANCELLED"
) => {
  const landlord = await requireLandlord();

  const booking = await db.reservation.findFirst({
    where: {
      id: bookingId,
      listing: {
        userId: landlord.id,
      },
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  const previousStatus = booking.status;
  const occupantCount = (booking as any).occupantsCount || 1;

  // 1. Determine if we need to update room slots
  // As per brainstorming, the decrement will now happen strictly on CHECKED_IN
  const isNowOccupying = status === "CHECKED_IN";
  const wasPreviouslyOccupying = previousStatus === "CHECKED_IN";

  // Perform slot updates ONLY if the "occupancy" state has changed to avoid double-counting
  if (isNowOccupying && !wasPreviouslyOccupying) {
    // LOCK SLOT: Decrement available slots based on group size
    await db.room.update({
      where: { id: booking.roomId },
      data: {
        availableSlots: { decrement: occupantCount },
      }
    });

    // Check if room is now full and update status
    const updatedRoom = await db.room.findUnique({
      where: { id: booking.roomId },
      select: { availableSlots: true }
    });

    if (updatedRoom && updatedRoom.availableSlots <= 0) {
      await db.room.update({
        where: { id: booking.roomId },
        data: { status: "FULL" }
      });
    }
  } else if (!isNowOccupying && wasPreviouslyOccupying) {
    // RELEASE SLOT: Increment available slots (Cancellation or Completion)
    await db.room.update({
      where: { id: booking.roomId },
      data: {
        availableSlots: { increment: occupantCount },
        status: "AVAILABLE" // Always ensure it's available if a slot is freed
      }
    });
  }

  const updatedBooking = await db.reservation.update({
    where: { id: bookingId },
    data: {
      status,
    },
    include: {
      listing: { select: { title: true, userId: true } },
      user: { select: { name: true, email: true } }
    }
  }) as any;

  // Notify the user about the booking status update
  let title = "Booking Update";
  let description = `Your booking for ${updatedBooking.listing.title} has been updated to ${status.replace('_', ' ')}.`;

  if (status === "RESERVED") {
    title = "Booking Confirmed!";
    description = `Your stay at ${updatedBooking.listing.title} is now officially reserved. See you soon!`;
  } else if (status === "CHECKED_IN") {
    title = "Welcome Home!";
    description = `You have been checked in to ${updatedBooking.listing.title}. Enjoy your stay!`;
  } else if (status === "COMPLETED") {
    title = "Stay Completed";
    description = `We hope you enjoyed your stay at ${updatedBooking.listing.title}. Don't forget to leave a review!`;
  }

  const notifications = [
    createNotification({
      userId: booking.userId,
      type: "reservation",
      title,
      description,
      link: `/reservations?id=${updatedBooking.id}`,
    })
  ];

  if (status === "CHECKED_IN") {
    notifications.push(
      createNotification({
        userId: updatedBooking.listing.userId,
        type: "reservation",
        title: "Check-in Successful",
        description: `${updatedBooking.user.name || 'A guest'} has been checked in to ${updatedBooking.listing.title}.`,
        link: "/landlord/bookings",
      })
    );
  }

  await Promise.all(notifications);

  // 3. Send Email Notification to Tenant
  try {
    if (updatedBooking.user && updatedBooking.user.email) {
      await sendReservationNotificationEmail(
        updatedBooking.user,
        updatedBooking.listing,
        status,
        title,
        description
      );
    }

    // 4. Special case: Notify Landlord of check-in via email
    if (status === "CHECKED_IN") {
      const landlord = await db.user.findUnique({
        where: { id: updatedBooking.listing.userId },
        select: { email: true, name: true }
      });

      if (landlord && landlord.email) {
        await sendReservationNotificationEmail(
          landlord,
          updatedBooking.listing,
          status,
          "Check-in Successful",
          `${updatedBooking.user.name || 'A guest'} has been successfully checked in to your property.`,
          true,
          `${baseUrl}/landlord/bookings`
        );
      }
    }
  } catch (emailError) {
    console.error("Failed to send booking status email:", emailError);
  }

  // Code 4: Next.js Route & Manual Redis Cache Invalidation
  // Critical fix: ensure the front-facing listing page and available rooms section reload actual db capacity instead of stale cache
  revalidatePath(`/listings/${booking.listingId}`);
  revalidatePath(`/landlord/bookings`);

  try {
    // Invalidate manual Redis cache for the listing
    await cache.del(`listing:id:${booking.listingId}`);
    // Also clear generic listings cache just to be safe so search grids update
    await cache.delPattern("listings:*");
  } catch (cacheError) {
    console.error("Failed to invalidate Redis cache:", cacheError);
  }

  return updatedBooking;
};

export const toggleReservationArchive = async (bookingId: string) => {
  const landlord = await requireLandlord();

  const booking = await db.reservation.findFirst({
    where: {
      id: bookingId,
      listing: {
        userId: landlord.id,
      },
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  const updatedBooking = await db.reservation.update({
    where: { id: bookingId },
    data: {
      isArchived: !booking.isArchived,
    },
  });

  return updatedBooking;
};

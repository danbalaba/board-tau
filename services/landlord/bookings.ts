"use server";

import { db } from "@/lib/db";
import { requireLandlord } from "@/lib/landlord";

export const getLandlordBookings = async (args?: {
  cursor?: string;
  status?: string;
  paymentStatus?: string;
}) => {
  const landlord = await requireLandlord();

  const { cursor, status, paymentStatus } = args || {};

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
        },
      },
      listing: {
        select: {
          id: true,
          title: true,
          imageSrc: true,
        },
      },
    },
  });

  const nextCursor = reservations.length > 20 ? reservations[20 - 1].id : null;
  const list = reservations.slice(0, 20);

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
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  return booking;
};

export const updateBookingStatus = async (
  bookingId: string,
  status: "pending" | "confirmed" | "cancelled"
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

  const updatedBooking = await db.reservation.update({
    where: { id: bookingId },
    data: {
      status,
    },
  });

  // TODO: Send notification to user

  return updatedBooking;
};

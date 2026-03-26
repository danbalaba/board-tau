import React from "react";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

import EmptyState from "@/components/common/EmptyState";
import ReservationsClient from "@/components/reservations/ReservationsClient";

import { getCurrentUser } from "@/services/user";
import { db } from "@/lib/db";

const ReservationPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  // Get user reservations
  const reservations = await db.reservation.findMany({
    where: {
      userId: user.id,
    },
    include: {
      listing: true, // Includes all fields including region/country
      room: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Transform to match client component interface
  const transformedReservations = reservations.map((reservation) => ({
    id: reservation.id,
    listingId: reservation.listingId,
    roomId: reservation.roomId,
    userId: reservation.userId,
    startDate: reservation.startDate.toISOString(),
    endDate: reservation.endDate.toISOString(),
    durationInDays: reservation.durationInDays,
    totalPrice: reservation.totalPrice,
    status: reservation.status as string,
    paymentStatus: reservation.paymentStatus as string,
    paymentMethod: reservation.paymentMethod || undefined,
    paymentReference: reservation.paymentReference || undefined,
    createdAt: reservation.createdAt.toISOString(),
    listing: {
      id: reservation.listing.id,
      title: reservation.listing.title,
      imageSrc: reservation.listing.imageSrc,
      location: reservation.listing.location,
      region: (reservation.listing as any).region,
      country: (reservation.listing as any).country,
    },
    room: {
      id: reservation.room.id,
      name: reservation.room.name,
      price: reservation.room.price,
      roomType: reservation.room.roomType as string,
      images: [],
    },
  }));

  return (
    <ReservationsClient
      initialReservations={transformedReservations}
      userId={user.id}
    />
  );
};

export default ReservationPage;

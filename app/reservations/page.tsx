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

  // Security: If user is a LANDLORD, redirect to their landlord dashboard
  if (user.role === "LANDLORD") {
    redirect("/landlord/reservations");
  }

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  // Get user reservations
  const reservations = (await db.reservation.findMany({
    where: {
      userId: user.id,
    },
    include: {
      listing: true, // Includes all fields including region/country
      room: true,
      inquiry: true,
      reviews: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })) as any[];

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
    occupantsCount: reservation.occupantsCount,
    status: reservation.status as string,
    paymentStatus: reservation.paymentStatus as string,
    paymentMethod: reservation.paymentMethod || undefined,
    preferredPaymentMethod: reservation.inquiry?.paymentMethod || undefined,
    paymentReference: reservation.paymentReference || undefined,
    createdAt: reservation.createdAt.toISOString(),
    hasReview: (reservation as any).reviews.length > 0,
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
      reservationFee: reservation.room.reservationFee,
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

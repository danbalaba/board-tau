import { getCurrentUser } from "@/services/user";
import { db } from "@/lib/db";
import LandlordBookingReservations from "../features/booking-reservations";

export default async function LandlordReservationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  // Get all reservation requests for the landlord's listings
  const reservations = await db.inquiry.findMany({
    where: { listing: { userId: user.id } },
    include: {
      listing: { select: { id: true, title: true, imageSrc: true } },
      room: { select: { id: true, name: true, price: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <LandlordBookingReservations reservations={reservations as any} />;
}

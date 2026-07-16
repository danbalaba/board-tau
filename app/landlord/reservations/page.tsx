import { requireLandlord } from "@/lib/landlord";
import { requirePagePermission } from "@/lib/rbac";
import { getLandlordBookings } from "@/services/landlord/bookings";
import LandlordBookingReservations from "../features/booking-reservations";
import { db } from "@/lib/db";

export default async function LandlordReservationsPage() {
  const landlord = await requireLandlord();
  await requirePagePermission(landlord.id, "MANAGE_RESERVATIONS");
  
  // Fetch landlord listings to populate the walk-in modal
  const listings = await db.listing.findMany({
    where: { userId: landlord.id },
    include: {
      rooms: {
        include: {
          images: true
        }
      },
      images: true,
    }
  });

  // Get all reservations (in our refined pipeline, the client will filter for pre-stay)
  const result = await getLandlordBookings();

  return (
    <LandlordBookingReservations 
      reservations={result.bookings as any} 
      landlordId={landlord.id}
      listings={listings}
    />
  );
}

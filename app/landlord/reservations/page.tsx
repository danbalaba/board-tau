import { requireLandlord } from "@/lib/landlord";
import { getLandlordBookings } from "@/services/landlord/bookings";
import LandlordBookingReservations from "../features/booking-reservations";

export default async function LandlordReservationsPage() {
  await requireLandlord();
  
  // Get all reservations (in our refined pipeline, the client will filter for pre-stay)
  const result = await getLandlordBookings();

  return <LandlordBookingReservations reservations={result.bookings as any} />;
}

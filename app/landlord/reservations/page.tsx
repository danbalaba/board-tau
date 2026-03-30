import { getLandlordReservations } from "@/services/landlord/reservations";
import LandlordReservationsClient from "../components/pages/reservations/LandlordReservationsClient";

export default async function LandlordReservationsPage() {
  const reservationsTask = await getLandlordReservations();

  return <LandlordReservationsClient reservations={reservationsTask} />;
}

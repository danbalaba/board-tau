import { getLandlordBookings } from '@/services/landlord/bookings';
import LandlordBookingsClient from '../components/pages/bookings/LandlordBookingsClient';
import { requireLandlord } from '@/lib/landlord';

export const metadata = {
  title: 'Bookings - Landlord Dashboard',
  description: 'Manage your property bookings',
};

export default async function LandlordBookingsPage() {
  await requireLandlord();
  const bookings = await getLandlordBookings();

  return <LandlordBookingsClient bookings={bookings} />;
}

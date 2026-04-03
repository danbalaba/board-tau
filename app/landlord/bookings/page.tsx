import { getLandlordBookings } from '@/services/landlord/bookings';
import LandlordBookingsFeature from '../features/bookings';
import { requireLandlord } from '@/lib/landlord';

export const metadata = {
  title: 'Bookings - Landlord Dashboard',
  description: 'Manage your property bookings',
};

export default async function LandlordBookingsPage() {
  await requireLandlord();
  const bookings = await getLandlordBookings();

  return <LandlordBookingsFeature bookings={bookings} />;
}

import { getLandlordBookings } from '@/services/landlord/bookings';
import LandlordBookings from '../features/bookings';
import { requireLandlord } from '@/lib/landlord';

export const metadata = {
  title: 'Bookings - Landlord Dashboard',
  description: 'Manage your property bookings',
};

export default async function LandlordBookingsPage() {
  await requireLandlord();
  const bookings = await getLandlordBookings();

  return <LandlordBookings bookings={bookings as any} />;
}

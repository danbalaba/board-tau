import { Metadata } from 'next';
import { BookingManagement } from '@/app/admin/features/properties/components/booking-management';

export const metadata: Metadata = {
  title: 'Booking Management - BoardTAU Admin',
  description: 'Manage all property bookings and reservations',
};

export default function BookingManagementPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <BookingManagement />
    </div>
  );
}

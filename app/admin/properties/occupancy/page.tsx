import { Metadata } from 'next';
import { OccupancyTracking } from '@/app/admin/features/properties/components/occupancy-tracking';

export const metadata: Metadata = {
  title: 'Occupancy Tracking - BoardTAU Admin',
  description: 'Track and manage property bookings and occupancy',
};

export default function OccupancyTrackingPage() {
  return (
    <div className="flex-1 flex flex-col space-y-6">
      <OccupancyTracking />
    </div>
  );
}

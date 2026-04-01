import { getLandlordDashboardStats, getRevenueReport, getOccupancyReport } from '@/services/landlord/analytics';
import LandlordAnalytics from '../features/analytics';
import { requireLandlord } from '@/lib/landlord';

export const metadata = {
  title: 'Analytics - Landlord Dashboard',
  description: 'View property performance analytics',
};

export default async function LandlordAnalyticsPage() {
  await requireLandlord();
  const stats = await getLandlordDashboardStats();
  const revenue = await getRevenueReport();
  const occupancy = await getOccupancyReport();

  return <LandlordAnalytics stats={stats as any} revenue={revenue as any} occupancy={occupancy} />;
}

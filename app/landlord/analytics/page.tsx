import { getLandlordDashboardStats, getRevenueReport, getOccupancyReport } from '@/services/landlord/analytics';
import LandlordAnalyticsClient from '../components/pages/analytics/LandlordAnalyticsClient';
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

  return <LandlordAnalyticsClient stats={stats} revenue={revenue} occupancy={occupancy} />;
}

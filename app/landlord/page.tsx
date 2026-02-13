import { getLandlordDashboardStats } from '@/services/landlord/analytics';
import LandlordDashboardClient from './components/dashboard/LandlordDashboardClient';

export default async function LandlordDashboardPage() {
  const stats = await getLandlordDashboardStats();

  return <LandlordDashboardClient stats={stats} />;
}

import LandlordDashboardFeature from './features/dashboard';
import { getLandlordDashboardStats } from '@/services/landlord/analytics';
import { requireLandlord } from '@/lib/landlord';

export default async function LandlordDashboardPage() {
  await requireLandlord();
  const stats = await getLandlordDashboardStats();

  return <LandlordDashboardFeature stats={stats} />;
}

import { getLandlordDashboardStats } from '@/services/landlord/analytics';
import LandlordDashboardFeature from './features/dashboard';
import { requireLandlord } from '@/lib/landlord';

export default async function LandlordDashboardPage() {
  const stats = await getLandlordDashboardStats();
  const user = await requireLandlord();

  return <LandlordDashboardFeature stats={stats} user={user} />;
}

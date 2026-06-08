import { getLandlordDashboardStats } from '@/services/landlord/analytics';
import LandlordDashboardFeature from './features/dashboard';
import { requireLandlord } from '@/lib/landlord';

export default async function LandlordDashboardPage() {
  const user = await requireLandlord();

  return <LandlordDashboardFeature user={user} />;
}

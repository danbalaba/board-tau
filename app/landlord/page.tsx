import { getLandlordDashboardStats } from '@/services/landlord/analytics';
import LandlordDashboardFeature from './features/dashboard';
import { requireLandlord } from '@/lib/landlord';
import { requirePagePermission } from '@/lib/rbac';

export default async function LandlordDashboardPage() {
  const user = await requireLandlord();
  await requirePagePermission(user.id, "VIEW_DASHBOARD");

  return <LandlordDashboardFeature user={user} />;
}

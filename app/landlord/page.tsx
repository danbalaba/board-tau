import LandlordDashboardFeature from './features/dashboard';

export default async function LandlordDashboardPage() {
  const stats = await getLandlordDashboardStats();

  return <LandlordDashboardFeature stats={stats} />;
}

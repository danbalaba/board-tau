import { getLandlordDashboardStats, getRevenueReport, getOccupancyReport, getDailyRevenueHistory, getMonthlyRevenueByProperty, getGrowthTrendData, getPropertyTypeBreakdown, getRatingDistribution, getAllPropertiesPerformance, getInquirySourceBreakdown } from '@/services/landlord/analytics';
import LandlordAnalytics from '../features/analytics';
import { requireLandlord } from '@/lib/landlord';

export const metadata = {
  title: 'Analytics - Landlord Dashboard',
  description: 'View property performance analytics',
};

export default async function LandlordAnalyticsPage() {
  await requireLandlord();
  
  return <LandlordAnalytics />;
}
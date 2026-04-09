import { getLandlordDashboardStats, getRevenueReport, getOccupancyReport, getDailyRevenueHistory, getMonthlyRevenueByProperty, getGrowthTrendData, getPropertyTypeBreakdown, getRatingDistribution, getAllPropertiesPerformance, getInquirySourceBreakdown } from '@/services/landlord/analytics';
import LandlordAnalytics from '../features/analytics';
import { requireLandlord } from '@/lib/landlord';

export const metadata = {
  title: 'Analytics - Landlord Dashboard',
  description: 'View property performance analytics',
};

export default async function LandlordAnalyticsPage() {
  await requireLandlord();
  
  const [stats, revenue, occupancy, dailyRevenue, monthlyRevenue, growthTrend, propertyTypes, ratings, propertyPerformance, inquirySources] = await Promise.all([
    getLandlordDashboardStats(),
    getRevenueReport(),
    getOccupancyReport(),
    getDailyRevenueHistory(30),
    getMonthlyRevenueByProperty(6),
    getGrowthTrendData(6),
    getPropertyTypeBreakdown(),
    getRatingDistribution(),
    getAllPropertiesPerformance(),
    getInquirySourceBreakdown(6),
  ]);

  const chartData = {
    dailyRevenue,
    monthlyRevenue: monthlyRevenue.monthlyData.map(m => {
      const obj: Record<string, number | string> = { date: m.date };
      monthlyRevenue.listings.forEach((l: { id: string; title: string }) => {
        obj[l.id] = (m as Record<string, unknown>)[l.id] as number ?? 0;
      });
      return obj;
    }),
    monthlyRevenueListings: monthlyRevenue.listings,
    monthlyRevenueMap: monthlyRevenue.listingMap,
    growthTrend,
    propertyTypes,
    ratings,
    propertyPerformance,
    inquirySources,
  };

  return <LandlordAnalytics stats={stats as any} revenue={revenue as any} occupancy={occupancy} chartData={chartData as any} />;
}
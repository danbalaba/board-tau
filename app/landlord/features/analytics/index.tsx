'use client';

import React from 'react';
import { useAnalyticsLogic, AnalyticsStats } from './hooks/use-analytics-logic';
import { LandlordAnalyticsHeader } from './components/landlord-analytics-header';
import { LandlordAnalyticsStatsGrid } from './components/landlord-analytics-stats-grid';
import { LandlordAnalyticsChartsGrid } from './components/landlord-analytics-charts-grid';
import { LandlordAnalyticsInsights } from './components/landlord-analytics-insights';

interface ChartData {
  dailyRevenue: Array<{ date: string; revenue: number; bookings: number }>;
  monthlyRevenue: Array<{ date: string; [key: string]: any }>;
  monthlyRevenueListings: Array<{ id: string; title: string }>;
  monthlyRevenueMap: Record<string, string>;
  growthTrend: Array<{ date: string; bookings: number; revenue: number }>;
  propertyTypes: Array<{ type: string; count: number; revenue: number }>;
  ratings: Array<{ rating: string; value: number; percentage: number }>;
  propertyPerformance: Array<{ name: string; inquiries: number; bookings: number; revenue: number }>;
}

interface LandlordAnalyticsProps {
  stats: AnalyticsStats;
  revenue: any;
  occupancy: any;
  chartData?: ChartData;
}

export default function LandlordAnalytics({
  stats,
  revenue,
  occupancy,
  chartData,
}: LandlordAnalyticsProps) {
  const {
    timePeriod,
    setTimePeriod,
    propertyPerformanceData,
    handleGenerateReport
  } = useAnalyticsLogic(stats, occupancy, chartData);

  return (
    <div className="space-y-4 pb-12">
      <LandlordAnalyticsHeader 
        timePeriod={timePeriod}
        setTimePeriod={setTimePeriod}
        handleGenerateReport={handleGenerateReport}
      />

      <LandlordAnalyticsStatsGrid 
        stats={stats}
        occupancyRate={occupancy.occupancyRate}
      />

      <LandlordAnalyticsChartsGrid chartData={chartData} />

      <LandlordAnalyticsInsights 
        propertyPerformanceData={propertyPerformanceData}
        stats={stats}
        occupancy={occupancy}
      />
    </div>
  );
}
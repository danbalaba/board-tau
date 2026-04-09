'use client';

import React from 'react';
import dynamic from 'next/dynamic';

interface ChartData {
  dailyRevenue: Array<{ date: string; revenue: number; bookings: number }>;
  monthlyRevenue: Array<{ date: string; [key: string]: any }>;
  monthlyRevenueListings: Array<{ id: string; title: string }>;
  monthlyRevenueMap: Record<string, string>;
  growthTrend: Array<{ date: string; bookings: number; revenue: number }>;
  propertyTypes: Array<{ type: string; count: number; revenue: number }>;
  ratings: Array<{ rating: string; value: number; percentage: number }>;
  propertyPerformance: Array<{ name: string; inquiries: number; bookings: number; revenue: number }>;
  inquirySources?: Array<{ date: string; direct: number; email: number; social: number }>;
}

interface LandlordAnalyticsChartsGridProps {
  chartData?: ChartData;
}

const ChartAreaInteractive = dynamic(() => import('@/app/landlord/components/charts/AreaChart').then(mod => mod.ChartAreaInteractive), { ssr: false });
const ChartBarInteractive = dynamic(() => import('@/app/landlord/components/charts/BarChart').then(mod => mod.ChartBarInteractive), { ssr: false });
const ChartLineInteractive = dynamic(() => import('@/app/landlord/components/charts/LineChart').then(mod => mod.ChartLineInteractive), { ssr: false });
const ChartPieLabel = dynamic(() => import('@/app/landlord/components/charts/PieChart').then(mod => mod.ChartPieLabel), { ssr: false });
const ChartRadarDots = dynamic(() => import('@/app/landlord/components/charts/RadarChart').then(mod => mod.ChartRadarDots), { ssr: false });
const ChartRadialLabel = dynamic(() => import('@/app/landlord/components/charts/RadialChart').then(mod => mod.ChartRadialLabel), { ssr: false });
const ChartTooltipDefault = dynamic(() => import('@/app/landlord/components/charts/ToolTips').then(mod => mod.ChartTooltipDefault), { ssr: false });

export function LandlordAnalyticsChartsGrid({ chartData }: LandlordAnalyticsChartsGridProps) {
  return (
    <div className="space-y-4">
      {/* Primary Chart */}
      <div className="bg-white dark:bg-gray-950 p-2 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
        <ChartAreaInteractive data={chartData?.dailyRevenue} />
      </div>

      {/* Grid of Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartLineInteractive data={chartData?.growthTrend} />
        </div>
        <div className="bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartPieLabel data={chartData?.propertyTypes} />
        </div>
        <div className="bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartRadarDots listings={chartData?.monthlyRevenueListings} />
        </div>
        <div className="bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartRadialLabel data={chartData?.ratings} listings={chartData?.monthlyRevenueListings} />
        </div>
        <div className="bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartTooltipDefault data={chartData?.inquirySources} />
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartBarInteractive 
            data={chartData?.monthlyRevenue} 
            listings={chartData?.monthlyRevenueListings}
            listingMap={chartData?.monthlyRevenueMap}
          />
        </div>
      </div>
    </div>
  );
}
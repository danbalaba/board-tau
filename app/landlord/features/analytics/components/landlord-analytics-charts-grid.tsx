'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Skeleton from '@/components/common/Skeleton';

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
  isLoading?: boolean;
}

const ChartAreaInteractive = dynamic(() => import('@/app/landlord/components/charts/AreaChart').then(mod => mod.ChartAreaInteractive), { ssr: false });
const ChartBarInteractive = dynamic(() => import('@/app/landlord/components/charts/BarChart').then(mod => mod.ChartBarInteractive), { ssr: false });
const ChartLineInteractive = dynamic(() => import('@/app/landlord/components/charts/LineChart').then(mod => mod.ChartLineInteractive), { ssr: false });
const ChartPieLabel = dynamic(() => import('@/app/landlord/components/charts/PieChart').then(mod => mod.ChartPieLabel), { ssr: false });
const ChartRadarDots = dynamic(() => import('@/app/landlord/components/charts/RadarChart').then(mod => mod.ChartRadarDots), { ssr: false });
const ChartRadialLabel = dynamic(() => import('@/app/landlord/components/charts/RadialChart').then(mod => mod.ChartRadialLabel), { ssr: false });
const ChartTooltipDefault = dynamic(() => import('@/app/landlord/components/charts/ToolTips').then(mod => mod.ChartTooltipDefault), { ssr: false });

export function LandlordAnalyticsChartsGrid({ chartData, isLoading }: LandlordAnalyticsChartsGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Main Chart Skeleton */}
        <div className="bg-white dark:bg-gray-950 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <Skeleton className="h-7 w-56 mb-2" variant="text" />
              <Skeleton className="h-4 w-72 opacity-60" variant="text" />
            </div>
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
          <div className="h-[300px] w-full flex items-end gap-2 px-2">
            {[...Array(24)].map((_, i) => (
              <Skeleton 
                key={i} 
                className="flex-1 rounded-t-lg" 
                style={{ height: `${20 + Math.sin(i / 3) * 30 + 30}%` }} 
              />
            ))}
          </div>
        </div>

        {/* Grid Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`bg-white dark:bg-gray-950 p-6 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm ${i === 5 ? 'lg:col-span-2' : ''}`}>
              <Skeleton className="h-6 w-44 mb-6" variant="text" />
              <div className="h-[250px] w-full flex items-center justify-center">
                 {/* Alternate between pie and bar skeletons */}
                 {i === 1 || i === 3 ? (
                    <div className="relative w-48 h-48 flex items-center justify-center">
                       <Skeleton className="w-full h-full rounded-full" />
                       <div className="absolute inset-4 bg-white dark:bg-gray-950 rounded-full" />
                    </div>
                 ) : (
                    <div className="w-full h-full flex items-end gap-3 px-4">
                      {[...Array(10)].map((_, j) => (
                        <Skeleton 
                          key={j} 
                          className="flex-1 rounded-t-md" 
                          style={{ height: `${30 + Math.random() * 50}%` }} 
                        />
                      ))}
                    </div>
                 )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Primary Chart */}
      <div className="bg-white dark:bg-gray-950 p-5 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm">
        <ChartAreaInteractive data={chartData?.dailyRevenue} />
      </div>

      {/* Grid of Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-950 p-5 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartLineInteractive data={chartData?.growthTrend} />
        </div>
        <div className="bg-white dark:bg-gray-950 p-5 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartPieLabel data={chartData?.propertyTypes} />
        </div>
        <div className="bg-white dark:bg-gray-950 p-5 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartRadarDots listings={chartData?.monthlyRevenueListings} />
        </div>
        <div className="bg-white dark:bg-gray-950 p-5 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartRadialLabel data={chartData?.ratings} listings={chartData?.monthlyRevenueListings} />
        </div>
        <div className="bg-white dark:bg-gray-950 p-5 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartTooltipDefault data={chartData?.inquirySources} />
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-gray-950 p-5 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm">
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
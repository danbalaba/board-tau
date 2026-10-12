'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Skeleton from '@/components/common/Skeleton';
import { RoomOccupancyDetail } from '@/services/landlord/analytics';

interface ChartData {
  dailyRevenue: Array<{ date: string; revenue: number; bookings: number }>;
  monthlyRevenue: Array<{ date: string; [key: string]: any }>;
  monthlyRevenueListings: Array<{ id: string; title: string }>;
  monthlyRevenueMap: Record<string, string>;
  growthTrend: Array<{ date: string; bookings: number; revenue: number; inquiries?: number }>;
  propertyTypes: Array<{ type: string; count: number; revenue: number }>;
  ratings: Array<{ rating: string; value: number; percentage: number }>;
}

interface AnalyticsScope {
  propertyId: string;
  propertyName: string;
  period: 'month' | 'quarter' | 'year';
  isSingleProperty: boolean;
}

interface LandlordAnalyticsChartsGridProps {
  chartData?: ChartData | null;
  scope?: AnalyticsScope | null;
  stats?: any | null;
  roomDetails?: RoomOccupancyDetail[] | null;
  isLoading?: boolean;
}

const AnalyticsAreaChart = dynamic(
  () => import('./charts/analytics-area-chart').then((mod) => mod.AnalyticsAreaChart),
  { ssr: false }
);
const AnalyticsBarChart = dynamic(
  () => import('./charts/analytics-bar-chart').then((mod) => mod.AnalyticsBarChart),
  { ssr: false }
);
const AnalyticsLineChart = dynamic(
  () => import('./charts/analytics-line-chart').then((mod) => mod.AnalyticsLineChart),
  { ssr: false }
);
const AnalyticsRadialChart = dynamic(
  () => import('./charts/analytics-radial-chart').then((mod) => mod.AnalyticsRadialChart),
  { ssr: false }
);
const AnalyticsPieChart = dynamic(
  () => import('./charts/analytics-pie-chart').then((mod) => mod.AnalyticsPieChart),
  { ssr: false }
);

export function LandlordAnalyticsChartsGrid({
  chartData,
  scope,
  stats,
  roomDetails,
  isLoading,
}: LandlordAnalyticsChartsGridProps) {
  if (isLoading || !chartData) {
    return (
      <div className="space-y-6">
        {/* Main Chart Skeleton */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-[26px] border border-slate-200/90 dark:border-slate-800 shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Skeleton className="h-6 w-48 mb-2" variant="text" />
              <Skeleton className="h-4 w-64 opacity-60" variant="text" />
            </div>
            <Skeleton className="h-9 w-32 rounded-xl" />
          </div>
          <div className="h-[280px] w-full flex items-end gap-2 px-2">
            {[...Array(20)].map((_, i) => (
              <Skeleton
                key={i}
                className="flex-1 rounded-t-lg"
                style={{ height: `${20 + Math.sin(i / 2.5) * 35 + 30}%` }}
              />
            ))}
          </div>
        </div>

        {/* Secondary Charts Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-[26px] border border-slate-200/90 dark:border-slate-800 shadow-xs"
            >
              <Skeleton className="h-5 w-40 mb-5" variant="text" />
              <div className="h-[220px] w-full flex items-center justify-center">
                <Skeleton className="w-40 h-40 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const propertyName = scope?.propertyName || 'All Properties Portfolio';
  const isSingleProperty = scope?.isSingleProperty ?? false;
  const period = scope?.period || 'month';
  const selectedPropertyId = scope?.propertyId || 'all';

  return (
    <div className="space-y-6">
      {/* 1. Primary Scope Chart: Revenue & Bookings History */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-[26px] sm:rounded-[28px] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
        <AnalyticsAreaChart
          data={chartData.dailyRevenue}
          propertyName={propertyName}
          isSingleProperty={isSingleProperty}
          period={period}
        />
      </div>

      {/* 2. Secondary Analytics Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multi-Property Revenue Contribution / Single Property Trajectory Bar Chart */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-[26px] sm:rounded-[28px] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <AnalyticsBarChart
            data={chartData.monthlyRevenue}
            listings={chartData.monthlyRevenueListings}
            listingMap={chartData.monthlyRevenueMap}
            propertyName={propertyName}
            isSingleProperty={isSingleProperty}
            selectedPropertyId={selectedPropertyId}
          />
        </div>

        {/* Inquiries vs. Bookings Conversion Funnel */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-[26px] sm:rounded-[28px] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <AnalyticsLineChart
            data={chartData.growthTrend?.map((g) => ({
              inquiries: g.inquiries ?? 0,
              ...g,
            }))}
            propertyName={propertyName}
            isSingleProperty={isSingleProperty}
            totalBookingRequests={stats?.totalBookingRequests}
          />
        </div>

        {/* Real Star Rating Sentiment Distribution */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-[26px] sm:rounded-[28px] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <AnalyticsRadialChart
            data={chartData.ratings}
            propertyName={propertyName}
            isSingleProperty={isSingleProperty}
            averageRating={stats?.averageRating}
            totalReviews={stats?.totalReviews}
          />
        </div>

        {/* Property Portfolio Category Breakdown / Bedspace Capacity Donut */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 sm:p-6 rounded-[26px] sm:rounded-[28px] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all">
          <AnalyticsPieChart
            data={chartData.propertyTypes}
            propertyName={propertyName}
            isSingleProperty={isSingleProperty}
            occupiedSlots={stats?.occupiedSlots}
            vacantSlots={stats?.vacantSlots}
            totalCapacity={stats?.totalCapacity}
            occupancyRate={stats?.occupancyRate}
            roomDetails={roomDetails || []}
          />
        </div>
      </div>
    </div>
  );
}

export default LandlordAnalyticsChartsGrid;
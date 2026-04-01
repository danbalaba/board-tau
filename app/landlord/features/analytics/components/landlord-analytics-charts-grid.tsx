'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const ChartAreaInteractive = dynamic(() => import('@/app/landlord/components/charts/AreaChart').then(mod => mod.ChartAreaInteractive), { ssr: false });
const ChartBarInteractive = dynamic(() => import('@/app/landlord/components/charts/BarChart').then(mod => mod.ChartBarInteractive), { ssr: false });
const ChartLineInteractive = dynamic(() => import('@/app/landlord/components/charts/LineChart').then(mod => mod.ChartLineInteractive), { ssr: false });
const ChartPieLabel = dynamic(() => import('@/app/landlord/components/charts/PieChart').then(mod => mod.ChartPieLabel), { ssr: false });
const ChartRadarDots = dynamic(() => import('@/app/landlord/components/charts/RadarChart').then(mod => mod.ChartRadarDots), { ssr: false });
const ChartRadialLabel = dynamic(() => import('@/app/landlord/components/charts/RadialChart').then(mod => mod.ChartRadialLabel), { ssr: false });
const ChartTooltipDefault = dynamic(() => import('@/app/landlord/components/charts/ToolTips').then(mod => mod.ChartTooltipDefault), { ssr: false });

export function LandlordAnalyticsChartsGrid() {
  return (
    <div className="space-y-4">
      {/* Primary Chart */}
      <div className="bg-white dark:bg-gray-950 p-2 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
        <ChartAreaInteractive />
      </div>

      {/* Grid of Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartLineInteractive />
        </div>
        <div className="bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartPieLabel />
        </div>
        <div className="bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartRadarDots />
        </div>
        <div className="bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartRadialLabel />
        </div>
        <div className="bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartTooltipDefault />
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartBarInteractive />
        </div>
      </div>
    </div>
  );
}

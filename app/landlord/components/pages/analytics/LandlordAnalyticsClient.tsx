'use client';

import React, { useState } from 'react';
import {
  IconChartLine,
  IconBuilding,
  IconCalendarCheck,
  IconStar,
  IconCash,
  IconUsers,
} from '@tabler/icons-react';
import dynamic from 'next/dynamic';

const ChartAreaInteractive = dynamic(() => import('@/app/landlord/components/charts/AreaChart').then(mod => mod.ChartAreaInteractive), { ssr: false });
const ChartBarInteractive = dynamic(() => import('@/app/landlord/components/charts/BarChart').then(mod => mod.ChartBarInteractive), { ssr: false });
const ChartLineInteractive = dynamic(() => import('@/app/landlord/components/charts/LineChart').then(mod => mod.ChartLineInteractive), { ssr: false });
const ChartPieLabel = dynamic(() => import('@/app/landlord/components/charts/PieChart').then(mod => mod.ChartPieLabel), { ssr: false });
const ChartRadarDots = dynamic(() => import('@/app/landlord/components/charts/RadarChart').then(mod => mod.ChartRadarDots), { ssr: false });
const ChartRadialLabel = dynamic(() => import('@/app/landlord/components/charts/RadialChart').then(mod => mod.ChartRadialLabel), { ssr: false });
const ChartTooltipDefault = dynamic(() => import('@/app/landlord/components/charts/ToolTips').then(mod => mod.ChartTooltipDefault), { ssr: false });
import ModernSelect from '@/components/common/ModernSelect';

interface LandlordAnalyticsClientProps {
  stats: {
    totalProperties: number;
    activeListings: number;
    pendingInquiries: number;
    confirmedBookings: number;
    averageRating: number;
    totalReviews: number;
    monthlyRevenue: number;
  };
  revenue: any;
  occupancy: any;
}

export default function LandlordAnalyticsClient({
  stats,
  revenue,
  occupancy,
}: LandlordAnalyticsClientProps) {
  const [timePeriod, setTimePeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const propertyPerformanceData = [
    { name: 'Property A', inquiries: 15, bookings: 8, revenue: 24000 },
    { name: 'Property B', inquiries: 10, bookings: 5, revenue: 15000 },
    { name: 'Property C', inquiries: 20, bookings: 12, revenue: 36000 },
    { name: 'Property D', inquiries: 8, bookings: 4, revenue: 12000 },
  ];

  const COLORS = ['#2f7d6d', '#1473E6', '#F59E0B', '#8B5CF6'];

  const statsCards = [
    {
      label: 'Total Properties',
      value: stats.totalProperties,
      icon: IconBuilding,
      color: 'blue',
    },
    {
      label: 'Active Listings',
      value: stats.activeListings,
      icon: IconBuilding,
      color: 'green',
    },
    {
      label: 'Pending Inquiries',
      value: stats.pendingInquiries,
      icon: IconCalendarCheck,
      color: 'yellow',
    },
    {
      label: 'Confirmed Bookings',
      value: stats.confirmedBookings,
      icon: IconCalendarCheck,
      color: 'purple',
    },
    {
      label: 'Average Rating',
      value: stats.averageRating.toFixed(1),
      icon: IconStar,
      color: 'orange',
    },
    {
      label: 'Total Reviews',
      value: stats.totalReviews,
      icon: IconStar,
      color: 'red',
    },
    {
      label: 'Monthly Revenue',
      value: `₱${stats.monthlyRevenue.toLocaleString()}`,
      icon: IconCash,
      color: 'indigo',
    },
    {
      label: 'Occupancy Rate',
      value: `${occupancy.occupancyRate.toFixed(1)}%`,
      icon: IconUsers,
      color: 'teal',
    },
  ];

  const colors: Record<string, string> = {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30',
    green: 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30',
    yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/30',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30',
    orange: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30',
    red: 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30',
    indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30',
    teal: 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30',
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
              <IconChartLine size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                Analytics & Performance
              </h1>
            </div>
          </div>
          <div className="w-auto">
            <ModernSelect
              instanceId="analytics-time-period"
              value={timePeriod}
              onChange={(val: any) => setTimePeriod(val)}
              className="min-w-[140px]"
              options={[
                { value: 'month', label: 'This Month' },
                { value: 'quarter', label: 'Quarter' },
                { value: 'year', label: 'Year' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 hover:border-primary/30 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[stat.color]} group-hover:scale-105 transition-transform duration-300 shadow-md`}>
                  <Icon size={14} strokeWidth={2.5} />
                </div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  {stat.label}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  {stat.value}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                    +15.2%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Chart: Revenue & Bookings */}
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

      {/* Bottom Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
            Revenue by Property
          </h3>
          <div className="space-y-2">
            {propertyPerformanceData.map((property, idx) => (
              <div key={property.name} className="group flex items-center justify-between p-2.5 px-3 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors tracking-tight">
                    {property.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 tabular-nums">
                  ₱{property.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
            Booking Statistics
          </h3>
          <div className="space-y-2">
            {[
              { label: 'Confirmed Bookings', value: stats.confirmedBookings, suffix: '' },
              { label: 'Analytics Revenue', value: stats.monthlyRevenue.toLocaleString(), prefix: '₱' },
              { label: 'Daily Rate', value: '4,500', prefix: '₱' },
              { label: 'Occupancy', value: occupancy.occupancyRate.toFixed(1), suffix: '%' },
            ].map((item) => (
              <div key={item.label} className="group flex items-center justify-between p-2.5 px-3 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:shadow-md transition-all duration-300">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors">
                  {item.label}
                </span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 tabular-nums">
                  {item.prefix}{item.value}{item.suffix}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

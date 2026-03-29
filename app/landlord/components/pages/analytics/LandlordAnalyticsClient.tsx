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
    <div className="space-y-10 pb-20">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-950 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-2xl shadow-gray-200/50 dark:shadow-black/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-[24px] flex items-center justify-center shadow-inner">
              <IconChartLine size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1.5 tracking-tighter">
                Analytics & Performance
              </h1>
              <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Real-time property tracking & revenue insights
              </p>
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <ModernSelect
              instanceId="analytics-time-period"
              value={timePeriod}
              onChange={(val: any) => setTimePeriod(val)}
              className="min-w-[260px]"
              options={[
                { value: 'month', label: 'This Calendar Month' },
                { value: 'quarter', label: 'Fiscal Quarter' },
                { value: 'year', label: 'Fiscal Year' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group relative bg-white dark:bg-gray-900 rounded-[28px] border border-gray-100 dark:border-gray-800 p-8 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center ${colors[stat.color]} group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              </div>
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
                  {stat.label}
                </p>
                <p className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">
                  {stat.value}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-black">
                    +15.2%
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    vs last period
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Chart: Revenue & Bookings */}
      <div className="bg-white dark:bg-gray-950 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
        <ChartAreaInteractive />
      </div>

      {/* Grid of Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-gray-950 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartLineInteractive />
        </div>
        <div className="bg-white dark:bg-gray-950 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartPieLabel />
        </div>
        <div className="bg-white dark:bg-gray-950 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartRadarDots />
        </div>
        <div className="bg-white dark:bg-gray-950 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartRadialLabel />
        </div>
        <div className="bg-white dark:bg-gray-950 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartTooltipDefault />
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-gray-950 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartBarInteractive />
        </div>
      </div>

      {/* Bottom Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white dark:bg-gray-950 rounded-[32px] border border-gray-100 dark:border-gray-800 p-10 shadow-sm">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter">
            Revenue by Property
          </h3>
          <div className="space-y-4">
            {propertyPerformanceData.map((property, idx) => (
              <div key={property.name} className="group flex items-center justify-between p-6 bg-gray-50/50 dark:bg-gray-900/50 rounded-[24px] border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:shadow-xl transition-all duration-500">
                <div className="flex items-center gap-5">
                  <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-base font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors tracking-tight">
                    {property.name}
                  </span>
                </div>
                <span className="text-lg font-black text-gray-900 dark:text-white tabular-nums">
                  ₱{property.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-[32px] border border-gray-100 dark:border-gray-800 p-10 shadow-sm">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter">
            Booking Statistics
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Total Confirmed Bookings', value: stats.confirmedBookings, suffix: 'units' },
              { label: 'Gross Analytics Revenue', value: stats.monthlyRevenue.toLocaleString(), prefix: '₱' },
              { label: 'Average Daily Rate', value: '4,500', prefix: '₱' },
              { label: 'Portfolio Occupancy', value: occupancy.occupancyRate.toFixed(1), suffix: '%' },
            ].map((item) => (
              <div key={item.label} className="group flex items-center justify-between p-6 bg-gray-50/50 dark:bg-gray-900/50 rounded-[24px] border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:shadow-xl transition-all duration-500">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors">
                  {item.label}
                </span>
                <span className="text-xl font-black text-gray-900 dark:text-white tabular-nums">
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

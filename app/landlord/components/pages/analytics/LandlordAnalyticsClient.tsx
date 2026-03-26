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
import { ChartAreaInteractive } from '@/app/landlord/components/charts/AreaChart';
import { ChartBarInteractive } from '@/app/landlord/components/charts/BarChart';
import { ChartLineInteractive } from '@/app/landlord/components/charts/LineChart';
import { ChartPieLabel } from '@/app/landlord/components/charts/PieChart';
import { ChartRadarDots } from '@/app/landlord/components/charts/RadarChart';
import { ChartRadialLabel } from '@/app/landlord/components/charts/RadialChart';
import { ChartTooltipDefault } from '@/app/landlord/components/charts/ToolTips';
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

  // Sample data for charts (would be replaced with real data from API)
  const revenueData = [
    { name: 'Jan', revenue: 12000 },
    { name: 'Feb', revenue: 19800 },
    { name: 'Mar', revenue: 15000 },
    { name: 'Apr', revenue: 25000 },
    { name: 'May', revenue: 32000 },
    { name: 'Jun', revenue: 28000 },
  ];

  const occupancyData = [
    { name: 'Property A', occupancy: 85 },
    { name: 'Property B', occupancy: 60 },
    { name: 'Property C', occupancy: 95 },
    { name: 'Property D', occupancy: 70 },
  ];

  const propertyPerformanceData = [
    { name: 'Property A', inquiries: 15, bookings: 8, revenue: 24000 },
    { name: 'Property B', inquiries: 10, bookings: 5, revenue: 15000 },
    { name: 'Property C', inquiries: 20, bookings: 12, revenue: 36000 },
    { name: 'Property D', inquiries: 8, bookings: 4, revenue: 12000 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-primary hover:scale-110 transition-transform duration-300">
              <IconChartLine size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-0.5 tracking-tight">
                Analytics & Reports
              </h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Track your property performance and revenue
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ModernSelect
              instanceId="timePeriod"
              value={timePeriod}
              onChange={(val: string) => setTimePeriod(val as 'month' | 'quarter' | 'year')}
              className="w-full sm:w-auto min-w-[180px]"
              options={[
                { value: 'month', label: 'This Month' },
                { value: 'quarter', label: 'This Quarter' },
                { value: 'year', label: 'This Year' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[stat.color]} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={18} />
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                  +12.5% from last period
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>
          );
        })}
      </div>

      {/* Revenue & Bookings Overview */}
      <div>
        <ChartAreaInteractive />
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bookings & Revenue */}
        <div>
          <ChartLineInteractive />
        </div>

        {/* Property Type Distribution */}
        <div>
          <ChartPieLabel />
        </div>

        {/* Property Performance Metrics */}
        <div>
          <ChartRadarDots />
        </div>

        {/* Review Ratings */}
        <div>
          <ChartRadialLabel />
        </div>

        {/* Inquiry Sources */}
        <div>
          <ChartTooltipDefault />
        </div>

        {/* Monthly Revenue by Property */}
        <div className="lg:col-span-2">
          <ChartBarInteractive />
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Property */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">
            Revenue by Property
          </h3>
          <div className="space-y-3">
            {propertyPerformanceData.map((property) => (
              <div key={property.name} className="group flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${COLORS[propertyPerformanceData.indexOf(property) % COLORS.length]} group-hover:scale-150 transition-transform shadow-sm`} />
                  <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                    {property.name}
                  </span>
                </div>
                <span className="text-sm font-black text-gray-900 dark:text-white">
                  ₱{property.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Statistics */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">
            Booking Statistics
          </h3>
          <div className="space-y-3">
            <div className="group flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:shadow-md transition-all duration-300">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">
                Total Bookings
              </span>
              <span className="text-lg font-black text-gray-900 dark:text-white">
                {stats.confirmedBookings}
              </span>
            </div>
            <div className="group flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:shadow-md transition-all duration-300">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">
                Total Revenue
              </span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                ₱{revenue.totalRevenue.toLocaleString()}
              </span>
            </div>
            <div className="group flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:shadow-md transition-all duration-300">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">
                Avg Booking Value
              </span>
              <span className="text-lg font-black text-gray-900 dark:text-white">
                ₱{revenue.averageBookingValue.toLocaleString()}
              </span>
            </div>
            <div className="group flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:shadow-md transition-all duration-300">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors">
                Occupancy Rate
              </span>
              <span className="text-lg font-black text-gray-900 dark:text-white">
                {occupancy.occupancyRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

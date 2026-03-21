'use client';

import React from 'react';
import Link from 'next/link';
import {
  FaBuilding,
  FaEnvelope,
  FaCalendarCheck,
  FaStar,
  FaChartLine,
  FaPlus,
  FaEye,
  FaChevronRight,
} from 'react-icons/fa';
import { ChartAreaInteractive } from '@/app/landlord/components/charts/AreaChart';
import { ChartBarInteractive } from '@/app/landlord/components/charts/BarChart';
import { ChartLineInteractive } from '@/app/landlord/components/charts/LineChart';
import { ChartPieLabel } from '@/app/landlord/components/charts/PieChart';
import { ChartRadarDots } from '@/app/landlord/components/charts/RadarChart';
import { ChartRadialLabel } from '@/app/landlord/components/charts/RadialChart';
import { ChartTooltipDefault } from '@/app/landlord/components/charts/ToolTips';

interface LandlordDashboardStats {
  totalProperties: number;
  activeListings: number;
  pendingInquiries: number;
  confirmedBookings: number;
  averageRating: number;
  totalReviews: number;
  monthlyRevenue: number;
}

interface LandlordDashboardClientProps {
  stats: LandlordDashboardStats;
}

export default function LandlordDashboardClient({ stats }: LandlordDashboardClientProps) {
  // Mock data for charts (would be replaced with real data from API)
  const revenueData = [
    { name: 'Jan', revenue: 12000 },
    { name: 'Feb', revenue: 19800 },
    { name: 'Mar', revenue: 15000 },
    { name: 'Apr', revenue: 25000 },
    { name: 'May', revenue: 32000 },
    { name: 'Jun', revenue: 28000 },
  ];

  const quickActions = [
    {
      title: 'Add Property',
      icon: FaPlus,
      href: '/landlord/properties/create',
      description: 'List a new property for rent',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'View Inquiries',
      icon: FaEye,
      href: '/landlord/inquiries',
      description: 'Check pending inquiries',
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'Manage Bookings',
      icon: FaCalendarCheck,
      href: '/landlord/bookings',
      description: 'View confirmed bookings',
      gradient: 'from-purple-500 to-purple-600',
    },
  ];

  const statsCards = [
    {
      label: 'Total Properties',
      value: stats.totalProperties,
      icon: FaBuilding,
      color: 'blue',
    },
    {
      label: 'Active Listings',
      value: stats.activeListings,
      icon: FaBuilding,
      color: 'green',
    },
    {
      label: 'Pending Inquiries',
      value: stats.pendingInquiries,
      icon: FaEnvelope,
      color: 'yellow',
    },
    {
      label: 'Confirmed Bookings',
      value: stats.confirmedBookings,
      icon: FaCalendarCheck,
      color: 'purple',
    },
    {
      label: 'Average Rating',
      value: stats.averageRating.toFixed(1),
      icon: FaStar,
      color: 'orange',
    },
    {
      label: 'Total Reviews',
      value: stats.totalReviews,
      icon: FaStar,
      color: 'red',
    },
    {
      label: 'Monthly Revenue',
      value: `₱${stats.monthlyRevenue.toLocaleString()}`,
      icon: FaChartLine,
      color: 'indigo',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border border-blue-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Landlord Dashboard
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl">
          Manage your properties, inquiries, and bookings efficiently with real-time insights
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center gap-4">
                <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-current/30`}>
                  <Icon size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-blue-50 dark:bg-blue-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300">
                <FaChevronRight size={12} className="text-blue-600 dark:text-blue-400" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const colors: Record<string, string> = {
            blue: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
            green: 'bg-gradient-to-br from-green-500 to-green-600 text-white',
            yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white',
            purple: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white',
            orange: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white',
            red: 'bg-gradient-to-br from-red-500 to-red-600 text-white',
            indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white',
          };

          return (
            <div
              key={stat.label}
              className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[stat.color]} shadow-lg shadow-current/30 group-hover:scale-110 transition-transform duration-300`}>
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
                  +12.5% from last month
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Bookings Overview */}
        <div>
          <ChartAreaInteractive />
        </div>

        {/* Property Type Distribution */}
        <div>
          <ChartPieLabel />
        </div>

        {/* Monthly Bookings & Revenue */}
        <div>
          <ChartLineInteractive />
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

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {/* Placeholder activity items */}
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <FaEnvelope size={16} className="text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  New inquiry received for Apartment #3
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  2 hours ago
                </p>
              </div>
              <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                Pending
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

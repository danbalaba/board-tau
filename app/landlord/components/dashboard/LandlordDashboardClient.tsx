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
  FaHome
} from 'react-icons/fa';
import { cn } from '@/lib/utils';
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
    },
    {
      title: 'View Inquiries',
      icon: FaEye,
      href: '/landlord/inquiries',
      description: 'Check pending inquiries',
    },
    {
      title: 'Manage Bookings',
      icon: FaCalendarCheck,
      href: '/landlord/bookings',
      description: 'View confirmed bookings',
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
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-primary hover:scale-110 transition-transform duration-300">
            <FaHome size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-0.5 tracking-tight">
              Landlord Dashboard
            </h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-2xl">
              Manage your properties, inquiries, and bookings efficiently with real-time insights
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300 shadow-sm"
            >
              <div className="relative z-10 flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  <Icon size={20} />
                </div>
                <div className="flex-1 pr-6">
                  <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors tracking-tight">
                    {action.title}
                  </h3>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>
              <div className="absolute right-6 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300">
                <FaChevronRight size={14} className="text-primary" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const colors: Record<string, string> = {
            blue: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400',
            green: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400',
            yellow: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400',
            purple: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400',
            orange: 'text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400',
            red: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400',
            indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400',
          };

          return (
            <div
              key={stat.label}
              className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-300 shadow-sm overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[stat.color] || 'text-primary bg-primary/10'} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={22} />
                </div>
                {index === 1 && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50" />}
              </div>
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                  {stat.label}
                </p>
                <p className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight group-hover:text-primary transition-colors">
                  {stat.value}
                </p>
                <p className="text-[12px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 inline-flex px-2 py-0.5 rounded-md">
                  +12.5% vs last month
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-primary transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500" />
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {/* Placeholder activity items */}
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="group flex items-center gap-4 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 transition-all duration-300">
              <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 flex items-center justify-center group-hover:scale-110 group-hover:border-primary/30 transition-transform duration-300 shadow-sm">
                <FaEnvelope size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-gray-900 dark:text-white mb-0.5 group-hover:text-primary transition-colors tracking-tight">
                  New inquiry received
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  for <span className="font-bold text-gray-700 dark:text-gray-300">Apartment #3</span> • 2 hours ago
                </p>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-black px-3 py-1 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-md border border-amber-500/20">
                Pending
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

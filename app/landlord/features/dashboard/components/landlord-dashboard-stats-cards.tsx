'use client';

import React from 'react';
import {
  IconBuilding,
  IconStar,
  IconChartLine,
  IconMessage2,
  IconPercentage,
} from '@tabler/icons-react';

interface LandlordDashboardStats {
  totalProperties: number;
  activeListings: number;
  pendingInquiries: number;
  confirmedBookings: number;
  averageRating: number;
  totalReviews: number;
  monthlyRevenue: number;
  occupancyRate: number;
}

interface LandlordDashboardStatsCardsProps {
  stats: LandlordDashboardStats;
}

export function LandlordDashboardStatsCards({ stats }: LandlordDashboardStatsCardsProps) {
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
      icon: IconMessage2,
      color: 'yellow',
    },
    {
      label: 'Confirmed Bookings',
      value: stats.confirmedBookings,
      icon: IconBuilding, // Corrected fallback or matched with original
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
      icon: IconChartLine,
      color: 'indigo',
    },
    {
      label: 'Occupancy Rate',
      value: `${stats.occupancyRate}%`,
      icon: IconPercentage,
      color: 'cyan',
    },
  ];

  const colors: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400',
    green: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400',
    yellow: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400',
    orange: 'text-orange-600 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400',
    red: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400',
    indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400',
    cyan: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10 dark:text-cyan-400',
    teal: 'text-teal-600 bg-teal-50 dark:bg-teal-500/10 dark:text-teal-400',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="group relative bg-white dark:bg-gray-900 rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-500 shadow-sm overflow-hidden"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center ${colors[stat.color] || 'text-primary bg-primary/10'} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <Icon size={22} strokeWidth={2.5} />
              </div>
              {index === 1 && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                {stat.label}
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter group-hover:text-primary transition-colors">
                {stat.value}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 inline-flex px-2 py-0.5 rounded-lg shadow-sm">
                +12.5% vs last month
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

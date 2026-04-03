'use client';

import React from 'react';
import {
  IconBuilding,
  IconCalendarCheck,
  IconStar,
  IconCash,
  IconUsers,
} from '@tabler/icons-react';

interface StatsProps {
  stats: {
    totalProperties: number;
    activeListings: number;
    pendingInquiries: number;
    confirmedBookings: number;
    averageRating: number;
    totalReviews: number;
    monthlyRevenue: number;
  };
  occupancyRate: number;
}

export default function AnalyticsStats({ stats, occupancyRate }: StatsProps) {
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
      value: `${occupancyRate.toFixed(1)}%`,
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
  );
}

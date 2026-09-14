'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  MessageSquare,
  DollarSign,
  CalendarCheck,
  Star,
  PieChart,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

import Skeleton from '@/components/common/Skeleton';

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
  stats?: LandlordDashboardStats;
  isLoading?: boolean;
}

export function LandlordDashboardStatsCards({ stats, isLoading }: LandlordDashboardStatsCardsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-[24px] border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between h-[135px] sm:h-[145px]"
          >
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="w-10 h-10 rounded-2xl" />
              <Skeleton className="w-12 h-4 rounded-full opacity-50" variant="text" />
            </div>
            <div>
              <Skeleton className="h-3 w-20 mb-1.5 opacity-60" variant="text" />
              <Skeleton className="h-7 w-24 mb-1" variant="text" />
              <Skeleton className="h-3 w-28 opacity-40" variant="text" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const allStats = [
    {
      label: 'Total Properties',
      value: stats.totalProperties,
      subtitle: `${stats.totalProperties} ${stats.totalProperties === 1 ? 'property' : 'properties'} listed`,
      icon: Building2,
      href: '/landlord/properties',
      accentColor: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      glowBg: 'bg-blue-500/15 dark:bg-blue-500/20',
      badge: `${stats.activeListings || stats.totalProperties} Live`,
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    },
    {
      label: 'Pending Inquiries',
      value: stats.pendingInquiries,
      subtitle: stats.pendingInquiries > 0 ? `${stats.pendingInquiries} awaiting response` : 'All inquiries answered',
      icon: MessageSquare,
      href: '/landlord/inquiries',
      accentColor: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      glowBg: 'bg-amber-500/15 dark:bg-amber-500/20',
      badge: stats.pendingInquiries > 0 ? 'Needs Action' : 'All Clear',
      badgeColor: stats.pendingInquiries > 0
        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse'
        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    {
      label: 'Monthly Revenue',
      value: `₱${stats.monthlyRevenue.toLocaleString()}`,
      subtitle: 'Estimated earnings this month',
      icon: DollarSign,
      href: '/landlord/analytics',
      accentColor: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      glowBg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
      badge: 'Est. Total',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    {
      label: 'Confirmed Bookings',
      value: stats.confirmedBookings,
      subtitle: `${stats.confirmedBookings} active tenant ${stats.confirmedBookings === 1 ? 'lease' : 'leases'}`,
      icon: CalendarCheck,
      href: '/landlord/bookings',
      accentColor: 'from-purple-500 to-indigo-500',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      glowBg: 'bg-purple-500/15 dark:bg-purple-500/20',
      badge: 'Active Leases',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    },
    {
      label: 'Landlord Rating',
      value: stats.averageRating > 0 ? `${stats.averageRating.toFixed(1)} ★` : 'N/A',
      subtitle: stats.totalReviews > 0 ? `Based on ${stats.totalReviews} tenant reviews` : 'No reviews received yet',
      icon: Star,
      href: '/landlord/reviews',
      accentColor: 'from-amber-400 to-yellow-500',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      glowBg: 'bg-amber-500/15 dark:bg-amber-500/20',
      badge: stats.averageRating >= 4.5 ? 'Top Rated' : 'Verified Host',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
    {
      label: 'Occupancy Rate',
      value: `${stats.occupancyRate || 0}%`,
      subtitle: stats.occupancyRate > 0 ? 'Total units currently occupied' : 'Rooms available for booking',
      icon: PieChart,
      href: '/landlord/rooms',
      accentColor: 'from-teal-500 to-emerald-500',
      iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      glowBg: 'bg-teal-500/15 dark:bg-teal-500/20',
      badge: stats.occupancyRate >= 80 ? 'High Demand' : 'Available',
      badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      hasProgress: true,
      progressVal: stats.occupancyRate || 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
      {allStats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Link
            key={stat.label}
            href={stat.href}
            className="group relative bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-[24px] sm:rounded-[26px] border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-xs hover:shadow-xl hover:shadow-emerald-500/5 dark:hover:shadow-black/60 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
          >
            {/* Top Hover Gradient Line */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            {/* Radial Accent Ambient Glow */}
            <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full ${stat.glowBg} blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none`} />

            {/* Card Header: Icon & Action Badge */}
            <div className="flex items-center justify-between mb-2.5 sm:mb-3 z-10">
              <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl ${stat.iconBg} border flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shrink-0 shadow-xs`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] sm:text-[11px] font-extrabold uppercase px-2 sm:px-2.5 py-0.5 rounded-full border ${stat.badgeColor} tracking-wider`}>
                  {stat.badge}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600 group-hover:text-[#2f7d6d] dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            {/* Card Body: Label, Value, Subtitle & Optional Progress Bar */}
            <div className="z-10 mt-auto">
              <p className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 truncate">
                {stat.label}
              </p>
              
              <div className="flex items-baseline gap-2">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-[#2f7d6d] dark:group-hover:text-emerald-400 transition-colors truncate">
                  {stat.value}
                </h3>
              </div>

              <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 truncate leading-snug">
                {stat.subtitle}
              </p>

              {/* Progress Bar for Occupancy Rate */}
              {stat.hasProgress && (
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2.5">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, Math.max(0, stat.progressVal))}%` }}
                  />
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

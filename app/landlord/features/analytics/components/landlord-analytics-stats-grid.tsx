'use client';

import React from 'react';
import {
  DollarSign,
  CalendarCheck,
  PieChart,
  TrendingUp,
  Star,
  Clock,
  HelpCircle,
} from 'lucide-react';
import Skeleton from '@/components/common/Skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StatsProps {
  totalRevenue: number;
  confirmedBookings: number;
  pendingInquiries: number;
  totalInquiries: number;
  inquiryConversionRate: number;
  bookingSuccessRate?: number;
  totalBookingRequests?: number;
  averageRating: number;
  totalReviews: number;
  occupancyRate: number;
  occupiedSlots: number;
  totalCapacity: number;
  vacantSlots: number;
  expiringLeases: number;
}

interface LandlordAnalyticsStatsGridProps {
  stats?: StatsProps | null;
  propertyName?: string;
  isLoading?: boolean;
}

export function LandlordAnalyticsStatsGrid({
  stats,
  propertyName,
  isLoading = false,
}: LandlordAnalyticsStatsGridProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-[22px] border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between h-[135px] sm:h-[145px]"
          >
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl" />
              <Skeleton className="w-12 h-4 rounded-full opacity-50" variant="text" />
            </div>
            <div>
              <Skeleton className="h-3 w-16 mb-1.5 opacity-60" variant="text" />
              <Skeleton className="h-7 w-20 mb-1" variant="text" />
              <Skeleton className="h-3 w-24 opacity-40" variant="text" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Earnings',
      value: `₱${stats.totalRevenue.toLocaleString()}`,
      subtitle: 'Paid student bookings',
      icon: DollarSign,
      accentColor: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      badge: 'Paid Rent',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      tooltip: {
        title: 'Gross Earnings',
        description: 'Total revenue collected and confirmed from student bookings across this property scope.',
        detail: 'Calculated from completed and confirmed rent payments.',
      },
    },
    {
      label: 'Active Bookings',
      value: stats.confirmedBookings,
      subtitle: `${stats.confirmedBookings} active & completed stays`,
      icon: CalendarCheck,
      accentColor: 'from-purple-500 to-indigo-500',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      badge: 'Active Stays',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      tooltip: {
        title: 'Active Bookings',
        description: 'Total students currently staying in or holding confirmed reservations for your rooms.',
        detail: 'Excludes cancelled or refunded reservations.',
      },
    },
    {
      label: 'Rooms Occupied',
      value: `${stats.occupancyRate}%`,
      subtitle: `${stats.occupiedSlots} of ${stats.totalCapacity} beds filled`,
      icon: PieChart,
      accentColor: 'from-teal-500 to-cyan-500',
      iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      badge: stats.occupancyRate >= 70 ? 'Mostly Full' : `${stats.vacantSlots} Open Beds`,
      badgeColor: stats.occupancyRate >= 70
        ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20'
        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      hasProgress: true,
      progressVal: stats.occupancyRate,
      tooltip: {
        title: 'Bed Occupancy Rate',
        description: 'Percentage of total bed spaces currently occupied by active student tenants.',
        detail: `Formula: (${stats.occupiedSlots} occupied / ${stats.totalCapacity} total capacity) × 100`,
      },
    },
    {
      label: 'Booking Success',
      value: `${stats.bookingSuccessRate ?? stats.inquiryConversionRate}%`,
      subtitle: `${stats.confirmedBookings} confirmed of ${stats.totalBookingRequests ?? stats.confirmedBookings} requests`,
      icon: TrendingUp,
      accentColor: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      badge: (stats.bookingSuccessRate ?? stats.inquiryConversionRate) >= 90
        ? 'Excellent'
        : (stats.bookingSuccessRate ?? stats.inquiryConversionRate) >= 75
        ? 'Good Rate'
        : 'Normal',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      tooltip: {
        title: 'Booking Confirmation Rate',
        description: 'Percentage of student booking requests that successfully resulted in confirmed reservations.',
        detail: `Formula: (${stats.confirmedBookings} confirmed / ${stats.totalBookingRequests ?? stats.confirmedBookings} total requests) × 100`,
      },
    },
    {
      label: 'Student Rating',
      value: stats.averageRating > 0 ? `${stats.averageRating.toFixed(1)} ★` : 'N/A',
      subtitle: stats.totalReviews > 0 ? `${stats.totalReviews} student reviews` : 'No reviews yet',
      icon: Star,
      accentColor: 'from-amber-400 to-yellow-500',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      badge: stats.averageRating >= 4.5 ? 'Top Rated' : 'Verified',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      tooltip: {
        title: 'Tenant Review Score',
        description: 'Average satisfaction rating calculated from verified student tenant reviews.',
        detail: stats.totalReviews > 0 ? `Based on ${stats.totalReviews} student reviews.` : 'No verified reviews submitted yet.',
      },
    },
    {
      label: 'Ending Soon',
      value: stats.expiringLeases,
      subtitle: stats.expiringLeases > 0 ? 'Ending in next 30 days' : 'No move-outs soon',
      icon: Clock,
      accentColor: 'from-rose-500 to-orange-500',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      badge: stats.expiringLeases > 0 ? 'Ending Soon' : 'All Set',
      badgeColor: stats.expiringLeases > 0
        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse'
        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      tooltip: {
        title: 'Upcoming Move-Outs',
        description: 'Number of active student rental contracts scheduled to end within the next 30 days.',
        detail: 'Helps you plan room inspection, maintenance, and remarketing.',
      },
    },
  ];

  return (
    <TooltipProvider delayDuration={150}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[22px] sm:rounded-[24px] border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:shadow-xl hover:shadow-[#2f7d6d]/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-default select-none"
            >
              {/* Ambient Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${kpi.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              {/* Header: Icon + Badge + Info Icon */}
              <div className="flex items-center justify-between mb-2.5 sm:mb-3 z-10">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl ${kpi.iconBg} border flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow-2xs`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded-full border ${kpi.badgeColor} tracking-wider truncate max-w-[78px] sm:max-w-[95px]`}>
                    {kpi.badge}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400/80 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                        aria-label={`About ${kpi.label}`}
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="max-w-[240px] p-0 border-0 shadow-2xl rounded-2xl overflow-hidden"
                    >
                      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 space-y-1.5 text-left">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${kpi.iconBg} border shrink-0`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider truncate">
                            {kpi.tooltip.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          {kpi.tooltip.description}
                        </p>
                        {kpi.tooltip.detail && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 italic pt-1 border-t border-slate-100 dark:border-slate-800/80">
                            {kpi.tooltip.detail}
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Body: Label & Value */}
              <div className="z-10 mt-auto">
                <p className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5 truncate">
                  {kpi.label}
                </p>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-[#2f7d6d] dark:group-hover:text-emerald-400 transition-colors truncate">
                  {kpi.value}
                </h3>
                <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
                  {kpi.subtitle}
                </p>

                {/* Progress Bar for Occupancy Rate */}
                {kpi.hasProgress && (
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(0, kpi.progressVal))}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

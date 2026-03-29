'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  IconBuilding,
  IconMail,
  IconCalendarCheck,
  IconStar,
  IconChartLine,
  IconPlus,
  IconEye,
  IconChevronRight,
  IconHome,
  IconActivity,
  IconArrowRight,
  IconCreditCard,
  IconMessage2
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { ChartAreaInteractive } from '@/app/landlord/components/charts/AreaChart';
import { ChartBarInteractive } from '@/app/landlord/components/charts/BarChart';
import { ChartLineInteractive } from '@/app/landlord/components/charts/LineChart';
import { ChartPieLabel } from '@/app/landlord/components/charts/PieChart';
import { ChartRadarDots } from '@/app/landlord/components/charts/RadarChart';
import { ChartRadialLabel } from '@/app/landlord/components/charts/RadialChart';
import { ChartTooltipDefault } from '@/app/landlord/components/charts/ToolTips';
import Button from '@/components/common/Button';

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

const recentActivities = [
  {
    id: 1,
    type: 'INQUIRY',
    title: 'New Inquiry Received',
    description: 'for Apartment #3 - Luxury Studio',
    time: '2 hours ago',
    status: 'Pending',
    icon: IconMail,
    color: 'amber',
    href: '/landlord/inquiries'
  },
  {
    id: 2,
    type: 'BOOKING',
    title: 'Booking Confirmed',
    description: 'James Wilson booked Sunset Villa',
    time: '5 hours ago',
    status: 'Confirmed',
    icon: IconCalendarCheck,
    color: 'emerald',
    href: '/landlord/bookings'
  },
  {
    id: 3,
    type: 'REVIEW',
    title: 'New 5-Star Review',
    description: 'from Sarah Jenkins about Loft #12',
    time: 'Yesterday',
    status: 'Published',
    icon: IconStar,
    color: 'blue',
    href: '/landlord/reviews'
  },
  {
    id: 4,
    type: 'PAYMENT',
    title: 'Payment Received',
    description: '₱12,500 from Unit 4B Monthly Rent',
    time: '2 days ago',
    status: 'Success',
    icon: IconCreditCard,
    color: 'purple',
    href: '/landlord/payments'
  }
];

export default function LandlordDashboardClient({ stats }: LandlordDashboardClientProps) {
  const [filter, setFilter] = useState('ALL');

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
      icon: IconChartLine,
      color: 'indigo',
    },
  ];

  const quickActions = [
    {
      title: 'Add Property',
      icon: IconPlus,
      href: '/landlord/properties/create',
      description: 'List a new property for rent',
    },
    {
      title: 'View Inquiries',
      icon: IconEye,
      href: '/landlord/inquiries',
      description: 'Check pending inquiries',
    },
    {
      title: 'Manage Bookings',
      icon: IconCalendarCheck,
      href: '/landlord/bookings',
      description: 'View confirmed bookings',
    },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-950 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-2xl shadow-gray-200/50 dark:shadow-black/20">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-[24px] flex items-center justify-center shadow-inner">
            <IconHome size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1.5 tracking-tighter">
              Landlord Dashboard
            </h1>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              High-level overview of your rental empire
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
              className="group relative bg-white dark:bg-gray-900 rounded-[28px] border border-gray-100 dark:border-gray-800 p-8 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 overflow-hidden"
            >
              <div className="relative z-10 flex flex-col items-start gap-4">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-[20px] flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                  <Icon size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">
                    {action.title}
                  </h3>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed uppercase tracking-tighter text-[11px]">
                    {action.description}
                  </p>
                </div>
                <div className="mt-2 w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-primary/5 transition-all">
                   <IconArrowRight size={18} className="text-primary translate-x-0 group-hover:translate-x-1 transition-transform" />
                </div>
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-950 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartAreaInteractive />
        </div>
        <div className="bg-white dark:bg-gray-950 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartPieLabel />
        </div>
        <div className="bg-white dark:bg-gray-950 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartLineInteractive />
        </div>
        <div className="bg-white dark:bg-gray-950 p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
             <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-xl">
                    <IconActivity size={18} />
                  </div>
                  Recent Activity
                </h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time system updates</p>
             </div>
             <Button outline className="rounded-[18px] py-1.5 px-4 text-[10px] font-black uppercase tracking-widest min-w-max w-auto">
               View All History
             </Button>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              const accentColor: Record<string, string> = {
                amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30',
                emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30',
                blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30',
                purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30',
              };

              return (
                <Link
                  key={activity.id}
                  href={activity.href}
                  className="group flex items-center gap-5 p-5 bg-gray-50/50 dark:bg-gray-900/50 rounded-[28px] border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:bg-white dark:hover:bg-gray-900 hover:shadow-xl transition-all duration-500"
                >
                  <div className={cn("flex-shrink-0 w-14 h-14 rounded-[22px] flex items-center justify-center border-2 transition-transform duration-500 group-hover:scale-110 shadow-sm", accentColor[activity.color])}>
                    <Icon size={24} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-0.5">
                      <p className="text-base font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors tracking-tight truncate">
                        {activity.title}
                      </p>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">{activity.time}</span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                       {activity.description}
                    </p>
                  </div>
                  <div className={cn("hidden sm:flex items-center px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border", accentColor[activity.color])}>
                    {activity.status}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

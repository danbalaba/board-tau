'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
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
  IconMessage2,
  IconPercentage,
  IconBed,
  IconDoor,
  IconCalendarEvent,
  IconX
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

// Dynamic imports for chart components (lazy loading)
const ChartAreaInteractive = dynamic(() => import('@/app/landlord/components/charts/AreaChart').then(mod => mod.ChartAreaInteractive), { ssr: false });
const ChartBarInteractive = dynamic(() => import('@/app/landlord/components/charts/BarChart').then(mod => mod.ChartBarInteractive), { ssr: false });
const ChartLineInteractive = dynamic(() => import('@/app/landlord/components/charts/LineChart').then(mod => mod.ChartLineInteractive), { ssr: false });
const ChartPieLabel = dynamic(() => import('@/app/landlord/components/charts/PieChart').then(mod => mod.ChartPieLabel), { ssr: false });
const ChartRadarDots = dynamic(() => import('@/app/landlord/components/charts/RadarChart').then(mod => mod.ChartRadarDots), { ssr: false });
const ChartRadialLabel = dynamic(() => import('@/app/landlord/components/charts/RadialChart').then(mod => mod.ChartRadialLabel), { ssr: false });
const ChartTooltipDefault = dynamic(() => import('@/app/landlord/components/charts/ToolTips').then(mod => mod.ChartTooltipDefault), { ssr: false });
import Button from '@/components/common/Button';
import Modal from '@/components/modals/Modal';

interface LandlordDashboardStats {
  totalProperties: number;
  activeListings: number;
  pendingInquiries: number;
  confirmedBookings: number;
  averageRating: number;
  totalReviews: number;
  monthlyRevenue: number;
  occupancyRate: number;
  vacantRooms: number;
  occupiedRooms: number;
  expiringLeases: number;
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
  },
  {
    id: 5,
    type: 'INQUIRY',
    title: 'New Inquiry Received',
    description: 'for Unit 5A - Standard Room',
    time: '3 days ago',
    status: 'Pending',
    icon: IconMail,
    color: 'amber',
    href: '/landlord/inquiries'
  },
  {
    id: 6,
    type: 'BOOKING',
    title: 'Booking Cancelled',
    description: 'Michael Brown cancelled Ocean View Suite',
    time: '4 days ago',
    status: 'Cancelled',
    icon: IconCalendarCheck,
    color: 'red',
    href: '/landlord/bookings'
  },
  {
    id: 7,
    type: 'REVIEW',
    title: 'New 4-Star Review',
    description: 'from David Lee about Garden View Room',
    time: '5 days ago',
    status: 'Published',
    icon: IconStar,
    color: 'blue',
    href: '/landlord/reviews'
  },
  {
    id: 8,
    type: 'PAYMENT',
    title: 'Payment Received',
    description: '₱15,000 from Unit 2C Monthly Rent',
    time: '1 week ago',
    status: 'Success',
    icon: IconCreditCard,
    color: 'purple',
    href: '/landlord/payments'
  },
  {
    id: 9,
    type: 'INQUIRY',
    title: 'New Inquiry Received',
    description: 'for Penthouse - Premium Suite',
    time: '1 week ago',
    status: 'Pending',
    icon: IconMail,
    color: 'amber',
    href: '/landlord/inquiries'
  },
  {
    id: 10,
    type: 'BOOKING',
    title: 'Booking Confirmed',
    description: 'Emma Watson booked Mountain View Room',
    time: '1 week ago',
    status: 'Confirmed',
    icon: IconCalendarCheck,
    color: 'emerald',
    href: '/landlord/bookings'
  },
  {
    id: 11,
    type: 'REVIEW',
    title: 'New 3-Star Review',
    description: 'from John Smith about City Lights Room',
    time: '2 weeks ago',
    status: 'Published',
    icon: IconStar,
    color: 'blue',
    href: '/landlord/reviews'
  },
  {
    id: 12,
    type: 'PAYMENT',
    title: 'Payment Received',
    description: '₱18,500 from Unit 1B Monthly Rent',
    time: '2 weeks ago',
    status: 'Success',
    icon: IconCreditCard,
    color: 'purple',
    href: '/landlord/payments'
  }
];

export default function LandlordDashboardClient({ stats }: LandlordDashboardClientProps) {
  const [filter, setFilter] = useState('ALL');
  const [showAllActivitiesModal, setShowAllActivitiesModal] = useState(false);

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
    {
      label: 'Occupancy Rate',
      value: `${stats.occupancyRate}%`,
      icon: IconPercentage,
      color: 'cyan',
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
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-950 p-5 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-lg shadow-gray-200/50 dark:shadow-black/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-[20px] flex items-center justify-center shadow-inner">
            <IconHome size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
              Landlord Dashboard
            </h1>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              High-level overview of your rental empire
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className="group relative bg-white dark:bg-gray-900 rounded-[20px] border border-gray-100 dark:border-gray-800 p-5 hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden"
            >
              <div className="relative z-10 flex flex-col items-start gap-3">
                <div className="w-11 h-11 bg-primary/10 text-primary rounded-[16px] flex items-center justify-center group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-0.5 tracking-tight">
                    {action.title}
                  </h3>
                  <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed uppercase tracking-tighter">
                    {action.description}
                  </p>
                </div>
                <div className="mt-1 w-8 h-8 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-primary/5 transition-all">
                   <IconArrowRight size={14} className="text-primary translate-x-0 group-hover:translate-x-0.5 transition-transform" />
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
            cyan: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10 dark:text-cyan-400',
            teal: 'text-teal-600 bg-teal-50 dark:bg-teal-500/10 dark:text-teal-400',
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-950 p-5 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartAreaInteractive />
        </div>
        <div className="bg-white dark:bg-gray-950 p-5 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartPieLabel />
        </div>
        <div className="bg-white dark:bg-gray-950 p-5 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartLineInteractive />
        </div>
        <div className="bg-white dark:bg-gray-950 p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="flex flex-row items-center justify-between mb-6 gap-4">
             <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                  <IconActivity size={14} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                  Recent Activity
                </h3>
             </div>
              <Button outline className="rounded-[14px] py-1 px-3 text-[9px] font-bold uppercase tracking-widest" onClick={() => setShowAllActivitiesModal(true)}>
               View All
              </Button>
          </div>
          
           <div className="space-y-3">
            {recentActivities.slice(0, 5).map((activity) => {
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
                  className="group flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:bg-white dark:hover:bg-gray-900 hover:shadow-lg transition-all duration-300"
                >
                  <div className={cn("flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border transition-transform duration-300 group-hover:scale-105 shadow-sm", accentColor[activity.color])}>
                    <Icon size={16} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors tracking-tight truncate">
                        {activity.title}
                      </p>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest shrink-0">{activity.time}</span>
                    </div>
                    <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                       {activity.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* All Activities Modal */}
      <Modal isOpen={showAllActivitiesModal} onClose={() => setShowAllActivitiesModal(false)} width="xl" title="All Recent Activity">
        <div className="max-h-[70vh] overflow-y-auto p-1">
          <div className="space-y-3">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              const accentColor: Record<string, string> = {
                amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30',
                emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30',
                blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30',
                purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30',
                red: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30',
              };

              const statusColor: Record<string, string> = {
                Pending: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10',
                Confirmed: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
                Published: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10',
                Success: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10',
                Cancelled: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10',
              };

              return (
                <Link
                  key={activity.id}
                  href={activity.href}
                  onClick={() => setShowAllActivitiesModal(false)}
                  className="group flex items-center gap-3 p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:bg-white dark:hover:bg-gray-900 hover:shadow-lg transition-all duration-300"
                >
                  <div className={cn("flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center border transition-transform duration-300 group-hover:scale-105 shadow-sm", accentColor[activity.color])}>
                    <Icon size={18} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors tracking-tight truncate">
                        {activity.title}
                      </p>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0", statusColor[activity.status])}>
                        {activity.status}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                       {activity.description}
                    </p>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 block">{activity.time}</span>
                  </div>
                  <IconChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
}

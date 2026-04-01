'use client';

import React from 'react';
import Link from 'next/link';
import {
  IconMail,
  IconCalendarCheck,
  IconStar,
  IconCreditCard,
  IconActivity,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/Button';

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

export function LandlordDashboardRecentActivity() {
  return (
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
         <Button outline className="rounded-[14px] py-1 px-3 text-[9px] font-bold uppercase tracking-widest">
           View All
         </Button>
      </div>
      
      <div className="space-y-3">
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
  );
}

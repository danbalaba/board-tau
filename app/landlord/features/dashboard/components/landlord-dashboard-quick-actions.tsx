'use client';

import React from 'react';
import Link from 'next/link';
import {
  IconPlus,
  IconEye,
  IconCalendarCheck,
  IconArrowRight,
} from '@tabler/icons-react';

export function LandlordDashboardQuickActions() {
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
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaHome,
  FaBuilding,
  FaEnvelope,
  FaCalendarCheck,
  FaStar,
  FaChartLine,
  FaCog,
} from 'react-icons/fa';

const navItems = [
  {
    href: '/landlord',
    label: 'Dashboard',
    icon: FaHome,
  },
  {
    href: '/landlord/properties',
    label: 'Properties',
    icon: FaBuilding,
  },
  {
    href: '/landlord/inquiries',
    label: 'Inquiries',
    icon: FaEnvelope,
  },
  {
    href: '/landlord/bookings',
    label: 'Bookings',
    icon: FaCalendarCheck,
  },
  {
    href: '/landlord/reviews',
    label: 'Reviews',
    icon: FaStar,
  },
  {
    href: '/landlord/analytics',
    label: 'Analytics',
    icon: FaChartLine,
  },
  {
    href: '/landlord/settings',
    label: 'Settings',
    icon: FaCog,
  },
];

export default function LandlordSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside
      className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <Link href="/landlord" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">BT</span>
            </div>
            {isOpen && <span className="font-bold text-lg text-gray-900 dark:text-white">BoardTAU</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
              >
                <Icon size={20} />
                {isOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar toggle */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="sr-only">Toggle sidebar</span>
            {isOpen ? (
              <span className="text-sm font-medium">Hide</span>
            ) : (
              <span className="text-sm font-medium">Show</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}

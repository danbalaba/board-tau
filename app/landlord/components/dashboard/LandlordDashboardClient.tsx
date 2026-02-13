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
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Landlord Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your properties, inquiries, and bookings efficiently
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className="flex items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Icon size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {action.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {action.description}
                </p>
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
            blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
            green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
            yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
            purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
            orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
            red: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
            indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400',
          };

          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[stat.color]}`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Monthly Revenue
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={(value) => `₱${value.toLocaleString()}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Listings Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Active Listings Performance
          </h3>
          <div className="h-64">
            {/* Placeholder for active listings chart */}
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              Chart data will be available soon
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {/* Placeholder activity items */}
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <FaEnvelope size={16} className="text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  New inquiry received for Apartment #3
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  2 hours ago
                </p>
              </div>
              <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                Pending
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

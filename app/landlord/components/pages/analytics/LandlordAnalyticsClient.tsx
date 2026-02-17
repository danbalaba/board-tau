'use client';

import React, { useState } from 'react';
import {
  FaChartLine,
  FaBuilding,
  FaCalendarCheck,
  FaStar,
  FaMoneyBill,
  FaUsers,
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface LandlordAnalyticsClientProps {
  stats: {
    totalProperties: number;
    activeListings: number;
    pendingInquiries: number;
    confirmedBookings: number;
    averageRating: number;
    totalReviews: number;
    monthlyRevenue: number;
  };
  revenue: any;
  occupancy: any;
}

export default function LandlordAnalyticsClient({
  stats,
  revenue,
  occupancy,
}: LandlordAnalyticsClientProps) {
  const [timePeriod, setTimePeriod] = useState<'month' | 'quarter' | 'year'>('month');

  // Sample data for charts (would be replaced with real data from API)
  const revenueData = [
    { name: 'Jan', revenue: 12000 },
    { name: 'Feb', revenue: 19800 },
    { name: 'Mar', revenue: 15000 },
    { name: 'Apr', revenue: 25000 },
    { name: 'May', revenue: 32000 },
    { name: 'Jun', revenue: 28000 },
  ];

  const occupancyData = [
    { name: 'Property A', occupancy: 85 },
    { name: 'Property B', occupancy: 60 },
    { name: 'Property C', occupancy: 95 },
    { name: 'Property D', occupancy: 70 },
  ];

  const propertyPerformanceData = [
    { name: 'Property A', inquiries: 15, bookings: 8, revenue: 24000 },
    { name: 'Property B', inquiries: 10, bookings: 5, revenue: 15000 },
    { name: 'Property C', inquiries: 20, bookings: 12, revenue: 36000 },
    { name: 'Property D', inquiries: 8, bookings: 4, revenue: 12000 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
      icon: FaCalendarCheck,
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
      icon: FaMoneyBill,
      color: 'indigo',
    },
    {
      label: 'Occupancy Rate',
      value: `${occupancy.occupancyRate.toFixed(1)}%`,
      icon: FaUsers,
      color: 'teal',
    },
  ];

  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400',
    teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-400',
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics & Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your property performance and revenue
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as 'month' | 'quarter' | 'year')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
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

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Revenue Overview
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

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Occupancy Rate by Property
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="occupancy" fill="#8884d8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Property Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Property Performance
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={propertyPerformanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {propertyPerformanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Property */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Revenue by Property
          </h3>
          <div className="space-y-4">
            {propertyPerformanceData.map((property) => (
              <div key={property.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${COLORS[propertyPerformanceData.indexOf(property) % COLORS.length]}`} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {property.name}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  ₱{property.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Statistics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Booking Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Bookings
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {stats.confirmedBookings}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Revenue
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                ₱{revenue.totalRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Average Booking Value
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                ₱{revenue.averageBookingValue.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Occupancy Rate
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {occupancy.occupancyRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

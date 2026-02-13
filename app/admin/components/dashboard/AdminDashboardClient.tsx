'use client';

import React, { useState, useEffect } from 'react';
import { FaDollarSign, FaUsers, FaHotel, FaStar, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import StatWidget from '../common/StatWidget';
import DashboardCard from '../common/DashboardCard';
import { RevenueChart, UserGrowthChart, PropertyTypeChart, BookingTrendChart } from '../common/Charts';
import { motion } from 'framer-motion';

interface AnalyticsData {
  stats: {
    totalRevenue: string;
    activeUsers: string;
    totalListings: string;
    averageRating: string;
  };
  charts: {
    monthlyData: Array<{
      name: string;
      bookings: number;
      revenue: number;
    }>;
    userRoles: Array<{
      role: string;
      _count: { id: number };
    }>;
    propertyTypes: Array<{
      category: string;
      _count: { id: number };
    }>;
  };
}

const AdminDashboardClient: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/admin/analytics');
        const data = await response.json();
        if (data.success) {
          setAnalyticsData(data.data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="w-48 h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
            <div className="w-96 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-6">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4 animate-pulse"></div>
              <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
              <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback to static data if API fails
  const stats = analyticsData?.stats || {
    totalRevenue: "$12,584",
    activeUsers: "1,847",
    totalListings: "245",
    averageRating: "4.8/5.0"
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back! Here's your comprehensive view of BoardTAU's performance.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Generate Report
        </motion.button>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget
          title="Total Revenue"
          value={stats.totalRevenue}
          change="12.5%"
          changeType="positive"
          icon={FaDollarSign}
          iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatWidget
          title="Active Users"
          value={stats.activeUsers}
          change="5.2%"
          changeType="positive"
          icon={FaUsers}
          iconBg="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatWidget
          title="Total Listings"
          value={stats.totalListings}
          change="8.1%"
          changeType="positive"
          icon={FaHotel}
          iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatWidget
          title="Average Rating"
          value={stats.averageRating}
          change="0.2"
          changeType="positive"
          icon={FaStar}
          iconBg="bg-gradient-to-br from-yellow-500 to-orange-500"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <DashboardCard title="Revenue & Expenses" className="lg:col-span-2">
          <RevenueChart data={analyticsData?.charts.monthlyData.map(item => ({
            ...item,
            expenses: Math.floor(item.revenue * 0.6) // 60% of revenue as expenses for demo
          }))} />
        </DashboardCard>

        {/* Property type distribution */}
        <DashboardCard title="Property Types">
          <PropertyTypeChart data={analyticsData?.charts.propertyTypes.map(type => ({
            name: type.category,
            value: type._count.id,
            color: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 5)]
          }))} />
        </DashboardCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User growth */}
        <DashboardCard title="User Growth">
          <UserGrowthChart data={analyticsData?.charts.monthlyData.map((item, index) => ({
            name: item.name,
            students: Math.floor(150 + index * 20 + Math.random() * 30),
            landlords: Math.floor(20 + index * 5 + Math.random() * 10)
          }))} />
        </DashboardCard>

        {/* Booking trends */}
        <DashboardCard title="Booking Trends">
          <BookingTrendChart data={analyticsData?.charts.monthlyData} />
        </DashboardCard>
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent reservations */}
        <DashboardCard title="Recent Reservations">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Guest</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Property</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((item) => (
                  <motion.tr
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: item * 0.1 }}
                    whileHover={{ scale: 1.02, backgroundColor: '#f8fafc' }}
                    className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all duration-200"
                  >
                    <td className="py-4 px-4 text-sm text-gray-800 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-xs">JD</span>
                        </div>
                        <div>
                          <p className="font-medium">John Doe</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">john@example.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-800 dark:text-white">
                      <div>
                        <p className="font-medium">Modern Apartment</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">New York, NY</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-800 dark:text-white">
                      <div>
                        <p className="font-medium">Mar 15 - Mar 20</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">5 nights</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item % 2 === 0
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {item % 2 === 0 ? 'Confirmed' : 'Pending'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>

        {/* Top properties */}
        <DashboardCard title="Top Rated Properties">
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: item * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:bg-gradient-to-br from-slate-700 to-slate-600 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                    Luxury Villa{item}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {['Bali', 'Paris', 'Tokyo'][item - 1]}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-3 h-3 ${star <= 5 - (item % 2) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {[4.9, 4.8, 4.7][item - 1]}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default AdminDashboardClient;

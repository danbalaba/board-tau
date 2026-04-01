'use client';

import React from 'react';

interface LandlordAnalyticsInsightsProps {
  propertyPerformanceData: Array<{ name: string; inquiries: number; bookings: number; revenue: number }>;
  stats: any;
  occupancy: any;
}

const COLORS = ['#2f7d6d', '#1473E6', '#F59E0B', '#8B5CF6'];

export function LandlordAnalyticsInsights({
  propertyPerformanceData,
  stats,
  occupancy
}: LandlordAnalyticsInsightsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Revenue by Property</h3>
        <div className="space-y-2">
          {propertyPerformanceData.map((property, idx) => (
            <div key={property.name} className="group flex items-center justify-between p-2.5 px-3 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors tracking-tight">{property.name}</span>
              </div>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 tabular-nums">₱{property.revenue.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Booking Statistics</h3>
        <div className="space-y-2">
          {[
            { label: 'Confirmed Bookings', value: stats.confirmedBookings, suffix: '' },
            { label: 'Analytics Revenue', value: stats.monthlyRevenue.toLocaleString(), prefix: '₱' },
            { label: 'Daily Rate', value: '4,500', prefix: '₱' },
            { label: 'Occupancy', value: occupancy.occupancyRate.toFixed(1), suffix: '%' },
          ].map((item) => (
            <div key={item.label} className="group flex items-center justify-between p-2.5 px-3 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:shadow-md transition-all duration-300">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors">{item.label}</span>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 tabular-nums">{item.prefix}{item.value}{item.suffix}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { IconChevronRight, IconX } from '@tabler/icons-react';

interface LandlordAnalyticsInsightsProps {
  propertyPerformanceData: Array<{ name: string; inquiries: number; bookings: number; revenue: number }>;
  stats: any;
  occupancy: any;
}

const COLORS = ['#2f7d6d', '#1473E6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#06B6D4'];

export function LandlordAnalyticsInsights({
  propertyPerformanceData,
  stats,
  occupancy
}: LandlordAnalyticsInsightsProps) {
  const [showAllModal, setShowAllModal] = useState(false);
  
  const avgDailyRate = stats.monthlyRevenue > 0 && stats.confirmedBookings > 0
    ? Math.round(stats.monthlyRevenue / stats.confirmedBookings)
    : 0;

  const sortedProperties = [...propertyPerformanceData].sort((a, b) => b.revenue - a.revenue);
  const top8Properties = sortedProperties.slice(0, 8);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Revenue by Property</h3>
            {sortedProperties.length > 8 && (
              <button 
                onClick={() => setShowAllModal(true)}
                className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
              >
                See All <IconChevronRight size={14} />
              </button>
            )}
          </div>
          <div className="space-y-2">
            {top8Properties.length > 0 ? (
              top8Properties.map((property, idx) => (
                <div key={property.name} className="group flex items-center justify-between p-2.5 px-3 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors tracking-tight truncate max-w-[180px]">{property.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 tabular-nums">₱{property.revenue.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 p-2">No property data available</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 tracking-tight">Booking Statistics</h3>
          <div className="space-y-2">
            {[
              { label: 'Confirmed Bookings', value: stats.confirmedBookings, suffix: '' },
              { label: 'Analytics Revenue', value: stats.monthlyRevenue.toLocaleString(), prefix: '₱' },
              { label: 'Daily Rate', value: avgDailyRate > 0 ? avgDailyRate.toLocaleString() : '0', prefix: '₱' },
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

      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">All Properties by Revenue</h3>
              <button 
                onClick={() => setShowAllModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <IconX size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-2">
              {sortedProperties.map((property, idx) => (
                <div key={property.name} className="flex items-center justify-between p-3 px-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-6">#{idx + 1}</span>
                    <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{property.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">₱{property.revenue.toLocaleString()}</span>
                    <p className="text-[10px] text-gray-400">{property.bookings} bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
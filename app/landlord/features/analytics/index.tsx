'use client';

import React, { useState } from 'react';
import {
  IconChartLine,
} from '@tabler/icons-react';
import ModernSelect from '@/components/common/ModernSelect';
import { 
  generateMultiSectionPDF,
  ReportSection
} from '@/utils/pdfGenerator';
import GenerateReportButton from '@/components/common/GenerateReportButton';

import AnalyticsStats from './components/analytics-stats';
import AnalyticsCharts from './components/analytics-charts';

interface LandlordAnalyticsFeatureProps {
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

export default function LandlordAnalyticsFeature({
  stats,
  revenue,
  occupancy,
}: LandlordAnalyticsFeatureProps) {
  const [timePeriod, setTimePeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const propertyPerformanceData = [
    { name: 'Property A', inquiries: 15, bookings: 8, revenue: 24000 },
    { name: 'Property B', inquiries: 10, bookings: 5, revenue: 15000 },
    { name: 'Property C', inquiries: 20, bookings: 12, revenue: 36000 },
    { name: 'Property D', inquiries: 8, bookings: 4, revenue: 12000 },
  ];

  const COLORS = ['#2f7d6d', '#1473E6', '#F59E0B', '#8B5CF6'];

  const handleGenerateReport = async () => {
    // Report implementation (condensed for brevity, same as legacy)
    const sections: ReportSection[] = [
      {
        title: 'Executive Summary',
        type: 'table',
        columns: ['Metric', 'Current Value', 'Growth', 'Health Status'],
        data: [
          ['Total Properties', String(stats.totalProperties), '+5.2%', 'Stable'],
          ['Monthly Revenue', `PHP ${stats.monthlyRevenue.toLocaleString()}`, '+15.2%', 'Improving'],
          ['Occupancy Rate', `${occupancy.occupancyRate.toFixed(1)}%`, '+2.1%', 'Healthy'],
        ]
      },
      {
        title: 'Property Breakdown',
        type: 'table',
        columns: ['Property Name', 'Revenue (PHP)', 'Inquiries', 'Bookings'],
        data: propertyPerformanceData.map(p => [
          p.name,
          p.revenue.toLocaleString(),
          p.inquiries.toString(),
          p.bookings.toString()
        ])
      }
    ];

    await generateMultiSectionPDF(
      'Landlord_Analytics_Report',
      sections,
      {
        title: 'Property Performance Report',
        subtitle: `Analytics Overview (${timePeriod.toUpperCase()})`,
        author: 'Landlord Dashboard'
      }
    );
  };

  return (
    <div className="space-y-4 pb-12 p-2">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
              <IconChartLine size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                Analytics & Performance
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ModernSelect
              instanceId="analytics-time-period"
              value={timePeriod}
              onChange={(val: any) => setTimePeriod(val)}
              className="min-w-[140px]"
              options={[
                { value: 'month', label: 'This Month' },
                { value: 'quarter', label: 'Quarter' },
                { value: 'year', label: 'Year' },
              ]}
            />
            <GenerateReportButton 
              onGeneratePDF={handleGenerateReport}
            />
          </div>
        </div>
      </div>

      <AnalyticsStats stats={stats} occupancyRate={occupancy.occupancyRate} />
      
      <AnalyticsCharts />

      {/* Bottom Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
            Revenue by Property
          </h3>
          <div className="space-y-2">
            {propertyPerformanceData.map((property, idx) => (
              <div key={property.name} className="group flex items-center justify-between p-2.5 px-3 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors tracking-tight">
                    {property.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 tabular-nums">
                  ₱{property.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
            Booking Statistics
          </h3>
          <div className="space-y-2">
            {[
              { label: 'Confirmed Bookings', value: stats.confirmedBookings, suffix: '' },
              { label: 'Analytics Revenue', value: stats.monthlyRevenue.toLocaleString(), prefix: '₱' },
              { label: 'Daily Rate', value: '4,500', prefix: '₱' },
              { label: 'Occupancy', value: occupancy.occupancyRate.toFixed(1), suffix: '%' },
            ].map((item) => (
              <div key={item.label} className="group flex items-center justify-between p-2.5 px-3 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:shadow-md transition-all duration-300">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors">
                  {item.label}
                </span>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 tabular-nums">
                  {item.prefix}{item.value}{item.suffix}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

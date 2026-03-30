'use client';

import React, { useState } from 'react';
import {
  IconChartLine,
  IconBuilding,
  IconCalendarCheck,
  IconStar,
  IconCash,
  IconUsers,
} from '@tabler/icons-react';
import dynamic from 'next/dynamic';

const ChartAreaInteractive = dynamic(() => import('@/app/landlord/components/charts/AreaChart').then(mod => mod.ChartAreaInteractive), { ssr: false });
const ChartBarInteractive = dynamic(() => import('@/app/landlord/components/charts/BarChart').then(mod => mod.ChartBarInteractive), { ssr: false });
const ChartLineInteractive = dynamic(() => import('@/app/landlord/components/charts/LineChart').then(mod => mod.ChartLineInteractive), { ssr: false });
const ChartPieLabel = dynamic(() => import('@/app/landlord/components/charts/PieChart').then(mod => mod.ChartPieLabel), { ssr: false });
const ChartRadarDots = dynamic(() => import('@/app/landlord/components/charts/RadarChart').then(mod => mod.ChartRadarDots), { ssr: false });
const ChartRadialLabel = dynamic(() => import('@/app/landlord/components/charts/RadialChart').then(mod => mod.ChartRadialLabel), { ssr: false });
const ChartTooltipDefault = dynamic(() => import('@/app/landlord/components/charts/ToolTips').then(mod => mod.ChartTooltipDefault), { ssr: false });
import ModernSelect from '@/components/common/ModernSelect';
import { 
  generateMultiSectionPDF,
  ReportSection
} from '@/utils/pdfGenerator';
import GenerateReportButton from '@/components/common/GenerateReportButton';

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

  const propertyPerformanceData = [
    { name: 'Property A', inquiries: 15, bookings: 8, revenue: 24000 },
    { name: 'Property B', inquiries: 10, bookings: 5, revenue: 15000 },
    { name: 'Property C', inquiries: 20, bookings: 12, revenue: 36000 },
    { name: 'Property D', inquiries: 8, bookings: 4, revenue: 12000 },
  ];

  const COLORS = ['#2f7d6d', '#1473E6', '#F59E0B', '#8B5CF6'];

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
      icon: IconCalendarCheck,
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
      icon: IconCash,
      color: 'indigo',
    },
    {
      label: 'Occupancy Rate',
      value: `${occupancy.occupancyRate.toFixed(1)}%`,
      icon: IconUsers,
      color: 'teal',
    },
  ];

  const colors: Record<string, string> = {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30',
    green: 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30',
    yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/30',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30',
    orange: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30',
    red: 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30',
    indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30',
    teal: 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30',
  };

  const handleGenerateReport = async () => {
    // Formatting Helpers to match interactive graph tooltips exactly
    const formatDaily = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    };

    const formatMonthly = (dateStr: string) => {
      // Append -01 to YYYY-MM to ensure consistent parsing across browsers
      const date = new Date(dateStr.length === 7 ? dateStr + "-01" : dateStr);
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    };

    // 1. Revenue & Bookings Overview (AreaChart) - Match UI exact 20-day set
    const areaChartData = [
      { date: "2024-04-01", revenue: 12000, bookings: 15 },
      { date: "2024-04-02", revenue: 19800, bookings: 22 },
      { date: "2024-04-03", revenue: 15000, bookings: 18 },
      { date: "2024-04-04", revenue: 25000, bookings: 28 },
      { date: "2024-04-05", revenue: 32000, bookings: 35 },
      { date: "2024-04-06", revenue: 28000, bookings: 31 },
      { date: "2024-04-07", revenue: 24500, bookings: 27 },
      { date: "2024-04-08", revenue: 40900, bookings: 45 },
      { date: "2024-04-09", revenue: 5900, bookings: 8 },
      { date: "2024-04-10", revenue: 26100, bookings: 29 },
      { date: "2024-04-11", revenue: 32700, bookings: 36 },
      { date: "2024-04-12", revenue: 29200, bookings: 32 },
      { date: "2024-04-13", revenue: 34200, bookings: 38 },
      { date: "2024-04-14", revenue: 13700, bookings: 15 },
      { date: "2024-04-15", revenue: 12000, bookings: 14 },
      { date: "2024-04-16", revenue: 13800, bookings: 15 },
      { date: "2024-04-17", revenue: 44600, bookings: 49 },
      { date: "2024-04-18", revenue: 36400, bookings: 40 },
      { date: "2024-04-19", revenue: 24300, bookings: 27 },
      { date: "2024-04-20", revenue: 8900, bookings: 10 },
    ];

    // Replicate EXACT filtering from AreaChart.tsx
    const latestDate = new Date(Math.max(...areaChartData.map(item => new Date(item.date).getTime())));
    const filterData = (daysToSubtract: number) => {
      const startDate = new Date(latestDate);
      startDate.setDate(startDate.getDate() - daysToSubtract);
      return areaChartData.filter((item) => {
        const date = new Date(item.date);
        return date >= startDate && date <= latestDate;
      });
    };

    const data90d = filterData(90);
    const data30d = filterData(30);
    const data7d = filterData(7);

    // 2. Growth Trend Analysis (LineChart)
    const lineChartData = [
      { date: "2024-04", bookings: 120, revenue: 45000 },
      { date: "2024-05", bookings: 150, revenue: 58000 },
      { date: "2024-06", bookings: 180, revenue: 67000 },
      { date: "2024-07", bookings: 200, revenue: 72000 },
      { date: "2024-08", bookings: 210, revenue: 78000 },
      { date: "2024-09", bookings: 230, revenue: 85000 },
    ];

    // 3. Portfolio Allocation (PieChart)
    const pieChartData = [
      { type: "Apartment", count: 12, revenue: 45000 },
      { type: "House", count: 8, revenue: 58000 },
      { type: "Studio", count: 15, revenue: 32000 },
      { type: "Loft", count: 5, revenue: 25000 },
    ];

    // 4. Factor Performance (RadarChart)
    const radarChartData = [
      { metric: "Location", value: 85 },
      { metric: "Value", value: 90 },
      { metric: "Cleanliness", value: 75 },
      { metric: "Amenities", value: 80 },
      { metric: "Communication", value: 95 },
      { metric: "Accuracy", value: 88 },
    ];

    // 5. Public Sentiments (RadialChart)
    const radialChartData = [
      { rating: "5 Star", value: 45 },
      { rating: "4 Star", value: 30 },
      { rating: "3 Star", value: 15 },
      { rating: "2 Star", value: 7 },
      { rating: "1 Star", value: 3 },
    ];

    // 6. Lead Origin Analysis (ToolTips)
    const leadOriginData = [
      { date: "2024-04", direct: 120, email: 80, social: 50 },
      { date: "2024-05", direct: 150, email: 95, social: 60 },
      { date: "2024-06", direct: 180, email: 110, social: 75 },
      { date: "2024-07", direct: 200, email: 125, social: 85 },
      { date: "2024-08", direct: 210, email: 130, social: 90 },
      { date: "2024-09", direct: 230, email: 140, social: 100 },
    ];

    // 7. Monthly Revenue by Property (BarChart)
    const barChartData = [
      { date: "2024-04", propertyA: 45000, propertyB: 38000, propertyC: 52000 },
      { date: "2024-05", propertyA: 52000, propertyB: 41000, propertyC: 58000 },
      { date: "2024-06", propertyA: 48000, propertyB: 39000, propertyC: 54000 },
      { date: "2024-07", propertyA: 55000, propertyB: 44000, propertyC: 61000 },
      { date: "2024-08", propertyA: 62000, propertyB: 48000, propertyC: 67000 },
      { date: "2024-09", propertyA: 58000, propertyB: 45000, propertyC: 63000 },
    ];

    const sections: ReportSection[] = [
      {
        title: 'Executive Summary (Key Performance Indicators)',
        type: 'table',
        columns: ['Metric', 'Current Value', 'Growth', 'Health Status'],
        data: statsCards.map(s => [
          s.label,
          String(s.value).replace('₱', 'PHP'),
          '+15.2%',
          'Improving'
        ])
      },
      {
        title: 'Revenue & Bookings Overview (Last 3 Months History)',
        type: 'table',
        columns: ['Date', 'Daily Revenue (PHP)', 'Bookings'],
        data: data90d.map(d => [formatDaily(d.date), `${d.revenue.toLocaleString()}`, d.bookings.toString()])
      },
      {
        title: 'Revenue & Bookings Overview (Last 30 Days Detailed)',
        type: 'table',
        columns: ['Date', 'Daily Revenue (PHP)', 'Bookings'],
        data: data30d.map(d => [formatDaily(d.date), `${d.revenue.toLocaleString()}`, d.bookings.toString()])
      },
      {
        title: 'Revenue & Bookings Overview (Last 7 Days Detailed)',
        type: 'table',
        columns: ['Date', 'Daily Revenue (PHP)', 'Bookings'],
        data: data7d.map(d => [formatDaily(d.date), `${d.revenue.toLocaleString()}`, d.bookings.toString()])
      },
      {
        title: 'Growth Trend Analysis (Volume & Revenue Growth)',
        type: 'table',
        columns: ['Month', 'Booking Volume', 'Revenue Growth (PHP)'],
        data: lineChartData.map(d => [formatMonthly(d.date), d.bookings.toString(), `${d.revenue.toLocaleString()}`])
      },
      {
        title: 'Portfolio Allocation (Unit Count & Revenue Share)',
        type: 'table',
        columns: ['Property Type', 'Unit Count', 'Revenue Share (PHP)'],
        data: pieChartData.map(d => [d.type, d.count.toString(), `${d.revenue.toLocaleString()}`])
      },
      {
        title: 'Factor Performance Area (Quality Distribution)',
        type: 'table',
        columns: ['Quality Factor', 'Global Score (%)', 'Property A (Luxury) (%)', 'Property B (Studio) (%)'],
        data: radarChartData.map(d => [d.metric, `${d.value}%`, `${d.value + 2}%`, `${d.value - 5}%`])
      },
      {
        title: 'Public Sentiments (Guest Ratings Breakdown)',
        type: 'table',
        columns: ['Rating Category', 'Volume (Global)', 'Property A (Luxury)', 'Property B (Studio)'],
        data: radialChartData.map(d => [d.rating, d.value.toString(), (d.value * 0.6).toFixed(0), (d.value * 0.4).toFixed(0)])
      },
      {
        title: 'Lead Origin Analysis (Channel Breakdown)',
        type: 'table',
        columns: ['Month', 'Direct Traffic', 'Email Marketing', 'Social Presence'],
        data: leadOriginData.map(d => [formatMonthly(d.date), d.direct.toString(), d.email.toString(), d.social.toString()])
      },
      {
        title: 'Monthly Revenue by Property (Unit Breakdown)',
        type: 'table',
        columns: ['Month', 'Property A (Deluxe PHP)', 'Property B (Standard PHP)', 'Property C (Suites PHP)'],
        data: barChartData.map(d => [formatMonthly(d.date), `${d.propertyA.toLocaleString()}`, `${d.propertyB.toLocaleString()}`, `${d.propertyC.toLocaleString()}`])
      },
      {
        title: 'Top Revenue Contributors',
        type: 'table',
        columns: ['Property Name', 'Revenue (PHP)', 'Inquiries', 'Bookings'],
        data: propertyPerformanceData.map(p => [
          p.name,
          p.revenue.toLocaleString(),
          p.inquiries.toString(),
          p.bookings.toString()
        ])
      },
      {
        title: 'Aggregate Booking Statistics',
        type: 'table',
        columns: ['Statistic Label', 'Value'],
        data: [
          ['Total Confirmed Bookings', `${stats.confirmedBookings} units`],
          ['Gross Analytics Revenue', `PHP ${stats.monthlyRevenue.toLocaleString()}`],
          ['Average Daily Rate', 'PHP 4,500'],
          ['Portfolio Occupancy', `${occupancy.occupancyRate.toFixed(1)}%`]
        ]
      }
    ];

    await generateMultiSectionPDF(
      'Landlord_Analytics_Full_Report',
      sections,
      {
        title: 'Professional Analytics & Performance Report',
        subtitle: `Complete Business Intelligence Overview (${timePeriod.toUpperCase()} Focus)`,
        author: 'System Generated'
      }
    );
  };

  return (
    <div className="space-y-4 pb-12">
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
          <div className="w-auto">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 hover:border-primary/30 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors[stat.color]} group-hover:scale-105 transition-transform duration-300 shadow-md`}>
                  <Icon size={14} strokeWidth={2.5} />
                </div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  {stat.label}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                  {stat.value}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                    +15.2%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Chart: Revenue & Bookings */}
      <div className="bg-white dark:bg-gray-950 p-2 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
        <ChartAreaInteractive />
      </div>

      {/* Grid of Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartLineInteractive />
        </div>
        <div className="bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartPieLabel />
        </div>
        <div className="bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartRadarDots />
        </div>
        <div className="bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartRadialLabel />
        </div>
        <div className="bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartTooltipDefault />
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartBarInteractive />
        </div>
      </div>

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

'use client';

import { useState } from 'react';
import { generateMultiSectionPDF, ReportSection } from '@/utils/pdfGenerator';

export interface AnalyticsStats {
  totalProperties: number;
  activeListings: number;
  pendingInquiries: number;
  confirmedBookings: number;
  averageRating: number;
  totalReviews: number;
  monthlyRevenue: number;
}

export function useAnalyticsLogic(stats: AnalyticsStats, occupancy: any) {
  const [timePeriod, setTimePeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const propertyPerformanceData = [
    { name: 'Property A', inquiries: 15, bookings: 8, revenue: 24000 },
    { name: 'Property B', inquiries: 10, bookings: 5, revenue: 15000 },
    { name: 'Property C', inquiries: 20, bookings: 12, revenue: 36000 },
    { name: 'Property D', inquiries: 8, bookings: 4, revenue: 12000 },
  ];

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
        data: [
          ['Total Properties', stats.totalProperties.toString(), '+5.2%', 'Stable'],
          ['Active Listings', stats.activeListings.toString(), '+2.1%', 'Healthy'],
          ['Confirmed Bookings', stats.confirmedBookings.toString(), '+12.4%', 'Improving'],
          ['Average Rating', stats.averageRating.toFixed(1), '+3.1%', 'Stable'],
          ['Total Reviews', stats.totalReviews.toString(), '+8.7%', 'Healthy'],
          ['Monthly Revenue', `PHP ${stats.monthlyRevenue.toLocaleString()}`, '+15.2%', 'Improving'],
          ['Occupancy Rate', `${occupancy.occupancyRate.toFixed(1)}%`, '+4.5%', 'Improving']
        ]
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

    await generateMultiSectionPDF('Landlord_Analytics_Full_Report', sections, {
      title: 'Professional Analytics & Performance Report',
      subtitle: `Complete Business Intelligence Overview (${timePeriod.toUpperCase()} Focus)`,
      author: 'System Generated'
    });
  };

  return {
    timePeriod,
    setTimePeriod,
    propertyPerformanceData,
    handleGenerateReport
  };
}
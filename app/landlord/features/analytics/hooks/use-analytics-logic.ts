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
    const formatDaily = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    };

    const formatMonthly = (dateStr: string) => {
      const date = new Date(dateStr.length === 7 ? dateStr + "-01" : dateStr);
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    };

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

    const sections: ReportSection[] = [
      {
        title: 'Executive Summary (Key Performance Indicators)',
        type: 'table',
        columns: ['Metric', 'Current Value', 'Growth', 'Health Status'],
        data: [
          ['Total Properties', stats.totalProperties.toString(), '+5.2%', 'Stable'],
          ['Active Listings', stats.activeListings.toString(), '+2.1%', 'Healthy'],
          ['Confirmed Bookings', stats.confirmedBookings.toString(), '+12.4%', 'Improving'],
          ['Monthly Revenue', `PHP ${stats.monthlyRevenue.toLocaleString()}`, '+15.2%', 'Improving']
        ]
      },
      {
        title: 'Revenue & Bookings Overview (Last 30 Days)',
        type: 'table',
        columns: ['Date', 'Daily Revenue (PHP)', 'Bookings'],
        data: areaChartData.map(d => [formatDaily(d.date), `${d.revenue.toLocaleString()}`, d.bookings.toString()])
      },
      {
        title: 'Property Analysis (Lead-to-Booking)',
        type: 'table',
        columns: ['Property Name', 'Revenue (PHP)', 'Inquiries', 'Bookings'],
        data: propertyPerformanceData.map(p => [p.name, p.revenue.toLocaleString(), p.inquiries.toString(), p.bookings.toString()])
      }
    ];

    await generateMultiSectionPDF('Analytics_Full_Report', sections, {
      title: 'Landlord Analytics & Performance Report',
      subtitle: `Complete Business Intelligence Overview (${timePeriod.toUpperCase()})`,
      author: 'BoardTAU BI System'
    });
  };

  return {
    timePeriod,
    setTimePeriod,
    propertyPerformanceData,
    handleGenerateReport
  };
}

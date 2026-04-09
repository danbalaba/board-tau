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

interface ChartData {
  dailyRevenue: Array<{ date: string; revenue: number; bookings: number }>;
  monthlyRevenue: Array<{ date: string; [key: string]: any }>;
  monthlyRevenueListings: Array<{ id: string; title: string }>;
  monthlyRevenueMap: Record<string, string>;
  growthTrend: Array<{ date: string; bookings: number; revenue: number }>;
  propertyTypes: Array<{ type: string; count: number; revenue: number }>;
  ratings: Array<{ rating: string; value: number; percentage: number }>;
  propertyPerformance: Array<{ name: string; inquiries: number; bookings: number; revenue: number }>;
}

export function useAnalyticsLogic(stats: AnalyticsStats, occupancy: any, chartData?: ChartData) {
  const [timePeriod, setTimePeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const propertyPerformanceData = chartData?.propertyPerformance || [];

  const handleGenerateReport = async () => {
    if (!chartData) return;

    const formatDaily = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    };

    const formatMonthly = (dateStr: string) => {
      const date = new Date(dateStr.length === 7 ? dateStr + "-01" : dateStr);
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    };

    const areaChartData = chartData.dailyRevenue;
    const latestDate = areaChartData.length > 0 
      ? new Date(Math.max(...areaChartData.map(item => new Date(item.date).getTime())))
      : new Date();
    
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
    const lineChartData = chartData.growthTrend;
    const pieChartData = chartData.propertyTypes;

    const radarChartData = [
      { metric: "Location", value: 85 },
      { metric: "Value", value: 90 },
      { metric: "Cleanliness", value: 75 },
      { metric: "Amenities", value: 80 },
      { metric: "Communication", value: 95 },
      { metric: "Accuracy", value: 88 },
    ];

    const radialChartData = chartData.ratings.map(r => ({
      rating: r.rating,
      value: r.value,
    }));

    const barChartData = chartData.monthlyRevenue.map(m => {
      const obj: Record<string, any> = { date: m.date };
      chartData.monthlyRevenueListings.forEach(l => {
        obj[l.id] = m[l.id] || 0;
      });
      return obj;
    });

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
        title: 'Monthly Revenue by Property (Unit Breakdown)',
        type: 'table',
        columns: ['Month', ...chartData.monthlyRevenueListings.map(l => `${l.title} (PHP)`)],
        data: barChartData.map(d => [
          formatMonthly(d.date),
          ...chartData.monthlyRevenueListings.map(l => `${(d[l.id] || 0).toLocaleString()}`)
        ])
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
'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateMultiSectionPDF, ReportSection } from '@/utils/pdfGenerator';
import {
  getLandlordPropertyList,
  getLandlordComprehensiveAnalytics,
  LandlordPropertyOption,
  ComprehensiveAnalyticsResult,
  RoomOccupancyDetail,
  PropertyLeaderboardItem,
} from '@/services/landlord/analytics';

export function useAnalyticsLogic() {
  const [propertyList, setPropertyList] = useState<LandlordPropertyOption[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [timePeriod, setTimePeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [analyticsData, setAnalyticsData] = useState<ComprehensiveAnalyticsResult | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // 1. Initial Load: Fetch Property List for the Dropdown
  useEffect(() => {
    let isMounted = true;
    async function fetchProperties() {
      try {
        const list = await getLandlordPropertyList();
        if (isMounted) {
          setPropertyList(list);
        }
      } catch (err) {
        console.error('Error fetching landlord property list:', err);
      }
    }
    fetchProperties();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Comprehensive Analytics when propertyId or timePeriod changes
  const fetchAnalytics = useCallback(async (isInitial = false) => {
    try {
      setIsLoading(true);
      if (isInitial) {
        setIsInitialLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const data = await getLandlordComprehensiveAnalytics(selectedPropertyId, timePeriod);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching comprehensive landlord analytics:', err);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedPropertyId, timePeriod]);

  useEffect(() => {
    fetchAnalytics(analyticsData === null);
  }, [fetchAnalytics]);

  // Convenience accessors
  const stats = analyticsData?.stats || null;
  const roomDetails: RoomOccupancyDetail[] = analyticsData?.roomDetails || [];
  const propertyLeaderboard: PropertyLeaderboardItem[] = analyticsData?.propertyLeaderboard || [];
  const scope = analyticsData?.scope || {
    propertyId: 'all',
    propertyName: 'All Properties Portfolio',
    period: timePeriod,
    isSingleProperty: false,
  };

  const chartData = analyticsData
    ? {
        dailyRevenue: analyticsData.dailyRevenue,
        monthlyRevenue: analyticsData.monthlyRevenueByProperty.monthlyData,
        monthlyRevenueListings: analyticsData.monthlyRevenueByProperty.listings,
        monthlyRevenueMap: analyticsData.monthlyRevenueByProperty.listingMap,
        growthTrend: analyticsData.growthTrend,
        propertyTypes: analyticsData.propertyTypes,
        ratings: analyticsData.ratingsDistribution,
      }
    : null;

  // 3. High-Quality PDF Report Generation
  const handleGenerateReport = async () => {
    if (!analyticsData || !stats) return;

    const formatDaily = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatMonthly = (dateStr: string) => {
      const date = new Date(dateStr.length === 7 ? dateStr + '-01' : dateStr);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const sections: ReportSection[] = [
      {
        title: `Executive Performance Summary (${scope.propertyName})`,
        type: 'table',
        columns: ['Key Metric', 'Performance Value', 'Scope', 'Operational Status'],
        data: [
          ['Total Revenue', `PHP ${stats.totalRevenue.toLocaleString()}`, scope.propertyName, 'Audited & Paid'],
          ['Confirmed Leases', `${stats.confirmedBookings} active bookings`, scope.propertyName, 'Active / Completed'],
          ['Portfolio Occupancy', `${stats.occupancyRate}% (${stats.occupiedSlots}/${stats.totalCapacity} beds)`, scope.propertyName, stats.occupancyRate >= 70 ? 'High Demand' : 'Available Slots'],
          ['Booking Success Rate', `${stats.bookingSuccessRate ?? stats.inquiryConversionRate}% (${stats.confirmedBookings} of ${stats.totalBookingRequests ?? stats.confirmedBookings} requests)`, scope.propertyName, (stats.bookingSuccessRate ?? stats.inquiryConversionRate) >= 80 ? 'High Acceptance' : 'Standard'],
          ['Average Tenant Rating', `${stats.averageRating > 0 ? `${stats.averageRating.toFixed(1)} ★` : 'N/A'} (${stats.totalReviews} reviews)`, scope.propertyName, stats.averageRating >= 4.5 ? 'Top Rated' : 'Verified'],
          ['Expiring Leases (30d)', `${stats.expiringLeases} leases nearing turnover`, scope.propertyName, stats.expiringLeases > 0 ? 'Turnover Soon' : 'Stable'],
        ],
      },
    ];

    // If single property selected, include room breakdown
    if (scope.isSingleProperty && roomDetails.length > 0) {
      sections.push({
        title: `Room & Bedspace Inventory Health (${scope.propertyName})`,
        type: 'table',
        columns: ['Room Name', 'Monthly Rate (PHP)', 'Capacity', 'Occupied Slots', 'Available Beds', 'Status'],
        data: roomDetails.map((r) => [
          r.name,
          r.price.toLocaleString(),
          `${r.capacity} beds`,
          `${r.occupiedSlots} beds`,
          `${r.availableSlots} beds`,
          r.isFull ? 'FULL' : r.hasExpiringLease ? 'EXPIRING SOON' : 'AVAILABLE',
        ]),
      });
    }

    // Property Leaderboard (if portfolio view)
    if (!scope.isSingleProperty && propertyLeaderboard.length > 0) {
      sections.push({
        title: 'Listing Performance Leaderboard',
        type: 'table',
        columns: ['Property Listing', 'Type', 'Capacity', 'Occupancy', 'Revenue (PHP)', 'Bookings', 'Rating'],
        data: propertyLeaderboard.map((p) => [
          p.title,
          p.propertyType,
          `${p.totalCapacity} beds`,
          `${p.occupancyRate}%`,
          p.monthlyRevenue.toLocaleString(),
          `${p.totalBookings} booked`,
          `${p.averageRating} ★ (${p.totalReviews})`,
        ]),
      });
    }

    // Daily Revenue Records
    if (analyticsData.dailyRevenue.length > 0) {
      sections.push({
        title: `Daily Revenue Breakdown (Past ${scope.period === 'year' ? '365' : scope.period === 'quarter' ? '90' : '30'} Days)`,
        type: 'table',
        columns: ['Date', 'Revenue (PHP)', 'Bookings Count'],
        data: analyticsData.dailyRevenue
          .filter((d) => d.revenue > 0 || d.bookings > 0)
          .map((d) => [formatDaily(d.date), d.revenue.toLocaleString(), d.bookings.toString()]),
      });
    }

    // 6-Month Growth Funnel
    if (analyticsData.growthTrend.length > 0) {
      sections.push({
        title: '6-Month Inquiries vs. Bookings Funnel',
        type: 'table',
        columns: ['Month', 'Tenant Inquiries', 'Confirmed Bookings', 'Gross Earnings (PHP)'],
        data: analyticsData.growthTrend.map((g) => [
          formatMonthly(g.date),
          g.inquiries.toString(),
          g.bookings.toString(),
          g.revenue.toLocaleString(),
        ]),
      });
    }

    // Tenant Rating Distribution
    if (analyticsData.ratingsDistribution.length > 0) {
      sections.push({
        title: 'Tenant Rating Sentiment Distribution',
        type: 'table',
        columns: ['Star Category', 'Total Reviews', 'Percentage of Reviews'],
        data: analyticsData.ratingsDistribution.map((r) => [
          r.rating,
          r.value.toString(),
          `${r.percentage}%`,
        ]),
      });
    }

    await generateMultiSectionPDF(
      `BoardTAU_Analytics_${scope.propertyName.replace(/\s+/g, '_')}_${scope.period}`,
      sections,
      {
        title: `BoardTAU Landlord Analytics & Performance Report`,
        subtitle: `${scope.propertyName} • Focus: ${scope.period.toUpperCase()} • Generated: ${new Date().toLocaleDateString('en-US')}`,
        author: 'BoardTAU Host Intelligence',
      }
    );
  };

  return {
    propertyList,
    selectedPropertyId,
    setSelectedPropertyId,
    timePeriod,
    setTimePeriod,
    analyticsData,
    stats,
    roomDetails,
    propertyLeaderboard,
    chartData,
    scope,
    isInitialLoading,
    isLoading,
    isRefreshing,
    handleGenerateReport,
  };
}

export default useAnalyticsLogic;
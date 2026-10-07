'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { generateTablePDF } from '@/utils/pdfGenerator';
import { formatDynamicCodeLabel } from '@/utils/export-utils';
import { DateRange } from 'react-day-picker';
import { useSession } from 'next-auth/react';
import { pusherClient } from '@/lib/pusher-client';

export interface Booking {
  id: string;
  listing: {
    id: string;
    title: string;
    imageSrc: string;
    images?: Array<{ url: string }>;
  };
  room?: {
    id: string;
    name: string;
    price: number;
    images?: Array<{ url: string }>;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  };
  isWalkIn?: boolean;
  guestName?: string | null;
  guestContact?: string | null;
  guestPhotoUrl?: string | null;
  guestIdUrl?: string | null;
  occupantsCount?: number;
  status: string;
  paymentStatus: string;
  totalPrice: number;
  startDate: Date | string;
  endDate: Date | string;
  isArchived: boolean;
  createdAt: Date | string;
}

export function useBookingLogic(initialBookings: Booking[], initialCursor: string | null) {
  const router = useRouter();
  const { success, error: toastError } = useResponsiveToast();
  const [listings, setListings] = useState(initialBookings);
  const [nextCursor, setNextCursor] = useState(initialCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isArchived, setIsArchived] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [completeLoaderBooking, setCompleteLoaderBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter loader state
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const isFirstRender = useRef(true);

  // Trigger loader animation when filters change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIsFilterLoading(true);
    const timer = setTimeout(() => {
      setIsFilterLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedStatus, selectedPaymentStatus, sortBy, isArchived]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedPaymentStatus, sortBy, isArchived]);

  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  // Real-time Pusher listener for landlord active stay bookings
  useEffect(() => {
    if (!userId) return;

    const channelName = `private-user-${userId}`;
    const channel = pusherClient.subscribe(channelName);

    const handleReservationUpdated = (data: any) => {
      if (!data || !data.entityId) return;

      setListings((prev) => {
        const index = prev.findIndex((b) => b.id === data.entityId);
        if (index === -1) {
          if (data.payload && data.payload.id) {
            return [data.payload, ...prev];
          }
          return prev;
        }

        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          status: data.status || updated[index].status,
          paymentStatus: data.payload?.paymentStatus || updated[index].paymentStatus,
          ...(data.payload || {}),
        };
        return updated;
      });
    };

    channel.bind("reservation-updated", handleReservationUpdated);

    return () => {
      channel.unbind("reservation-updated", handleReservationUpdated);
    };
  }, [userId]);

  useEffect(() => {
    setListings(initialBookings);
    setNextCursor(initialCursor);
  }, [initialBookings, initialCursor]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const filteredBookings = useMemo(() => {
    // For bookings page, we only show: CHECKED_IN, COMPLETED
    const stayStatuses = ['checked_in', 'completed'];
    let result = listings.filter(booking => {
      const isStayStatus = stayStatuses.includes(booking.status?.toLowerCase());
      if (!isStayStatus) return false;

      const statusMatch = selectedStatus === 'all' || booking.status?.toLowerCase() === selectedStatus.toLowerCase();
      const paymentMatch = selectedPaymentStatus === 'all' || booking.paymentStatus?.toLowerCase() === selectedPaymentStatus.toLowerCase();
      
      let searchMatch = true;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        searchMatch = 
          booking.listing.title.toLowerCase().includes(q) || 
          ((booking.user?.name || booking.guestName)?.toLowerCase() || '').includes(q) || 
        ((booking.user?.email || booking.guestContact) || '').toLowerCase().includes(q);
      }

      return statusMatch && paymentMatch && searchMatch;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'price_asc':
          return a.totalPrice - b.totalPrice;
        case 'price_desc':
          return b.totalPrice - a.totalPrice;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [selectedStatus, selectedPaymentStatus, listings, sortBy, searchQuery]);

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBookings, currentPage, itemsPerPage]);

  const handleUpdateStatus = useCallback(async (bookingId: string, status: string) => {
    const targetBooking = listings.find(b => b.id === bookingId);
    if (status === 'COMPLETED' && targetBooking) {
      setCompleteLoaderBooking(targetBooking);
    }

    setUpdatingId(bookingId);
    if (process.env.NODE_ENV !== 'test') {
      console.log(`🔄 Updating booking ${bookingId} to status: ${status}`);
    }
    try {
      const response = await fetch(`/api/landlord/bookings?id=${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setListings(prev => prev.map(booking => 
          booking.id === bookingId ? { ...booking, status } : booking
        ));
        success(`Booking status updated to ${status.toLowerCase()} successfully.`);
        router.refresh();
      } else {
        const data = await response.json();
        toastError(data.error || 'Failed to update status');
      }
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      toastError(error.message || 'Error updating status');
      throw error;
    } finally {
      setUpdatingId(null);
    }
  }, [listings, router, success, toastError]);

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/landlord/bookings?cursor=${nextCursor}`);
      const data = await response.json();

      if (data.success && data.data) {
        setListings(prev => [...prev, ...data.data.bookings]);
        setNextCursor(data.data.nextCursor);
      }
    } catch (error) {
      console.error('Error loading more bookings:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore]);

  const handleGenerateReport = async (options?: { scope?: 'filtered' | 'all'; format?: string; includeSummary?: boolean; includeGlossary?: boolean; dateRange?: DateRange } | DateRange) => {
    try {
      const isParamDateRange = options && ('from' in options || 'to' in options);
      const dateRange = isParamDateRange ? (options as DateRange) : (options as any)?.dateRange;
      const exportScope = !isParamDateRange && (options as any)?.scope ? (options as any).scope : 'filtered';
      const includeSummary = !isParamDateRange && (options as any)?.includeSummary !== undefined ? (options as any).includeSummary : true;
      const includeGlossary = !isParamDateRange && (options as any)?.includeGlossary !== undefined ? (options as any).includeGlossary : true;

      let exportData = exportScope === 'all' ? listings : filteredBookings;

      if (dateRange?.from) {
        const fromDate = dateRange.from;
        const toDate = dateRange.to;
        exportData = exportData.filter((b: any) => {
          const createdAt = new Date(b.createdAt);
          if (toDate) {
            return createdAt >= fromDate && createdAt <= toDate;
          }
          return createdAt >= fromDate;
        });
      }

      const totalBookings = exportData.length;
      const totalRevenue = exportData.reduce((acc: number, b: any) => acc + (b.reservationFee || b.totalPrice || b.amount || b.room?.reservationFee || 0), 0);
      const activeStays = exportData.filter((b: any) => (b.status || '').toLowerCase() === 'checked_in').length;
      const completedStays = exportData.filter((b: any) => (b.status || '').toLowerCase() === 'completed').length;
      const cancelledStays = exportData.filter((b: any) => (b.status || '').toLowerCase() === 'cancelled').length;

      const distributionData = [
        { label: 'Checked-In (Active)', count: activeStays, percentage: totalBookings ? (activeStays / totalBookings) * 100 : 0, color: [47, 125, 109] as [number, number, number] },
        { label: 'Completed Stays', count: completedStays, percentage: totalBookings ? (completedStays / totalBookings) * 100 : 0, color: [37, 99, 235] as [number, number, number] },
        { label: 'Cancelled / Other', count: cancelledStays, percentage: totalBookings ? (cancelledStays / totalBookings) * 100 : 0, color: [220, 38, 38] as [number, number, number] }
      ];

      // Payment Status Category Breakdown for Horizontal Bar Chart Graph
      const payCounts: Record<string, number> = {};
      exportData.forEach((b: any) => {
        const payStatus = b.paymentStatus ? b.paymentStatus.toUpperCase() : 'PAID';
        payCounts[payStatus] = (payCounts[payStatus] || 0) + 1;
      });

      const categoryData = Object.entries(payCounts)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);

      // Monthly Revenue & Stay Creation Trajectory
      const monthCounts: Record<string, number> = {};
      exportData.forEach((b: any) => {
        const date = new Date(b.createdAt || b.startDate || Date.now());
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
        monthCounts[monthLabel] = (monthCounts[monthLabel] || 0) + 1;
      });
      const trendData = Object.entries(monthCounts).map(([label, value]) => ({ label, value }));

      const summaryData = [
        { label: 'Total Holding Fees', value: `PHP ${totalRevenue.toLocaleString()}`, subValue: 'Online reservation fees collected' },
        { label: 'Total Bookings', value: `${totalBookings} Stays`, subValue: `${activeStays} Active | ${completedStays} Completed` },
        { label: 'Active Guests', value: `${activeStays} Guests`, subValue: 'Currently checked in' },
        { label: 'Avg Holding Fee', value: `PHP ${Math.round(totalBookings ? totalRevenue / totalBookings : 0).toLocaleString()}`, subValue: 'Average reservation fee per booking' }
      ];

      const columns = ['Listing', 'Room Unit', 'Guest Name', 'Status', 'Payment', 'Reservation Fee (PHP)', 'Stay Dates'];
      const data = exportData.map((b: any) => [
        b.listing?.title || b.propertyTitle || 'N/A',
        b.room?.name || b.room?.title || b.roomTitle || 'Standard Unit',
        (b.user?.name || b.guestName || b.user?.email || 'N/A'),
        formatDynamicCodeLabel(b.status, 'Confirmed'),
        formatDynamicCodeLabel(b.paymentStatus || b.status, 'Paid'),
        `PHP ${(b.reservationFee || b.totalPrice || b.amount || b.room?.reservationFee || 0).toLocaleString()}`,
        `${new Date(b.startDate).toLocaleDateString()} - ${new Date(b.endDate).toLocaleDateString()}`
      ]);

      const totalsRow = [
        'TOTALS',
        `${totalBookings} Stays`,
        `${activeStays} Active`,
        'Payment Verified',
        'Holding Fees Paid',
        `PHP ${totalRevenue.toLocaleString()}`,
        new Date().toLocaleDateString()
      ];

      const glossaryItems = [
        { term: 'Total Booking Count', definition: 'Count of confirmed tenant stay agreements recorded in the system.' },
        { term: 'Active Tenant Stays', definition: 'Count of tenants currently checked in and residing in the property.' },
        { term: 'Reservation Holding Fee', definition: 'Advance fee collected online via Stripe/PayMongo to lock and reserve the room slot before move-in.' },
        { term: 'Booking Status', definition: 'Current lease contract status — Active (checked-in), Pending Payment, Completed (moved out), or Cancelled.' },
        { term: 'Payment Settlement', definition: 'Transaction verification state — Paid (verified reservation fee), Pending Verification, or Unpaid.' }
      ];

      const subtitle = exportScope === 'all'
        ? `All-Time Booking Record for ${totalBookings} bookings (PHP ${totalRevenue.toLocaleString()} Total Holding Fees)`
        : `Filtered Booking Report for ${totalBookings} stay records`;

      const authorName = session?.user?.name || session?.user?.email || 'BoardTAU Landlord Portal';

      await generateTablePDF('Booking_Financial_Report', columns, data, {
        title: 'Booking & Reservation Summary Report',
        subtitle: subtitle,
        author: authorName,
        summaryData: summaryData,
        distributionData: distributionData,
        categoryData: categoryData,
        trendData: trendData,
        statusChartTitle: 'Booking Status',
        categoryChartTitle: 'Payment Breakdown',
        trendChartTitle: 'Monthly Stay Activity',
        glossaryItems: glossaryItems,
        totalsRow: totalsRow,
        scopeTag: exportScope === 'all' ? 'Complete History' : 'Filtered View',
        type: 'booking',
        includeSummary: includeSummary,
        includeGlossary: includeGlossary
      });
      
      success(`Generated booking report for ${totalBookings} bookings`);
    } catch (error) {
      console.error('Failed to generate report:', error);
      toastError('Failed to generate complete report');
    }
  };

  const handleToggleArchivedView = useCallback(async () => {
    const newArchivedState = !isArchived;
    setIsArchived(newArchivedState);
    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/landlord/bookings?isArchived=${newArchivedState}`);
      const data = await response.json();
      if (data.success && data.data && data.data.bookings) {
        setListings(data.data.bookings);
        setNextCursor(data.data.nextCursor);
      }
    } catch (error) {
      toastError('Failed to fetch bookings');
    } finally {
      setIsLoadingMore(false);
    }
  }, [isArchived]);

  const handleToggleArchiveRecord = useCallback(async (id: string, currentArchived: boolean) => {
    try {
      const response = await fetch(`/api/landlord/bookings?id=${id}`, {
        method: 'PATCH',
      });
      if (response.ok) {
        setListings(prev => prev.filter(b => b.id !== id));
        success({ title: 'SUCCESS', description: `Booking ${currentArchived ? 'unarchived' : 'archived'} successfully.` });
      } else {
        toastError({ title: 'ERROR', description: 'Failed to update archive status.' });
      }
    } catch (error) {
      toastError({ title: 'ERROR', description: 'An unexpected error occurred.' });
    }
  }, [router]);

  return {
    listings,
    nextCursor,
    isLoadingMore,
    selectedStatus,
    setSelectedStatus,
    selectedPaymentStatus,
    setSelectedPaymentStatus,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    filteredBookings: paginatedBookings,
    allFilteredBookings: filteredBookings,
    totalBookings: filteredBookings.length,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    searchQuery,
    setSearchQuery,
    rawBookings: listings,
    isArchived,
    handleToggleArchivedView,
    handleToggleArchiveRecord,
    handleUpdateStatus,
    handleLoadMore,
    handleGenerateReport,
    updatingId,
    completeLoaderBooking,
    setCompleteLoaderBooking,
    isHeaderLoading: isLoading,
    isSyncing: isFilterLoading || isLoadingMore,
    isLoading: isLoading || isFilterLoading
  };
}

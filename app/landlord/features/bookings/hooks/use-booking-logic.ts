'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { generateTablePDF } from '@/utils/pdfGenerator';

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
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setListings(initialBookings);
    setNextCursor(initialCursor);
  }, [initialBookings, initialCursor]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 700);
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
          (booking.user.name?.toLowerCase() || '').includes(q) || 
          booking.user.email.toLowerCase().includes(q);
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
  }, [selectedStatus, selectedPaymentStatus, listings, sortBy]);

  const handleUpdateStatus = useCallback(async (bookingId: string, status: string) => {
    setIsUpdatingStatus(true);
    console.log(`🔄 Updating booking ${bookingId} to status: ${status}`);
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
      setIsUpdatingStatus(false);
    }
  }, [router]);

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

  const handleGenerateReport = async () => {
    try {
      const totalRevenue = filteredBookings.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
      const totalBookings = filteredBookings.length;
      const activeStays = filteredBookings.filter(b => b.status?.toLowerCase() === 'checked_in').length;

      const summaryData = [
        { 
          label: 'Total Revenue', 
          value: `PHP ${totalRevenue.toLocaleString()}`,
          subValue: 'Confirmed bookings'
        },
        { 
          label: 'Booking Volume', 
          value: `${totalBookings} Total`,
          subValue: 'Historical record'
        },
        { 
          label: 'Operational Status', 
          value: `${activeStays} Checked-In`,
          subValue: 'Current active stays'
        }
      ];

      const columns = ['Listing', 'Guest', 'Status', 'Payment', 'Total Price', 'Dates'];
      const data = filteredBookings.map((b: any) => [
        b.listing.title,
        b.user.name || b.user.email,
        b.status.toUpperCase(),
        b.paymentStatus.toUpperCase(),
        `PHP ${b.totalPrice.toLocaleString()}`,
        `${new Date(b.startDate).toLocaleDateString()} - ${new Date(b.endDate).toLocaleDateString()}`
      ]);

      await generateTablePDF('Bookings_Report', columns, data, {
        title: 'Booking & Revenue Business Report',
        subtitle: `Financial auditing for ${totalBookings} stay records`,
        author: 'Landlord Revenue Management',
        summaryData: summaryData
      });
      
      success(`Generated enterprise report for ${totalBookings} bookings`);
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
    filteredBookings,
    searchQuery,
    setSearchQuery,
    rawBookings: listings,
    isArchived,
    handleToggleArchivedView,
    handleToggleArchiveRecord,
    handleUpdateStatus,
    handleLoadMore,
    handleGenerateReport,
    isUpdatingStatus,
    isLoading
  };
}

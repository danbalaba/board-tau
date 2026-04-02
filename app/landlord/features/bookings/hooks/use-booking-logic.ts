'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { generateTablePDF } from '@/utils/pdfGenerator';

export interface Booking {
  id: string;
  listing: {
    id: string;
    title: string;
    imageSrc: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  status: string;
  paymentStatus: string;
  totalPrice: number;
  startDate: Date | string;
  endDate: Date | string;
  createdAt: Date | string;
}

export function useBookingLogic(initialBookings: Booking[], initialCursor: string | null) {
  const router = useRouter();
  const [listings, setListings] = useState(initialBookings);
  const [nextCursor, setNextCursor] = useState(initialCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookings = useMemo(() => {
    let result = listings.filter(booking => {
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

  const handleUpdateStatus = useCallback(async (bookingId: string, status: 'pending' | 'confirmed' | 'cancelled') => {
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
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
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
    const columns = ['Listing', 'Guest', 'Status', 'Payment', 'Total Price', 'Dates'];
    const data = filteredBookings.map((b: any) => [
      b.listing.title,
      b.user.name || b.user.email,
      b.status.toUpperCase(),
      b.paymentStatus.toUpperCase(),
      `PHP ${b.totalPrice.toLocaleString()}`,
      `${new Date(b.startDate).toLocaleDateString()} - ${new Date(b.endDate).toLocaleDateString()}`
    ]);

    await generateTablePDF(
      'Bookings_Report',
      columns,
      data,
      {
        title: 'Property Bookings Report',
        subtitle: `Overview of all ${filteredBookings.length} bookings matching current filters`,
        author: 'Landlord Dashboard'
      }
    );
  };

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
    handleUpdateStatus,
    handleLoadMore,
    handleGenerateReport
  };
}

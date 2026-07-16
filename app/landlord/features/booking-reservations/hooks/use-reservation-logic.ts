'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { generateTablePDF } from '@/utils/pdfGenerator';
import { useQueryClient } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';

export interface ReservationRequest {
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
  paymentStatus?: string;
  moveInDate: Date;
  stayDuration: number;
  isArchived: boolean;
  createdAt: Date;
}

export function useReservationLogic(initialReservations: ReservationRequest[]) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useResponsiveToast();
  
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isArchived, setIsArchived] = useState(false);
  const [reservations, setReservations] = useState(initialReservations);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  // Sync with incoming server data changes (e.g., after router.refresh())
  useEffect(() => {
    setReservations(initialReservations);
  }, [initialReservations]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, sortBy, isArchived]);

  const filteredReservations = useMemo(() => {
    // For reservations page, we only show: PENDING_PAYMENT, RESERVED, CANCELLED
    const preStayStatuses = ['pending_payment', 'reserved', 'confirmed', 'cancelled', 'checked_in'];
    let result = reservations.filter(r => 
      preStayStatuses.includes(r.status.toLowerCase())
    );
    
    if (selectedStatus !== 'all') {
      result = result.filter(r => r.status?.toLowerCase() === selectedStatus.toLowerCase());
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.listing.title.toLowerCase().includes(q) || 
        ((r.user?.name || r.guestName)?.toLowerCase() || '').includes(q) || 
        ((r.user?.email || r.guestContact) || '').toLowerCase().includes(q)
      );
    }
    
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortBy === 'oldest' ? timeA - timeB : timeB - timeA;
    });

    return result;
  }, [selectedStatus, reservations, sortBy, searchQuery]);

  const paginatedReservations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReservations.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReservations, currentPage, itemsPerPage]);

  const handleToggleArchivedView = useCallback(async () => {
    const newArchivedState = !isArchived;
    setIsArchived(newArchivedState);
    try {
      const response = await fetch(`/api/landlord/bookings?isArchived=${newArchivedState}`);
      const data = await response.json();
      if (data.success && data.data && data.data.bookings) {
        setReservations(data.data.bookings);
      }
    } catch (error) {
      toastError("Failed to fetch reservations.");
    }
  }, [isArchived, toastError]);

  const handleToggleArchiveRecord = useCallback(async (id: string, currentArchived: boolean) => {
    try {
      const response = await fetch(`/api/landlord/bookings?id=${id}`, {
        method: 'PATCH',
      });
      if (response.ok) {
        setReservations(prev => prev.filter(r => r.id !== id));
        success({ title: 'SUCCESS', description: `Reservation ${currentArchived ? 'unarchived' : 'archived'} successfully.` });
      } else {
        toastError({ title: 'ERROR', description: `Failed to update archive status.` });
      }
    } catch (error) {
      toastError({ title: 'ERROR', description: "An unexpected error occurred." });
    }
  }, [router, success, toastError]);

  const handleUpdateStatus = useCallback(async (bookingId: string, status: string, reason?: string) => {
    setUpdatingId(bookingId);
    try {
      const response = await fetch(`/api/landlord/bookings?id=${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }),
      });

      if (response.ok) {
        setReservations(prev => prev.map(r => r.id === bookingId ? { ...r, status } : r));
        success(`Reservation status updated to ${status.replace('_', ' ')}.`);
        
        // Force immediate notification sync
        queryClient.invalidateQueries({ queryKey: ["landlord-notifications"] });
        router.refresh();
      } else {
        const data = await response.json();
        toastError(data.error || `Failed to update status.`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toastError('An unexpected error occurred.');
    } finally {
      setUpdatingId(null);
    }
  }, [router, success, toastError]);

  const handleGenerateReport = async (dateRange?: DateRange) => {
    try {
      // 1. Filter by Date Range
      let exportData = filteredReservations;
      if (dateRange?.from) {
        const fromDate = dateRange.from;
        const toDate = dateRange.to;
        exportData = exportData.filter(r => {
          const createdAt = new Date(r.createdAt);
          if (toDate) {
            return createdAt >= fromDate && createdAt <= toDate;
          }
          return createdAt >= fromDate;
        });
      }

      const totalRequests = exportData.length;
      let summaryData: any[] = [];
      let subtitle = `Auditing pre-stay pipeline for ${totalRequests} potential tenants`;

      // 2. Dynamic Context-Aware KPIs
      if (selectedStatus === 'RESERVED') {
        const totalAmount = exportData.reduce((sum, r) => sum + (r.room?.price || 0), 0);
        const totalDays = exportData.reduce((sum, r) => sum + (r.stayDuration || 0), 0);
        const avgDays = totalRequests > 0 ? Math.round(totalDays / totalRequests) : 0;
        
        summaryData = [
          { label: 'Total Paid', value: `${totalRequests}` },
          { label: 'Total Amount Collected', value: `₱${totalAmount.toLocaleString()}` },
          { label: 'Average Stay', value: `${avgDays} Days` }
        ];
        subtitle = `Auditing paid reservations for ${totalRequests} tenants`;
      } 
      else if (selectedStatus === 'PENDING_PAYMENT') {
        const potentialAmount = exportData.reduce((sum, r) => sum + (r.room?.price || 0), 0);
        
        summaryData = [
          { label: 'Pending Requests', value: `${totalRequests}` },
          { label: 'Unpaid Amount', value: `₱${potentialAmount.toLocaleString()}` },
          { label: 'Awaiting Payment', value: `${totalRequests} Tenants` }
        ];
        subtitle = `Auditing pending reservations for ${totalRequests} tenants`;
      }
      else if (selectedStatus === 'CANCELLED') {
        const lostAmount = exportData.reduce((sum, r) => sum + (r.room?.price || 0), 0);
        
        summaryData = [
          { label: 'Cancelled Requests', value: `${totalRequests}` },
          { label: 'Lost Amount', value: `₱${lostAmount.toLocaleString()}` },
          { label: 'Status', value: `Cancelled` }
        ];
        subtitle = `Auditing cancelled reservations for ${totalRequests} tenants`;
      }
      else {
        // Global 'all' view
        const reservedCount = exportData.filter(r => r.status?.toLowerCase() === 'reserved').length;
        const pendingCount = exportData.filter(r => r.status?.toLowerCase() === 'pending_payment').length;
        
        summaryData = [
          { label: 'Total Requests', value: `${totalRequests}` },
          { label: 'Paid Reservations', value: `${reservedCount}` },
          { label: 'Pending Payment', value: `${pendingCount}` }
        ];
      }

      const columns = ['Listing', 'Tenant', 'Status', 'Move In Date', 'Duration'];
      const data = exportData.map((r) => [
        r.listing.title,
        (r.user?.name || r.guestName) || (r.user?.email || r.guestContact),
        r.status.toUpperCase(),
        new Date(r.moveInDate).toLocaleDateString(),
        `${r.stayDuration} days`
      ]);

      await generateTablePDF('Reservations_Report', columns, data, {
        title: 'Reservation Requests Business Report',
        subtitle: subtitle,
        author: 'Landlord Booking Management',
        summaryData: summaryData
      });
      
      success(`Generated enterprise report for ${totalRequests} reservations`);
    } catch (error) {
      console.error('Failed to generate report:', error);
      toastError('Failed to generate complete report');
    }
  };

  return {
    filteredReservations: paginatedReservations,
    totalReservations: filteredReservations.length,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    selectedStatus,
    setSelectedStatus,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    rawReservations: reservations,
    isArchived,
    handleToggleArchivedView,
    handleToggleArchiveRecord,
    handleUpdateStatus,
    handleGenerateReport,
    updatingId,
    isLoading
  };
}

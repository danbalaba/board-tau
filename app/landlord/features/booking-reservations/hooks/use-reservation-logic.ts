'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { generateTablePDF } from '@/utils/pdfGenerator';
import { useQueryClient } from '@tanstack/react-query';

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
  
  const [isArchived, setIsArchived] = useState(false);
  const [reservations, setReservations] = useState(initialReservations);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  // Sync with incoming server data changes (e.g., after router.refresh())
  useEffect(() => {
    setReservations(initialReservations);
  }, [initialReservations]);

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
        (r.user.name?.toLowerCase() || '').includes(q) || 
        r.user.email.toLowerCase().includes(q)
      );
    }
    
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortBy === 'oldest' ? timeA - timeB : timeB - timeA;
    });

    return result;
  }, [selectedStatus, reservations, sortBy, searchQuery]);

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
    setIsUpdating(true);
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
      setIsUpdating(false);
    }
  }, [router, success, toastError]);

  const handleGenerateReport = async () => {
    try {
      const totalRequests = filteredReservations.length;
      const reservedCount = filteredReservations.filter(r => r.status?.toLowerCase() === 'reserved').length;
      const pendingCount = filteredReservations.filter(r => r.status?.toLowerCase() === 'pending_payment').length;

      const summaryData = [
        { 
          label: 'Total Requests', 
          value: `${totalRequests}`,
          subValue: 'All pre-stay volume'
        },
        { 
          label: 'Confirmed', 
          value: `${reservedCount} Paid`,
          subValue: 'Reservations secured'
        },
        { 
          label: 'Pipeline', 
          value: `${pendingCount} Pending`,
          subValue: 'Awaiting payment'
        }
      ];

      const columns = ['Listing', 'Tenant', 'Status', 'Move In Date', 'Duration'];
      const data = filteredReservations.map((r) => [
        r.listing.title,
        r.user.name || r.user.email,
        r.status.toUpperCase(),
        new Date(r.moveInDate).toLocaleDateString(),
        `${r.stayDuration} days`
      ]);

      await generateTablePDF('Reservations_Report', columns, data, {
        title: 'Reservation Requests Business Report',
        subtitle: `Auditing pre-stay pipeline for ${totalRequests} potential tenants`,
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
    filteredReservations,
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
    isUpdating,
    isLoading
  };
}

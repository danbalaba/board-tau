'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { generateTablePDF } from '@/utils/pdfGenerator';

export interface ReservationRequest {
  id: string;
  listing: {
    id: string;
    title: string;
    imageSrc: string;
  };
  room?: {
    id: string;
    name: string;
    price: number;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  status: string;
  paymentStatus?: string;
  moveInDate: Date;
  stayDuration: number;
  createdAt: Date;
}

export function useReservationLogic(initialReservations: ReservationRequest[]) {
  const router = useRouter();
  const { success, error: toastError } = useResponsiveToast();
  
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReservations = useMemo(() => {
    let result = [...initialReservations];
    
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
  }, [selectedStatus, initialReservations, sortBy, searchQuery]);

  const handleRespond = useCallback(async (inquiryId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/inquiries?id=${inquiryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        router.refresh();
        success(`Reservation has been ${status}.`);
      } else {
        toastError(`Failed to ${status} reservation.`);
      }
    } catch (error) {
      console.error('Error responding:', error);
      toastError('An unexpected error occurred.');
    }
  }, [router, success, toastError]);

  const handleGenerateReport = async () => {
    const columns = ['Listing', 'Tenant', 'Status', 'Move In Date', 'Duration'];
    const data = filteredReservations.map((r) => [
      r.listing.title,
      r.user.name || r.user.email,
      r.status.toUpperCase(),
      new Date(r.moveInDate).toLocaleDateString(),
      `${r.stayDuration} days`
    ]);

    await generateTablePDF('Reservations_Report', columns, data, {
      title: 'Reservation Requests Report',
      subtitle: `Overview of ${filteredReservations.length} reservation requests`,
      author: 'Landlord Dashboard'
    });
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
    rawReservations: initialReservations,
    handleRespond,
    handleGenerateReport
  };
}

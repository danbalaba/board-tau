'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { generateTablePDF } from '@/utils/pdfGenerator';
import { useQueryClient } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';
import { formatDate } from '@/lib/utils';
import { formatDynamicCodeLabel } from '@/utils/export-utils';
import { useSession } from 'next-auth/react';
import { pusherClient } from '@/lib/pusher-client';

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
  totalPrice?: number;
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
  const [checkInLoaderReservation, setCheckInLoaderReservation] = useState<ReservationRequest | null>(null);
  const [cancelLoaderReservation, setCancelLoaderReservation] = useState<ReservationRequest | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  // Real-time Pusher listener for landlord reservations
  useEffect(() => {
    if (!userId) return;

    const channelName = `private-user-${userId}`;
    const channel = pusherClient.subscribe(channelName);

    const handleReservationUpdated = (data: any) => {
      if (!data || !data.entityId) return;

      setReservations((prev) => {
        const index = prev.findIndex((r) => r.id === data.entityId);
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
    channel.bind("new-notification", () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-notifications"] });
    });

    return () => {
      channel.unbind("reservation-updated", handleReservationUpdated);
    };
  }, [userId, queryClient]);

  // Sync with incoming server data changes (e.g., after router.refresh())
  useEffect(() => {
    setReservations(initialReservations);
  }, [initialReservations]);

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
  }, [searchQuery, selectedStatus, sortBy, isArchived]);

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
      if (sortBy === 'price_desc') {
        const priceA = a.totalPrice || a.room?.price || 0;
        const priceB = b.totalPrice || b.room?.price || 0;
        return priceB - priceA;
      }
      if (sortBy === 'price_asc') {
        const priceA = a.totalPrice || a.room?.price || 0;
        const priceB = b.totalPrice || b.room?.price || 0;
        return priceA - priceB;
      }
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
    const targetReservation = reservations.find(r => r.id === bookingId);
    if (status === 'CHECKED_IN' && targetReservation) {
      setCheckInLoaderReservation(targetReservation);
    } else if (status === 'CANCELLED' && targetReservation) {
      setCancelLoaderReservation(targetReservation);
    }

    setUpdatingId(bookingId);
    try {
      const response = await fetch(`/api/landlord/bookings?id=${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }),
      });

      if (response.ok) {
        setReservations(prev => prev.map(r => r.id === bookingId ? { ...r, status } : r));
        
        // Force immediate notification sync
        queryClient.invalidateQueries({ queryKey: ["landlord-notifications"] });
        router.refresh();
        success(`Reservation status updated to ${status}.`);
      } else {
        const data = await response.json();
        toastError(data.error || `Failed to update status.`);
        setCheckInLoaderReservation(null);
        setCancelLoaderReservation(null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toastError('An unexpected error occurred.');
      setCheckInLoaderReservation(null);
      setCancelLoaderReservation(null);
    } finally {
      setUpdatingId(null);
    }
  }, [reservations, router, queryClient, success, toastError]);

  const handleGenerateReport = async (options?: { scope?: 'filtered' | 'all'; format?: string; includeSummary?: boolean; includeGlossary?: boolean; dateRange?: DateRange } | DateRange) => {
    try {
      const isParamDateRange = options && ('from' in options || 'to' in options);
      const dateRange = isParamDateRange ? (options as DateRange) : (options as any)?.dateRange;
      const exportScope = !isParamDateRange && (options as any)?.scope ? (options as any).scope : 'filtered';
      const includeSummary = !isParamDateRange && (options as any)?.includeSummary !== undefined ? (options as any).includeSummary : true;
      const includeGlossary = !isParamDateRange && (options as any)?.includeGlossary !== undefined ? (options as any).includeGlossary : true;

      let exportData = exportScope === 'all' ? reservations : filteredReservations;

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
      const reservedCount = exportData.filter(r => (r.status || '').toLowerCase() === 'reserved').length;
      const pendingCount = exportData.filter(r => (r.status || '').toLowerCase() === 'pending_payment').length;
      const cancelledCount = exportData.filter(r => (r.status || '').toLowerCase() === 'cancelled').length;
      const totalCollected = exportData.reduce((acc, r: any) => acc + (r.totalPrice || r.room?.reservationFee || r.reservationFee || 0), 0);

      const distributionData = [
        { label: 'Confirmed Reservations', count: reservedCount, percentage: totalRequests ? (reservedCount / totalRequests) * 100 : 0, color: [47, 125, 109] as [number, number, number] },
        { label: 'Pending Payment', count: pendingCount, percentage: totalRequests ? (pendingCount / totalRequests) * 100 : 0, color: [217, 119, 6] as [number, number, number] },
        { label: 'Cancelled', count: cancelledCount, percentage: totalRequests ? (cancelledCount / totalRequests) * 100 : 0, color: [220, 38, 38] as [number, number, number] }
      ];

      // Reservation Source Category Breakdown for Horizontal Bar Chart Graph
      const resCounts: Record<string, number> = {};
      exportData.forEach(r => {
        const sourceName = r.isWalkIn ? 'Walk-In Guest' : 'Online Reservation';
        resCounts[sourceName] = (resCounts[sourceName] || 0) + 1;
      });

      const categoryData = Object.entries(resCounts)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);

      // Monthly Reservation Activity Trajectory
      const monthCounts: Record<string, number> = {};
      exportData.forEach(r => {
        const date = new Date(r.createdAt || r.moveInDate || Date.now());
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
        monthCounts[monthLabel] = (monthCounts[monthLabel] || 0) + 1;
      });
      const trendData = Object.entries(monthCounts).map(([label, value]) => ({ label, value }));

      const summaryData = [
        { label: 'Total Reservations', value: `${totalRequests} Requests`, subValue: `${reservedCount} Confirmed | ${pendingCount} Pending` },
        { label: 'Total Holding Fees', value: `PHP ${totalCollected.toLocaleString()}`, subValue: 'Online reservation fees collected' },
        { label: 'Confirmation Rate', value: `${totalRequests ? Math.round((reservedCount / totalRequests) * 100) : 0}%`, subValue: 'Percentage confirmed' }
      ];

      const columns = ['Listing', 'Room Unit', 'Tenant', 'Status', 'Reservation Fee (PHP)', 'Check-In Date', 'Stay Duration'];
      const data = exportData.map((r: any) => [
        r.listing?.title || r.propertyTitle || 'N/A',
        r.room?.name || r.room?.title || r.roomTitle || 'Standard Unit',
        (r.user?.name || r.guestName || r.user?.email || 'N/A'),
        formatDynamicCodeLabel(r.status, 'Reserved'),
        `PHP ${(r.totalPrice || r.room?.reservationFee || r.reservationFee || 0).toLocaleString()}`,
        formatDate(r.moveInDate || r.createdAt),
        r.stayDuration ? `${r.stayDuration} days` : 'N/A'
      ]);

      const totalsRow = [
        'TOTALS',
        `${totalRequests} Requests`,
        `${reservedCount} Confirmed`,
        'Holding Fees Paid',
        `PHP ${totalCollected.toLocaleString()}`,
        'Deposit Secured',
        '-'
      ];

      const glossaryItems = [
        { term: 'Slot Reservation', definition: 'Temporary hold securing a room slot for a prospective tenant prior to move-in.' },
        { term: 'Holding Deposit Paid', definition: 'Advance reservation fee deposited by the tenant to guarantee their room slot.' },
        { term: 'Move-In Window', definition: 'Agreed timeframe within which the tenant must arrive to complete check-in and contract sign-off.' },
        { term: 'Walk-In vs Online', definition: 'Reservation source — Online (booked via BoardTAU platform) or Walk-In (registered directly onsite).' }
      ];

      const subtitle = exportScope === 'all'
        ? `All-Time Reservation Record for ${totalRequests} reservation requests (${reservedCount} Confirmed)`
        : `Filtered Reservation Report for ${totalRequests} potential tenants`;

      const authorName = session?.user?.name || session?.user?.email || 'BoardTAU Landlord Portal';

      await generateTablePDF('Reservation_Certificates_Report', columns, data, {
        title: 'Reservation Summary Report',
        subtitle: subtitle,
        author: authorName,
        summaryData: summaryData,
        distributionData: distributionData,
        categoryData: categoryData,
        trendData: trendData,
        statusChartTitle: 'Reservation Status',
        categoryChartTitle: 'Reservations by Type',
        trendChartTitle: 'Monthly Reservations',
        glossaryItems: glossaryItems,
        totalsRow: totalsRow,
        scopeTag: exportScope === 'all' ? 'Complete History' : 'Filtered View',
        type: 'reservation',
        includeSummary: includeSummary,
        includeGlossary: includeGlossary
      });
      
      success(`Generated reservation report for ${totalRequests} requests`);
    } catch (error) {
      console.error('Failed to generate report:', error);
      toastError('Failed to generate reservation report');
    }
  };

  return {
    filteredReservations: paginatedReservations,
    allFilteredReservations: filteredReservations,
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
    checkInLoaderReservation,
    setCheckInLoaderReservation,
    cancelLoaderReservation,
    setCancelLoaderReservation,
    isHeaderLoading: isLoading,
    isSyncing: isFilterLoading,
    isLoading: isLoading || isFilterLoading
  };
}

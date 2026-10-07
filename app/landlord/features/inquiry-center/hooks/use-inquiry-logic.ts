'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { generateTablePDF } from '@/utils/pdfGenerator';
import { formatDynamicCodeLabel } from '@/utils/export-utils';
import { DateRange } from 'react-day-picker';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { pusherClient } from '@/lib/pusher-client';

export interface Inquiry {
  id: string;
  listingId: string;
  roomId: string;
  userId: string;
  moveInDate: string | Date;
  checkOutDate: string | Date;
  occupantsCount: number;
  role: string;
  message?: string | null;
  profilePhotoUrl?: string | null;
  idAttachmentUrl?: string | null;
  paymentMethod?: string | null;
  contactInfo?: string | null;
  contactMethod?: string | null;
  status: string;
  rejectionReason?: string | null;
  isArchived: boolean;
  isSoloBuyout?: boolean;
  createdAt: string | Date;
  listing: {
    id: string;
    title: string;
    imageSrc: string;
    images?: Array<{ url: string }>;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  };
  room?: {
    id: string;
    name: string;
    price: number;
    reservationFee?: number;
    images?: Array<{ url: string }>;
  };
}

export function useInquiryLogic(initialInquiries: { inquiries: Inquiry[]; nextCursor: string | null }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useResponsiveToast();
  const [listings, setListings] = useState(initialInquiries.inquiries);
  const [nextCursor, setNextCursor] = useState(initialInquiries.nextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [approvalLoaderInquiry, setApprovalLoaderInquiry] = useState<Inquiry | null>(null);
  const [rejectionLoaderInquiry, setRejectionLoaderInquiry] = useState<Inquiry | null>(null);

  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  // Real-time Pusher listener for landlord inquiry center
  useEffect(() => {
    if (!userId) return;

    const channelName = `private-user-${userId}`;
    const channel = pusherClient.subscribe(channelName);

    const handleInquiryUpdated = (data: any) => {
      if (!data || !data.entityId) return;

      setListings((prev) => {
        const index = prev.findIndex((i) => i.id === data.entityId);
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
          rejectionReason: data.payload?.rejectionReason || updated[index].rejectionReason,
          ...(data.payload || {}),
        };
        return updated;
      });

      setSelectedInquiry((prevSelected) => {
        if (prevSelected && prevSelected.id === data.entityId) {
          return {
            ...prevSelected,
            status: data.status || prevSelected.status,
            rejectionReason: data.payload?.rejectionReason || prevSelected.rejectionReason,
            ...(data.payload || {}),
          };
        }
        return prevSelected;
      });
    };

    channel.bind("inquiry-updated", handleInquiryUpdated);
    channel.bind("new-notification", () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-notifications"] });
    });

    return () => {
      channel.unbind("inquiry-updated", handleInquiryUpdated);
    };
  }, [userId, queryClient]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // When isArchived toggles, we should probably refetch, 
    // but the current structure relies on initialInquiries and handleLoadMore.
    // For now, I'll just clear the local listings to force a fresh view if needed,
    // though the best way would be to refetch from server.
  }, [isArchived]);

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

  const handleToggleArchived = useCallback(async () => {
    const newArchivedState = !isArchived;
    setIsArchived(newArchivedState);
    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/landlord/inquiries?isArchived=${newArchivedState}`);
      const data = await response.json();
      if (data.success && data.data) {
        setListings(data.data.inquiries);
        setNextCursor(data.data.nextCursor);
      }
    } catch (error) {
      toastError("Failed to fetch inquiries");
    } finally {
      setIsLoadingMore(false);
    }
  }, [isArchived]);

  useEffect(() => {
    setListings(initialInquiries.inquiries);
    setNextCursor(initialInquiries.nextCursor);
  }, [initialInquiries]);

  const filteredInquiries = useMemo(() => {
    let result = [...listings];
    if (selectedStatus !== "ALL") result = result.filter(i => i.status === selectedStatus);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => 
        i.listing.title.toLowerCase().includes(q) || 
        (i.user.name?.toLowerCase() || '').includes(q) || 
        i.user.email.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      if (sortBy === 'price_desc') {
        const priceA = a.room?.price || 0;
        const priceB = b.room?.price || 0;
        return priceB - priceA;
      }
      if (sortBy === 'price_asc') {
        const priceA = a.room?.price || 0;
        const priceB = b.room?.price || 0;
        return priceA - priceB;
      }
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortBy === 'oldest' ? timeA - timeB : timeB - timeA;
    });
    return result;
  }, [selectedStatus, listings, searchQuery, sortBy]);

  const paginatedInquiries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInquiries.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInquiries, currentPage, itemsPerPage]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedInquiry) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/landlord/inquiries?id=${selectedInquiry.id}&purge=true`, { method: 'DELETE' });
      const data = await response.json();
      
      if (response.ok) {
        setListings(prev => prev.filter(i => i.id !== selectedInquiry.id));
        setDeleteModalOpen(false);
        
        if (selectedInquiry.isArchived) {
          success({ 
            title: 'INQUIRY DELETED', 
            description: 'The record has been permanently removed.' 
          });
        } else {
          success({ 
            title: 'ARCHIVED', 
            description: `Inquiry from ${selectedInquiry.user.name || selectedInquiry.user.email} moved to archive.` 
          });
        }
      } else {
        toastError({ title: 'ERROR', description: data.error || 'Failed to process request.' });
      }
    } catch (error) {
      toastError({ title: 'ERROR', description: 'An unexpected error occurred.' });
    } finally {
      setIsDeleting(false);
    }
  }, [selectedInquiry, router]);

  const handleConfirmArchive = useCallback(async () => {
    if (!selectedInquiry) return;
    setIsArchiving(true);
    try {
      const response = await fetch(`/api/landlord/inquiries?id=${selectedInquiry.id}`, {
        method: 'DELETE', // Same endpoint, logic handles toggle
      });
      if (response.ok) {
        setListings(prev => prev.filter(i => i.id !== selectedInquiry.id));
        setArchiveModalOpen(false);
        success({
          title: selectedInquiry.isArchived ? 'RESTORED' : 'ARCHIVED',
          description: `Inquiry ${selectedInquiry.isArchived ? 'restored to active list' : 'moved to archive'}.`
        });
      } else {
        toastError('Failed to update inquiry status');
      }
    } catch (error) {
      toastError('An error occurred');
    } finally {
      setIsArchiving(false);
    }
  }, [selectedInquiry, success, toastError]);

  const handleRespond = useCallback(async (inquiryId: string, status: "APPROVED" | "REJECTED", message?: string) => {
    const targetInquiry = listings.find(i => i.id === inquiryId) || selectedInquiry;
    if (status === "APPROVED" && targetInquiry) {
      setApprovalLoaderInquiry(targetInquiry);
    } else if (status === "REJECTED" && targetInquiry) {
      setRejectionLoaderInquiry(targetInquiry);
    }

    setRespondingId(inquiryId);
    try {
      const response = await fetch(`/api/landlord/inquiries?id=${inquiryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, message }),
      });
      if (response.ok) {
        setListings(prev => prev.map(i => i.id === inquiryId ? { ...i, status } : i));
        queryClient.invalidateQueries({ queryKey: ["landlord-notifications"] });
        router.refresh();
        success(`Inquiry ${status.toLowerCase()} successfully.`);
      } else {
        toastError(`Failed to update status.`);
        setApprovalLoaderInquiry(null);
        setRejectionLoaderInquiry(null);
      }
    } catch (error) {
      toastError("An error occurred.");
      setApprovalLoaderInquiry(null);
      setRejectionLoaderInquiry(null);
    } finally {
      setRespondingId(null);
    }
  }, [listings, selectedInquiry, queryClient, router, success, toastError]);

  const handleConfirmReject = useCallback(async (inquiryId: string, reason: string) => {
    await handleRespond(inquiryId, "REJECTED", reason);
    setRejectModalOpen(false);
  }, [handleRespond]);

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const response = await fetch(`/api/landlord/inquiries?cursor=${nextCursor}&isArchived=${isArchived}`);
      const data = await response.json();
      if (data.success && data.data) {
        setListings(prev => [...prev, ...data.data.inquiries]);
        setNextCursor(data.data.nextCursor);
      }
    } catch (error) {
      console.error(error);
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

      let exportData = exportScope === 'all' ? listings : filteredInquiries;

      if (dateRange?.from) {
        const fromDate = dateRange.from;
        const toDate = dateRange.to;
        exportData = exportData.filter((i: any) => {
          const createdAt = new Date(i.createdAt);
          if (toDate) {
            return createdAt >= fromDate && createdAt <= toDate;
          }
          return createdAt >= fromDate;
        });
      }

      const totalInquiries = exportData.length;
      const pendingCount = exportData.filter((i: any) => (i.status || '').toUpperCase() === 'PENDING').length;
      const approvedCount = exportData.filter((i: any) => (i.status || '').toUpperCase() === 'APPROVED').length;
      const rejectedCount = exportData.filter((i: any) => (i.status || '').toUpperCase() === 'REJECTED').length;
      const uniqueListings = new Set(exportData.map((i: any) => i.listingId || i.listing?.title)).size;

      const distributionData = [
        { label: 'Approved Inquiries', count: approvedCount, percentage: totalInquiries ? (approvedCount / totalInquiries) * 100 : 0, color: [47, 125, 109] as [number, number, number] },
        { label: 'Pending Response', count: pendingCount, percentage: totalInquiries ? (pendingCount / totalInquiries) * 100 : 0, color: [217, 119, 6] as [number, number, number] },
        { label: 'Declined Inquiries', count: rejectedCount, percentage: totalInquiries ? (rejectedCount / totalInquiries) * 100 : 0, color: [220, 38, 38] as [number, number, number] }
      ];

      // Property Inquiry Category Breakdown for Horizontal Bar Chart Graph
      const inqCounts: Record<string, number> = {};
      exportData.forEach((i: any) => {
        const propTitle = i.listing?.title || i.propertyTitle || 'Listing Unit';
        inqCounts[propTitle] = (inqCounts[propTitle] || 0) + 1;
      });

      const categoryData = Object.entries(inqCounts)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);

      // Inquiry Volume Trend Trajectory for Line Graph
      const monthCounts: Record<string, number> = {};
      exportData.forEach((i: any) => {
        const date = new Date(i.createdAt || Date.now());
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
        monthCounts[monthLabel] = (monthCounts[monthLabel] || 0) + 1;
      });
      const trendData = Object.entries(monthCounts).map(([label, value]) => ({ label, value }));

      const summaryData = [
        { label: 'TOTAL INQUIRIES', value: `${totalInquiries} Inquiries`, subValue: `${uniqueListings} Properties targeted` },
        { label: 'PENDING RESPONSE', value: `${pendingCount} Pending`, subValue: 'Action required' },
        { label: 'RESPONSE RATE', value: `${totalInquiries ? Math.round(((totalInquiries - pendingCount) / totalInquiries) * 100) : 100}%`, subValue: 'Landlord response rate' }
      ];

      const columns = ['Target Property', 'Target Room Unit', 'Tenant Name', 'Status', 'Check-In', 'Check-Out', 'Payment Method', 'Date Received'];
      const data = exportData.map((i: any) => [
        i.listing?.title || (i as any).propertyTitle || 'N/A',
        i.room?.name || i.room?.title || (i as any).roomTitle || 'Standard Unit',
        i.user?.name || i.user?.email || (i as any).tenantName || 'N/A',
        formatDynamicCodeLabel(i.status, 'Pending'),
        i.moveInDate ? new Date(i.moveInDate).toLocaleDateString() : 'N/A',
        i.checkOutDate ? new Date(i.checkOutDate).toLocaleDateString() : 'N/A',
        formatDynamicCodeLabel(i.paymentMethod || i.contactMethod, 'Online Payment'),
        new Date(i.createdAt).toLocaleDateString()
      ]);

      const totalsRow = [
        'TOTALS',
        `${uniqueListings} Properties`,
        `${totalInquiries} Inquiries`,
        `${approvedCount} Approved`,
        'Move-In Scheduled',
        'Move-Out Scheduled',
        'Verified',
        new Date().toLocaleDateString()
      ];

      const glossaryItems = [
        { term: 'Total Inquiry Count', definition: 'Total number of prospective tenant inquiries received across your property listings.' },
        { term: 'Inquiry Status', definition: 'Prospective tenant query state — Received (awaiting response), Approved (accepted by landlord), or Closed.' },
        { term: 'Target Room Unit', definition: 'Specific property room unit queried by the prospective tenant.' },
        { term: 'Intended Stay Window', definition: 'Tenant requested check-in (move-in) and check-out dates for their stay duration.' },
        { term: 'Payment Method', definition: 'Tenant preferred payment channel specified during inquiry submission.' }
      ];

      const subtitle = exportScope === 'all'
        ? `All-Time Inquiry Record for ${totalInquiries} tenant inquiries`
        : `Filtered Inquiry Report for ${totalInquiries} tenant inquiries`;

      const authorName = session?.user?.name || session?.user?.email || 'BoardTAU Landlord Portal';

      await generateTablePDF('Tenant_Inquiries_Report', columns, data, {
        title: 'Tenant Inquiry Summary Report',
        subtitle: subtitle,
        author: authorName,
        summaryData: summaryData,
        distributionData: distributionData,
        categoryData: categoryData,
        trendData: trendData,
        statusChartTitle: 'Inquiry Status',
        categoryChartTitle: 'Inquiries by Property',
        trendChartTitle: 'Monthly Inquiry Volume',
        glossaryItems: glossaryItems,
        totalsRow: totalsRow,
        scopeTag: exportScope === 'all' ? 'Complete History' : 'Filtered View',
        type: 'inquiry',
        includeSummary: includeSummary,
        includeGlossary: includeGlossary
      });
      
      success(`Generated inquiry report for ${totalInquiries} inquiries`);
    } catch (error) {
      console.error('Failed to generate report:', error);
      toastError('Failed to generate inquiry report');
    }
  };

  return {
    filteredInquiries: paginatedInquiries,
    allFilteredInquiries: filteredInquiries,
    totalInquiries: filteredInquiries.length,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    selectedStatus,
    setSelectedStatus,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedInquiry,
    setSelectedInquiry,
    viewModalOpen,
    setViewModalOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    rejectModalOpen,
    setRejectModalOpen,
    archiveModalOpen,
    setArchiveModalOpen,
    isDeleting,
    respondingId,
    isArchiving,
    isLoadingMore,
    nextCursor,
    handleConfirmDelete,
    handleConfirmArchive,
    handleRespond,
    handleConfirmReject,
    handleLoadMore,
    handleGenerateReport,
    isArchived,
    handleToggleArchived,
    approvalLoaderInquiry,
    setApprovalLoaderInquiry,
    rejectionLoaderInquiry,
    setRejectionLoaderInquiry,
    isHeaderLoading: isLoading,
    isSyncing: isFilterLoading || isLoadingMore,
    isLoading: isLoading || isFilterLoading,
    rawInquiries: listings
  };
}

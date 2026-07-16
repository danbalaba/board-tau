'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { generateTablePDF } from '@/utils/pdfGenerator';
import { DateRange } from 'react-day-picker';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

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

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // When isArchived toggles, we should probably refetch, 
    // but the current structure relies on initialInquiries and handleLoadMore.
    // For now, I'll just clear the local listings to force a fresh view if needed,
    // though the best way would be to refetch from server.
  }, [isArchived]);

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
    setRespondingId(inquiryId);
    const loadingToast = toast.loading(`${status === "APPROVED" ? "Approving" : "Rejecting"} inquiry...`);
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
      }
    } catch (error) {
      toastError("An error occurred.");
    } finally {
      setRespondingId(null);
      toast.dismiss(loadingToast);
    }
  }, [router]);

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

  const handleGenerateReport = async (dateRange?: DateRange) => {
    try {
      let exportData = filteredInquiries;
      if (dateRange?.from) {
        const fromDate = dateRange.from;
        const toDate = dateRange.to;
        exportData = exportData.filter(i => {
          const createdAt = new Date(i.createdAt);
          if (toDate) {
            return createdAt >= fromDate && createdAt <= toDate;
          }
          return createdAt >= fromDate;
        });
      }

      const totalInquiries = exportData.length;
      let summaryData: any[] = [];
      let subtitle = `Auditing engagement for ${totalInquiries} potential tenants`;

      if (selectedStatus === 'PENDING') {
        const uniqueProperties = new Set(exportData.map(i => i.listingId)).size;
        summaryData = [
          { label: 'Unanswered Inquiries', value: `${totalInquiries}` },
          { label: 'Need to Answer', value: `${uniqueProperties} Properties` },
          { label: 'Status', value: `Pending Action` }
        ];
        subtitle = `Auditing pending inquiries for ${totalInquiries} tenants`;
      } 
      else if (selectedStatus === 'APPROVED') {
        summaryData = [
          { label: 'Approved Inquiries', value: `${totalInquiries}` },
          { label: 'Potential Tenants', value: `${totalInquiries}` },
          { label: 'Status', value: `Approved` }
        ];
        subtitle = `Auditing approved inquiries for ${totalInquiries} tenants`;
      }
      else if (selectedStatus === 'REJECTED') {
        summaryData = [
          { label: 'Rejected Inquiries', value: `${totalInquiries}` },
          { label: 'Total Rejected', value: `${totalInquiries}` },
          { label: 'Status', value: `Rejected` }
        ];
        subtitle = `Auditing rejected inquiries for ${totalInquiries} tenants`;
      }
      else {
        // Global 'all' view
        const uniqueListings = new Set(exportData.map(i => i.listingId)).size;
        const pendingCount = exportData.filter(i => i.status === 'PENDING').length;
        
        summaryData = [
          { label: 'Total Inquiries', value: `${totalInquiries}` },
          { label: 'Properties Inquired', value: `${uniqueListings}` },
          { label: 'Need to Answer', value: `${pendingCount}` }
        ];
      }

      const columns = ['Listing', 'Tenant', 'Status', 'Date', 'Message'];
      const data = exportData.map((i) => [
        i.listing.title,
        i.user?.name || i.user?.email || 'Guest',
        i.status,
        new Date(i.createdAt).toLocaleDateString(),
        (i.message || 'N/A').length > 50 ? `${(i.message || '').substring(0, 50)}...` : (i.message || 'N/A'),
      ]);

      await generateTablePDF('Inquiries_Report', columns, data, {
        title: 'Tenant Inquiries Business Report',
        subtitle: subtitle,
        author: 'Landlord Inquiry Management',
        summaryData: summaryData
      });
      
      success(`Generated enterprise report for ${totalInquiries} inquiries`);
    } catch (error) {
      console.error('Failed to generate report:', error);
      toastError('Failed to generate complete report');
    }
  };

  return {
    filteredInquiries: paginatedInquiries,
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
    isLoading,
    rawInquiries: listings
  };
}

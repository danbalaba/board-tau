'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import { generateTablePDF } from '@/utils/pdfGenerator';
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
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
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
    setIsResponding(true);
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
      setIsResponding(false);
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

  const handleGenerateReport = async () => {
    try {
      const totalInquiries = filteredInquiries.length;
      const pendingCount = filteredInquiries.filter(i => i.status === 'PENDING').length;
      const approvedCount = filteredInquiries.filter(i => i.status === 'APPROVED').length;
      const uniqueListings = new Set(filteredInquiries.map(i => i.listingId)).size;

      const summaryData = [
        { 
          label: 'Total Inquiries', 
          value: `${totalInquiries}`,
          subValue: 'Total engagement'
        },
        { 
          label: 'Engagement Rate', 
          value: `${uniqueListings} Properties`,
          subValue: 'Receiving interest'
        },
        { 
          label: 'Response Status', 
          value: `${approvedCount} Approved`,
          subValue: `${pendingCount} Pending response`
        }
      ];

      const columns = ['Listing Title', 'Tenant Name', 'Status', 'Date Received'];
      const data = filteredInquiries.map(i => [
        i.listing.title,
        i.user.name || i.user.email,
        i.status.toUpperCase(),
        new Date(i.createdAt).toLocaleDateString()
      ]);

      await generateTablePDF('Inquiries_Report', columns, data, {
        title: 'Tenant Inquiry Business Report',
        subtitle: `Auditing response performance for ${totalInquiries} tenant leads`,
        author: 'Landlord Relationship Management',
        summaryData: summaryData
      });
      
      success(`Generated enterprise report for ${totalInquiries} inquiries`);
    } catch (error) {
      console.error('Failed to generate report:', error);
      toastError('Failed to generate complete report');
    }
  };

  return {
    filteredInquiries,
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
    isResponding,
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

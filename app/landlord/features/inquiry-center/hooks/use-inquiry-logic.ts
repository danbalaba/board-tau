'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { generateTablePDF } from '@/utils/pdfGenerator';

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
  status: string;
  rejectionReason?: string | null;
  isArchived: boolean;
  createdAt: string | Date;
  listing: {
    id: string;
    title: string;
    imageSrc: string;
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
  };
}

export function useInquiryLogic(initialInquiries: { inquiries: Inquiry[]; nextCursor: string | null }) {
  const router = useRouter();
  const [listings, setListings] = useState(initialInquiries.inquiries);
  const [nextCursor, setNextCursor] = useState(initialInquiries.nextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

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
      toast.error("Failed to fetch inquiries");
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
      const response = await fetch(`/api/landlord/inquiries?id=${selectedInquiry.id}`, { method: 'DELETE' });
      if (response.ok) {
        setListings(prev => prev.filter(i => i.id !== selectedInquiry.id));
        setDeleteModalOpen(false);
        router.refresh();
        toast.success(`Inquiry removed.`);
      } else {
        toast.error('Failed to remove inquiry.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsDeleting(false);
    }
  }, [selectedInquiry, router]);

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
        router.refresh();
        toast.success(`Inquiry ${status.toLowerCase()}.`, { id: loadingToast });
      } else {
        toast.error(`Failed to update status.`, { id: loadingToast });
      }
    } catch (error) {
      toast.error("An error occurred.", { id: loadingToast });
    } finally {
      setIsResponding(false);
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
    const columns = ['Listing', 'Tenant', 'Status', 'Date Received'];
    const data = filteredInquiries.map(i => [
      i.listing.title,
      i.user.name || i.user.email,
      i.status.toUpperCase(),
      new Date(i.createdAt).toLocaleDateString()
    ]);
    await generateTablePDF('Inquiries_Report', columns, data, {
      title: 'Tenant Inquiries Report',
      subtitle: `Detailed view of all ${filteredInquiries.length} inquiries received`,
      author: 'Landlord Dashboard'
    });
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
    isDeleting,
    isResponding,
    isLoadingMore,
    nextCursor,
    handleConfirmDelete,
    handleRespond,
    handleConfirmReject,
    handleLoadMore,
    handleGenerateReport,
    isArchived,
    handleToggleArchived,
    rawInquiries: listings
  };
}

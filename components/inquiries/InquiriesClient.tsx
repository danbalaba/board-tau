"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Heading from "@/components/common/Heading";
import InquiryCard from "@/components/inquiries/InquiryCard";
import InquiryDetailsModal from "@/components/inquiries/InquiryDetailsModal";
import Button from "@/components/common/Button";
import { Search, Filter, ArrowUpDown, Clock, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import ModernSelect from "@/components/common/ModernSelect";
import ModernLoader from "@/components/common/ModernLoader";
import Modal from "@/components/modals/Modal";
import ConfirmModal from "@/components/common/ConfirmModal";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface InquiryListing {
  id: string;
  title: string;
  imageSrc: string;
  location: any;
  region?: string;
  country?: string;
}

interface InquiryRoom {
  id: string;
  name: string;
  price: number;
  roomType: string;
  images: Array<{
    id: string;
    url: string;
  }>;
}

interface Inquiry {
  id: string;
  listingId: string;
  roomId: string;
  userId: string;
  moveInDate: string;
  checkOutDate: string;
  occupantsCount: number;
  role: string;
  contactMethod: string;
  message: string;
  status: string;
  paymentStatus: string;
  isApproved: boolean;
  reservationFee: number;
  createdAt: string;
  updatedAt: string;
  listing: InquiryListing;
  room: InquiryRoom;
}

interface InquiriesClientProps {
  initialInquiries: any[];
}

type StatusFilter = "all" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

const statusOptions = [
  { value: "all", label: "All", color: "bg-gray-400" },
  { value: "PENDING", label: "Pending", color: "bg-amber-500" },
  { value: "APPROVED", label: "Approved", color: "bg-emerald-500" },
  { value: "REJECTED", label: "Rejected", color: "bg-rose-500" },
  { value: "CANCELLED", label: "Cancelled", color: "bg-gray-500" },
];

const sortOptions = [
  { value: "newest", label: "Newest", icon: <Clock size={16} /> },
  { value: "oldest", label: "Oldest", icon: <Clock size={16} className="opacity-50" /> },
  { value: "price-high", label: "Price: High", icon: <DollarSign size={16} /> },
  { value: "price-low", label: "Price: Low", icon: <DollarSign size={16} className="opacity-50" /> },
];

export default function InquiriesClient({ initialInquiries }: InquiriesClientProps) {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cancellation state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [inquiryToCancel, setInquiryToCancel] = useState<Inquiry | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    // Air-gap buffer (800ms) to ensure root dots loader is completely gone
    const timer = setTimeout(() => {
      setIsMounted(true);
      setIsLoading(true);

      const contentTimer = setTimeout(() => {
        setIsLoading(false);
      }, 1000); // Content load duration

      return () => clearTimeout(contentTimer);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Handle Loading state during filtering/sorting/searching
  useEffect(() => {
    if (!isMounted) return;

    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600); // Quick sync feel

    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, sortBy, isMounted]);

  const handleCancelClick = (inquiry: Inquiry) => {
    setInquiryToCancel(inquiry);
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = async () => {
    if (!inquiryToCancel) return;

    setIsCancelling(true);
    setError(null);

    try {
      const response = await fetch(`/api/inquiries/${inquiryToCancel.id}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to cancel inquiry");
      }

      // Update local state
      setInquiries((prev) =>
        prev.map((inquiry) =>
          inquiry.id === inquiryToCancel.id ? { ...inquiry, status: "CANCELLED" } : inquiry
        )
      );
      
      setShowCancelConfirm(false);
      setInquiryToCancel(null);
      setSelectedInquiry(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredInquiries = useMemo(() => {
    let filtered = [...inquiries];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((inquiry) => inquiry.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((inquiry) =>
        inquiry.room.name.toLowerCase().includes(searchLower) ||
        inquiry.listing.title.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "price-high") {
        return b.room.price - a.room.price;
      } else if (sortBy === "price-low") {
        return a.room.price - b.room.price;
      }
      return 0;
    });

    return filtered;
  }, [inquiries, statusFilter, searchQuery, sortBy]);

  if (!isMounted) return null;

  return (
    <div className="main-container min-h-[70vh] flex flex-col">
      <Heading
        title="My Inquiries"
        subtitle="Manage your boarding house inquiries"
        backBtn
      />

      {/* Search and Filter Bar - Always visible */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 mb-10 flex flex-col md:flex-row items-center gap-4 bg-white/50 dark:bg-gray-800/50 p-4 rounded-2xl backdrop-blur-md border border-gray-100 dark:border-gray-700/50 shadow-sm"
      >
        {/* Search */}
        <div className="relative flex-[5]">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by room name or listing..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-transparent rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all"
          />
        </div>

        {/* Status Filter */}
        <ModernSelect
          instanceId="status-filter"
          options={statusOptions}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val as StatusFilter)}
          icon={<Filter size={18} />}
          className="md:w-max min-w-[200px]"
        />

        {/* Sort */}
        <ModernSelect
          instanceId="sort-filter"
          options={sortOptions}
          value={sortBy}
          onChange={setSortBy}
          icon={<ArrowUpDown size={18} />}
          className="md:w-max min-w-[204px]"
        />
      </motion.div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <ModernLoader text="Securely loading your inquiries..." />
        </div>
      ) : (
        <>
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800/50">
              {error}
            </div>
          )}

          {/* Inquiries Grid */}
          {filteredInquiries.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold text-text-primary dark:text-gray-100 mb-2">
                No Inquiries Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                You haven't sent any inquiries yet. Start exploring boarding houses to find your perfect room.
              </p>
              <Button onClick={() => router.push("/")}>
                Explore Listings
              </Button>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredInquiries.map((inquiry) => (
                <motion.div key={inquiry.id} variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}>
                  <InquiryCard
                    inquiry={inquiry}
                    onViewDetails={() => setSelectedInquiry(inquiry)}
                    onCancel={
                      inquiry.status === "PENDING"
                        ? () => handleCancelClick(inquiry)
                        : undefined
                    }
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Inquiry Details Modal */}
          {selectedInquiry && (
            <InquiryDetailsModal
              inquiry={selectedInquiry}
              isOpen={!!selectedInquiry}
              onClose={() => setSelectedInquiry(null)}
              onCancel={
                selectedInquiry.status === "PENDING"
                  ? () => handleCancelClick(selectedInquiry)
                  : undefined
              }
            />
          )}

          {/* Global Cancellation Confirmation */}
          <Modal 
            isOpen={showCancelConfirm} 
            onClose={() => setShowCancelConfirm(false)} 
            width="sm"
          >
            <ConfirmModal
              isOpen={showCancelConfirm}
              onClose={() => setShowCancelConfirm(false)}
              onConfirm={handleConfirmCancel}
              title="Cancel Inquiry?"
              message={inquiryToCancel ? `Are you sure you want to cancel your inquiry for ${inquiryToCancel.room.name}? This action cannot be undone.` : ""}
              confirmLabel="Yes, Cancel"
              cancelLabel="No, Keep It"
              isLoading={isCancelling}
              variant="danger"
            />
          </Modal>
        </>
      )}
    </div>
  );
}

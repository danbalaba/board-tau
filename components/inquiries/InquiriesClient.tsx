"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Heading from "@/components/common/Heading";
import InquiryCard from "@/components/inquiries/InquiryCard";
import InquiryDetailsModal from "@/components/inquiries/InquiryDetailsModal";
import Button from "@/components/common/Button";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Clock, 
  DollarSign, 
  Home, 
  MapPin, 
  AlertCircle, 
  FileText, 
  Calendar, 
  MoreHorizontal,
  Info,
  HeartPulse,
  Building2,
  Truck,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ModernSelect from "@/components/common/ModernSelect";
import ModernLoader from "@/components/common/ModernLoader";
import Modal from "@/components/modals/Modal";
import ConfirmModal from "@/components/common/ConfirmModal";
import { getUnreadNotifications } from "@/services/notification";
import { Notification } from "@prisma/client";

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
  rejectionReason?: string;
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
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [inquiryToCancel, setInquiryToCancel] = useState<Inquiry | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const data = await getUnreadNotifications();
      setUnreadNotifications(data);
    };
    fetchNotifications();
  }, []);

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

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    setShowCancelReason(true);
  };

  const handleFinalCancel = async () => {
    if (!inquiryToCancel) return;

    setIsCancelling(true);
    setError(null);

    try {
      const response = await fetch(`/api/inquiries/${inquiryToCancel.id}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: cancelReason || "No reason specified" }),
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
      setShowCancelReason(false);
      setInquiryToCancel(null);
      setCancelReason("");
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
            <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-900/20 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
              <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <Search className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2">
                No Inquiries Found
              </h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">
                You haven't sent any inquiries yet. Start exploring boarding houses to find your perfect room.
              </p>
              <Button 
                onClick={() => router.push("/")}
                className="rounded-xl px-10 py-3 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
              >
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
              {filteredInquiries.map((inquiry) => {
                const hasNotification = unreadNotifications.some(n => 
                  n.link.includes(inquiry.id) && !n.isRead
                );
                
                return (
                  <motion.div key={inquiry.id} variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}>
                    <InquiryCard
                      inquiry={inquiry}
                      hasNotification={hasNotification}
                      onViewDetails={() => setSelectedInquiry(inquiry)}
                      onCancel={
                        inquiry.status === "PENDING"
                          ? () => handleCancelClick(inquiry)
                          : undefined
                      }
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Inquiry Details Modal */}
          {selectedInquiry && (
            <InquiryDetailsModal
              inquiry={selectedInquiry}
              isOpen={!!selectedInquiry}
              notification={unreadNotifications.find(n => n.link.includes(selectedInquiry.id))}
              onClose={() => {
                // Optimistically clear the notification for this specific inquiry
                setUnreadNotifications(prev => prev.filter(n => !n.link.includes(selectedInquiry.id)));
                setSelectedInquiry(null);
                router.refresh();
              }}
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

          {/* Inquiry Cancellation Reason Modal */}
          <Modal 
            isOpen={showCancelReason} 
            onClose={() => setShowCancelReason(false)} 
            width="md"
            title=""
          >
            <div className="overflow-hidden rounded-3xl">
              {/* Premium Header Banner */}
              <div className="bg-amber-500/10 p-6 border-b border-amber-500/10 flex items-start gap-4">
                <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/20">
                  <Info size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Withdrawal Reason</h3>
                  <p className="text-xs font-bold text-amber-600/70 uppercase tracking-widest leading-relaxed">
                    Help the host manage their room better
                  </p>
                </div>
              </div>

              <div className="p-8">
                <p className="text-sm text-gray-400 mb-8 font-medium leading-relaxed">
                  Please select why you are withdrawing this inquiry. This helps in record keeping and keeps the platform fair for others.
                </p>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { label: "Found another room already", icon: <Home size={18} /> },
                      { label: "Changed my mind about the location", icon: <MapPin size={18} /> },
                      { label: "Inquired by mistake", icon: <AlertCircle size={18} /> },
                      { label: "Room details don't fit my needs", icon: <FileText size={18} /> },
                      { label: "Stay dates no longer fit my schedule", icon: <Calendar size={18} /> },
                      { label: "Other", icon: <MoreHorizontal size={18} /> }
                    ].map((item, index) => (
                      <motion.button
                        key={item.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setCancelReason(item.label)}
                        className={`group flex items-center gap-4 px-5 py-4 rounded-[22px] border-2 transition-all duration-300 ${
                          cancelReason === item.label 
                            ? "border-primary bg-primary/5 text-primary shadow-xl shadow-primary/10 ring-4 ring-primary/5" 
                            : "border-gray-50 hover:border-gray-200 bg-gray-50/50 dark:bg-gray-900/50 dark:border-gray-800 dark:hover:border-gray-700 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl transition-colors ${
                          cancelReason === item.label 
                            ? "bg-primary text-white" 
                            : "bg-white dark:bg-gray-800 text-gray-400 group-hover:text-primary"
                        }`}>
                          {item.icon}
                        </div>
                        <span className="text-sm font-black tracking-tight">{item.label}</span>
                      </motion.button>
                    ))}
                  </div>

                  <AnimatePresence>
                    {cancelReason === "Other" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <textarea
                          placeholder="Please specify your reason here..."
                          className="w-full p-5 border-2 border-gray-100 dark:border-gray-800 dark:bg-gray-900 rounded-[22px] focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-sm font-medium transition-all min-h-[120px] dark:text-white"
                          onChange={(e) => setCancelReason(e.target.value)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-4 mt-10">
                  <Button
                    outline
                    onClick={() => setShowCancelReason(false)}
                    className="flex-1 rounded-2xl py-4 h-auto text-[11px] font-black uppercase tracking-widest border-2"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleFinalCancel}
                    isLoading={isCancelling}
                    disabled={!cancelReason}
                    className="flex-[2] rounded-2xl py-4 h-auto text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-primary/30"
                  >
                    Confirm Withdrawal
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}

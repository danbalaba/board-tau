"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Heading from "@/components/common/Heading";
import Button from "@/components/common/Button";
import ReservationCard from "@/components/reservations/ReservationCard";
import ReservationDetailsModal from "@/components/reservations/ReservationDetailsModal";
import PaymentModal from "@/components/reservations/PaymentModal";
import { Search, Filter, Loader2, ArrowUpDown, Clock, DollarSign, CheckCircle, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ModernSelect from "@/components/common/ModernSelect";
import ConfirmModal from "@/components/common/ConfirmModal";
import Modal from "@/components/modals/Modal";
import ModernLoader from "@/components/common/ModernLoader";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface ReservationListing {
  id: string;
  title: string;
  imageSrc: string;
  location: any;
  region?: string;
  country?: string;
}

interface ReservationRoom {
  id: string;
  name: string;
  price: number;
  roomType: string;
  images: Array<{
    id: string;
    url: string;
  }>;
}

interface Reservation {
  id: string;
  listingId: string;
  roomId: string;
  userId: string;
  startDate: string;
  endDate: string;
  durationInDays: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  preferredPaymentMethod?: string;
  paymentReference?: string;
  createdAt: string;
  listing: ReservationListing;
  room: ReservationRoom;
}

interface ReservationsClientProps {
  initialReservations: Reservation[];
  userId: string;
}

const ReservationsClient: React.FC<ReservationsClientProps> = ({
  initialReservations,
  userId,
}) => {
  const router = useRouter();
  const { data: session } = useSession();

  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>(initialReservations);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Air-gap buffer (800ms) to ensure root dots loader is completely gone
    const timer = setTimeout(() => {
      setIsMounted(true);
      // Now start the internal loading phase
      setIsLoading(true);
      
      const contentTimer = setTimeout(() => {
        setIsLoading(false);
      }, 1000); // Content load duration
      
      return () => clearTimeout(contentTimer);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const methodParam = searchParams.get("method");

  // Step 2b: Handle Auto-Sync on successful payment redirect
  useEffect(() => {
    if (statusParam === "success" && isMounted) {
      const syncPayment = async () => {
        const toastId = toast.loading("Verifying your payment... Just a moment!");
        
        try {
          // 1. Give it 1 second for the webhook to potentially beat us to it
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // 2. Call the manual sync API to force update the DB
          const response = await fetch("/api/reservations/sync-payment");
          const data = await response.json();
          
          if (data.success) {
            toast.success("Payment Received! Your room is now RESERVED.", { id: toastId, duration: 5000 });
            // 3. Force a refresh to show the "RESERVED" badge instantly
            router.refresh();
          } else {
             // Already sync-ed or no pending found, just refresh
             router.refresh();
             toast.dismiss(toastId);
          }
        } catch (error) {
          console.error("Sync error:", error);
          toast.error("Still processing... Try refreshing manually in a bit.", { id: toastId });
        }
      };

      syncPayment();
    }
    
    if (statusParam === "cancelled" && isMounted) {
       toast.error("Payment was cancelled or failed. Please try again.");
    }
  }, [statusParam, isMounted, router]);

  // Handle Loading state during filtering/sorting/searching
  useEffect(() => {
    if (!isMounted) return;

    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600); // Quick sync feel

    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, sortBy, isMounted]);

  // Filter and sort reservations
  useEffect(() => {
    let filtered = [...reservations];

    // Apply status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.room.name.toLowerCase().includes(query) ||
        r.listing.title.toLowerCase().includes(query) ||
        (r.listing.region && r.listing.region.toLowerCase().includes(query)) ||
        (r.listing.country && r.listing.country.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "price-high") {
        return b.totalPrice - a.totalPrice;
      } else if (sortBy === "price-low") {
        return a.totalPrice - b.totalPrice;
      }
      return 0;
    });

    setFilteredReservations(filtered);
  }, [reservations, statusFilter, searchQuery, sortBy]);

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowDetailsModal(true);
  };

  const handlePayNow = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setShowDetailsModal(false);
    setShowPaymentModal(true);
  };

  const handleCancelClick = (reservation: Reservation) => {
    setReservationToCancel(reservation);
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = async () => {
    if (!reservationToCancel) return;

    setIsCancelling(true);
    try {
      const response = await fetch(`/api/reservations/${reservationToCancel.id}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to cancel reservation");
      }

      // Update local state
      setReservations(prev =>
        prev.map(r =>
          r.id === reservationToCancel.id
            ? { ...r, status: "CANCELLED" as any }
            : r
        )
      );
      setShowDetailsModal(false);
      setShowCancelConfirm(false);
      setReservationToCancel(null);
    } catch (error: any) {
      alert(error.message || "An error occurred");
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Refresh the page to get updated data
    router.refresh();
  };

  const statusOptions = [
    { value: "ALL", label: "All", color: "bg-gray-400" },
    { value: "PENDING_PAYMENT", label: "Pending", color: "bg-amber-500" },
    { value: "RESERVED", label: "Reserved", color: "bg-emerald-500" },
    { value: "CANCELLED", label: "Cancelled", color: "bg-rose-500" },
    { value: "EXPIRED", label: "Expired", color: "bg-gray-500" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest", icon: <Clock size={16} /> },
    { value: "oldest", label: "Oldest", icon: <Clock size={16} className="opacity-50" /> },
    { value: "price-high", label: "Price: High", icon: <DollarSign size={16} /> },
    { value: "price-low", label: "Price: Low", icon: <DollarSign size={16} className="opacity-50" /> },
  ];

  if (!isMounted) return null;

  return (
    <section className="main-container">
      <Heading
        title="My Reservations"
        subtitle="Manage your approved boarding house reservations"
        backBtn
      />

      {/* Filters and Search - Always visible */}
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
            placeholder="Search by room name or location..."
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
          onChange={setStatusFilter}
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
          <ModernLoader text="Syncing your reservations..." />
        </div>
      ) : (
        <>
          {/* Reservations Grid */}
          {filteredReservations.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold text-text-primary dark:text-gray-100 mb-2">
                No Reservations Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                You haven't made any reservations yet. Start by sending an inquiry to find your perfect room.
              </p>
              <Button onClick={() => router.push("/inquiries")}>
                View My Inquiries
              </Button>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mt-8"
            >
              {filteredReservations.map((reservation) => (
                <motion.div key={reservation.id} variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}>
                  <ReservationCard
                    reservation={reservation}
                    onViewDetails={() => handleViewDetails(reservation)}
                    onPayNow={() => handlePayNow(reservation)}
                    onCancel={() => handleCancelClick(reservation)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      )}

      {/* Reservation Details Modal */}
      {selectedReservation && (
        <ReservationDetailsModal
          reservation={selectedReservation}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          onPayNow={() => {
            setShowDetailsModal(false);
            setShowPaymentModal(true);
          }}
          onCancel={() => handleCancelClick(selectedReservation)}
        />
      )}

      {/* Cancel Confirmation Modal */}
      <Modal 
        isOpen={showCancelConfirm} 
        onClose={() => setShowCancelConfirm(false)} 
        width="sm"
      >
        <ConfirmModal
          isOpen={showCancelConfirm}
          onClose={() => setShowCancelConfirm(false)}
          onConfirm={handleConfirmCancel}
          title="Cancel Reservation?"
          message={reservationToCancel ? `Are you sure you want to cancel your reservation for ${reservationToCancel.room.name}? This action cannot be undone.` : ""}
          confirmLabel="Yes, Cancel"
          cancelLabel="No, Keep It"
          isLoading={isCancelling}
          variant="danger"
        />
      </Modal>

      {/* Payment Modal */}
      {selectedReservation && (
        <PaymentModal
          reservation={selectedReservation}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </section>
  );
};

export default ReservationsClient;

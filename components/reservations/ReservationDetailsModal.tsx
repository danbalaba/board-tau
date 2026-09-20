"use client";
import React, { useState, useMemo, useCallback } from "react";
import Modal from "../modals/Modal";
import { 
  X, 
  Calendar, 
  CreditCard, 
  Clock, 
  Home, 
  MapPin, 
  CheckCircle as IconCircleCheck, 
  ChevronLeft, 
  ChevronRight, 
  FileText,
  Mail,
  User,
  Tag
} from "lucide-react";
import SafeImage from "@/components/common/SafeImage";
import { cn } from "@/utils/helper";
import { generateConfirmationSlipPDF } from "@/utils/slipGenerator";
import { generateLeaseContractPDF, previewPdfBlob } from "@/utils/contractPdfGenerator";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import { NotificationItem } from "@/context/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface ReservationListing {
  id: string;
  userId?: string;
  title: string;
  imageSrc: string;
  location: any;
  region?: string;
  country?: string;
  images?: Array<{ url: string }>;
  propertyType?: any;
}

interface ReservationRoom {
  id: string;
  name: string;
  price: number;
  reservationFee: number;
  roomType?: string;
  roomTypeDefinition?: {
    id?: string;
    name: string;
  };
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
  occupantsCount?: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  paymentReference?: string;
  createdAt: string;
  hasReview?: boolean;
  listing: ReservationListing;
  room: ReservationRoom;
}

interface ReservationDetailsModalProps {
  reservation: Reservation;
  isOpen: boolean;
  currentUserId: string;
  onClose: () => void;
  onPayNow?: () => void;
  onCancel?: () => void;
  onMarkAsRead?: () => void;
  notification?: NotificationItem;
  currentUserName?: string;
  currentUserEmail?: string;
}

const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({
  reservation,
  isOpen,
  currentUserId,
  onClose,
  onPayNow,
  onCancel,
  onMarkAsRead,
  notification,
  currentUserName = "Tenant",
  currentUserEmail = "tenant@example.com",
}) => {
  const router = useRouter();
  const responsiveToast = useResponsiveToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeNotification, setActiveNotification] = useState(notification);

  React.useEffect(() => {
    if (notification && !activeNotification) {
      setActiveNotification(notification);
    }
  }, [notification, activeNotification]);

  React.useEffect(() => {
    if (activeNotification) {
      const timer = setTimeout(() => {
        setActiveNotification(undefined);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [activeNotification]);

  React.useEffect(() => {
    if (!isOpen) {
      setActiveNotification(undefined);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (isOpen && activeNotification) {
      if (onMarkAsRead) {
        onMarkAsRead();
      }
    }
  }, [isOpen, activeNotification, onMarkAsRead]);

  const images = useMemo(() => reservation?.room?.images || [], [reservation?.room?.images]);

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return {
          label: "Payment Pending",
          className: "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border-amber-300 dark:border-amber-800",
        };
      case "RESERVED":
        return {
          label: "Reservation Confirmed",
          className: "bg-primary/10 text-primary-dark dark:bg-primary/20 dark:text-primary-light border-primary/20",
        };
      case "CHECKED_IN":
        return {
          label: "Currently Checked In",
          className: "bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-200 border-blue-300 dark:border-blue-800",
        };
      case "COMPLETED":
        return {
          label: "Stay Completed",
          className: "bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-200 border-purple-300 dark:border-purple-800",
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700",
        };
      default:
        return {
          label: status.replace("_", " "),
          className: "bg-gray-100 text-gray-800 border-gray-300",
        };
    }
  }, []);

  const getPaymentBadge = useCallback((status: string) => {
    switch (status) {
      case "PAID":
        return {
          label: "Paid",
          className: "bg-primary/10 text-primary-dark dark:bg-primary/20 dark:text-primary-light border-primary/20",
        };
      case "PENDING":
        return {
          label: "Pending",
          className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800",
        };
      case "FAILED":
        return {
          label: "Failed",
          className: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800",
        };
      default:
        return {
          label: status,
          className: "bg-gray-100 text-gray-800 border-gray-300",
        };
    }
  }, []);

  const displayLocation = useMemo(() => [
    reservation?.listing?.region,
    reservation?.listing?.country
  ].filter(Boolean).join(", "), [reservation?.listing?.region, reservation?.listing?.country]);

  const landlordId = useMemo(() => String(reservation?.listing?.userId || "").trim(), [reservation?.listing]);

  if (!isOpen || !reservation) return null;

  const canPay = reservation.status === "PENDING_PAYMENT";
  const statusInfo = getStatusBadge(reservation.status);
  const paymentInfo = getPaymentBadge(reservation.paymentStatus);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} width="xl" hasFixedFooter={true} fullOnMobile={true}>
        <div className="flex flex-col h-full sm:h-auto max-h-full sm:max-h-[82vh] overflow-hidden">
          
          {/* Header Bar */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center shrink-0 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <Calendar size={20} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight">
                  Reservation Details
                </h2>
                <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 truncate max-w-[180px] sm:max-w-none">
                  {reservation.listing.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className={cn("px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold border shadow-sm", statusInfo.className)}>
                {statusInfo.label}
              </span>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable Content Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-4 sm:space-y-6 bg-slate-50/70 dark:bg-gray-950 custom-scrollbar overscroll-contain [transform:translateZ(0)]">
            
            {/* Notification Banner (if any) */}
            {activeNotification && (
              <div className={cn(
                "p-5 border rounded-2xl flex items-start gap-3.5 shadow-sm",
                reservation.status === "COMPLETED"
                  ? "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/60 text-purple-900 dark:text-purple-100"
                  : "bg-primary/10 dark:bg-primary/20 border-primary/20 text-primary-dark dark:text-primary-light"
              )}>
                <div className={cn(
                  "p-2 text-white rounded-xl shrink-0 mt-0.5 shadow-sm",
                  reservation.status === "COMPLETED" ? "bg-purple-600" : "bg-primary"
                )}>
                  <IconCircleCheck size={20} />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs font-black uppercase tracking-wider">
                    {activeNotification.title}
                  </h4>
                  <p className="text-xs font-medium leading-relaxed">
                    {activeNotification.description}
                  </p>
                </div>
              </div>
            )}

            {/* 2-Column Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column: Room Showcase & Financial Summary */}
              <div className="space-y-6">
                
                {/* Room Showcase Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                  <div className="aspect-video w-full relative group/gallery bg-gray-100 dark:bg-gray-800">
                    <SafeImage
                      src={images.length > 0 
                        ? images[currentImageIndex]?.url 
                        : (reservation.listing?.images && reservation.listing.images.length > 0)
                          ? reservation.listing.images[0].url
                          : reservation.listing.imageSrc || "/images/placeholder.jpg"
                      }
                      alt={reservation.room.name}
                      unoptimized={true}
                    />

                    {images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover/gallery:opacity-100 transition-opacity hover:bg-black/80"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover/gallery:opacity-100 transition-opacity hover:bg-black/80"
                        >
                          <ChevronRight size={18} />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {images.map((_, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "w-1.5 h-1.5 rounded-full transition-all",
                                idx === currentImageIndex ? "bg-white w-4" : "bg-white/50"
                              )}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight line-clamp-1">
                        {reservation.room.name}
                      </h3>
                      <p className="text-xs font-bold text-primary flex items-center gap-1.5 mt-1">
                        <Home size={14} />
                        <span>{reservation.listing.title}</span>
                      </p>
                    </div>

                    {displayLocation && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                        <MapPin size={14} className="text-rose-500 shrink-0" />
                        <span className="truncate">{displayLocation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Details Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                      <CreditCard size={14} className="text-primary" />
                      <span>Payment Details</span>
                    </h4>
                    <span className={cn("px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase border", paymentInfo.className)}>
                      {paymentInfo.label}
                    </span>
                  </div>

                  <div className="space-y-3.5 divide-y divide-gray-100 dark:divide-gray-800">
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <Tag size={15} className="text-primary shrink-0" />
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Reservation Holding Fee</span>
                      </div>
                      <span className="text-base font-black text-gray-900 dark:text-white">
                        ₱{Number(reservation.totalPrice || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Expected Monthly Rent</span>
                      <span className="text-sm font-black text-gray-900 dark:text-white">
                        ₱{Number(reservation.room.price || 0).toLocaleString()} <span className="text-xs font-semibold text-gray-400">/ mo</span>
                      </span>
                    </div>

                    {reservation.paymentMethod && (
                      <div className="pt-3 flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Payment Transfer Method</span>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900 dark:text-white capitalize">
                            {reservation.paymentMethod.toLowerCase()} Transfer
                          </span>
                          {reservation.paymentReference && (
                            <span className="text-xs font-mono font-semibold text-gray-500 dark:text-gray-400">
                              Ref: {reservation.paymentReference}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Schedule & Booking Details */}
              <div className="space-y-6">
                
                {/* Stay Schedule Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <Calendar size={14} className="text-primary" />
                    <span>Stay Schedule</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-xl text-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary-dark dark:text-primary-light block mb-1">
                        Check-in Date
                      </span>
                      <span className="text-xs font-black text-primary-dark dark:text-white">
                        {formatDate(reservation.startDate)}
                      </span>
                    </div>

                    <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl text-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 block mb-1">
                        Check-out Date
                      </span>
                      <span className="text-xs font-black text-amber-950 dark:text-amber-100">
                        {formatDate(reservation.endDate)}
                      </span>
                    </div>
                  </div>

                  {Boolean(reservation.durationInDays) && (
                    <div className="p-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300">
                      <Clock size={14} className="text-primary" />
                      <span>Total Stay Duration: {reservation.durationInDays} Nights</span>
                    </div>
                  )}
                </div>

                {/* Booking Details Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <User size={14} className="text-primary" />
                    <span>Booking Details</span>
                  </h4>

                  <div className="space-y-3.5 divide-y divide-gray-100 dark:divide-gray-800">
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Room Type</span>
                      <span className="text-xs font-black text-gray-900 dark:text-white uppercase">
                        {(reservation.room as any)?.roomTypeDefinition?.name || (reservation.room as any)?.roomType || (typeof (reservation.listing as any)?.propertyType === 'object' ? (reservation.listing as any)?.propertyType?.name : (reservation.listing as any)?.propertyType) || (Array.isArray((reservation.listing as any)?.category) ? (reservation.listing as any)?.category[0] : (reservation.listing as any)?.category) || "Solo Room"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Number of Guests</span>
                      <span className="text-xs font-black text-gray-900 dark:text-white">
                        {reservation.occupantsCount === 1 ? "1 Guest" : `${reservation.occupantsCount || 1} Guests`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Booking Reference ID</span>
                      <span className="text-xs font-mono font-bold text-gray-900 dark:text-white truncate max-w-[160px]">
                        {reservation.id}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Simple Clean Timestamp */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 text-center">
              <p className="text-[11px] font-bold text-gray-400 flex items-center justify-center gap-1.5">
                <Clock size={12} />
                <span>Reserved on {formatDate(reservation.createdAt)}</span>
              </p>
            </div>

          </div>

          {/* Action Footer */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-lg">
            <button
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors text-center"
              onClick={onClose}
            >
              Close
            </button>
            
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-end gap-2.5 w-full sm:w-auto">
              <button
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-black uppercase tracking-wider text-primary bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 rounded-xl transition-all flex items-center justify-center gap-2"
                onClick={() => router.push(`/messages?listingId=${reservation.listingId}&otherUserId=${landlordId}`)}
              >
                <Mail size={14} />
                <span>Chat with Host</span>
              </button>

              {(reservation.status === "RESERVED" || reservation.status === "CHECKED_IN" || reservation.status === "COMPLETED") && (
                <>
                  <button
                    className="w-full sm:w-auto px-4 py-2.5 text-xs font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-xl transition-all flex items-center justify-center gap-2"
                    onClick={() => {
                      responsiveToast.loading("Preparing boarding pass...");
                      generateConfirmationSlipPDF(reservation, currentUserName, currentUserEmail)
                        .then(() => responsiveToast.success("Boarding pass downloaded!"))
                        .catch(() => responsiveToast.error("Could not generate boarding pass."));
                    }}
                  >
                    <IconCircleCheck size={14} />
                    <span>Boarding Pass</span>
                  </button>

                  <button
                    className="w-full sm:w-auto px-4 py-2.5 text-xs font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-xl transition-all flex items-center justify-center gap-2"
                    onClick={async () => {
                      const toastId = responsiveToast.loading("Preparing lease contract...");
                      try {
                        const res = await fetch(`/api/contracts/generate?listingId=${reservation.listingId}&userId=${reservation.userId}&roomId=${reservation.roomId}`);
                        if (!res.ok) throw new Error("Failed to fetch contract data");
                        const data = await res.json();
                        if ((data.contractMode === 'CUSTOM_PDF' || data.customPdfUrl) && data.customPdfUrl) {
                          const success = await previewPdfBlob(data.customPdfUrl, "Custom Lease Contract Preview");
                          if (success) {
                            responsiveToast.success("Custom lease contract loaded!", { id: toastId });
                            return;
                          }
                        }
                        await generateLeaseContractPDF(`Lease_Contract_${reservation.listingId}`, data);
                        responsiveToast.success("Lease contract downloaded!", { id: toastId });
                      } catch (e) {
                        responsiveToast.error("Could not generate lease contract.", { id: toastId });
                      }
                    }}
                  >
                    <FileText size={14} />
                    <span>Lease Contract</span>
                  </button>
                </>
              )}

              {canPay && onPayNow && (
                <button
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-primary hover:bg-primary-dark rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
                  onClick={onPayNow}
                >
                  <CreditCard size={14} />
                  <span>Pay Now</span>
                </button>
              )}

              {onCancel && (
                <button
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-black uppercase tracking-wider text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 rounded-xl transition-all flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-800"
                  onClick={onCancel}
                >
                  <X size={14} />
                  <span>Cancel</span>
                </button>
              )}

              {reservation.status === "COMPLETED" && (
                <button
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-primary hover:bg-primary-dark rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  onClick={() => router.push(`/listings/${reservation.listingId}`)}
                >
                  <Home size={14} />
                  <span>View Listing</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </Modal>
    </>
  );
};

export default ReservationDetailsModal;

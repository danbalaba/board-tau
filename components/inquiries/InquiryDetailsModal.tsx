"use client";
import React, { useState, useMemo, useCallback } from "react";
import Modal from "../modals/Modal";
import { 
  X, 
  Calendar, 
  User, 
  Mail, 
  Home, 
  Info, 
  Clock, 
  Trash2, 
  MapPin, 
  Eye as IconEye, 
  CheckCircle as IconCircleCheck, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SafeImage from "@/components/common/SafeImage";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/helper";
import { getSafeImageSrcString } from "@/components/modals/inquiry-modal/InquiryModalUtils";
import { generateLeaseContractPDF, previewPdfBlob } from "@/utils/contractPdfGenerator";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import { NotificationItem } from "@/context/NotificationContext";

interface InquiryListing {
  id: string;
  userId?: string;
  title: string;
  imageSrc: string;
  location: any;
  region?: string;
  country?: string;
  images?: Array<{
    url: string;
  }>;
  propertyType?: any;
}

interface InquiryRoom {
  id: string;
  name: string;
  price: number;
  capacity: number;
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
  reservationFee: number;
  isSoloBuyout?: boolean;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  profilePhotoUrl?: string | null;
  idAttachmentUrl?: string | null;
  listing: InquiryListing;
  room: InquiryRoom;
}

interface InquiryDetailsModalProps {
  inquiry: Inquiry;
  isOpen: boolean;
  currentUserId: string;
  onClose: () => void;
  onCancel?: () => void;
  onMarkAsRead?: () => void;
  notification?: NotificationItem;
}

const InquiryDetailsModal: React.FC<InquiryDetailsModalProps> = ({
  inquiry,
  isOpen,
  currentUserId,
  onClose,
  onCancel,
  onMarkAsRead,
  notification,
}) => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeNotification, setActiveNotification] = useState(notification);
  const responsiveToast = useResponsiveToast();

  React.useEffect(() => {
    if (notification && !activeNotification) {
      setActiveNotification(notification);
    }
  }, [notification]);

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

  const images = useMemo(() => inquiry?.room?.images || [], [inquiry?.room?.images]);

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
      case "PENDING":
        return {
          label: "Pending Host Review",
          className: "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border-amber-300 dark:border-amber-800",
        };
      case "APPROVED":
        return {
          label: "Request Approved",
          className: "bg-primary/10 text-primary-dark dark:bg-primary/20 dark:text-primary-light border-primary/20",
        };
      case "REJECTED":
        return {
          label: "Not Accepted",
          className: "bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-200 border-rose-300 dark:border-rose-800",
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700",
        };
      case "EXPIRED":
        return {
          label: "Expired",
          className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700",
        };
      default:
        return {
          label: status,
          className: "bg-gray-100 text-gray-800 border-gray-300",
        };
    }
  }, []);

  const displayLocation = useMemo(() => [
    inquiry?.listing?.region,
    inquiry?.listing?.country
  ].filter(Boolean).join(", "), [inquiry?.listing?.region, inquiry?.listing?.country]);

  const landlordId = useMemo(() => String((inquiry?.listing as any)?.userId || "").trim(), [inquiry?.listing]);

  if (!isOpen || !inquiry) return null;

  const statusInfo = getStatusBadge(inquiry.status);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} width="xl" hasFixedFooter={true} fullOnMobile={true}>
        <div className="flex flex-col h-full sm:h-auto max-h-full sm:max-h-[82vh] overflow-hidden">
          
          {/* Clean Modern Header */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center shrink-0 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight">
                  Inquiry Details
                </h2>
                <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 truncate max-w-[180px] sm:max-w-none">
                  {inquiry.listing.title}
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
            
            {/* Host Feedback Alert (Rejection) */}
            {inquiry.status === "REJECTED" && inquiry.rejectionReason && (
              <div className="p-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl flex items-start gap-3.5 shadow-sm">
                <div className="p-2 bg-rose-500 text-white rounded-xl shrink-0 mt-0.5 shadow-sm">
                  <Info size={18} />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">
                    Note from Property Owner
                  </h4>
                  <p className="text-sm font-medium text-rose-900 dark:text-rose-100 leading-relaxed italic">
                    "{inquiry.rejectionReason}"
                  </p>
                </div>
              </div>
            )}

            {/* Host Approval Notification Alert */}
            {activeNotification && inquiry.status === "APPROVED" && (
              <div className="p-5 bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start gap-3.5">
                  <div className="p-2 bg-primary text-white rounded-xl shrink-0 shadow-sm">
                    <IconCircleCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-primary-dark dark:text-primary-light">
                      Request Approved!
                    </h4>
                    <p className="text-xs font-bold text-primary dark:text-primary-light mt-0.5">
                      Your room inquiry has been accepted by the host.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/reservations")}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-primary/20 shrink-0"
                >
                  View Reservations
                </button>
              </div>
            )}

            {/* 2-Column Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column: Room Photo & Pricing */}
              <div className="space-y-6">
                
                {/* Room Showcase Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                  <div className="aspect-video w-full relative group/gallery bg-gray-100 dark:bg-gray-800">
                    <SafeImage
                      src={getSafeImageSrcString(
                        images.length > 0 
                          ? images[currentImageIndex]?.url 
                          : (inquiry.listing?.images && inquiry.listing.images.length > 0)
                            ? inquiry.listing.images[0].url
                            : inquiry.listing?.imageSrc || "/images/placeholder.jpg"
                      )}
                      alt={inquiry.room.name}
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
                        {inquiry.room.name}
                      </h3>
                      <p className="text-xs font-bold text-primary flex items-center gap-1.5 mt-1">
                        <Home size={14} />
                        <span>{inquiry.listing.title}</span>
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

                {/* Rental Costs Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <CreditCard size={14} className="text-primary" />
                    <span>Payment Details</span>
                  </h4>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Monthly Rent</span>
                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                      ₱{Number(inquiry.room.price || 0).toLocaleString()} <span className="text-xs font-semibold text-gray-400">/ mo</span>
                    </span>
                  </div>

                  {Boolean(inquiry.reservationFee) && (
                    <div className="p-3.5 bg-primary/5 dark:bg-primary/15 border border-primary/20 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Tag size={16} className="text-primary shrink-0" />
                        <div>
                          <span className="text-xs font-black text-primary-dark dark:text-primary-light block">
                            Reservation Holding Fee
                          </span>
                          <span className="text-[11px] font-medium text-primary/80 dark:text-primary-light/80">
                            Guarantees your slot until check-in
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-black text-primary-dark dark:text-primary-light shrink-0">
                        ₱{Number(inquiry.reservationFee).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stay Dates Card */}
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
                        {formatDate(inquiry.moveInDate)}
                      </span>
                    </div>

                    <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl text-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 block mb-1">
                        Check-out Date
                      </span>
                      <span className="text-xs font-black text-amber-950 dark:text-amber-100">
                        {formatDate(inquiry.checkOutDate)}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Guest Information & Note */}
              <div className="space-y-6">
                
                {/* Guest Details Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <User size={14} className="text-primary" />
                    <span>Guest Details</span>
                  </h4>

                  <div className="space-y-3.5 divide-y divide-gray-100 dark:divide-gray-800">
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Room Type</span>
                      <span className="text-xs font-black text-gray-900 dark:text-white uppercase">
                        {(inquiry.room as any)?.roomTypeDefinition?.name || (inquiry.room as any)?.roomType || (typeof (inquiry.listing as any)?.propertyType === 'object' ? (inquiry.listing as any)?.propertyType?.name : (inquiry.listing as any)?.propertyType) || (Array.isArray((inquiry.listing as any)?.category) ? (inquiry.listing as any)?.category[0] : (inquiry.listing as any)?.category) || "Solo Room"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Number of Guests</span>
                      <span className="text-xs font-black text-gray-900 dark:text-white">
                        {inquiry.isSoloBuyout 
                          ? "1 Guest (Private Entire Room)" 
                          : inquiry.occupantsCount === 1 
                            ? "1 Guest" 
                            : `${inquiry.occupantsCount} Guests`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Message to Host (if any) */}
                {inquiry.message && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                      <MessageSquare size={14} className="text-primary" />
                      <span>Note to Host</span>
                    </h4>
                    <p className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 italic border-l-4 border-primary leading-relaxed">
                      "{inquiry.message}"
                    </p>
                  </div>
                )}

                {/* Identity Verification Documents (if uploaded) */}
                {(inquiry.profilePhotoUrl || inquiry.idAttachmentUrl) && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                      <ShieldCheck size={14} className="text-primary" />
                      <span>Identity Documents</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      {inquiry.profilePhotoUrl && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black uppercase text-gray-400 block">Selfie Photo</span>
                          <div
                            className="aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 cursor-zoom-in group relative shadow-sm"
                            onClick={() => setPreviewImage(inquiry.profilePhotoUrl || null)}
                          >
                            <SafeImage src={inquiry.profilePhotoUrl} alt="Selfie" unoptimized={true} />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <IconEye size={20} className="text-white" />
                            </div>
                          </div>
                        </div>
                      )}

                      {inquiry.idAttachmentUrl && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black uppercase text-gray-400 block">Valid ID Card</span>
                          <div
                            className="aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 cursor-zoom-in group relative shadow-sm"
                            onClick={() => setPreviewImage(inquiry.idAttachmentUrl || null)}
                          >
                            <SafeImage src={inquiry.idAttachmentUrl} alt="ID Document" unoptimized={true} />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <IconEye size={20} className="text-white" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Clean Simple Footer Stamp */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 text-center">
              <p className="text-[11px] font-bold text-gray-400 flex items-center justify-center gap-1.5">
                <Clock size={12} />
                <span>Sent on {formatDate(inquiry.createdAt)}</span>
              </p>
            </div>

          </div>

          {/* Clean Action Footer */}
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
                onClick={() => router.push(`/messages?listingId=${inquiry.listingId}&otherUserId=${landlordId}`)}
              >
                <Mail size={14} />
                <span>Chat with Host</span>
              </button>

              <button
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-black uppercase tracking-wider text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl transition-all flex items-center justify-center gap-2"
                onClick={async () => {
                  const toastId = responsiveToast.loading("Preparing lease contract...");
                  try {
                    const res = await fetch(`/api/contracts/generate?listingId=${inquiry.listingId}&userId=${inquiry.userId}&roomId=${inquiry.roomId}`);
                    if (!res.ok) throw new Error("Failed to fetch contract data");
                    const data = await res.json();
                    if ((data.contractMode === 'CUSTOM_PDF' || data.customPdfUrl) && data.customPdfUrl) {
                      const success = await previewPdfBlob(data.customPdfUrl, "Custom Lease Contract Preview");
                      if (success) {
                        responsiveToast.success("Custom lease contract loaded!", { id: toastId });
                        return;
                      }
                    }
                    await generateLeaseContractPDF(`Lease_Contract_${inquiry.listingId}`, data);
                    responsiveToast.success("Lease contract downloaded!", { id: toastId });
                  } catch (e) {
                    responsiveToast.error("Could not generate lease contract.", { id: toastId });
                  }
                }}
              >
                <FileText size={14} />
                <span>Lease Contract</span>
              </button>

              {onCancel && inquiry.status === "PENDING" && (
                <button
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 rounded-xl transition-all flex items-center justify-center gap-2"
                  onClick={onCancel}
                >
                  <Trash2 size={14} />
                  <span>Cancel Request</span>
                </button>
              )}
              
              {inquiry.status === "REJECTED" && (
                <button
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-primary hover:bg-primary-dark rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
                  onClick={() => router.push(`/listings/${inquiry.listingId}?room=${inquiry.roomId}&autoInquire=true`)}
                >
                  <Home size={14} />
                  <span>Apply Again</span>
                </button>
              )}
              
              {inquiry.status === "APPROVED" && (
                <button
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-primary hover:bg-primary-dark rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
                  onClick={() => router.push("/reservations")}
                >
                  <IconCircleCheck size={14} />
                  <span>View Reservation</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </Modal>

      {/* Enlarged Photo Overlay */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[20000] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              onClick={() => setPreviewImage(null)}
            >
              <X size={20} />
            </motion.button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-[90vw] h-[80vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <SafeImage
                src={previewImage as string}
                alt="Enlarged Document"
                unoptimized={true}
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InquiryDetailsModal;

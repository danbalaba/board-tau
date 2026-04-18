"use client";
import React, { useState } from "react";
import Modal from "../modals/Modal";
import Button from "@/components/common/Button";
import { X, Calendar, User, Mail, Phone, Home, Info, Clock, Trash2, MapPin, Tag, Eye as IconEye, CheckCircle as IconCircleCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/helper";

interface InquiryListing {
  id: string;
  title: string;
  imageSrc: string;
  location: any;
  region?: string;
  country?: string;
  images?: Array<{
    url: string;
  }>;
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
  reservationFee: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  profilePhotoUrl?: string | null;
  idAttachmentUrl?: string | null;
  listing: InquiryListing;
  room: InquiryRoom;
}

import { markEntityNotificationsAsRead } from "@/services/notification";
import { Notification } from "@prisma/client";

interface InquiryDetailsModalProps {
  inquiry: Inquiry;
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void;
  notification?: Notification;
}

const InquiryDetailsModal: React.FC<InquiryDetailsModalProps> = ({
  inquiry,
  isOpen,
  onClose,
  onCancel,
  notification,
}) => {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  React.useEffect(() => {
    if (isOpen && notification) {
      markEntityNotificationsAsRead("inquiry", inquiry.id);
    }
  }, [isOpen, notification, inquiry.id]);
  const images = inquiry.room.images || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100/50 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 border border-amber-200/50 dark:border-amber-800/50";
      case "APPROVED":
        return "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light border border-primary/20 dark:border-primary-light/20";
      case "REJECTED":
        return "bg-red-100/50 text-red-800 dark:bg-red-900/40 dark:text-red-200 border border-red-200/50 dark:border-red-800/50";
      case "CANCELLED":
      case "EXPIRED":
        return "bg-gray-100/50 text-gray-800 dark:bg-gray-700/40 dark:text-gray-200 border border-gray-200/50 dark:border-gray-600/50";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const displayLocation = [
    inquiry.listing.region,
    inquiry.listing.country
  ].filter(Boolean).join(", ");

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} width="xl" hasFixedFooter={true}>
        <div className="flex flex-col max-h-[70vh] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 ml-4 tracking-tight">
              Inquiry Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors group"
            >
              <X className="text-xl text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
            </button>
          </div>

          {/* Content Section */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/50 dark:bg-gray-900/50 custom-scrollbar">
            {notification && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-6 border rounded-[32px] flex flex-col gap-4 shadow-sm",
                  inquiry.status === "APPROVED" 
                    ? "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-900/50" 
                    : "bg-rose-500/10 dark:bg-rose-500/20 border-rose-200 dark:border-rose-900/50"
                )}
              >
                <div className="flex gap-4 items-start">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg",
                    inquiry.status === "APPROVED" 
                      ? "bg-emerald-500 shadow-emerald-500/20" 
                      : "bg-rose-500 shadow-rose-500/20"
                  )}>
                    {inquiry.status === "APPROVED" ? <IconCircleCheck size={20} /> : <Info size={20} />}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className={cn(
                      "text-sm font-black uppercase tracking-widest leading-none mb-1",
                      inquiry.status === "APPROVED" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    )}>
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                      {notification.description}
                    </p>
                  </div>
                </div>

                {inquiry.status === "APPROVED" && (
                  <div className="pt-4 border-t border-emerald-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                      Your room has been successfully moved to your reservations.
                    </p>
                    <button
                      onClick={() => router.push("/reservations")}
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 px-6 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-emerald-600/20"
                    >
                      Go to Reservations
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {inquiry.status === "REJECTED" && inquiry.rejectionReason && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-rose-50/50 dark:bg-rose-900/10 border-2 border-rose-100 dark:border-rose-800 rounded-[32px] overflow-hidden relative shadow-sm"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                   <Info size={80} className="text-rose-500" />
                </div>
                <div className="relative flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-lg">
                      <Info size={14} strokeWidth={3} />
                    </div>
                    <h4 className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Feedback from Host</h4>
                  </div>
                  <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl italic text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed border border-rose-100/50">
                    "{inquiry.rejectionReason}"
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Room & pricing */}
              <div className="space-y-6">
                {/* Room Showcase - Integrated as per user request */}
                <div className="bg-white dark:bg-gray-800 rounded-[32px] overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm relative group">
                    <div className="aspect-video w-full relative">
                        <img
                            src={inquiry.listing.imageSrc || "/images/placeholder.jpg"}
                            alt={inquiry.room.name}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md border border-white/20 ${getStatusColor(inquiry.status)}`}>
                                {inquiry.status}
                            </span>
                        </div>
                    </div>
                    <div className="p-6">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight line-clamp-1">{inquiry.room.name}</h3>
                        <div className="flex items-center gap-2 text-primary font-bold mb-4">
                            <Home size={16} />
                            <span className="text-sm uppercase tracking-wide truncate">{inquiry.listing.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-bold bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                            <MapPin size={14} className="text-rose-500" />
                            {displayLocation || "Location Verified"}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Pricing Summary</h3>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-4xl font-black text-gray-900 dark:text-white">₱ {inquiry.room.price.toLocaleString()}</span>
                    <span className="text-sm font-medium text-gray-400 mb-1.5 uppercase tracking-wide">/ month</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10">
                    <div className="flex items-center gap-3">
                      <Tag size={18} className="text-primary dark:text-primary-light" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-primary dark:text-primary-light uppercase tracking-widest">Reservation Fee</span>
                        <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                          {inquiry.occupantsCount} {inquiry.occupantsCount === 1 ? 'Person' : 'People'} × ₱{((inquiry.room as any).reservationFee || ((inquiry as any).reservationFee / (inquiry.occupantsCount || 1))).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <span className="text-base font-black text-gray-900 dark:text-white">
                      ₱ {(inquiry as any).reservationFee?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Schedule Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-[28px] border border-emerald-100 dark:border-emerald-800/50 flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100 mb-3">
                        <Calendar size={20} />
                      </div>
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Move In</span>
                      <span className="text-sm font-black text-emerald-950 dark:text-emerald-100">{formatDate(inquiry.moveInDate)}</span>
                    </div>
                    <div className="p-5 bg-amber-50 dark:bg-amber-900/20 rounded-[28px] border border-amber-100 dark:border-amber-800/50 flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-amber-500 shadow-sm border border-amber-50 mb-3">
                        <Clock size={20} />
                      </div>
                      <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Check Out</span>
                      <span className="text-sm font-black text-amber-950 dark:text-amber-100">{formatDate(inquiry.checkOutDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Occupant info & Message */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
                   <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Occupant Information</h3>
                   <div className="space-y-5">
                      <div className="flex flex-col gap-1 mb-2">
                         <span className="text-[10px] block font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Inquiring for Listing</span>
                         <div className="flex items-center gap-2 text-primary font-black text-sm">
                            <Home size={14} />
                            {inquiry.listing.title}
                         </div>
                      </div>
                      <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="w-12 h-12 rounded-[18px] bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center text-gray-400">
                          <User size={24} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] block font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Room Type</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{inquiry.room.roomType}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="w-12 h-12 rounded-[18px] bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                          {inquiry.occupantsCount}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] block font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Occupants</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white">{inquiry.occupantsCount === 1 ? "Solo Occupant" : `${inquiry.occupantsCount} Occupants`}</span>
                        </div>
                      </div>
                   </div>
                </div>

                {inquiry.message && (
                  <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Message to Host</h3>
                    <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-l-[6px] border-primary italic text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                      "{inquiry.message}"
                    </div>
                  </div>
                )}

                {(inquiry.profilePhotoUrl || inquiry.idAttachmentUrl) && (
                  <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
                     <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Identity Verification</h3>
                     <div className="grid grid-cols-2 gap-4">
                        {inquiry.profilePhotoUrl && (
                          <div className="space-y-2">
                             <span className="text-[10px] block font-black text-gray-400 uppercase tracking-widest leading-none">Selfie Check</span>
                             <div 
                                className="aspect-square rounded-[24px] overflow-hidden border-2 border-gray-100 dark:border-gray-700 cursor-zoom-in group relative shadow-sm"
                                onClick={() => setPreviewImage(inquiry.profilePhotoUrl || null)}
                             >
                                <img src={inquiry.profilePhotoUrl} alt="Selfie" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                   <IconEye size={24} className="text-white" />
                                </div>
                             </div>
                          </div>
                        )}
                        {inquiry.idAttachmentUrl && (
                          <div className="space-y-2">
                             <span className="text-[10px] block font-black text-gray-400 uppercase tracking-widest leading-none">ID Capture</span>
                             <div 
                                className="aspect-square rounded-[24px] overflow-hidden border-2 border-gray-100 dark:border-gray-700 cursor-zoom-in group relative shadow-sm"
                                onClick={() => setPreviewImage(inquiry.idAttachmentUrl || null)}
                             >
                                <img src={inquiry.idAttachmentUrl} alt="ID card" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                   <IconEye size={24} className="text-white" />
                                </div>
                             </div>
                          </div>
                        )}
                     </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100 dark:border-gray-700 flex flex-col gap-2 opacity-50">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Clock size={10} /> Submitted on {formatDateTime(inquiry.createdAt)}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <Clock size={10} /> Last activity {formatDateTime(inquiry.updatedAt)}
                </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
            <button 
              className="w-full sm:w-auto px-8 py-3 text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" 
              onClick={onClose}
            >
              Go Back
            </button>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {onCancel && inquiry.status === "PENDING" && (
                <button 
                    className="w-full sm:w-auto px-10 py-3 text-xs font-black uppercase tracking-widest text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-100 dark:border-rose-800/50 rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all active:scale-95 flex items-center justify-center gap-2 group/cancel" 
                    onClick={onCancel}
                >
                    <Trash2 size={14} strokeWidth={3} className="group-hover/cancel:rotate-12 transition-transform" /> 
                    Withdraw Inquiry
                </button>
                )}
                {inquiry.status === "REJECTED" && (
                <button 
                    className="w-full sm:w-auto px-10 py-3 text-xs font-black uppercase tracking-widest text-white bg-primary rounded-2xl hover:bg-primary-dark shadow-xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 group/re" 
                    onClick={() => router.push(`/listings/${inquiry.listingId}?room=${inquiry.roomId}&autoInquire=true`)}
                >
                    <Home size={14} strokeWidth={3} className="group-hover/re:scale-110 transition-transform" /> 
                    Submit New Request
                </button>
                )}
                {inquiry.status === "APPROVED" && (
                <button 
                    className="w-full sm:w-auto px-10 py-3 text-xs font-black uppercase tracking-widest text-white bg-emerald-600 rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 group/app" 
                    onClick={() => router.push("/reservations")}
                >
                    <IconCircleCheck size={14} strokeWidth={3} className="group-hover/app:scale-110 transition-transform" /> 
                    View Reservations
                </button>
                )}
            </div>
          </div>
      </Modal>

      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1001] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              onClick={() => setPreviewImage(null)}
            >
              <X size={24} />
            </motion.button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full aspect-auto max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={previewImage as string} 
                alt="Enlarged preview" 
                className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border-4 border-white/5"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InquiryDetailsModal;

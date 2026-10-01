'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from '@/components/modals/Modal';
import { Inquiry } from '../hooks/use-inquiry-logic';
import Avatar from '@/components/common/Avatar';
import { 
  IconUser, 
  IconMail, 
  IconCalendar, 
  IconBuilding, 
  IconCreditCard, 
  IconCheck, 
  IconX,
  IconClock,
  IconMapPin,
  IconMessage,
  IconEye,
  IconDeviceMobile,
  IconChevronLeft,
  IconChevronRight,
  IconTag,
  IconFileText,
  IconShieldCheck
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import { getSafeImageSrcString } from '@/components/modals/inquiry-modal/InquiryModalUtils';
import SafeImage from '@/components/common/SafeImage';
import { LandlordInquiryDeclineModal } from './landlord-inquiry-decline-modal';
import { generateLeaseContractPDF, previewPdfBlob } from '@/utils/contractPdfGenerator';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import MediaPreviewOverlay from '@/components/common/MediaPreviewOverlay';

interface LandlordInquiryDetailsModalProps {
  inquiry: Inquiry | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string, reason?: string) => Promise<void>;
  isUpdatingStatus?: boolean;
}

export function LandlordInquiryDetailsModal({
  inquiry,
  isOpen,
  onClose,
  onUpdateStatus,
  isUpdatingStatus
}: LandlordInquiryDetailsModalProps) {
  const responsiveToast = useResponsiveToast();
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  
  // Media Overlay state
  const [mediaOverlay, setMediaOverlay] = useState<{
    isOpen: boolean;
    images: string[];
    currentIndex: number;
    title: string;
    isDocument?: boolean;
  }>({
    isOpen: false,
    images: [],
    currentIndex: 0,
    title: '',
    isDocument: false,
  });

  // States for signed URLs
  const [signedProfileUrl, setSignedProfileUrl] = useState<string | null>(null);
  const [signedIdUrl, setSignedIdUrl] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    if (isOpen && inquiry) {
      setIsInitialLoading(true);
      setShowRejectConfirm(false);
      setCurrentImageIndex(0);
      setSignedProfileUrl(inquiry.profilePhotoUrl || null);
      setSignedIdUrl(inquiry.idAttachmentUrl || null);
      setMediaOverlay({
        isOpen: false,
        images: [],
        currentIndex: 0,
        title: '',
        isDocument: false,
      });
      const timer = setTimeout(() => setIsInitialLoading(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, inquiry]);

  const formatDate = useCallback((dateStr: string | Date | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch (e) {
      return 'N/A';
    }
  }, []);

  const getStatusBadge = useCallback((status: string, reservationStatus?: string) => {
    if (reservationStatus === "COMPLETED") {
      return {
        label: "Stay Completed",
        className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
      };
    }
    if (reservationStatus === "CHECKED_IN") {
      return {
        label: "Checked In",
        className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      };
    }
    if (reservationStatus === "CANCELLED") {
      return {
        label: "Cancelled",
        className: "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200",
      };
    }

    switch (status) {
      case 'PENDING':
        return {
          label: 'Inquiry Pending',
          className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        };
      case 'APPROVED':
        return {
          label: 'Inquiry Approved',
          className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        };
      case 'REJECTED':
        return {
          label: 'Inquiry Declined',
          className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200',
        };
    }
  }, []);

  const roomImages = useMemo(() => {
    if (!inquiry) return [];
    if (inquiry.room?.images && inquiry.room.images.length > 0) {
      return inquiry.room.images.map(img => img.url);
    }
    if (inquiry.listing?.images && inquiry.listing.images.length > 0) {
      return inquiry.listing.images.map(img => img.url);
    }
    if (inquiry.listing?.imageSrc) {
      return [inquiry.listing.imageSrc];
    }
    return ['/images/placeholder.jpg'];
  }, [inquiry]);

  if (!isOpen || !inquiry) return null;

  const reservationStatus = (inquiry as any).reservations?.[0]?.status;
  const statusInfo = getStatusBadge(inquiry.status, reservationStatus);
  const reservationFee = (inquiry as any).reservationFee || inquiry.room?.reservationFee || 0;

  const handleAction = async (status: string, reason?: string) => {
    try {
      await onUpdateStatus(inquiry.id, status, reason);
      onClose();
    } catch (error) {
      // Handled upstream
    }
  };

  const isPastStay = inquiry.checkOutDate ? new Date(inquiry.checkOutDate) < new Date() : false;
  const canChat = (inquiry.status === 'PENDING' || inquiry.status === 'APPROVED') && !isPastStay && reservationStatus !== "COMPLETED" && reservationStatus !== "CANCELLED";

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} width="xl" hasFixedFooter={true} fullOnMobile={true}>
        <div className="flex flex-col h-full sm:h-auto max-h-full sm:max-h-[90vh] overflow-hidden bg-white dark:bg-gray-900 rounded-none sm:rounded-3xl">
          
          {/* Top Header Bar - Mobile Collision Proof */}
          <div className="px-3.5 sm:px-8 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 pr-2">
              <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0">
                <IconMail size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                    Inquiry Details
                  </h2>
                  <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border shadow-2xs sm:hidden shrink-0", statusInfo.className)}>
                    {statusInfo.label}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 truncate max-w-[130px] sm:max-w-md mt-0.5 leading-tight">
                  {inquiry.user.name || 'Tenant Inquiry'} • {inquiry.listing.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className={cn("hidden sm:inline-flex px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-xs", statusInfo.className)}>
                {statusInfo.label}
              </span>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer shrink-0"
                title="Close"
              >
                <IconX size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Main Content Area - Mobile & Desktop Responsive */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-7 space-y-3.5 sm:space-y-4 bg-slate-50/50 dark:bg-gray-950/60 custom-scrollbar overscroll-contain">
            {isInitialLoading ? (
              <div className="h-64 sm:h-96 flex flex-col items-center justify-center gap-3 py-12">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-lg" />
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-400">Loading Inquiry Details...</p>
              </div>
            ) : (
              <>
                {/* Solo Buyout Banner */}
            {inquiry.isSoloBuyout && (
              <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl sm:rounded-2xl flex items-center gap-3 shadow-xs text-amber-900 dark:text-amber-100">
                <div className="p-1.5 sm:p-2 bg-amber-600 text-white rounded-lg sm:rounded-xl shrink-0">
                  <IconEye size={16} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-wider leading-none mb-0.5 sm:mb-1">
                    Solo Buyout Request
                  </h4>
                  <p className="text-[10px] sm:text-xs font-medium leading-tight text-amber-800 dark:text-amber-200">
                    Reserving all <span className="font-bold">{(inquiry.room as any)?.capacity || 'bedspaces'}</span> for solo privacy.
                  </p>
                </div>
              </div>
            )}

            {/* Responsive 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-5 items-start">
              
              {/* Left Column: Property Showcase & Stay Schedule */}
              <div className="space-y-3.5 sm:space-y-4 flex flex-col">
                
                {/* Room Showcase Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-xs">
                  <div 
                    onClick={() => setMediaOverlay({
                      isOpen: true,
                      images: roomImages,
                      currentIndex: currentImageIndex,
                      title: `${inquiry.listing.title} - Showcase`,
                      isDocument: false,
                    })}
                    className="relative h-44 sm:h-60 w-full group/gallery bg-gray-100 dark:bg-gray-800 cursor-zoom-in overflow-hidden"
                  >
                    <SafeImage
                      src={getSafeImageSrcString(roomImages[currentImageIndex])}
                      alt={inquiry.listing.title}
                      className="w-full h-full object-cover group-hover/gallery:scale-105 transition-transform duration-500"
                      unoptimized={true}
                    />

                    {/* Preview overlay indicator */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/gallery:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-black uppercase tracking-wider backdrop-blur-[2px]">
                      <IconEye size={18} />
                      <span>View Gallery ({roomImages.length} Photos)</span>
                    </div>

                    {roomImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex((prev) => (prev === 0 ? roomImages.length - 1 : prev - 1));
                          }}
                          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
                        >
                          <IconChevronLeft size={16} className="sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex((prev) => (prev === roomImages.length - 1 ? 0 : prev + 1));
                          }}
                          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
                        >
                          <IconChevronRight size={16} className="sm:w-4 sm:h-4" />
                        </button>
                        <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5 z-10">
                          {roomImages.map((_, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all",
                                idx === currentImageIndex ? "bg-white w-3 sm:w-4" : "bg-white/50"
                              )}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-3.5 sm:p-5 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800/60">
                    <h3 className="text-sm sm:text-lg font-black text-gray-900 dark:text-white tracking-tight truncate">
                      {inquiry.listing.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs font-bold text-primary flex items-center gap-1.5">
                      <IconBuilding size={14} className="shrink-0" />
                      <span className="truncate">
                        {inquiry.room?.name ? `${inquiry.room.name} • ${(inquiry.room as any)?.roomTypeDefinition?.name || (inquiry.room as any)?.roomType || 'Solo Room'}` : 'Solo Room'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Stay Schedule Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
                  <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <IconCalendar size={14} className="text-primary shrink-0" />
                    <span>Intended Stay Schedule</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="p-2.5 sm:p-3 bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-xl sm:rounded-2xl text-center">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-primary-dark dark:text-primary-light block mb-0.5">
                        Check-in
                      </span>
                      <span className="text-xs sm:text-sm font-black text-primary-dark dark:text-white">
                        {formatDate(inquiry.moveInDate)}
                      </span>
                    </div>

                    <div className="p-2.5 sm:p-3 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl sm:rounded-2xl text-center">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 block mb-0.5">
                        Check-out
                      </span>
                      <span className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-100">
                        {formatDate(inquiry.checkOutDate)}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400 font-bold flex items-center gap-1.5 text-[11px] sm:text-xs">
                      <IconUser size={14} className="text-primary shrink-0" />
                      <span>Occupants</span>
                    </span>
                    <span className="font-black text-gray-900 dark:text-white text-xs sm:text-sm">
                      {inquiry.occupantsCount || 1} {inquiry.occupantsCount === 1 ? 'Person' : 'People'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Right Column: Tenant Profile, Financials, Verification Docs & Note */}
              <div className="space-y-3.5 sm:space-y-4 flex flex-col">
                
                {/* Tenant Profile & Contact Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Avatar 
                      src={inquiry.user.image} 
                      name={inquiry.user.name} 
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl shadow-xs border-2 border-primary/20 shrink-0" 
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-lg font-black text-gray-900 dark:text-white truncate leading-tight">
                        {inquiry.user.name || 'Anonymous Tenant'}
                      </h3>
                      <p className="text-[11px] sm:text-xs font-bold text-gray-400 truncate leading-tight mt-0.5">
                        {inquiry.user.email}
                      </p>
                    </div>
                  </div>

                  {inquiry.contactInfo && (
                    <div className="p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] sm:text-xs">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-bold">
                        {inquiry.contactMethod?.toLowerCase() === 'email' ? (
                          <IconMail size={14} className="text-primary shrink-0" />
                        ) : (
                          <IconDeviceMobile size={14} className="text-primary shrink-0" />
                        )}
                        <span>Contact ({inquiry.contactMethod || 'Mobile'})</span>
                      </div>
                      <span className="font-black text-gray-900 dark:text-white truncate max-w-[140px] sm:max-w-[180px]">
                        {inquiry.contactInfo}
                      </span>
                    </div>
                  )}
                </div>

                {/* Financial Summary Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2.5">
                  <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <IconCreditCard size={14} className="text-primary" />
                    <span>Reservation Deposit</span>
                  </h4>

                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <IconTag size={15} className="text-primary shrink-0" />
                      <span className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">Holding Fee</span>
                    </div>
                    <span className="text-base sm:text-xl font-black text-primary dark:text-primary-light">
                      ₱{Number(reservationFee).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/60">
                    <span className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">Monthly Rate</span>
                    <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">
                      ₱{Number(inquiry.room?.price || 0).toLocaleString()}<span className="text-[10px] sm:text-xs text-gray-400 font-bold">/mo</span>
                    </span>
                  </div>
                </div>

                {/* Verification Documents Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2.5 sm:space-y-3">
                  <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <IconShieldCheck size={14} className="text-primary" />
                    <span>Verification Documents</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    {/* Selfie Photo */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-gray-400">Tenant Selfie</span>
                      {signedProfileUrl ? (
                        <div 
                          onClick={() => setMediaOverlay({
                            isOpen: true,
                            images: [signedProfileUrl],
                            currentIndex: 0,
                            title: `Tenant Selfie - ${inquiry.user.name || 'Tenant'}`,
                            isDocument: true,
                          })}
                          className="group relative h-20 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs cursor-pointer border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
                        >
                          <SafeImage 
                            src={signedProfileUrl} 
                            alt="Tenant Profile Photo" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                            unoptimized={true}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-[1px]">
                            <IconEye size={14} />
                            <span>Preview</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-20 sm:h-28 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center text-gray-400 text-[10px] sm:text-xs font-bold border border-dashed border-gray-200 dark:border-gray-700">
                          Not Provided
                        </div>
                      )}
                    </div>

                    {/* ID Attachment */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-gray-400">Government ID</span>
                      {signedIdUrl ? (
                        <div 
                          onClick={() => setMediaOverlay({
                            isOpen: true,
                            images: [signedIdUrl],
                            currentIndex: 0,
                            title: `Government ID - ${inquiry.user.name || 'Tenant'}`,
                            isDocument: true,
                          })}
                          className="group relative h-20 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs cursor-pointer border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
                        >
                          <SafeImage 
                            src={signedIdUrl} 
                            alt="Tenant ID Attachment" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                            unoptimized={true}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-[1px]">
                            <IconEye size={14} />
                            <span>Preview</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-20 sm:h-28 rounded-xl sm:rounded-2xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center text-gray-400 text-[10px] sm:text-xs font-bold border border-dashed border-gray-200 dark:border-gray-700">
                          Not Provided
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Special Request / Message Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-1.5 sm:space-y-2">
                  <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <IconMessage size={14} className="text-primary" />
                    <span>Special Request / Note</span>
                  </h4>
                  <p className="text-[11px] sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 leading-relaxed italic line-clamp-3">
                    "{inquiry.message || "No special requests provided."}"
                  </p>
                </div>

              </div>
            </div>

            {/* Created Timestamp */}
            <div className="pt-1 sm:pt-2 text-center">
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 flex items-center justify-center gap-1.5">
                <IconClock size={12} className="sm:w-3.5 sm:h-3.5" />
                <span>Inquiry submitted on {formatDate(inquiry.createdAt)}</span>
              </p>
            </div>
            </>
            )}

          </div>

          {/* Action Footer Bar - Compact Mobile Rows & Desktop Single Row */}
          <div className="px-3.5 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0 shadow-lg">
            
            {/* Left Action: Chat with Tenant */}
            {canChat ? (
              <button
                className="w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-primary bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => {
                  const listingImg = (inquiry.room?.images && inquiry.room.images.length > 0) ? inquiry.room.images[0].url : inquiry.listing.imageSrc;
                  const event = new CustomEvent('open-landlord-chat', {
                    detail: {
                      listingId: inquiry.listing.id,
                      tenantId: inquiry.user.id,
                      tenantName: inquiry.user.name || 'Tenant',
                      tenantImage: inquiry.user.image || '',
                      listingTitle: inquiry.listing.title,
                      listingImage: listingImg || ''
                    }
                  });
                  window.dispatchEvent(event);
                  onClose();
                }}
              >
                <IconMessage size={16} />
                <span>Chat with Tenant</span>
              </button>
            ) : (
              <div
                className="w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-gray-400 bg-gray-100 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed"
                title={isPastStay ? "Messaging is closed because the stay period has ended" : "Messaging is closed for rejected or cancelled inquiries"}
              >
                <IconMessage size={16} className="opacity-50" />
                <span>Chat Closed</span>
              </div>
            )}
            
            {/* Right Primary Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {inquiry.status === 'APPROVED' && (
                <button
                  className="flex-1 sm:flex-none h-10 sm:h-11 px-4 sm:px-5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  onClick={async () => {
                    const toastId = responsiveToast.loading("Generating Lease Contract...");
                    try {
                      const res = await fetch(`/api/contracts/generate?listingId=${inquiry.listing.id}&userId=${inquiry.user.id}&roomId=${inquiry.room?.id}`);
                      if (!res.ok) throw new Error("Failed to fetch contract data");
                      const data = await res.json();
                      if ((data.contractMode === 'CUSTOM_PDF' || data.customPdfUrl) && data.customPdfUrl) {
                        const success = await previewPdfBlob(data.customPdfUrl, "Custom Lease Contract Preview");
                        if (success) {
                          responsiveToast.success("Custom Lease Contract loaded!", { id: toastId });
                          return;
                        }
                      }
                      await generateLeaseContractPDF(`Lease_Contract_${inquiry.listing.id}`, data);
                      responsiveToast.success("Lease Contract downloaded successfully!", { id: toastId });
                    } catch (e) {
                      responsiveToast.error("Failed to generate Lease Contract.", { id: toastId });
                    }
                  }}
                >
                  <IconFileText size={15} />
                  <span>Lease Contract</span>
                </button>
              )}

              {inquiry.status === 'PENDING' && !(inquiry as any).isArchived && (
                <>
                  <button
                    disabled={isUpdatingStatus}
                    className="flex-1 sm:flex-none h-10 sm:h-11 px-3 sm:px-5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 hover:bg-rose-100 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    onClick={() => setShowRejectConfirm(true)}
                  >
                    <IconX size={15} />
                    <span>Decline</span>
                  </button>

                  <button
                    disabled={isUpdatingStatus}
                    className="flex-1 sm:flex-none h-10 sm:h-11 px-4 sm:px-6 text-[11px] sm:text-xs font-black uppercase tracking-wider text-white bg-primary hover:bg-primary/90 rounded-xl sm:rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0 cursor-pointer"
                    onClick={() => handleAction('APPROVED')}
                  >
                    <IconCheck size={15} />
                    <span>Approve</span>
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </Modal>

      {/* Global Media Preview Overlay */}
      <MediaPreviewOverlay
        isOpen={mediaOverlay.isOpen}
        onClose={() => setMediaOverlay(prev => ({ ...prev, isOpen: false }))}
        images={mediaOverlay.images}
        currentIndex={mediaOverlay.currentIndex}
        onNavigate={(idx) => setMediaOverlay(prev => ({ ...prev, currentIndex: idx }))}
        title={mediaOverlay.title}
        isDocument={mediaOverlay.isDocument}
      />

      {/* Decline Reason Modal */}
      <LandlordInquiryDeclineModal
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        onConfirm={async (reason) => {
          await handleAction('REJECTED', reason);
          setShowRejectConfirm(false);
        }}
        isLoading={isUpdatingStatus}
      />
    </>
  );
}

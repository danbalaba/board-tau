'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from '@/components/modals/Modal';
import { ReservationRequest } from '../hooks/use-reservation-logic';
import Avatar from '@/components/common/Avatar';
import { 
  IconUser, 
  IconMail, 
  IconCalendar, 
  IconBuilding, 
  IconCreditCard, 
  IconPlayerPlay, 
  IconCheck, 
  IconX,
  IconClock,
  IconChevronLeft,
  IconChevronRight,
  IconTag,
  IconFileText,
  IconEye,
  IconShieldCheck,
  IconDeviceMobile,
  IconMessage
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { cn } from '@/utils/helper';
import SafeImage from '@/components/common/SafeImage';
import { getSafeImageSrcString } from '@/components/modals/inquiry-modal/InquiryModalUtils';
import { LandlordReservationCancelModal } from './landlord-reservation-cancel-modal';
import { generateLeaseContractPDF, previewPdfBlob } from '@/utils/contractPdfGenerator';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';
import MediaPreviewOverlay from '@/components/common/MediaPreviewOverlay';

interface LandlordReservationDetailsModalProps {
  reservation: ReservationRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string, reason?: string) => Promise<void>;
  isUpdatingStatus?: boolean;
}

export function LandlordReservationDetailsModal({
  reservation,
  isOpen,
  onClose,
  onUpdateStatus,
  isUpdatingStatus
}: LandlordReservationDetailsModalProps) {
  const responsiveToast = useResponsiveToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  useEffect(() => {
    if (isOpen && reservation) {
      setIsInitialLoading(true);
      setCurrentImageIndex(0);
      setShowCancelModal(false);
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
  }, [isOpen, reservation]);

  const formatDate = useCallback((dateStr: string | Date | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch (e) {
      return 'N/A';
    }
  }, []);

  const getStatusBadge = useCallback((status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING_PAYMENT':
        return {
          label: 'Payment Pending',
          className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        };
      case 'RESERVED':
      case 'CONFIRMED':
        return {
          label: 'Reservation Confirmed',
          className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        };
      case 'CHECKED_IN':
        return {
          label: 'Currently Checked In',
          className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
        };
      case 'CANCELLED':
        return {
          label: 'Reservation Cancelled',
          className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
        };
      default:
        return {
          label: status?.replace('_', ' ') || 'RESERVATION',
          className: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-200',
        };
    }
  }, []);

  const roomImages = useMemo(() => {
    if (!reservation) return [];
    if (reservation.room?.images && reservation.room.images.length > 0) {
      return reservation.room.images.map(img => img.url);
    }
    if (reservation.listing?.images && reservation.listing.images.length > 0) {
      return reservation.listing.images.map(img => img.url);
    }
    if (reservation.listing?.imageSrc) {
      return [reservation.listing.imageSrc];
    }
    return ['/images/placeholder.jpg'];
  }, [reservation]);

  if (!isOpen || !reservation) return null;

  const statusInfo = getStatusBadge(reservation.status);
  const canCancel = reservation.status === 'PENDING_PAYMENT' || reservation.status === 'RESERVED' || reservation.status === 'CONFIRMED';
  const canChat = reservation.status === 'PENDING_PAYMENT' || reservation.status === 'RESERVED' || reservation.status === 'CONFIRMED' || reservation.status === 'CHECKED_IN';
  const guestName = (reservation.user?.name || reservation.guestName) || 'Anonymous Guest';
  const guestEmail = (reservation.user?.email || reservation.guestContact) || 'No contact specified';
  const signedGuestPhoto = reservation.guestPhotoUrl || reservation.user?.image || null;
  const signedGuestId = reservation.guestIdUrl || null;

  const handleAction = async (status: string, reason?: string) => {
    setIsLoading(true);
    try {
      await onUpdateStatus(reservation.id, status, reason);
      onClose();
    } catch (error) {
      // toast handled in hook
    } finally {
      setIsLoading(false);
      setShowCancelModal(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} width="full" noPadding={true} hasFixedFooter={true} closeOnOutsideClick={false} fullOnMobile={true}>
        <div className="w-full h-full sm:h-auto sm:max-h-[90vh] max-w-full sm:max-w-5xl mx-auto sm:my-auto overflow-hidden flex flex-col bg-white dark:bg-gray-900 rounded-none sm:rounded-3xl border-0 sm:border sm:border-gray-200 dark:sm:border-gray-800 shadow-2xl">
          
          {/* Top Header Bar - Mobile Collision Proof */}
          <div className="px-3.5 sm:px-8 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 pr-2">
              <div className="p-2 bg-primary/10 text-primary rounded-xl shrink-0">
                <IconCalendar size={18} className="sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
                    Reservation Details
                  </h2>
                  <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border shadow-2xs sm:hidden shrink-0", statusInfo.className)}>
                    {statusInfo.label}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 truncate max-w-[130px] sm:max-w-md mt-0.5 leading-tight">
                  {guestName} • {reservation.listing.title}
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
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-400">Loading Reservation Details...</p>
              </div>
            ) : (
              <>
                {/* Walk-In Guest Banner */}
            {reservation.isWalkIn && (
              <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl sm:rounded-2xl flex items-center gap-3 shadow-xs text-blue-900 dark:text-blue-100">
                <div className="p-1.5 sm:p-2 bg-blue-600 text-white rounded-lg sm:rounded-xl shrink-0">
                  <IconUser size={16} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-wider leading-none mb-0.5 sm:mb-1">
                    Walk-In Guest Reservation
                  </h4>
                  <p className="text-[10px] sm:text-xs font-medium leading-tight text-blue-800 dark:text-blue-200">
                    Manually initialized on-site reservation by landlord.
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
                      title: `${reservation.listing.title} - Showcase`,
                      isDocument: false,
                    })}
                    className="relative h-44 sm:h-60 w-full group/gallery bg-gray-100 dark:bg-gray-800 cursor-zoom-in overflow-hidden"
                  >
                    <SafeImage
                      src={getSafeImageSrcString(roomImages[currentImageIndex])}
                      alt={reservation.listing.title}
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
                      {reservation.listing.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs font-bold text-primary flex items-center gap-1.5">
                      <IconBuilding size={14} className="shrink-0" />
                      <span className="truncate">
                        {reservation.room?.name ? `${reservation.room.name} • ${(reservation.room as any)?.roomTypeDefinition?.name || (reservation.room as any)?.roomType || (typeof (reservation.listing as any)?.propertyType === 'object' ? (reservation.listing as any)?.propertyType?.name : (reservation.listing as any)?.propertyType) || 'Solo Room'}` : ((reservation.room as any)?.roomTypeDefinition?.name || (reservation.room as any)?.roomType || (typeof (reservation.listing as any)?.propertyType === 'object' ? (reservation.listing as any)?.propertyType?.name : (reservation.listing as any)?.propertyType) || 'Solo Room')}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Stay Schedule Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
                  <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <IconCalendar size={14} className="text-primary shrink-0" />
                    <span>Stay Logistics</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="p-2.5 sm:p-3 bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-xl sm:rounded-2xl text-center">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-primary-dark dark:text-primary-light block mb-0.5">
                        Check-in Date
                      </span>
                      <span className="text-xs sm:text-sm font-black text-primary-dark dark:text-white">
                        {formatDate(reservation.moveInDate)}
                      </span>
                    </div>

                    <div className="p-2.5 sm:p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-xl sm:rounded-2xl text-center">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 block mb-0.5">
                        Stay Duration
                      </span>
                      <span className="text-xs sm:text-sm font-black text-blue-950 dark:text-blue-100">
                        {reservation.stayDuration} Days
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400 font-bold flex items-center gap-1.5 text-[11px] sm:text-xs">
                      <IconUser size={14} className="text-primary shrink-0" />
                      <span>Occupants</span>
                    </span>
                    <span className="font-black text-gray-900 dark:text-white text-xs sm:text-sm">
                      {(reservation as any).occupantsCount || 1} {(reservation as any).occupantsCount === 1 ? 'Person' : 'People'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Right Column: Guest Profile, Financials & Reference */}
              <div className="space-y-3.5 sm:space-y-4 flex flex-col">
                
                {/* Guest Profile & Contact Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Avatar 
                      src={reservation.user?.image || reservation.guestPhotoUrl} 
                      name={guestName} 
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl shadow-xs border-2 border-primary/20 shrink-0" 
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-lg font-black text-gray-900 dark:text-white truncate leading-tight">
                        {guestName}
                      </h3>
                      <p className="text-[11px] sm:text-xs font-bold text-gray-400 truncate leading-tight mt-0.5">
                        {guestEmail}
                      </p>
                    </div>
                  </div>

                  {reservation.guestContact && (
                    <div className="p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] sm:text-xs">
                      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-bold">
                        <IconDeviceMobile size={14} className="text-primary shrink-0" />
                        <span>Contact Info</span>
                      </div>
                      <span className="font-black text-gray-900 dark:text-white truncate max-w-[140px] sm:max-w-[180px]">
                        {reservation.guestContact}
                      </span>
                    </div>
                  )}
                </div>

                {/* Financial Overview Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2.5">
                  <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <IconCreditCard size={14} className="text-primary" />
                    <span>Payment & Deposit</span>
                  </h4>

                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <IconTag size={15} className="text-primary shrink-0" />
                      <span className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">Total Holding Deposit</span>
                    </div>
                    <span className="text-base sm:text-xl font-black text-primary dark:text-primary-light">
                      ₱{Number((reservation as any).totalPrice || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/60">
                    <span className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">Monthly Room Rate</span>
                    <span className="text-xs sm:text-sm font-black text-gray-900 dark:text-white">
                      ₱{Number(reservation.room?.price || 0).toLocaleString()}<span className="text-[10px] sm:text-xs text-gray-400 font-bold">/mo</span>
                    </span>
                  </div>
                </div>

                {/* Verification & Booking Reference Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
                  <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <IconShieldCheck size={14} className="text-primary" />
                    <span>Booking Reference</span>
                  </h4>

                  <div className="p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] sm:text-xs">
                    <span className="text-gray-500 dark:text-gray-400 font-bold">Reservation Reference</span>
                    <span className="font-mono font-black text-primary dark:text-primary-light text-xs sm:text-sm tracking-wider" title={reservation.id}>
                      #RES-{reservation.id.slice(-8).toUpperCase()}
                    </span>
                  </div>

                  {/* Verification Docs thumbnail if available */}
                  {signedGuestId && (
                    <div className="pt-1">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-gray-400">Government ID</span>
                        <div 
                          onClick={() => setMediaOverlay({
                            isOpen: true,
                            images: [signedGuestId],
                            currentIndex: 0,
                            title: `Government ID - ${guestName}`,
                            isDocument: true,
                          })}
                          className="group relative h-20 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs cursor-pointer border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
                        >
                          <SafeImage 
                            src={signedGuestId} 
                            alt="Guest Government ID" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                            unoptimized={true}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-[1px]">
                            <IconEye size={14} />
                            <span>Preview Document</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Initialized Timestamp */}
            <div className="pt-1 sm:pt-2 text-center">
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 flex items-center justify-center gap-1.5">
                <IconClock size={12} className="sm:w-3.5 sm:h-3.5" />
                <span>Reservation initialized on {formatDate(reservation.createdAt)}</span>
              </p>
            </div>
            </>
            )}

          </div>

          {/* Action Footer Bar - Compact Mobile Rows & Desktop Single Row */}
          <div className="px-3.5 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0 shadow-lg">
            
            {/* Left Action: Chat with Guest */}
            {canChat ? (
              <button
                className="w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-primary bg-primary/10 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => {
                  const listingImg = (reservation.room?.images && reservation.room.images.length > 0) ? reservation.room.images[0].url : (reservation.listing?.images && reservation.listing.images.length > 0) ? reservation.listing.images[0].url : reservation.listing?.imageSrc;
                  const event = new CustomEvent('open-landlord-chat', {
                    detail: {
                      listingId: reservation.listing.id,
                      tenantId: reservation.user.id,
                      tenantName: guestName,
                      tenantImage: (reservation.user?.image || reservation.guestPhotoUrl) || '',
                      listingTitle: reservation.listing.title,
                      listingImage: listingImg || ''
                    }
                  });
                  window.dispatchEvent(event);
                  onClose();
                }}
              >
                <IconMessage size={16} />
                <span>Chat with Guest</span>
              </button>
            ) : (
              <div
                className="w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-gray-400 bg-gray-100 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed"
                title="Messaging is closed for completed or cancelled stays"
              >
                <IconMessage size={16} className="opacity-50" />
                <span>Chat Closed</span>
              </div>
            )}
            
            {/* Right Primary Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {(reservation.status === 'RESERVED' || reservation.status === 'CHECKED_IN' || reservation.status === 'COMPLETED' || reservation.status === 'CONFIRMED') && (
                <button
                  disabled={isLoading}
                  className="flex-1 sm:flex-none h-10 sm:h-11 px-4 sm:px-5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  onClick={async () => {
                    const toastId = responsiveToast.loading("Generating Lease Contract...");
                    setIsLoading(true);
                    try {
                      const res = await fetch(`/api/contracts/generate?listingId=${reservation.listing.id}&userId=${reservation.user.id}&roomId=${reservation.room?.id}`);
                      if (!res.ok) throw new Error("Failed to fetch contract data");
                      const data = await res.json();
                      if ((data.contractMode === 'CUSTOM_PDF' || data.customPdfUrl) && data.customPdfUrl) {
                        const success = await previewPdfBlob(data.customPdfUrl, "Custom Lease Contract Preview");
                        if (success) {
                          responsiveToast.success("Custom Lease Contract loaded!", { id: toastId });
                          return;
                        }
                      }
                      await generateLeaseContractPDF(`Lease_Contract_${reservation.listing.id}`, data);
                      responsiveToast.success("Lease Contract downloaded successfully!", { id: toastId });
                    } catch (e) {
                      responsiveToast.error("Failed to generate Lease Contract.", { id: toastId });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  <IconFileText size={15} />
                  <span>Lease Contract</span>
                </button>
              )}

              {(reservation.status === 'RESERVED' || reservation.status === 'CONFIRMED') && !(reservation as any).isArchived && (
                <button
                  disabled={isLoading}
                  className="flex-1 sm:flex-none h-10 sm:h-11 px-4 sm:px-6 text-[11px] sm:text-xs font-black uppercase tracking-wider text-white bg-primary hover:bg-primary/90 rounded-xl sm:rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0 cursor-pointer"
                  onClick={() => handleAction('CHECKED_IN')}
                >
                  <IconPlayerPlay size={15} fill="currentColor" />
                  <span>Confirm Check-In</span>
                </button>
              )}

              {canCancel && !(reservation as any).isArchived && (
                <button
                  disabled={isLoading}
                  className="flex-1 sm:flex-none h-10 sm:h-11 px-3 sm:px-5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 hover:bg-rose-100 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  onClick={() => setShowCancelModal(true)}
                >
                  <IconX size={15} />
                  <span>Cancel Reservation</span>
                </button>
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

      {/* Standalone Cancel Modal */}
      <LandlordReservationCancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={(reason) => handleAction('CANCELLED', reason)}
        isLoading={isLoading}
      />
    </>
  );
}

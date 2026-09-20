'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from '@/components/modals/Modal';
import { ReservationRequest } from '../hooks/use-reservation-logic';
import Avatar from '@/components/common/Avatar';
import { 
  IconUser, 
  IconMail, 
  IconCalendar, 
  IconHome, 
  IconCreditCard, 
  IconPlayerPlay, 
  IconCheck, 
  IconX,
  IconClock,
  IconChevronLeft,
  IconChevronRight,
  IconTag,
  IconFileText
} from '@tabler/icons-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { cn } from '@/utils/helper';
import SafeImage from '@/components/common/SafeImage';
import { getSafeImageSrcString } from '@/components/modals/inquiry-modal/InquiryModalUtils';
import { LandlordReservationCancelModal } from './landlord-reservation-cancel-modal';
import { generateLeaseContractPDF, previewPdfBlob } from '@/utils/contractPdfGenerator';

interface LandlordReservationDetailsModalProps {
  reservation: ReservationRequest;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string, reason?: string) => Promise<void>;
}

export function LandlordReservationDetailsModal({
  reservation,
  isOpen,
  onClose,
  onUpdateStatus
}: LandlordReservationDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setShowCancelModal(false);
    }
  }, [isOpen]);

  const formatDate = useCallback((dateStr: string | Date | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch (e) {
      return 'N/A';
    }
  }, []);

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return {
          label: 'Payment Pending',
          className: 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border-amber-300 dark:border-amber-800',
        };
      case 'RESERVED':
      case 'CONFIRMED':
        return {
          label: 'Reservation Confirmed',
          className: 'bg-primary/10 text-primary-dark dark:bg-primary/20 dark:text-primary-light border-primary/20',
        };
      case 'CHECKED_IN':
        return {
          label: 'Currently Checked In',
          className: 'bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-200 border-blue-300 dark:border-blue-800',
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          className: 'bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-200 border-rose-300 dark:border-rose-800',
        };
      default:
        return {
          label: status.replace('_', ' '),
          className: 'bg-gray-100 text-gray-800 border-gray-300',
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
  const guestName = (reservation.user?.name || reservation.guestName) || 'Anonymous Guest';
  const guestEmail = (reservation.user?.email || reservation.guestContact) || 'No contact specified';

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
      <Modal isOpen={isOpen} onClose={onClose} width="xl" hasFixedFooter={true} fullOnMobile={true}>
        <div className="flex flex-col h-full sm:h-auto max-h-full sm:max-h-[82vh] overflow-hidden">
          
          {/* Top Header Bar */}
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center shrink-0 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <IconCalendar size={20} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight">
                  Reservation Details
                </h2>
                <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 truncate max-w-[180px] sm:max-w-none">
                  {guestName} • {reservation.listing.title}
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
                <IconX size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-4 sm:space-y-6 bg-slate-50/70 dark:bg-gray-950 custom-scrollbar overscroll-contain [transform:translateZ(0)]">
            
            {/* 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column: Guest Profile & Property Details */}
              <div className="space-y-6">
                
                {/* Guest Profile Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar 
                      src={reservation.user?.image || reservation.guestPhotoUrl} 
                      name={guestName} 
                      className="w-14 h-14 rounded-2xl shadow-md border-2 border-primary/20 shrink-0" 
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-black text-gray-900 dark:text-white truncate">
                        {guestName}
                      </h3>
                      <p className="text-xs font-bold text-gray-400 truncate">
                        {guestEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Room Showcase Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                  <div className="aspect-video w-full relative group/gallery bg-gray-100 dark:bg-gray-800">
                    <SafeImage
                      src={getSafeImageSrcString(roomImages[currentImageIndex])}
                      alt={reservation.listing.title}
                      unoptimized={true}
                    />

                    {roomImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex((prev) => (prev === 0 ? roomImages.length - 1 : prev - 1));
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover/gallery:opacity-100 transition-opacity hover:bg-black/80"
                        >
                          <IconChevronLeft size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex((prev) => (prev === roomImages.length - 1 ? 0 : prev + 1));
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover/gallery:opacity-100 transition-opacity hover:bg-black/80"
                        >
                          <IconChevronRight size={18} />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {roomImages.map((_, idx) => (
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

                  <div className="p-5 space-y-2">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight line-clamp-1">
                      {reservation.listing.title}
                    </h3>
                    <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <IconHome size={14} />
                      <span>{reservation.room?.name ? `${reservation.room.name} • ${(reservation.room as any)?.roomTypeDefinition?.name || (reservation.room as any)?.roomType || (typeof (reservation.listing as any)?.propertyType === 'object' ? (reservation.listing as any)?.propertyType?.name : (reservation.listing as any)?.propertyType) || 'Solo Room'}` : ((reservation.room as any)?.roomTypeDefinition?.name || (reservation.room as any)?.roomType || (typeof (reservation.listing as any)?.propertyType === 'object' ? (reservation.listing as any)?.propertyType?.name : (reservation.listing as any)?.propertyType) || 'Solo Room')}</span>
                    </p>
                  </div>
                </div>

                {/* Stay Schedule Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <IconCalendar size={14} className="text-primary" />
                    <span>Stay Logistics</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-xl text-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary-dark dark:text-primary-light block mb-1">
                        Check-in Date
                      </span>
                      <span className="text-xs font-black text-primary-dark dark:text-white">
                        {formatDate(reservation.moveInDate)}
                      </span>
                    </div>

                    <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-xl text-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 block mb-1">
                        Stay Duration
                      </span>
                      <span className="text-xs font-black text-blue-950 dark:text-blue-100">
                        {reservation.stayDuration} Days
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Financial Overview & Booking Reference */}
              <div className="space-y-6">
                
                {/* Financial Overview Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <IconCreditCard size={14} className="text-primary" />
                    <span>Payment & Deposit</span>
                  </h4>

                  <div className="space-y-3.5 divide-y divide-gray-100 dark:divide-gray-800">
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <IconTag size={15} className="text-primary shrink-0" />
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Total Holding Deposit Paid</span>
                      </div>
                      <span className="text-lg font-black text-primary dark:text-primary-light">
                        ₱{Number((reservation as any).totalPrice || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Occupants Breakdown</span>
                      <span className="text-xs font-black text-gray-900 dark:text-white">
                        {(reservation as any).occupantsCount || 1} {(reservation as any).occupantsCount === 1 ? 'Person' : 'People'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Booking Details Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <IconUser size={14} className="text-primary" />
                    <span>Booking Reference</span>
                  </h4>

                  <div className="space-y-3.5 divide-y divide-gray-100 dark:divide-gray-800">
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Reservation ID</span>
                      <span className="text-xs font-mono font-bold text-gray-900 dark:text-white truncate max-w-[160px]">
                        {reservation.id}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Listing Title</span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[160px]">
                        {reservation.listing.title}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Created Timestamp */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 text-center">
              <p className="text-[11px] font-bold text-gray-400 flex items-center justify-center gap-1.5">
                <IconClock size={12} />
                <span>Reservation initialized for {reservation.room?.name || (reservation.room as any)?.roomType || 'selected room'}</span>
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
                <IconMail size={14} />
                <span>Chat with Guest</span>
              </button>

              {(reservation.status === 'RESERVED' || reservation.status === 'CHECKED_IN' || reservation.status === 'COMPLETED') && (
                <button
                  disabled={isLoading}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  onClick={async () => {
                    const toastId = toast.loading("Generating Lease Contract...");
                    setIsLoading(true);
                    try {
                      const res = await fetch(`/api/contracts/generate?listingId=${reservation.listing.id}&userId=${reservation.user.id}&roomId=${reservation.room?.id}`);
                      if (!res.ok) throw new Error("Failed to fetch contract data");
                      const data = await res.json();
                      if ((data.contractMode === 'CUSTOM_PDF' || data.customPdfUrl) && data.customPdfUrl) {
                        const success = await previewPdfBlob(data.customPdfUrl, "Custom Lease Contract Preview");
                        if (success) {
                          toast.success("Custom Lease Contract loaded!", { id: toastId });
                          return;
                        }
                      }
                      await generateLeaseContractPDF(`Lease_Contract_${reservation.listing.id}`, data);
                      toast.success("Lease Contract downloaded successfully!", { id: toastId });
                    } catch (e) {
                      toast.error("Failed to generate Lease Contract.", { id: toastId });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  <IconFileText size={14} />
                  <span>Lease Contract</span>
                </button>
              )}

              {(reservation.status === 'RESERVED' || reservation.status === 'CONFIRMED') && !(reservation as any).isArchived && (
                <button
                  disabled={isLoading}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-primary hover:bg-primary-dark rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
                  onClick={() => handleAction('CHECKED_IN')}
                >
                  <IconPlayerPlay size={14} fill="currentColor" />
                  <span>Confirm Check-In</span>
                </button>
              )}

              {reservation.status !== 'CANCELLED' && !(reservation as any).isArchived && (
                <button
                  disabled={isLoading}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  onClick={() => setShowCancelModal(true)}
                >
                  <IconX size={14} />
                  <span>Cancel Reservation</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </Modal>
      
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


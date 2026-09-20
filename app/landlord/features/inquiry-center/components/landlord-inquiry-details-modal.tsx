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
  IconFileText
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import { createPortal } from 'react-dom';
import { getSafeImageSrcString } from '@/components/modals/inquiry-modal/InquiryModalUtils';
import SafeImage from '@/components/common/SafeImage';
import { LandlordInquiryDeclineModal } from './landlord-inquiry-decline-modal';
import { generateLeaseContractPDF, previewPdfBlob } from '@/utils/contractPdfGenerator';
import { useResponsiveToast } from '@/components/common/ResponsiveToast';

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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // States for signed URLs
  const [signedProfileUrl, setSignedProfileUrl] = useState<string | null>(null);
  const [signedIdUrl, setSignedIdUrl] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen && inquiry) {
      setShowRejectConfirm(false);
      setPreviewImage(null);
      setCurrentImageIndex(0);
      setSignedProfileUrl(inquiry.profilePhotoUrl || null);
      setSignedIdUrl(inquiry.idAttachmentUrl || null);
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

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Inquiry Pending',
          className: 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border-amber-300 dark:border-amber-800',
        };
      case 'APPROVED':
        return {
          label: 'Inquiry Approved',
          className: 'bg-primary/10 text-primary-dark dark:bg-primary/20 dark:text-primary-light border-primary/20',
        };
      case 'REJECTED':
        return {
          label: 'Inquiry Declined',
          className: 'bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-200 border-rose-300 dark:border-rose-800',
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-300',
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

  const statusInfo = getStatusBadge(inquiry.status);
  const reservationFee = (inquiry as any).reservationFee || inquiry.room?.reservationFee || 0;

  const handleAction = async (status: string, reason?: string) => {
    try {
      await onUpdateStatus(inquiry.id, status, reason);
      onClose();
    } catch (error) {
      // Handled upstream
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
                <IconMail size={20} />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight">
                  Inquiry Details
                </h2>
                <p className="text-[11px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 truncate max-w-[180px] sm:max-w-none">
                  {inquiry.user.name || 'Tenant Inquiry'} • {inquiry.listing.title}
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
            
            {/* Solo Buyout Banner */}
            {inquiry.isSoloBuyout && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl flex items-center gap-3.5 shadow-sm text-amber-900 dark:text-amber-100">
                <div className="p-2 bg-amber-600 text-white rounded-xl shrink-0 shadow-sm">
                  <IconEye size={20} />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs font-black uppercase tracking-wider">
                    Solo Buyout Request
                  </h4>
                  <p className="text-xs font-medium leading-relaxed">
                    This tenant is reserving all <span className="font-bold">{(inquiry.room as any)?.capacity || 'bedspaces'}</span> for solo privacy.
                  </p>
                </div>
              </div>
            )}

            {/* 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column: Tenant Profile & Property/Stay Details */}
              <div className="space-y-6">
                
                {/* Tenant Profile Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar 
                      src={inquiry.user.image} 
                      name={inquiry.user.name} 
                      className="w-14 h-14 rounded-2xl shadow-md border-2 border-primary/20 shrink-0" 
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-black text-gray-900 dark:text-white truncate">
                        {inquiry.user.name || 'Anonymous Tenant'}
                      </h3>
                      <p className="text-xs font-bold text-gray-400 truncate">
                        {inquiry.user.email}
                      </p>
                    </div>
                  </div>

                  {inquiry.contactInfo && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold">
                        {inquiry.contactMethod?.toLowerCase() === 'email' ? (
                          <IconMail size={15} className="text-primary shrink-0" />
                        ) : (
                          <IconDeviceMobile size={15} className="text-primary shrink-0" />
                        )}
                        <span>Preferred Contact ({inquiry.contactMethod || 'Mobile'})</span>
                      </div>
                      <span className="font-black text-gray-900 dark:text-white">
                        {inquiry.contactInfo}
                      </span>
                    </div>
                  )}
                </div>

                {/* Room Showcase Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                  <div className="aspect-video w-full relative group/gallery bg-gray-100 dark:bg-gray-800">
                    <SafeImage
                      src={getSafeImageSrcString(roomImages[currentImageIndex])}
                      alt={inquiry.listing.title}
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
                      {inquiry.listing.title}
                    </h3>
                    <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <IconBuilding size={14} />
                      <span>{inquiry.room?.name ? `${inquiry.room.name} • ${(inquiry.room as any)?.roomTypeDefinition?.name || (inquiry.room as any)?.roomType || (typeof (inquiry.listing as any)?.propertyType === 'object' ? (inquiry.listing as any)?.propertyType?.name : (inquiry.listing as any)?.propertyType) || 'Solo Room'}` : ((inquiry.room as any)?.roomTypeDefinition?.name || (inquiry.room as any)?.roomType || (typeof (inquiry.listing as any)?.propertyType === 'object' ? (inquiry.listing as any)?.propertyType?.name : (inquiry.listing as any)?.propertyType) || 'Solo Room')}</span>
                    </p>
                  </div>
                </div>

                {/* Stay Schedule Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <IconCalendar size={14} className="text-primary" />
                    <span>Intended Stay Schedule</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-xl text-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary-dark dark:text-primary-light block mb-1">
                        Intended Check-in
                      </span>
                      <span className="text-xs font-black text-primary-dark dark:text-white">
                        {formatDate(inquiry.moveInDate)}
                      </span>
                    </div>

                    <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl text-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 block mb-1">
                        Intended Check-out
                      </span>
                      <span className="text-xs font-black text-amber-950 dark:text-amber-100">
                        {formatDate(inquiry.checkOutDate)}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <IconUser size={14} className="text-primary" />
                      <span>Number of Occupants</span>
                    </span>
                    <span className="font-black text-gray-900 dark:text-white">
                      {inquiry.occupantsCount || 1} {inquiry.occupantsCount === 1 ? 'Person' : 'People'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Right Column: Financial Breakdown, Verification Docs & Message */}
              <div className="space-y-6">
                
                {/* Financial Summary Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <IconCreditCard size={14} className="text-primary" />
                    <span>Reservation Deposit</span>
                  </h4>

                  <div className="space-y-3.5 divide-y divide-gray-100 dark:divide-gray-800">
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <IconTag size={15} className="text-primary shrink-0" />
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Reservation Holding Fee</span>
                      </div>
                      <span className="text-lg font-black text-primary dark:text-primary-light">
                        ₱{Number(reservationFee).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Monthly Room Rate</span>
                      <span className="text-sm font-black text-gray-900 dark:text-white">
                        ₱{Number(inquiry.room?.price || 0).toLocaleString()} <span className="text-xs font-semibold text-gray-400">/ mo</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Verification Documents Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <IconEye size={14} className="text-primary" />
                    <span>Verification Documents</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Selfie Photo */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Tenant Selfie</span>
                      {signedProfileUrl ? (
                        <div 
                          onClick={() => setPreviewImage(signedProfileUrl)}
                          className="group relative aspect-video rounded-xl overflow-hidden shadow-sm cursor-pointer border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
                        >
                          <SafeImage 
                            src={signedProfileUrl} 
                            alt="Tenant Profile Photo" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                            unoptimized={true}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-xs font-bold">
                            <IconEye size={16} />
                            <span>View</span>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video rounded-xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center text-gray-400 text-xs font-bold border border-dashed border-gray-200 dark:border-gray-700">
                          Not Provided
                        </div>
                      )}
                    </div>

                    {/* ID Attachment */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Valid Government ID</span>
                      {signedIdUrl ? (
                        <div 
                          onClick={() => setPreviewImage(signedIdUrl)}
                          className="group relative aspect-video rounded-xl overflow-hidden shadow-sm cursor-pointer border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
                        >
                          <SafeImage 
                            src={signedIdUrl} 
                            alt="Tenant ID Attachment" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                            unoptimized={true}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-xs font-bold">
                            <IconEye size={16} />
                            <span>View</span>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video rounded-xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center text-gray-400 text-xs font-bold border border-dashed border-gray-200 dark:border-gray-700">
                          Not Provided
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Special Request / Message Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <IconMessage size={14} className="text-primary" />
                    <span>Special Request / Note</span>
                  </h4>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 leading-relaxed italic">
                    "{inquiry.message || "No special requests provided."}"
                  </p>
                </div>

              </div>
            </div>

            {/* Created Timestamp */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 text-center">
              <p className="text-[11px] font-bold text-gray-400 flex items-center justify-center gap-1.5">
                <IconClock size={12} />
                <span>Inquiry submitted on {formatDate(inquiry.createdAt)}</span>
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
                <IconMessage size={14} />
                <span>Chat with Tenant</span>
              </button>

              {inquiry.status === 'APPROVED' && (
                <button
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 rounded-xl transition-all flex items-center justify-center gap-2"
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
                  <IconFileText size={14} />
                  <span>Lease Contract</span>
                </button>
              )}

              {inquiry.status === 'PENDING' && !(inquiry as any).isArchived && (
                <>
                  <button
                    disabled={isUpdatingStatus}
                    className="w-full sm:w-auto px-4 py-2.5 text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    onClick={() => setShowRejectConfirm(true)}
                  >
                    <IconX size={14} />
                    <span>Decline Inquiry</span>
                  </button>

                  <button
                    disabled={isUpdatingStatus}
                    className="w-full sm:w-auto px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-primary hover:bg-primary-dark rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
                    onClick={() => handleAction('APPROVED')}
                  >
                    <IconCheck size={14} />
                    <span>Approve Inquiry</span>
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </Modal>

      {/* Document Image Preview Portal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {previewImage && (
            <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPreviewImage(null)}
                className="absolute inset-0 bg-gray-900/60 dark:bg-gray-950/80 backdrop-blur-sm"
              />
              <motion.button
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setPreviewImage(null)}
                className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-10"
              >
                <IconX size={24} />
              </motion.button>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-[90vw] h-[80vh] flex items-center justify-center z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <SafeImage 
                  src={previewImage} 
                  className="w-full h-full object-contain rounded-2xl shadow-2xl" 
                  alt="Document Preview" 
                  unoptimized={true}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

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

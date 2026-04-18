'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/modals/Modal';
import { Inquiry } from '../hooks/use-inquiry-logic';
import Button from '@/components/common/Button';
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
  IconEye
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import { createPortal } from 'react-dom';

interface LandlordInquiryDetailsModalProps {
  inquiry: Inquiry | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string, reason?: string) => Promise<void>;
  isUpdatingStatus?: boolean;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-500 text-white',
  APPROVED: 'bg-emerald-500 text-white',
  REJECTED: 'bg-rose-500 text-white',
};

export function LandlordInquiryDetailsModal({
  inquiry,
  isOpen,
  onClose,
  onUpdateStatus,
  isUpdatingStatus
}: LandlordInquiryDetailsModalProps) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [customReason, setCustomReason] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsInitialLoading(true);
      setShowRejectConfirm(false);
      setCustomReason("");
      setPreviewImage(null);
      const timer = setTimeout(() => setIsInitialLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!inquiry) return null;

  const handleAction = async (status: string, reason?: string) => {
    try {
      await onUpdateStatus(inquiry.id, status, reason);
      onClose();
    } catch (error) {
      // Error handled by hook
    }
  };

  const PREDEFINED_REASONS = [
    "Room no longer available",
    "Profile incomplete or not verified",
    "Number of occupants exceeds limit",
    "Stay duration does not meet minimum requirements"
  ];

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Inquiry Details" width="lg">
        <div className="p-8 space-y-8 bg-white dark:bg-gray-900 overflow-hidden">
          
          <AnimatePresence mode="wait">
            {isInitialLoading ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-96 flex flex-col items-center justify-center gap-4"
              >
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Inquiry Data...</p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
                className="space-y-8"
              >
                {/* Overlay for Reject Confirmation */}
                {showRejectConfirm && (
                  <div className="absolute inset-x-0 bottom-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-8 border-t border-rose-100 dark:border-rose-900/30 rounded-b-[32px] animate-in slide-in-from-bottom-full duration-300">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">Decline Inquiry</h3>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Provide a reason for the tenant</p>
                        </div>
                        <button onClick={() => setShowRejectConfirm(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                          <IconX size={20} />
                        </button>
                      </div>

                      <div className="space-y-4 mb-6 text-left">
                        <div className="flex flex-wrap gap-2">
                          {PREDEFINED_REASONS.map((reason) => (
                            <button
                              key={reason}
                              onClick={() => handleAction('REJECTED', reason)}
                              disabled={isUpdatingStatus}
                              className="px-3 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 border border-gray-100 dark:border-gray-700 hover:border-rose-200 rounded-xl text-xs font-bold transition-all"
                            >
                              {reason}
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={customReason}
                          onChange={(e) => setCustomReason(e.target.value)}
                          placeholder="Or type a custom reason..."
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all min-h-[80px]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          outline
                          onClick={() => setShowRejectConfirm(false)}
                          className="rounded-xl py-3 text-xs font-black uppercase tracking-widest border-gray-100 dark:border-gray-800"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="danger"
                          isLoading={isUpdatingStatus}
                          disabled={!customReason.trim()}
                          onClick={() => handleAction('REJECTED', customReason)}
                          className="rounded-xl py-3 text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-500/10"
                        >
                          Confirm Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile Card */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, scale: 0.95, y: 10 },
                    visible: { opacity: 1, scale: 1, y: 0 }
                  }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-amber-500/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <div className="relative flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 backdrop-blur-sm">
                    <div className="flex items-center gap-5">
                       <Avatar 
                          src={inquiry.user.image} 
                          name={inquiry.user.name} 
                          className="w-16 h-16 rounded-[1.25rem] shadow-2xl border-4 border-white dark:border-gray-800" 
                       />
                       <div>
                          <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-2">{inquiry.user.name || 'Anonymous Potential Tenant'}</h3>
                          <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Inquiry</p>
                          </div>
                       </div>
                    </div>
                    <span className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm", 
                      statusColors[inquiry.status] || 'bg-gray-100 text-gray-500'
                    )}>
                      {inquiry.status}
                    </span>
                  </div>
                </motion.div>

                {/* Main Content Layout */}
                <div className="space-y-6">
                  
                  {/* Property & Stay Overview */}
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      visible: { opacity: 1, x: 0 }
                    }}
                    className="bg-gray-50/30 dark:bg-gray-800/30 p-6 rounded-3xl border border-gray-100/50 dark:border-gray-800/50"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                      Stay Information
                    </span>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden shadow-inner border border-gray-100 dark:border-gray-800">
                        <img src={inquiry.listing.imageSrc} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h4 className="text-xl font-black text-gray-900 dark:text-white leading-tight mb-2">
                          {inquiry.listing.title}
                        </h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                          Space: <span className="text-primary">{inquiry.room?.name || 'Full Unit'}</span>
                        </p>
                        
                        <div className="mt-4 space-y-2">
                           <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-50 dark:border-gray-800/50 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <IconCalendar size={16} className="text-primary" />
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Intended Stay</span>
                              </div>
                              <span className="text-xs font-black text-gray-900 dark:text-white">
                                {format(new Date(inquiry.moveInDate), 'MMM d, yyyy')} - {format(new Date(inquiry.checkOutDate), 'MMM d, yyyy')}
                              </span>
                           </div>
                           <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-50 dark:border-gray-800/50 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <IconUser size={16} className="text-primary" />
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Occupants</span>
                              </div>
                              <span className="text-xs font-black text-gray-900 dark:text-white">
                                {(inquiry as any).occupantsCount || 1} Person
                              </span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Message Section */}
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className="p-6 bg-amber-500/5 dark:bg-amber-500/10 rounded-3xl border border-amber-500/10 flex flex-col"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 flex items-center gap-2 mb-3">
                      <IconMessage size={14} />
                      Tenant Message
                    </span>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic">
                      "{inquiry.message || "No specific message provided. Interested in the property."}"
                    </p>
                  </motion.div>

                  {/* Verification & Finances Grid */}
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {/* Identification */}
                    <div className="bg-gray-50/30 dark:bg-gray-800/30 p-5 rounded-3xl border border-gray-100/50 dark:border-gray-800/50 flex flex-col gap-3">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Verification Documents</span>
                      <div className="flex items-center gap-4">
                         {inquiry.profilePhotoUrl ? (
                            <div 
                              onClick={() => setPreviewImage(inquiry.profilePhotoUrl ?? null)}
                              className="group relative w-16 h-16 rounded-2xl overflow-hidden shadow-sm cursor-pointer border border-gray-200 dark:border-gray-700"
                            >
                               <img src={inquiry.profilePhotoUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <IconEye size={16} className="text-white" />
                               </div>
                            </div>
                         ) : (
                            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-xs font-bold border border-dashed border-gray-300 dark:border-gray-700">No Selfie</div>
                         )}

                         {inquiry.idAttachmentUrl ? (
                            <div 
                              onClick={() => setPreviewImage(inquiry.idAttachmentUrl ?? null)}
                              className="group relative w-16 h-16 rounded-2xl overflow-hidden shadow-sm cursor-pointer border border-gray-200 dark:border-gray-700"
                            >
                               <img src={inquiry.idAttachmentUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <IconEye size={16} className="text-white" />
                               </div>
                            </div>
                         ) : (
                            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-xs font-bold border border-dashed border-gray-300 dark:border-gray-700">No ID</div>
                         )}
                      </div>
                    </div>

                    {/* Quick Financial Overview */}
                    <div className="bg-emerald-500/5 p-5 rounded-3xl border border-emerald-500/10 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500 text-white rounded-xl">
                           <IconCreditCard size={18} />
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Reservation Deposit</span>
                      </div>
                      <p className="text-2xl font-black tracking-tighter text-emerald-700 dark:text-emerald-400">
                         ₱{((inquiry.room as any)?.reservationFee || (((inquiry as any).reservationFee || 0) / ((inquiry as any).occupantsCount || 1))).toLocaleString()}
                      </p>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Per Person Fee</p>
                    </div>
                  </motion.div>
                </div>

                {/* Management Actions */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  className="pt-8 border-t border-gray-100 dark:border-gray-800"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">Manage Inquiry</h4>
                    <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800 mx-6"></div>
                  </div>
                  
                  {inquiry.status === 'PENDING' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button 
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 py-5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] group/act"
                        onClick={() => handleAction('APPROVED')}
                        isLoading={isUpdatingStatus}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <IconCheck size={18} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                          Approve Inquiry
                        </span>
                      </Button>
                      <Button 
                        outline
                        className="rounded-[1.25rem] py-5 border-rose-100 text-rose-500 hover:bg-rose-50 dark:border-rose-900/30 dark:hover:bg-rose-900/10 text-[10px] font-black uppercase tracking-[0.2em] transition-all group/rev"
                        onClick={() => setShowRejectConfirm(true)}
                        disabled={isUpdatingStatus}
                      >
                        <span className="flex items-center justify-center gap-2">
                           <IconX size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> 
                           Decline Inquiry
                        </span>
                      </Button>
                    </div>
                  ) : (
                     <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
                          Decision already made: <span className={inquiry.status === 'APPROVED' ? 'text-emerald-500' : 'text-rose-500'}>{inquiry.status}</span>
                        </p>
                     </div>
                  )}
                  
                  <div className="mt-6 flex items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                    <IconClock size={12} className="text-gray-400" />
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest text-center px-4">
                      Approving will notify the tenant to proceed with the reservation payment.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>

      {/* Portal Image Preview Overlay */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {previewImage && (
            <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPreviewImage(null)}
                className="absolute inset-0 bg-black/95 backdrop-blur-md"
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
                className="relative max-w-5xl w-full max-h-[85vh] flex items-center justify-center z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <img 
                  src={previewImage} 
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" 
                  alt="Document Preview" 
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

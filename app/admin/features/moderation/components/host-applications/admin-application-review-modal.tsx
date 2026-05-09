'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/modals/Modal';
import { Button } from '@/app/admin/components/ui/button';
import { 
  IconUser, 
  IconBuilding, 
  IconCheck, 
  IconX,
  IconClock,
  IconShieldCheck,
  IconId,
  IconFileText,
  IconEye,
  IconPhone
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';
import SafeImage from '@/components/common/SafeImage';

interface AdminApplicationReviewModalProps {
  application: any | null;
  isOpen: boolean;
  onClose: () => void;
  onDecision: (id: string, action: 'approve' | 'reject', reason?: string) => void;
  isDeciding?: boolean;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500 text-white',
  approved: 'bg-emerald-500 text-white',
  rejected: 'bg-rose-500 text-white',
};

export function AdminApplicationReviewModal({
  application,
  isOpen,
  onClose,
  onDecision,
  isDeciding
}: AdminApplicationReviewModalProps) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [customReason, setCustomReason] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && application) {
      setIsInitialLoading(true);
      setShowRejectConfirm(false);
      setCustomReason("");
      setPreviewImage(null);
      
      const timer = setTimeout(() => setIsInitialLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isOpen, application]);

  if (!application) return null;

  const handleAction = async (action: 'approve' | 'reject', reason?: string) => {
    onDecision(application.id, action, reason);
  };

  const PREDEFINED_REASONS = [
    "Illegible or blurry ID/Documents",
    "Mismatched identity information",
    "Expired business permit",
    "Incomplete application details"
  ];

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Identity Verification" width="lg">
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
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Identity Data...</p>
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
                          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">Reject Identity</h3>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Provide a reason for the rejection</p>
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
                              onClick={() => handleAction('reject', reason)}
                              disabled={isDeciding}
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
                          variant="outline"
                          onClick={() => setShowRejectConfirm(false)}
                          className="rounded-xl py-6 h-auto text-xs font-black uppercase tracking-widest border-gray-200 dark:border-gray-800"
                        >
                          Cancel
                        </Button>
                        <Button
                          disabled={isDeciding || !customReason.trim()}
                          onClick={() => handleAction('reject', customReason)}
                          className="rounded-xl py-6 h-auto text-xs font-black uppercase tracking-widest shadow-lg bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20"
                        >
                          Confirm Rejection
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile Banner */}
                <motion.div 
                  variants={{
                    hidden: { opacity: 0, scale: 0.95, y: 10 },
                    visible: { opacity: 1, scale: 1, y: 0 }
                  }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-emerald-500/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <div className="relative flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 backdrop-blur-sm">
                    <div className="flex items-center gap-5">
                       {application.user?.image ? (
                         <SafeImage src={application.user.image} alt={application.user.name} className="w-16 h-16 rounded-[1.25rem] shadow-2xl border-4 border-white dark:border-gray-800 object-cover" />
                       ) : (
                         <div className="w-16 h-16 rounded-[1.25rem] shadow-2xl border-4 border-white dark:border-gray-800 bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                           {application.user?.name?.charAt(0) || 'U'}
                         </div>
                       )}
                       <div>
                          <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-none mb-2">{application.user?.name || 'Unknown User'}</h3>
                          <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{application.businessInfo?.businessName || 'Independent Landlord'}</p>
                          </div>
                       </div>
                    </div>
                    <span className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm", 
                      statusColors[application.status] || 'bg-gray-100 text-gray-500'
                    )}>
                      {application.status}
                    </span>
                  </div>
                </motion.div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Contact Info */}
                  <motion.div 
                    variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                    className="bg-gray-50/30 dark:bg-gray-800/30 p-5 rounded-3xl border border-gray-100/50 dark:border-gray-800/50 flex flex-col gap-3"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 mb-2">
                      <IconUser size={14} /> User Details
                    </span>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Email Address</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{application.user?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Phone Number</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{application.contactInfo?.phoneNumber || 'N/A'}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Business Info */}
                  <motion.div 
                    variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
                    className="bg-amber-500/5 dark:bg-amber-500/10 p-5 rounded-3xl border border-amber-500/10 flex flex-col gap-3"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 flex items-center gap-2 mb-2">
                      <IconBuilding size={14} /> Business Identity
                    </span>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Business Type</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white capitalize">{application.businessInfo?.businessType || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Experience</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{application.businessInfo?.yearsExperience || '0'} Years</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Identity Documents Grid */}
                  <motion.div 
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    className="col-span-1 md:col-span-2 bg-gray-50/30 dark:bg-gray-800/30 p-5 rounded-3xl border border-gray-100/50 dark:border-gray-800/50 flex flex-col gap-4"
                  >
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <IconShieldCheck size={14} /> Verification Documents
                    </span>
                    
                    <div className="flex flex-wrap gap-4">
                       {/* Selfie */}
                       {application.selfieUrl && (
                          <div 
                            onClick={() => setPreviewImage(application.selfieUrl)}
                            className="group relative w-24 h-24 rounded-2xl overflow-hidden shadow-sm cursor-pointer border border-gray-200 dark:border-gray-700"
                          >
                             <SafeImage 
                               src={application.selfieUrl} 
                               alt="Applicant Selfie" 
                               className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                             />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <IconEye size={20} className="text-white" />
                             </div>
                             <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white font-bold text-center py-1">SELFIE</div>
                          </div>
                       )}

                       {/* ID Card */}
                       {application.idCardUrl && (
                          <div 
                            onClick={() => setPreviewImage(application.idCardUrl)}
                            className="group relative w-24 h-24 rounded-2xl overflow-hidden shadow-sm cursor-pointer border border-gray-200 dark:border-gray-700"
                          >
                             <SafeImage 
                               src={application.idCardUrl} 
                               alt="Government ID Card" 
                               className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                             />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <IconEye size={20} className="text-white" />
                             </div>
                             <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white font-bold text-center py-1">GOV ID</div>
                          </div>
                       )}

                       {/* Permit */}
                       {application.businessPermitUrl && (
                          <div 
                            onClick={() => setPreviewImage(application.businessPermitUrl)}
                            className="group relative w-24 h-24 rounded-2xl overflow-hidden shadow-sm cursor-pointer border border-gray-200 dark:border-gray-700"
                          >
                             <SafeImage 
                               src={application.businessPermitUrl} 
                               alt="Business Permit Document" 
                               className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                             />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <IconEye size={20} className="text-white" />
                             </div>
                             <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white font-bold text-center py-1">PERMIT</div>
                          </div>
                       )}
                       
                       {/* Fire Safety */}
                       {application.fireSafetyUrl && (
                          <div 
                            onClick={() => setPreviewImage(application.fireSafetyUrl)}
                            className="group relative w-24 h-24 rounded-2xl overflow-hidden shadow-sm cursor-pointer border border-gray-200 dark:border-gray-700"
                          >
                             <SafeImage 
                               src={application.fireSafetyUrl} 
                               alt="Fire Safety Certificate" 
                               className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                             />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <IconEye size={20} className="text-white" />
                             </div>
                             <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white font-bold text-center py-1">FIRE CERT</div>
                          </div>
                       )}
                    </div>
                  </motion.div>
                </div>

                {/* Management Actions */}
                <motion.div 
                  variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                  className="pt-8 border-t border-gray-100 dark:border-gray-800"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white">Verification Decision</h4>
                    <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800 mx-6"></div>
                  </div>
                  
                  {application.status === 'pending' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button 
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 py-6 h-auto rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] group/act"
                        onClick={() => handleAction('approve')}
                        disabled={isDeciding}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <IconCheck size={18} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                          Verify & Authorize
                        </span>
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full rounded-[1.25rem] py-6 h-auto border-rose-200 text-rose-500 hover:bg-rose-50 dark:border-rose-900/30 dark:hover:bg-rose-900/10 text-[10px] font-black uppercase tracking-[0.2em] transition-all group/rev"
                        onClick={() => setShowRejectConfirm(true)}
                        disabled={isDeciding}
                      >
                        <span className="flex items-center justify-center gap-2">
                           <IconX size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> 
                           Reject Identity
                        </span>
                      </Button>
                    </div>
                  ) : (
                     <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
                          Decision already made: <span className={application.status === 'approved' ? 'text-emerald-500' : 'text-rose-500'}>{application.status}</span>
                        </p>
                     </div>
                  )}
                  
                  <div className="mt-6 flex items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
                    <IconClock size={12} className="text-gray-400" />
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest text-center px-4">
                      Authorizing will grant this user Landlord privileges platform-wide.
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
                <SafeImage 
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

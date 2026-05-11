'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconAlertTriangle, 
  IconX, 
  IconMail, 
  IconUser, 
  IconBuilding, 
  IconCreditCard, 
  IconCalendarEvent, 
  IconInfoCircle, 
  IconEye,
  IconRestore,
  IconTrash,
  IconLoader2 
} from '@tabler/icons-react';
import Button from '@/components/common/Button';
import { cn } from '@/utils/helper';
import { useRouter } from 'next/navigation';
import { Inquiry } from '../hooks/use-inquiry-logic';
import { createPortal } from 'react-dom';
import { useIsClient } from '@/hooks/useIsClient';
import { LandlordInquiryDetailsModal } from './landlord-inquiry-details-modal';
import LandlordArchiveModal from './landlord-inquiry-archive-modal';

interface LandlordInquiryModalsProps {
  deleteModalOpen: boolean;
  setDeleteModalOpen: (o: boolean) => void;
  viewModalOpen: boolean;
  setViewModalOpen: (o: boolean) => void;
  rejectModalOpen: boolean;
  setRejectModalOpen: (o: boolean) => void;
  archiveModalOpen: boolean;
  setArchiveModalOpen: (o: boolean) => void;
  selectedInquiry: Inquiry | null;
  isDeleting: boolean;
  isResponding?: boolean;
  isArchiving?: boolean;
  handleConfirmDelete: () => void;
  handleConfirmArchive: () => void;
  handleConfirmReject: (id: string, reason: string) => void;
  handleRespond?: (id: string, status: "APPROVED" | "REJECTED", message?: string) => Promise<void>;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  APPROVED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  REJECTED: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

const PREDEFINED_REASONS = [
  "Room no longer available",
  "Profile incomplete or not verified",
  "Number of occupants exceeds limit",
  "Stay duration does not meet minimum requirements",
  "Inquiry policy violation"
];

export function LandlordInquiryModals({
  deleteModalOpen,
  setDeleteModalOpen,
  viewModalOpen,
  setViewModalOpen,
  rejectModalOpen,
  setRejectModalOpen,
  archiveModalOpen,
  setArchiveModalOpen,
  selectedInquiry,
  isDeleting,
  isResponding,
  isArchiving,
  handleConfirmDelete,
  handleConfirmArchive,
  handleConfirmReject,
  handleRespond
}: LandlordInquiryModalsProps) {
  const router = useRouter();
  const isClient = useIsClient();
  const [customReason, setCustomReason] = React.useState("");
  const [selectedReason, setSelectedReason] = React.useState<string | null>(null);
  const [showCustom, setShowCustom] = React.useState(false);
  const [submittingReject, setSubmittingReject] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

  const resetRejectState = () => {
    setSelectedReason(null);
    setCustomReason("");
    setShowCustom(false);
  };

  if (!selectedInquiry || !isClient) return null;

  const onConfirmReject = async () => {
    const reason = showCustom ? customReason.trim() : selectedReason;
    if (!reason) return;
    setSubmittingReject(true);
    await handleConfirmReject(selectedInquiry.id, reason);
    setSubmittingReject(false);
    setRejectModalOpen(false);
    resetRejectState();
  };

  return createPortal(
    <>
      {/* New Professional Archive Modal */}
      <LandlordArchiveModal 
        isOpen={archiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        onConfirm={handleConfirmArchive}
        isArchiving={isArchiving}
        isRestore={selectedInquiry.isArchived}
        title={selectedInquiry.isArchived ? 'Restore Inquiry' : 'Archive Inquiry'}
        description={selectedInquiry.isArchived 
          ? `This will restore the inquiry from ${selectedInquiry.user.name || selectedInquiry.user.email} to your active inbox.`
          : `This will move the inquiry from ${selectedInquiry.user.name || selectedInquiry.user.email} to your archive. You can restore it anytime.`
        }
      />

      {/* Permanent Delete Modal (Only for Archived items) */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModalOpen(false)}
              className="absolute inset-0 bg-white/40 dark:bg-gray-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-[#111827] rounded-[32px] border border-gray-100 dark:border-white/10 p-8 max-sm:w-full max-w-sm shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500" />
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-[2rem] bg-rose-500/10 text-rose-500 border border-rose-900/30 flex items-center justify-center mb-8 shadow-inner">
                   <IconTrash size={36} className="animate-bounce" />
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight leading-none">
                   Delete Permanently
                </h3>
                
                <p className="text-sm text-gray-400 mb-8 leading-relaxed font-medium px-4">
                  You are about to permanently delete all sensitive documents for "{selectedInquiry.user.name || selectedInquiry.user.email}". This action cannot be undone.
                </p>

                <div className="flex flex-col w-full gap-3">
                  <Button
                    variant="danger"
                    isLoading={isDeleting}
                    onClick={handleConfirmDelete}
                    className="rounded-2xl py-4 shadow-xl text-[10px] font-black uppercase tracking-[0.2em] bg-rose-500 hover:bg-rose-600 shadow-rose-500/20"
                  >
                    {isDeleting ? 'Purging Files...' : 'Delete Permanently'}
                  </Button>
                  <Button
                    outline
                    onClick={() => setDeleteModalOpen(false)}
                    className="rounded-2xl py-4 border-gray-800 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500"
                  >
                    Cancel Action
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rejection Reason Modal */}
      <AnimatePresence>
        {rejectModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setRejectModalOpen(false); resetRejectState(); }}
              className="absolute inset-0 bg-gray-900/60 dark:bg-gray-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-[#111827] rounded-[32px] border border-gray-100 dark:border-white/10 p-8 max-w-md w-full shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Red accent bar */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 to-rose-600 rounded-t-[32px]" />

              {/* Header */}
              <div className="flex items-start justify-between mb-6 mt-1">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Decline Inquiry</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Select a reason to notify the tenant</p>
                </div>
                <button
                  onClick={() => { setRejectModalOpen(false); resetRejectState(); }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <IconX size={18} />
                </button>
              </div>

              {/* Predefined reasons — select-only */}
              <div className="mb-5">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Quick Reasons</p>
                <div className="space-y-2">
                  {PREDEFINED_REASONS.map((reason) => {
                    const isSelected = selectedReason === reason && !showCustom;
                    return (
                      <button
                        key={reason}
                        onClick={() => { setSelectedReason(reason); setShowCustom(false); setCustomReason(""); }}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-2xl border text-sm font-semibold transition-all flex items-center gap-3",
                          isSelected
                            ? "bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 shadow-sm"
                            : "bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-300 hover:bg-rose-50/50 dark:hover:bg-rose-500/5 hover:border-rose-200 dark:hover:border-rose-500/20 hover:text-rose-600 dark:hover:text-rose-400"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all",
                          isSelected ? "border-rose-500 bg-rose-500" : "border-gray-300 dark:border-gray-600"
                        )}>
                          {isSelected && <div className="w-full h-full rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-white" /></div>}
                        </div>
                        {reason}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Reason toggle */}
              <div className="mb-6">
                <button
                  onClick={() => { setShowCustom(v => !v); setSelectedReason(null); }}
                  className={cn(
                    "w-full px-4 py-3 rounded-2xl border text-sm font-bold transition-all flex items-center gap-3",
                    showCustom
                      ? "bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-400"
                      : "bg-gray-50 dark:bg-white/5 border-dashed border-gray-200 dark:border-white/10 text-gray-400 hover:text-rose-500 hover:border-rose-300 dark:hover:border-rose-500/30"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all",
                    showCustom ? "border-rose-500 bg-rose-500" : "border-gray-300 dark:border-gray-600"
                  )}>
                    {showCustom && <div className="w-full h-full rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-white" /></div>}
                  </div>
                  Write a custom reason...
                </button>

                <AnimatePresence>
                  {showCustom && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <textarea
                        autoFocus
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Describe your reason here..."
                        className="w-full mt-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all min-h-[100px] text-gray-900 dark:text-white placeholder:text-gray-400 resize-none"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setRejectModalOpen(false); resetRejectState(); }}
                  className="rounded-2xl py-3 border border-gray-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={submittingReject || (showCustom ? !customReason.trim() : !selectedReason)}
                  onClick={onConfirmReject}
                  className={cn(
                    "rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                    submittingReject || (showCustom ? !customReason.trim() : !selectedReason)
                      ? "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                      : "bg-rose-500 hover:bg-rose-600 text-white shadow-xl shadow-rose-500/20"
                  )}
                >
                  {submittingReject ? (
                    <><IconLoader2 size={14} className="animate-spin" /> Declining...</>
                  ) : 'Confirm Decline'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Modal (Using the New Cinematic Component) */}
      <LandlordInquiryDetailsModal 
        inquiry={selectedInquiry}
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        onUpdateStatus={async (id, status, reason) => {
          if (status === 'REJECTED') {
            await handleConfirmReject(id, reason || '');
          } else if (handleRespond) {
            await handleRespond(id, status as "APPROVED" | "REJECTED");
          }
        }}
        isUpdatingStatus={isResponding}
      />
    </>,
    document.body
  );
}

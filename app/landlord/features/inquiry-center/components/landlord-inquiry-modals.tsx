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
  const [submittingReject, setSubmittingReject] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState<string | null>(null);

  if (!selectedInquiry || !isClient) return null;

  const onConfirmReject = async (reason: string) => {
    setSubmittingReject(true);
    await handleConfirmReject(selectedInquiry.id, reason);
    setSubmittingReject(false);
    setRejectModalOpen(false);
    setCustomReason("");
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
              className="absolute inset-0 bg-gray-900/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-[#111827] rounded-[32px] border border-white/10 p-8 max-w-sm w-full shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500" />
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-[2rem] bg-rose-500/10 text-rose-500 border border-rose-900/30 flex items-center justify-center mb-8 shadow-inner">
                   <IconTrash size={36} className="animate-bounce" />
                </div>
                
                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight leading-none">
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

      {/* Rejection Reason Modal (New) */}
      <AnimatePresence>
        {rejectModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRejectModalOpen(false)}
              className="absolute inset-0 bg-gray-900/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-[#111827] rounded-[32px] border border-white/10 p-8 max-w-md w-full shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500" />
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Reject Inquiry</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Provide a reason for the tenant</p>
                  </div>
                  <button onClick={() => setRejectModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <IconX size={20} />
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Quick Reasons</p>
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_REASONS.map((reason) => (
                      <button
                        key={reason}
                        onClick={() => onConfirmReject(reason)}
                        className="px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-600 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 border border-gray-100 dark:border-gray-700 hover:border-rose-200 dark:hover:border-rose-900/50 rounded-xl text-xs font-bold transition-all text-left"
                      >
                        {reason}
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-50 dark:border-gray-800">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Custom Feedback</p>
                    <textarea
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Type your own reason here..."
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all min-h-[100px] text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    outline
                    onClick={() => setRejectModalOpen(false)}
                    className="rounded-xl py-3 text-xs font-black uppercase tracking-widest"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    isLoading={submittingReject}
                    disabled={!customReason.trim()}
                    onClick={() => onConfirmReject(customReason)}
                    className="rounded-xl py-3 shadow-lg shadow-rose-500/10 text-xs font-black uppercase tracking-widest"
                  >
                    Confirm Rejection
                  </Button>
                </div>
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

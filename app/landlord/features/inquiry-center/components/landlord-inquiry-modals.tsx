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
  IconEye 
} from '@tabler/icons-react';
import Button from '@/components/common/Button';
import { cn } from '@/utils/helper';
import { useRouter } from 'next/navigation';
import { Inquiry } from '../hooks/use-inquiry-logic';

interface LandlordInquiryModalsProps {
  deleteModalOpen: boolean;
  setDeleteModalOpen: (o: boolean) => void;
  viewModalOpen: boolean;
  setViewModalOpen: (o: boolean) => void;
  selectedInquiry: Inquiry | null;
  isDeleting: boolean;
  handleConfirmDelete: () => void;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  APPROVED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  REJECTED: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

export function LandlordInquiryModals({
  deleteModalOpen,
  setDeleteModalOpen,
  viewModalOpen,
  setViewModalOpen,
  selectedInquiry,
  isDeleting,
  handleConfirmDelete
}: LandlordInquiryModalsProps) {
  const router = useRouter();

  if (!selectedInquiry) return null;

  return (
    <>
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-8 max-w-sm w-full shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-rose-500" />
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-6 text-red-500 animate-pulse">
                  <IconAlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Remove Inquiry?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed font-medium">
                  Are you sure you want to remove the inquiry from <span className="font-bold text-gray-900 dark:text-white">"{selectedInquiry.user.name || selectedInquiry.user.email}"</span>?
                </p>
                <div className="flex flex-col w-full gap-2.5">
                  <Button
                    variant="danger"
                    isLoading={isDeleting}
                    onClick={handleConfirmDelete}
                    className="rounded-xl py-3 shadow-lg shadow-red-500/10 text-xs font-black uppercase tracking-widest"
                  >
                    Confirm Deletion
                  </Button>
                  <Button
                    outline
                    onClick={() => setDeleteModalOpen(false)}
                    className="rounded-xl py-3 border-gray-100 dark:border-gray-800 text-xs font-black uppercase tracking-widest"
                  >
                    Keep Record
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="relative bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-8 max-w-5xl w-full shadow-2xl overflow-hidden"
            >
              <button
                onClick={() => setViewModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <IconX size={18} />
              </button>

              <div className="flex flex-col gap-8 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                {/* Header */}
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-[28px] overflow-hidden flex-shrink-0 shadow-lg border-2 border-white dark:border-gray-800">
                    <img src={selectedInquiry.listing.imageSrc} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className={cn(
                      "inline-flex items-center px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border mb-3",
                      statusColors[selectedInquiry.status]
                    )}>
                      {selectedInquiry.status}
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{selectedInquiry.listing.title}</h3>
                  </div>
                </div>

                {/* Tenant Info */}
                <div className="bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-black text-lg">
                      {selectedInquiry.user.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <p className="text-lg font-black text-gray-900 dark:text-white">{selectedInquiry.user.name || 'Anonymous Tenant'}</p>
                      <p className="text-sm font-medium text-gray-500">{selectedInquiry.user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Room Preference', value: selectedInquiry.room?.name || 'Full Unit', icon: IconBuilding, color: 'text-primary' },
                    { label: 'Estimated Rate', value: selectedInquiry.room ? `₱${selectedInquiry.room.price.toLocaleString()}` : 'Varies', icon: IconCreditCard, color: 'text-emerald-500' },
                    { label: 'Received Date', value: new Date(selectedInquiry.createdAt).toLocaleDateString(), icon: IconCalendarEvent, color: 'text-blue-500' },
                    { label: 'Status', value: selectedInquiry.status, icon: IconInfoCircle, color: 'text-orange-500' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                      <div className={cn("w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-2", item.color)}>
                        <item.icon size={14} />
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{item.label}</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-row justify-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    onClick={() => {
                      setViewModalOpen(false);
                      router.push(`/landlord/inquiries/${selectedInquiry.id}`);
                    }}
                    className="rounded-xl px-10 py-3 shadow-xl shadow-primary/20 flex items-center gap-2"
                  >
                    <IconEye size={16} />
                    <span className="text-xs font-black uppercase tracking-widest">Open Conversation</span>
                  </Button>
                  <Button outline onClick={() => setViewModalOpen(false)} className="rounded-xl px-10 py-3 text-xs font-black uppercase tracking-widest">
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

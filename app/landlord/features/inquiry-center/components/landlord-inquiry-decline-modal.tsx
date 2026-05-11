'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconLoader2 } from '@tabler/icons-react';
import { cn } from '@/utils/helper';
import { useIsClient } from '@/hooks/useIsClient';

interface LandlordInquiryDeclineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

const PREDEFINED_REASONS = [
  "Room no longer available",
  "Profile incomplete or not verified",
  "Number of occupants exceeds limit",
  "Stay duration does not meet minimum requirements",
  "Inquiry policy violation",
];

export function LandlordInquiryDeclineModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: LandlordInquiryDeclineModalProps) {
  const isClient = useIsClient();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customReason, setCustomReason] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedReason(null);
      setShowCustom(false);
      setCustomReason('');
    }
  }, [isOpen]);

  if (!isClient) return null;

  const handleConfirm = async () => {
    const reason = showCustom ? customReason.trim() : selectedReason;
    if (!reason) return;
    await onConfirm(reason);
  };

  const isSubmitDisabled = isLoading || (showCustom ? !customReason.trim() : !selectedReason);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/40 dark:bg-gray-950/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative bg-white dark:bg-[#111827] rounded-[2rem] border border-gray-100 dark:border-white/10 max-w-md w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Accent bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 to-rose-600 rounded-t-[2rem]" />

            {/* Header */}
            <div className="flex items-start justify-between px-8 pt-8 pb-5">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  Decline Inquiry
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  Select a reason to notify the tenant
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="px-8 pb-8 space-y-5">

              {/* Quick Reasons */}
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">
                  Quick Reasons
                </p>
                <div className="space-y-2">
                  {PREDEFINED_REASONS.map((reason) => {
                    const isSelected = selectedReason === reason && !showCustom;
                    return (
                      <button
                        key={reason}
                        onClick={() => {
                          setSelectedReason(reason);
                          setShowCustom(false);
                          setCustomReason('');
                        }}
                        className={cn(
                          'w-full text-left px-4 py-3 rounded-2xl border text-sm font-semibold transition-all flex items-center gap-3',
                          isSelected
                            ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 shadow-sm'
                            : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-300 hover:bg-rose-50/50 dark:hover:bg-rose-500/5 hover:border-rose-200 dark:hover:border-rose-500/20 hover:text-rose-600 dark:hover:text-rose-400'
                        )}
                      >
                        {/* Radio indicator */}
                        <div className={cn(
                          'w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
                          isSelected ? 'border-rose-500 bg-rose-500' : 'border-gray-300 dark:border-gray-600'
                        )}>
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        {reason}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Reason Toggle */}
              <div>
                <button
                  onClick={() => {
                    setShowCustom((v) => !v);
                    setSelectedReason(null);
                  }}
                  className={cn(
                    'w-full px-4 py-3 rounded-2xl border text-sm font-bold transition-all flex items-center gap-3',
                    showCustom
                      ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-400'
                      : 'bg-gray-50 dark:bg-white/5 border-dashed border-gray-200 dark:border-white/10 text-gray-400 hover:text-rose-500 hover:border-rose-300 dark:hover:border-rose-500/30'
                  )}
                >
                  <div className={cn(
                    'w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
                    showCustom ? 'border-rose-500 bg-rose-500' : 'border-gray-300 dark:border-gray-600'
                  )}>
                    {showCustom && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
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

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  onClick={onClose}
                  className="rounded-2xl py-3 border border-gray-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitDisabled}
                  onClick={handleConfirm}
                  className={cn(
                    'rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2',
                    isSubmitDisabled
                      ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'bg-rose-500 hover:bg-rose-600 text-white shadow-xl shadow-rose-500/20'
                  )}
                >
                  {isLoading ? (
                    <><IconLoader2 size={14} className="animate-spin" /> Declining...</>
                  ) : 'Confirm Decline'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

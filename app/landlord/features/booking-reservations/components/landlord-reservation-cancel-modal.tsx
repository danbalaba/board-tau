'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconLoader2, IconAlertTriangle } from '@tabler/icons-react';
import { cn } from '@/utils/helper';
import { useIsClient } from '@/hooks/useIsClient';
import Button from '@/components/common/Button';

interface LandlordReservationCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

const PREDEFINED_REASONS = [
  "Room unavailable due to maintenance",
  "Double booking / System error",
  "Reservation policy violation",
  "Security deposit not verified",
  "Tenant requested cancellation via chat",
];

export function LandlordReservationCancelModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: LandlordReservationCancelModalProps) {
  const isClient = useIsClient();
  const [step, setStep] = useState<'confirm' | 'reason'>('confirm');
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customReason, setCustomReason] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep('confirm');
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
            <div className={cn(
              "absolute top-0 left-0 w-full h-1.5 rounded-t-[2rem] transition-colors duration-500",
              step === 'confirm' ? "bg-rose-500" : "bg-amber-500"
            )} />

            <AnimatePresence mode="wait">
              {step === 'confirm' ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-8 text-center relative"
                >
                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-gray-700 dark:hover:text-white"
                  >
                    <IconX size={18} />
                  </button>

                  <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <IconX size={32} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Cancel Reservation?</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium italic">
                    This will remove the reservation. The tenant will be notified immediately.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      outline
                      onClick={onClose}
                      className="rounded-xl py-3 text-xs font-black uppercase tracking-widest border-gray-100 dark:border-gray-800"
                    >
                      Wait, Keep It
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => setStep('reason')}
                      className="rounded-xl py-3 text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-500/10"
                    >
                      Confirm Revoke
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="reason"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between px-8 pt-8 pb-5">
                    <div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                        Reason for Cancellation
                      </h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                        Professional record keeping required
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
                                ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 shadow-sm'
                                : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-300 hover:bg-amber-50/50 dark:hover:bg-amber-500/5 hover:border-amber-200 dark:hover:border-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400'
                            )}
                          >
                            <div className={cn(
                              'w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
                              isSelected ? 'border-amber-500 bg-amber-500' : 'border-gray-300 dark:border-gray-600'
                            )}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            {reason}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Reason */}
                    <div>
                      <button
                        onClick={() => {
                          setShowCustom((v) => !v);
                          setSelectedReason(null);
                        }}
                        className={cn(
                          'w-full px-4 py-3 rounded-2xl border text-sm font-bold transition-all flex items-center gap-3',
                          showCustom
                            ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400'
                            : 'bg-gray-50 dark:bg-white/5 border-dashed border-gray-200 dark:border-white/10 text-gray-400 hover:text-amber-500 hover:border-amber-300 dark:hover:border-amber-500/30'
                        )}
                      >
                        <div className={cn(
                          'w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
                          showCustom ? 'border-amber-500 bg-amber-500' : 'border-gray-300 dark:border-gray-600'
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
                              className="w-full mt-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all min-h-[100px] text-gray-900 dark:text-white placeholder:text-gray-400 resize-none"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <button
                        onClick={() => setStep('confirm')}
                        className="rounded-2xl py-3 border border-gray-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                      >
                        Go Back
                      </button>
                      <button
                        disabled={isSubmitDisabled}
                        onClick={handleConfirm}
                        className={cn(
                          'rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2',
                          isSubmitDisabled
                            ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                            : 'bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20'
                        )}
                      >
                        {isLoading ? (
                          <><IconLoader2 size={14} className="animate-spin" /> Finalizing...</>
                        ) : 'Finish Cancellation'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

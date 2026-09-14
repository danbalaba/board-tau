'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X, Loader2 } from 'lucide-react';
import { Button } from '@/app/admin/components/ui/button';
import { useIsClient } from '@/hooks/useIsClient';

interface AdminApplicationDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  applicantName?: string;
  isDeleting?: boolean;
}

export function AdminApplicationDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  applicantName = 'this applicant',
  isDeleting = false
}: AdminApplicationDeleteModalProps) {
  const isClient = useIsClient();
  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md">
          {/* Backdrop Click Dismiss */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0" 
          />

          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 15 }} 
            className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-7 sm:p-9 max-w-md w-full shadow-2xl overflow-hidden z-10"
          >
            {/* Close Button */}
            <button 
              onClick={onClose} 
              disabled={isDeleting}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              <X size={18} />
            </button>

            {/* Modal Body */}
            <div className="flex flex-col items-center text-center pt-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-[2rem] flex items-center justify-center mb-5 shadow-sm border border-rose-200 dark:border-rose-500/20">
                <Trash2 size={32} className="animate-bounce" />
              </div>
              
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
                Delete Host Application
              </h3>

              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mb-8 leading-relaxed px-2">
                Are you sure you want to delete the host application for <span className="font-black text-slate-900 dark:text-white underline decoration-rose-500/40 decoration-2 underline-offset-4">"{applicantName}"</span>? This action cannot be undone and will permanently remove all submitted details.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row w-full gap-3">
                <Button 
                  variant="outline" 
                  onClick={onClose} 
                  disabled={isDeleting}
                  className="flex-1 rounded-2xl py-3.5 border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 order-2 sm:order-1"
                >
                  Cancel
                </Button>

                <Button 
                  variant="destructive" 
                  onClick={onConfirm} 
                  disabled={isDeleting}
                  className="flex-1 rounded-2xl py-3.5 bg-rose-500 hover:bg-rose-600 text-white shadow-xl shadow-rose-500/20 text-xs font-black uppercase tracking-wider order-1 sm:order-2"
                >
                  {isDeleting ? (
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 size={15} className="animate-spin" /> Deleting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 justify-center">
                      <Trash2 size={15} /> Delete Application
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

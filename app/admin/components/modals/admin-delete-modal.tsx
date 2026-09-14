'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useIsClient } from '@/hooks/useIsClient';

interface AdminDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  isDeleting?: boolean;
}

export function AdminDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  isDeleting = false
}: AdminDeleteModalProps) {
  const isClient = useIsClient();
  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-white/40 dark:bg-gray-950/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 max-sm:w-full max-w-sm shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col items-center text-center pt-2">
              <div className="w-20 h-20 rounded-[2rem] bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mb-6 shadow-inner">
                <Trash2 size={36} className="animate-bounce" />
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight leading-none">
                Delete Permanently
              </h3>
              
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-8 leading-relaxed px-2">
                You are about to permanently delete <span className="font-black text-slate-900 dark:text-white">{itemName}</span>. This action cannot be undone.
              </p>

              <div className="flex flex-col w-full gap-3">
                <button
                  disabled={isDeleting}
                  onClick={onConfirm}
                  className="rounded-2xl py-3.5 shadow-xl text-[10px] font-black uppercase tracking-[0.2em] bg-rose-500 hover:bg-rose-600 shadow-rose-500/20 text-white transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Delete Permanently'
                  )}
                </button>
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="rounded-2xl py-3.5 border border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  Cancel Action
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

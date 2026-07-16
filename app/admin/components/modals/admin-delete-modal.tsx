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
            className="relative bg-white dark:bg-[#111827] rounded-[32px] border border-gray-100 dark:border-white/10 p-8 max-sm:w-full max-w-sm shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500" />
            
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-[2rem] bg-rose-500/10 text-rose-500 border border-rose-900/30 flex items-center justify-center mb-8 shadow-inner">
                <Trash2 size={36} className="animate-bounce" />
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight leading-none">
                Delete Permanently
              </h3>
              
              <p className="text-sm text-gray-400 mb-8 leading-relaxed font-medium px-4">
                You are about to permanently delete {itemName}. This action cannot be undone.
              </p>

              <div className="flex flex-col w-full gap-3">
                <button
                  disabled={isDeleting}
                  onClick={onConfirm}
                  className="rounded-2xl py-4 shadow-xl text-[10px] font-black uppercase tracking-[0.2em] bg-rose-500 hover:bg-rose-600 shadow-rose-500/20 text-white transition-all disabled:opacity-50 flex items-center justify-center"
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
                  className="rounded-2xl py-4 border border-gray-200 dark:border-gray-800 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
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

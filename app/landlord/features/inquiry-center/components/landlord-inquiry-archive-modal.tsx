'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Archive, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/utils/helper';
import { createPortal } from 'react-dom';
import { useIsClient } from '@/hooks/useIsClient';

interface LandlordArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isArchiving?: boolean;
  isRestore?: boolean;
}

const LandlordArchiveModal: React.FC<LandlordArchiveModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isArchiving = false,
  isRestore = false
}) => {
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-[#111827] rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
                  isRestore 
                    ? "bg-emerald-500 shadow-emerald-500/20" 
                    : "bg-amber-500 shadow-amber-500/20"
                )}>
                  {isRestore ? (
                    <RotateCcw className="text-white w-7 h-7" />
                  ) : (
                    <Archive className="text-white w-7 h-7" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white leading-none mb-1">
                    {title}
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Action Required
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 mb-8">
                <div className="flex gap-3">
                  <AlertCircle className="shrink-0 w-5 h-5 text-amber-500 mt-0.5" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onClose}
                  disabled={isArchiving}
                  className="px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  Go Back
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isArchiving}
                  className={cn(
                    "px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50",
                    isRestore 
                      ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" 
                      : "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
                  )}
                >
                  {isArchiving ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {isRestore ? <RotateCcw size={14} strokeWidth={3} /> : <Archive size={14} strokeWidth={3} />}
                      {isRestore ? 'Restore Now' : 'Archive Now'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default LandlordArchiveModal;

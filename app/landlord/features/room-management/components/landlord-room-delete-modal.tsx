'use client';

import React from 'react';
import { Trash2, X, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useIsClient } from '@/hooks/useIsClient';
import { Button } from '@/app/admin/components/ui/button';
import { Room } from '../hooks/use-room-logic';

interface LandlordRoomDeleteModalProps {
  room: Room;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function LandlordRoomDeleteModal({
  room,
  onClose,
  onConfirm,
  isDeleting,
}: LandlordRoomDeleteModalProps) {
  const isClient = useIsClient();

  if (!isClient) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gray-900/80 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="relative w-full max-w-md bg-[#111827] rounded-[2.5rem] border border-white/10 shadow-2xl p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-100 dark:border-rose-500/20">
          <AlertTriangle size={28} className="text-rose-500" />
        </div>

        {/* Text */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-3">
            Delete Unit?
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            You are about to permanently delete{' '}
            <span className="font-black text-gray-900 dark:text-white">{room.name}</span>{' '}
            from{' '}
            <span className="font-black text-gray-900 dark:text-white">{room.propertyTitle}</span>.
            This action cannot be undone.
          </p>
        </div>

        {/* Separator */}
        <div className="h-px bg-gray-100 dark:bg-gray-800 mb-6" />

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            outline
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest border-gray-200 dark:border-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 h-12 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 border-b-4 border-rose-600/50 active:border-b-0 transition-all"
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Deleting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Trash2 size={14} /> Delete Unit
              </span>
            )}
          </Button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

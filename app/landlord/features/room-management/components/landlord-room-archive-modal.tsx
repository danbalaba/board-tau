'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Archive, 
  RotateCcw, 
  AlertTriangle 
} from 'lucide-react';
import { cn } from '@/utils/helper';
import { createPortal } from 'react-dom';
import { useIsClient } from '@/hooks/useIsClient';
import { Button } from '@/app/admin/components/ui/button';
import { Room } from '../hooks/use-room-logic';

interface LandlordRoomArchiveModalProps {
  isOpen: boolean;
  onClose: (o: boolean) => void;
  room: Room | null;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function LandlordRoomArchiveModal({
  isOpen,
  onClose,
  room,
  onConfirm,
  isLoading
}: LandlordRoomArchiveModalProps) {
  const isClient = useIsClient();

  if (!room || !isClient) return null;

  const isArchived = (room as any).isArchived;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onClose(false)}
            className="absolute inset-0 bg-white/40 dark:bg-gray-950/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white dark:bg-[#111827] rounded-[32px] border border-gray-100 dark:border-white/10 p-8 max-w-sm w-full shadow-2xl overflow-hidden"
          >
            <div className={cn(
              "absolute top-0 left-0 w-full h-1.5",
              isArchived ? "bg-emerald-500" : "bg-amber-500"
            )} />
            
            <div className="flex flex-col items-center text-center">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 animate-pulse",
                isArchived ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500" : "bg-amber-50 dark:bg-amber-900/20 text-amber-500"
              )}>
                {isArchived ? <RotateCcw size={32} /> : <Archive size={32} />}
              </div>

              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                 {isArchived ? 'Restore Room Unit?' : 'Archive Room Unit?'}
              </h3>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed font-medium">
                {isArchived 
                  ? `Are you sure you want to restore "${room.name}"? It will be moved back to your active unit inventory.`
                  : `Are you sure you want to archive "${room.name}"? This will hide it from active listings but keep its history for your records.`
                }
              </p>

              <div className="flex flex-col w-full gap-2.5">
                <button
                  disabled={isLoading}
                  onClick={onConfirm}
                  className={cn(
                    "w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-2",
                    isArchived 
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20" 
                      : "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                  )}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {isArchived ? <RotateCcw size={14} strokeWidth={3} /> : <Archive size={14} strokeWidth={3} />}
                      {isArchived ? 'Confirm Restore' : 'Confirm Archive'}
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => onClose(false)}
                  className="w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all"
                >
                  Cancel
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

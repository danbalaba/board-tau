'use client';
 
import React from 'react';
import { AlertTriangle, X, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/app/admin/components/ui/button';
import { Property } from '../hooks/use-property-logic';
 
import { createPortal } from 'react-dom';
import { useIsClient } from '@/hooks/useIsClient';
 
interface LandlordPropertyDeleteModalProps {
  isOpen: boolean;
  property: Property | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
 
export function LandlordPropertyDeleteModal({
  isOpen,
  property,
  isDeleting,
  onClose,
  onConfirm
}: LandlordPropertyDeleteModalProps) {
  const isClient = useIsClient();

  if (!isOpen || !property || !isClient) return null;
 
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-gray-900/80 backdrop-blur-md" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.9, y: 20 }} 
        className="relative bg-[#111827] rounded-[2.5rem] border border-white/10 p-10 max-w-md w-full shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <X size={20} />
        </button>
 
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center mb-8 text-rose-500 shadow-inner border border-rose-900/30">
            <Trash2 size={36} className="animate-bounce" />
          </div>
          
          <h3 className="text-3xl font-black text-white mb-3 uppercase tracking-tight leading-none">Delete Permanently</h3>
          <p className="text-[13px] text-gray-400 mb-10 leading-relaxed font-medium px-4">
            You are about to permanently delete <span className="font-black text-white underline decoration-rose-500/50 decoration-2 underline-offset-4">"{property.title}"</span>. 
            This will remove all <span className="text-rose-400 font-bold">gallery images</span> and <span className="text-rose-400 font-bold">room photos</span> from our servers.
          </p>
 
          <div className="flex flex-col sm:flex-row w-full gap-4">
            <Button 
              outline 
              onClick={onClose} 
              disabled={isDeleting}
              className="flex-1 rounded-2xl py-4 border-gray-200 dark:border-gray-700 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={onConfirm} 
              disabled={isDeleting}
              className="flex-1 rounded-2xl py-4 shadow-xl shadow-red-500/20 text-[10px] font-black uppercase tracking-[0.2em] order-1 sm:order-2"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Deleting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Trash2 size={14} /> Confirm Delete
                </span>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

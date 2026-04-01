'use client';

import React from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Button from '@/components/common/Button';
import { Property } from '../hooks/use-property-logic';

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
  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 max-w-sm w-full shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 to-orange-500" />
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-6 text-red-500 animate-pulse"><IconAlertTriangle size={32} /></div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Delete Property?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">Are you sure you want to remove <span className="font-bold text-gray-900 dark:text-white">"{property.title}"</span>? This action is permanent.</p>
          <div className="flex flex-col w-full gap-2.5">
            <Button variant="danger" isLoading={isDeleting} onClick={onConfirm} className="rounded-lg py-3 shadow-lg shadow-red-500/10 text-sm">Confirm Deletion</Button>
            <Button outline onClick={onClose} className="rounded-lg py-3 border-gray-200 dark:border-gray-700 text-sm">Keep Property</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

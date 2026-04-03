'use client';

import React from 'react';
import { 
  IconX, 
  IconMail, 
  IconUser, 
  IconBuilding, 
  IconCreditCard, 
  IconCalendarEvent, 
  IconInfoCircle, 
  IconEye
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Button from '@/components/common/Button';

interface Inquiry {
  id: string;
  listing: {
    id: string;
    title: string;
    imageSrc: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  room?: {
    id: string;
    name: string;
    price: number;
  };
  status: string;
  createdAt: string | Date;
}

interface LandlordInquiryDetailModalProps {
  inquiry: Inquiry;
  onClose: () => void;
  onOpenConversation: (id: string) => void;
  statusColors: Record<string, string>;
}

export default function LandlordInquiryDetailModal({
  inquiry,
  onClose,
  onOpenConversation,
  statusColors,
}: LandlordInquiryDetailModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 40 }}
        className="relative bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-8 max-w-5xl w-full shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <IconX size={18} />
        </button>

        <div className="flex flex-col gap-8 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* Header Section */}
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[28px] overflow-hidden flex-shrink-0 shadow-lg border-2 border-white dark:border-gray-800">
              {inquiry.listing.imageSrc ? (
                <img src={inquiry.listing.imageSrc} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300">
                  <IconMail size={40} />
                </div>
              )}
            </div>
            <div className="flex-1 pt-1">
              <div className={cn(
                "inline-flex items-center px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border mb-3",
                statusColors[inquiry.status]
              )}>
                {inquiry.status}
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-2 tracking-tight">
                {inquiry.listing.title}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">ID: {inquiry.id}</span>
              </div>
            </div>
          </div>

          {/* Tenant Info Section */}
          <div className="bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
              <IconUser size={12} className="text-primary" />
              Interested Tenant
            </h4>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-black text-lg">
                {inquiry.user.name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="text-lg font-black text-gray-900 dark:text-white tracking-tight">{inquiry.user.name || 'Anonymous Tenant'}</p>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{inquiry.user.email}</p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Room Preference', value: inquiry.room?.name || 'Full Unit', icon: IconBuilding, color: 'text-primary' },
              { label: 'Estimated Rate', value: inquiry.room ? `₱${inquiry.room.price.toLocaleString()}` : 'Varies', icon: IconCreditCard, color: 'text-emerald-500' },
              { label: 'Received Date', value: new Date(inquiry.createdAt).toLocaleDateString(), icon: IconCalendarEvent, color: 'text-blue-500' },
              { label: 'Inquiry Status', value: inquiry.status, icon: IconInfoCircle, color: 'text-orange-500' },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className={cn("w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-2", item.color)}>
                  <item.icon size={14} />
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{item.label}</p>
                <p className="text-sm font-black text-gray-900 dark:text-white truncate">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-row justify-center items-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Button
              onClick={() => onOpenConversation(inquiry.id)}
              className="rounded-xl w-auto py-3 px-10 shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
            >
              <IconEye size={16} />
              <span className="text-xs font-black uppercase tracking-widest">Open Conversation</span>
            </Button>
            <Button
              outline
              onClick={onClose}
              className="rounded-xl w-auto py-3 px-10 text-xs font-black uppercase tracking-widest"
            >
              Close
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

'use client';

import React from 'react';
import { 
  IconMail, 
  IconUser, 
  IconCalendarEvent, 
  IconMessage, 
  IconCheck, 
  IconX,
  IconBuilding
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

interface LandlordInquiryCardProps {
  inquiry: Inquiry;
  idx: number;
  viewMode: 'grid' | 'list';
  statusColors: Record<string, string>;
  statusIcons: Record<string, any>;
  onRespond: (inquiryId: string, status: 'APPROVED' | 'REJECTED') => void;
  onMessage: (inquiryId: string) => void;
}

export default function LandlordInquiryCard({
  inquiry,
  idx,
  viewMode,
  statusColors,
  statusIcons,
  onRespond,
  onMessage,
}: LandlordInquiryCardProps) {
  const StatusIcon = statusIcons[inquiry.status] || IconMail;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className={cn(
        "group relative bg-white dark:bg-gray-900 rounded-[40px] border border-gray-100 dark:border-gray-800 p-6 hover:border-primary/40 transition-all duration-500 shadow-xl shadow-gray-200/50 dark:shadow-none hover:shadow-2xl hover:-translate-y-2 overflow-hidden",
        viewMode === "list" && "flex flex-col sm:flex-row gap-8 items-center"
      )}
    >
      <div className={cn(
        "relative rounded-[24px] overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 z-10",
        viewMode === "grid" ? "h-48 mb-5 w-full" : "w-full sm:w-48 h-40"
      )}>
        {inquiry.listing.imageSrc ? (
          <img
            src={inquiry.listing.imageSrc}
            alt={inquiry.listing.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <IconMail size={40} strokeWidth={1.5} />
          </div>
        )}

        {/* Status Badge overlay */}
        <div className="absolute top-3 left-3 z-20">
          <span className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] uppercase font-black tracking-widest shadow-lg backdrop-blur-md border",
            statusColors[inquiry.status] || "bg-white text-gray-800 border-gray-200"
          )}>
            <StatusIcon size={12} strokeWidth={3} />
            {inquiry.status}
          </span>
        </div>
      </div>

      <div className="flex-1 min-w-0 w-full z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 pr-4">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight truncate group-hover:text-primary transition-colors">
              {inquiry.listing.title}
            </h3>

            <div className="flex items-center gap-3 mb-6 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-2xl border border-gray-100/50 dark:border-gray-800 w-fit">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white font-black text-xs uppercase shadow-lg shadow-primary/20">
                {inquiry.user.name?.charAt(0) || <IconUser size={14} />}
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5 leading-none">Perspective Tenant</p>
                <p className="text-sm font-black text-gray-900 dark:text-gray-100 max-w-[150px] sm:max-w-[200px] truncate leading-none">{inquiry.user.name || 'Anonymous User'}</p>
              </div>
            </div>
          </div>
        </div>

        {inquiry.room && (
          <div className="flex items-center gap-3 mb-5 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Room Interest</p>
              <p className="text-xs font-black text-gray-900 dark:text-white truncate">{inquiry.room.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Rate</p>
              <p className="text-xs font-black text-primary">₱{inquiry.room.price.toLocaleString()}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
          <div className="flex items-center gap-1.5">
            <IconCalendarEvent size={12} className="text-gray-300 dark:text-gray-600" />
            {new Date(inquiry.createdAt).toLocaleDateString()}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
          <Button
            outline
            onClick={() => onMessage(inquiry.id)}
            className="flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
          >
            <span className="flex items-center justify-center gap-2">
              <IconMessage size={14} />
              Message
            </span>
          </Button>

          {inquiry.status === "PENDING" && (
            <div className="flex gap-3 basis-[100%] sm:basis-auto flex-1">
              <Button
                onClick={() => onRespond(inquiry.id, "APPROVED")}
                className="flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 group/btn"
              >
                <span className="flex items-center justify-center gap-2">
                  <IconCheck size={14} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                  Approve
                </span>
              </Button>
              <Button
                outline
                onClick={() => onRespond(inquiry.id, "REJECTED")}
                className="flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest border-rose-100 text-rose-500 hover:bg-rose-50 dark:border-rose-900/30 group/btn"
              >
                <span className="flex items-center justify-center gap-2">
                  <IconX size={14} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                  Reject
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[32px]" />
    </motion.div>
  );
}

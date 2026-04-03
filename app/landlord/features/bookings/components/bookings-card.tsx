'use client';

import React from 'react';
import { 
  IconCalendarCheck, 
  IconCalendar, 
  IconCheck, 
  IconX, 
  IconEye 
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import Button from "@/components/common/Button";

interface Booking {
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
  status: string;
  paymentStatus: string;
  totalPrice: number;
  startDate: Date | string;
  endDate: Date | string;
  createdAt: Date | string;
}

interface LandlordBookingCardProps {
  booking: Booking;
  viewMode: 'grid' | 'list';
  statusColors: Record<string, string>;
  paymentStatusColors: Record<string, string>;
  onUpdateStatus: (id: string, status: 'pending' | 'confirmed' | 'cancelled') => void;
  onViewDetails: (id: string) => void;
}

export default function LandlordBookingCard({
  booking,
  viewMode,
  statusColors,
  paymentStatusColors,
  onUpdateStatus,
  onViewDetails,
}: LandlordBookingCardProps) {
  if (viewMode === 'grid') {
    return (
      <div className="group relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 hover:border-primary/20 transition-all duration-300 hover:shadow-xl shadow-sm flex flex-col">
        <div className="relative h-44 rounded-2xl overflow-hidden mb-6">
          {booking.listing.imageSrc ? (
            <img
              src={booking.listing.imageSrc}
              alt={booking.listing.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
              <IconCalendarCheck size={32} />
            </div>
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <span className={cn("px-2.5 py-1 rounded-lg text-[9px] uppercase font-black tracking-widest shadow-lg backdrop-blur-md", statusColors[booking.status.toLowerCase()])}>
              {booking.status}
            </span>
            <span className={cn("px-2.5 py-1 rounded-lg text-[9px] uppercase font-black tracking-widest shadow-lg backdrop-blur-md", paymentStatusColors[booking.paymentStatus.toLowerCase()])}>
              {booking.paymentStatus}
            </span>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {booking.listing.title}
          </h3>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black ring-2 ring-primary/5">
                {booking.user.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-xs font-black text-gray-900 dark:text-gray-100">{booking.user.name || 'Anonymous'}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{new Date(booking.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-primary">₱{booking.totalPrice.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700/50 mb-6 flex items-center gap-2">
            <IconCalendar size={14} className="text-primary" />
            <span className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider">
              {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button
            outline
            onClick={() => onViewDetails(booking.id)}
            className="w-full rounded-xl py-3 text-[10px] font-black uppercase tracking-widest"
          >
            Manage Booking
          </Button>
          
          {booking.status.toLowerCase() === 'pending' && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                className="rounded-xl py-2.5 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
              >
                Confirm
              </Button>
              <Button
                outline
                onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                className="rounded-xl py-2.5 border-red-200 text-red-500"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:border-primary/20 transition-all duration-300 hover:shadow-xl shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-2">
        <div className="flex items-start gap-5 flex-1">
          <div className="relative w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden flex-shrink-0 group-hover:shadow-md transition-all duration-300">
            {booking.listing.imageSrc ? (
              <img
                src={booking.listing.imageSrc}
                alt={booking.listing.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <IconCalendarCheck size={24} />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("px-2 py-0.5 rounded-md text-[9px] uppercase font-black tracking-widest", statusColors[booking.status.toLowerCase()])}>
                {booking.status}
              </span>
              <span className={cn("px-2 py-0.5 rounded-md text-[9px] uppercase font-black tracking-widest", paymentStatusColors[booking.paymentStatus.toLowerCase()])}>
                {booking.paymentStatus}
              </span>
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">
              {booking.listing.title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black uppercase">
                {booking.user.name?.charAt(0) || 'U'}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                <span className="font-bold text-gray-900 dark:text-gray-100">{booking.user.name || 'Anonymous User'}</span>
              </p>
            </div>
            <p className="text-xl font-black text-gray-900 dark:text-white mb-2">
              ₱{booking.totalPrice.toLocaleString()}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
              <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md">
                <IconCalendar size={10} className="text-primary" />
                {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
              </span>
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Booked on {new Date(booking.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
        <Button
          outline
          onClick={() => onViewDetails(booking.id)}
          className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border-gray-200 dark:border-gray-700"
        >
          <span className="flex items-center gap-2">
            <IconEye size={12} />
            View Details
          </span>
        </Button>
        
        {booking.status.toLowerCase() === 'pending' && (
          <div className="flex items-center gap-2 border-l border-gray-100 dark:border-gray-800 pl-3">
            <Button
              onClick={() => onUpdateStatus(booking.id, 'confirmed')}
              className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
            >
              <span className="flex items-center gap-2">
                <IconCheck size={12} />
                Confirm
              </span>
            </Button>
            <Button
              outline
              onClick={() => onUpdateStatus(booking.id, 'cancelled')}
              className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 dark:border-red-900/50"
            >
              <span className="flex items-center gap-2">
                <IconX size={12} />
                Cancel
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

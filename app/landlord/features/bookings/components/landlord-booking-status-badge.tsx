'use client';

import React from 'react';
import { cn } from '@/utils/helper';
import { 
  IconClock, 
  IconCircleCheck, 
  IconCircleX, 
  IconPlayerPlay, 
  IconHomeCheck 
} from '@tabler/icons-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function LandlordBookingStatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'pending_payment':
        return {
          label: 'Awaiting Payment',
          classes: 'bg-amber-500/90 text-white border-amber-400/40',
        };
      case 'confirmed':
      case 'reserved':
        return {
          label: 'Securely Reserved',
          classes: 'bg-emerald-500/90 text-white border-emerald-400/40',
        };
      case 'checked_in':
        return {
          label: 'Currently In-house',
          classes: 'bg-blue-500/90 text-white border-blue-400/40',
        };
      case 'completed':
        return {
          label: 'Stay Completed',
          classes: 'bg-purple-500/90 text-white border-purple-400/40',
        };
      case 'cancelled':
        return {
          label: 'Stay Revoked',
          classes: 'bg-rose-500/90 text-white border-rose-400/40',
        };
      default:
        return {
          label: status.replace('_', ' '),
          classes: 'bg-gray-800/90 text-white border-gray-700/40',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={cn(
      "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md border",
      config.classes,
      className
    )}>
      <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {config.label}
    </span>
  );
}

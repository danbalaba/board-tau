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
          classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
          icon: <IconClock size={14} />
        };
      case 'confirmed':
      case 'reserved':
        return {
          label: 'Securely Reserved',
          classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
          icon: <IconCircleCheck size={14} />
        };
      case 'checked_in':
        return {
          label: 'Currently In-house',
          classes: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
          icon: <IconPlayerPlay size={14} fill="currentColor" />
        };
      case 'completed':
        return {
          label: 'Stay Completed',
          classes: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
          icon: <IconHomeCheck size={14} />
        };
      case 'cancelled':
        return {
          label: 'Stay Revoked',
          classes: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
          icon: <IconCircleX size={14} />
        };
      default:
        return {
          label: status,
          classes: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200',
          icon: null
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border shadow-sm backdrop-blur-md",
      config.classes,
      className
    )}>
      {config.icon}
      {config.label}
    </div>
  );
}

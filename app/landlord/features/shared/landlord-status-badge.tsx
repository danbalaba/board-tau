'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type LandlordStatus = 'active' | 'pending' | 'rejected' | 'flagged' | 'confirmed' | 'success' | 'published' | string;

interface LandlordStatusBadgeProps {
  status: LandlordStatus;
  className?: string;
  dot?: boolean;
}

const statusConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
  active: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-500/20', label: 'Active' },
  confirmed: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20', label: 'Confirmed' },
  published: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20', label: 'Published' },
  success: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20', label: 'Success' },
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20', label: 'Pending' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/20', label: 'Rejected' },
  flagged: { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/20', label: 'Flagged' },
};

export default function LandlordStatusBadge({
  status,
  className,
  dot = true,
}: LandlordStatusBadgeProps) {
  const lowerStatus = status.toLowerCase();
  const config = statusConfig[lowerStatus] || {
    bg: 'bg-gray-500/10',
    text: 'text-gray-600',
    border: 'border-gray-500/20',
    label: status.charAt(0).toUpperCase() + status.slice(1),
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-sm",
      config.bg,
      config.text,
      config.border,
      className
    )}>
      {dot && (
        <div className={cn(
          "w-1.5 h-1.5 rounded-full",
          config.text.replace('text-', 'bg-'),
          (lowerStatus === 'active' || lowerStatus === 'confirmed') && "animate-pulse shadow-[0_0_8px_currentColor]"
        )} />
      )}
      <span>{config.label}</span>
    </div>
  );
}

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { TablerIconsProps } from '@tabler/icons-react';

interface LandlordFormHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  className?: string;
  badge?: string;
}

export default function LandlordFormHeader({
  title,
  subtitle,
  icon: Icon,
  className,
  badge,
}: LandlordFormHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row items-center justify-between gap-6 mb-8", className)}>
      <div className="flex items-center gap-6">
        {Icon && (
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-[24px] flex items-center justify-center shadow-inner">
            <Icon size={32} strokeWidth={2.5} />
          </div>
        )}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">
              {title}
            </h1>
            {badge && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-wider">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Inbox, ShieldCheck, RefreshCw, Download, Calendar, ChevronDown, ShieldAlert } from 'lucide-react';
import { Button } from '@/app/admin/components/ui/button';
import { IconFileTypePdf, IconTable, IconFileTypeCsv } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import Skeleton from '@/components/common/Skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';

interface AdminQueueHeaderProps {
  handleRefresh?: () => void;
  onExport?: (format: 'CSV' | 'EXCEL' | 'PDF') => void;
  isLoading?: boolean;
  totalPending: number;
  range?: string;
  onRangeChange?: (range: string) => void;
  isSuperAdmin?: boolean;
}

const DATE_RANGES = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Past Year' },
];

export function AdminQueueHeader({
  handleRefresh,
  onExport,
  totalPending,
  isLoading,
  range,
  onRangeChange,
  isSuperAdmin = false,
}: AdminQueueHeaderProps) {
  const rangeLabel = DATE_RANGES.find(r => r.value === range)?.label ?? 'Last 30 Days';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-[3rem] border border-indigo-500/10 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-indigo-500/10 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Title */}
        <div className="flex items-center gap-5">
          {isLoading ? (
            <>
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div>
                <Skeleton className="h-8 w-48 mb-2 rounded-lg" />
                <Skeleton className="h-4 w-64 rounded-md" />
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-indigo-500 border border-gray-100 dark:border-gray-700">
                <Inbox size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight flex items-center gap-3">
                  Moderation Inbox
                  {totalPending > 0 && (
                    <span className="flex items-center gap-1.5 bg-indigo-500/10 px-3 py-1.5 rounded-2xl border border-indigo-500/10 text-indigo-500 text-[10px] tracking-[0.2em] font-black italic shadow-sm">
                      <ShieldCheck size={12} />
                      {totalPending} PENDING
                    </span>
                  )}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                    Review and approve pending items
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 self-end md:self-auto flex-wrap relative z-50">
          {isLoading ? (
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              {onRangeChange && <Skeleton className="h-12 w-[140px] rounded-2xl" />}
              <Skeleton className="h-10 w-10 rounded-[0.85rem]" />
              {isSuperAdmin && <Skeleton className="h-9 w-[110px] rounded-xl" />}
            </div>
          ) : (
            <>
              {/* Date Range */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 px-5 gap-2 rounded-2xl border-indigo-200/60 dark:border-indigo-700/60 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 shadow-sm text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-100 dark:hover:bg-indigo-800/40 hover:text-indigo-900 dark:hover:text-indigo-300">
                    <Calendar size={16} className="text-indigo-500" />
                    {rangeLabel}
                    <ChevronDown size={14} className="opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-100 dark:border-gray-800 rounded-2xl p-2 shadow-2xl">
                  {DATE_RANGES.map(item => (
                    <DropdownMenuItem
                      key={item.value}
                      onClick={() => onRangeChange?.(item.value)}
                      className={cn(
                        'text-[10px] font-black py-3 uppercase tracking-widest cursor-pointer rounded-xl mb-1',
                        range === item.value ? 'bg-indigo-500/10 text-indigo-600' : 'text-gray-500'
                      )}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
                {/* Refresh Action */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className={cn(
                    "h-10 w-10 p-0 shadow-sm rounded-[0.85rem] border-gray-200/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all duration-200 group",
                    isLoading && "animate-spin [animation-duration:2s]"
                  )}
                >
                  <RefreshCw size={16} className="text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                </Button>

                {/* Export Action - Only visible to Super Admin */}
                {isSuperAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" className="h-9 gap-2 shadow-lg rounded-xl font-black uppercase text-[10px] tracking-widest relative z-10 bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-500/20 transition-all">
                        <Download size={14} />
                        Export
                        <ChevronDown size={14} className="opacity-70" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-100 dark:border-gray-800 rounded-2xl p-2 shadow-2xl">
                      <DropdownMenuItem onClick={() => onExport?.('PDF')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300 dark:hover:text-white group cursor-pointer mb-1">
                        <IconFileTypePdf className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                        PDF Document
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExport?.('EXCEL')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300 dark:hover:text-white group cursor-pointer mb-1">
                        <IconTable className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
                        Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExport?.('CSV')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300 dark:hover:text-white group cursor-pointer">
                        <IconFileTypeCsv className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                        CSV Data
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

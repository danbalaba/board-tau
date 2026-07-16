'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, RefreshCw, Download, Calendar, ChevronDown } from 'lucide-react';
import { IconFileTypePdf, IconTable, IconFileTypeCsv } from '@tabler/icons-react';
import { Button } from '@/app/admin/components/ui/button';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import Skeleton from '@/components/common/Skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';

interface AuditLogHeaderProps {
  onRefresh?: () => void;
  onExport?: (format: 'CSV' | 'EXCEL' | 'PDF') => void;
  isFetching?: boolean;
  isLoading?: boolean;
  range?: string;
  onRangeChange?: (range: string) => void;
}

const DATE_RANGES = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Past Year' },
];

export function AuditLogHeader({ onRefresh, onExport, isFetching, isLoading, range = '30d', onRangeChange }: AuditLogHeaderProps) {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';
  const rangeLabel = DATE_RANGES.find(r => r.value === range)?.label ?? 'Last 30 Days';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-[3rem] border border-emerald-500/10 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Title */}
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-emerald-500 border border-gray-100 dark:border-gray-700">
            <ShieldAlert size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
              Audit Logs
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                Monitor project schema and content changes
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 self-end md:self-auto flex-wrap">
          {isLoading ? (
            <>
              {onRangeChange && <Skeleton className="h-12 w-32 rounded-2xl" />}
              {onRefresh && <Skeleton className="h-10 w-10 rounded-[0.85rem]" />}
              {isSuperAdmin && onExport && <Skeleton className="h-9 w-24 rounded-xl" />}
            </>
          ) : (
            <>
              {/* Date Range */}
              {onRangeChange && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12 px-5 gap-2 rounded-2xl border-gray-200/60 dark:border-gray-700/60 shadow-sm text-[10px] font-black uppercase tracking-[0.2em]">
                      <Calendar size={16} className="text-emerald-500" />
                      {rangeLabel}
                      <ChevronDown size={14} className="opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-100 dark:border-gray-800 rounded-2xl p-2 shadow-2xl">
                    {DATE_RANGES.map(item => (
                      <DropdownMenuItem
                        key={item.value}
                        onClick={() => onRangeChange(item.value)}
                        className={cn(
                          'text-[10px] font-black py-3 uppercase tracking-widest cursor-pointer rounded-xl mb-1',
                          range === item.value ? 'bg-emerald-500/10 text-emerald-600' : 'text-gray-500'
                        )}
                      >
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <div className="flex flex-wrap items-center gap-3">
                {/* Refresh */}
                {onRefresh && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    className="h-10 w-10 p-0 shadow-sm rounded-[0.85rem] border-gray-200/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-200 group"
                  >
                    <RefreshCw size={16} className={cn("text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors", isFetching && "animate-spin [animation-duration:2s]")} />
                  </Button>
                )}

                {/* Export */}
                {isSuperAdmin && onExport && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" className="h-9 gap-2 rounded-xl bg-gray-900 hover:bg-emerald-600 dark:bg-white dark:text-gray-900 dark:hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/10 font-black uppercase text-[10px] tracking-[0.2em] transition-all relative z-10">
                        <Download size={14} />
                        Export
                        <ChevronDown size={14} className="opacity-70" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-100 dark:border-gray-800 rounded-2xl p-2 shadow-2xl">
                      <DropdownMenuItem onClick={() => onExport('PDF')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300 dark:hover:text-white group cursor-pointer mb-1">
                        <IconFileTypePdf className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                        PDF Document
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExport('EXCEL')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300 dark:hover:text-white group cursor-pointer mb-1">
                        <IconTable className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
                        Excel
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExport('CSV')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-sm font-semibold text-gray-700 dark:text-gray-300 dark:hover:text-white group cursor-pointer">
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

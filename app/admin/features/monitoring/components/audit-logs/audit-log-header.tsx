'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCw, Download, Calendar, ChevronDown, Check } from 'lucide-react';
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
  const rangeLabel = DATE_RANGES.find(r => r.value === range)?.label ?? 'Last 30 Days';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-[3rem] border border-primary/10 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Title */}
        <div className="flex items-center gap-5">
          {isLoading ? (
            <>
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div>
                <Skeleton className="h-8 w-56 mb-2 rounded-lg" />
                <Skeleton className="h-3 w-72 rounded-md" />
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-primary border border-gray-100 dark:border-gray-700 shrink-0">
                <ShieldCheck size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight flex items-center gap-3">
                  Audit Logs & History
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.18em]">
                    Track and review all admin actions & activity history
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 self-end md:self-auto flex-wrap">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-[130px] rounded-xl" />
              <Skeleton className="h-10 w-10 rounded-[0.85rem]" />
              <Skeleton className="h-9 w-[110px] rounded-xl" />
            </div>
          ) : (
            <>
              {/* Date Range */}
              {onRangeChange && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="h-9 px-4 gap-2 rounded-xl border-primary/20 bg-primary/10 text-primary dark:text-primary-light shadow-sm text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/20 hover:text-primary cursor-pointer"
                    >
                      <Calendar size={14} className="text-primary" />
                      <span>{rangeLabel}</span>
                      <ChevronDown size={14} className="opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-100 dark:border-gray-800 rounded-2xl p-2 shadow-2xl">
                    {DATE_RANGES.map(item => {
                      const isSelected = range === item.value;
                      return (
                        <DropdownMenuItem
                          key={item.value}
                          onClick={() => onRangeChange(item.value)}
                          className={cn(
                            'text-[10px] font-black py-3 px-3.5 uppercase tracking-widest cursor-pointer rounded-xl mb-1 flex items-center justify-between transition-all outline-none',
                            isSelected
                              ? 'bg-primary text-white data-[highlighted]:bg-primary data-[highlighted]:text-white focus:bg-primary focus:text-white hover:bg-primary hover:text-white shadow-md shadow-primary/20'
                              : 'text-gray-600 dark:text-gray-300 data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary focus:bg-primary/10 focus:text-primary hover:bg-primary/10 hover:text-primary'
                          )}
                        >
                          <span>{item.label}</span>
                          {isSelected && <Check size={14} className="text-white shrink-0 ml-2" />}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Refresh Trigger */}
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isFetching}
                  className={cn(
                    "h-10 w-10 p-0 shadow-sm rounded-[0.85rem] border-gray-200/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 group cursor-pointer"
                  )}
                >
                  <RefreshCw size={16} className={cn("text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors", isFetching && "animate-spin [animation-duration:2s]")} />
                </Button>
              )}

              {/* Export Menu - Compact h-9 matching Property Configuration */}
              {onExport && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="h-9 gap-2 shadow-lg rounded-xl font-black uppercase text-[10px] tracking-widest relative z-10 bg-primary hover:bg-primary/90 text-white shadow-primary/20 transition-all cursor-pointer">
                      <Download size={14} />
                      Export
                      <ChevronDown size={14} className="opacity-70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-100 dark:border-gray-800 rounded-2xl p-2 shadow-2xl">
                    <DropdownMenuItem 
                      onClick={() => onExport('PDF')} 
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary hover:bg-primary/10 focus:bg-primary/10 focus:text-primary hover:text-primary transition-all text-xs font-bold text-gray-700 dark:text-gray-300 group cursor-pointer mb-1 outline-none"
                    >
                      <IconFileTypePdf className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                      PDF Document
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onExport('EXCEL')} 
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary hover:bg-primary/10 focus:bg-primary/10 focus:text-primary hover:text-primary transition-all text-xs font-bold text-gray-700 dark:text-gray-300 group cursor-pointer mb-1 outline-none"
                    >
                      <IconTable className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
                      Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onExport('CSV')} 
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary hover:bg-primary/10 focus:bg-primary/10 focus:text-primary hover:text-primary transition-all text-xs font-bold text-gray-700 dark:text-gray-300 group cursor-pointer outline-none"
                    >
                      <IconFileTypeCsv className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                      CSV Data
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}




'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, RefreshCw, Search, LayoutGrid, List, Calendar, ChevronDown, Download } from 'lucide-react';
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

interface AdminApplicationHeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (val: 'grid' | 'list') => void;
  handleRefresh: () => void;
  onExport?: (format: 'CSV' | 'EXCEL' | 'PDF') => void;
  pendingCount: number;
  isLoading: boolean;
  isArchived: boolean;
  onToggleArchived: () => void;
  range: string;
  onRangeChange: (range: string) => void;
  isSuperAdmin?: boolean;
}

const DATE_RANGES = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Past Year' },
];

export function AdminApplicationHeader({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  handleRefresh,
  onExport,
  pendingCount,
  isLoading,
  isArchived,
  onToggleArchived,
  range,
  onRangeChange,
  isSuperAdmin = false,
}: AdminApplicationHeaderProps) {
  const rangeLabel = DATE_RANGES.find(r => r.value === range)?.label ?? 'Last 30 Days';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-[3rem] border border-primary/10 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-violet-500/10 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-8">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
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
                <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-violet-500 border border-gray-100 dark:border-gray-700">
                  <ShieldCheck size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight flex items-center gap-3">
                    Host Applications
                    {pendingCount > 0 && (
                      <span className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-2xl border border-amber-500/10 text-amber-500 text-[10px] tracking-[0.2em] font-black italic shadow-sm">
                        <ShieldAlert size={12} />
                        {pendingCount} PENDING
                      </span>
                    )}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                      Review and verify landlord applications
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0 ml-auto">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-[130px] rounded-xl" />
                <Skeleton className="h-10 w-10 rounded-[0.85rem]" />
                {isSuperAdmin && <Skeleton className="h-9 w-[100px] rounded-xl" />}
              </div>
            ) : (
              <>
                {/* Date Range */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9 px-4 gap-2 rounded-xl border-violet-200/60 dark:border-violet-700/60 bg-violet-50/50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 shadow-sm text-[10px] font-black uppercase tracking-[0.2em] hover:bg-violet-100 dark:hover:bg-violet-800/40 hover:text-violet-900 dark:hover:text-violet-300">
                      <Calendar size={14} className="text-violet-500" />
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
                          range === item.value ? 'bg-primary/10 text-primary' : 'text-gray-500'
                        )}
                      >
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Refresh Action */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className={cn(
                    "h-10 w-10 p-0 shadow-sm rounded-[0.85rem] border-gray-200/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 group"
                  )}
                >
                  <RefreshCw size={16} className="text-gray-500 dark:text-gray-400 group-hover:text-primary dark:group-hover:text-primary transition-colors" />
                </Button>

                {/* Export Action - Only visible to Super Admin */}
                {isSuperAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" className="h-9 gap-2 shadow-lg rounded-xl font-black uppercase text-[10px] tracking-widest relative z-10 bg-violet-500 hover:bg-violet-600 text-white shadow-violet-500/20 transition-all">
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
              </>
            )}
          </div>
      </div>

        {/* Bottom Row – Search & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 pt-8 border-t border-gray-100 dark:border-gray-800">
          {isLoading ? (
            <>
              <Skeleton className="h-12 w-full lg:max-w-md rounded-2xl" />
              <div className="flex items-center gap-3 lg:ml-auto">
                <Skeleton className="h-12 w-[140px] rounded-2xl" />
                <Skeleton className="h-12 w-[120px] rounded-2xl" />
                <Skeleton className="h-12 w-[88px] rounded-2xl" />
              </div>
            </>
          ) : (
            <>
              <div className="flex-1 lg:max-w-md relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, email, or business..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                />
              </div>

              <div className="flex items-center gap-3 lg:ml-auto">
                <button
                  onClick={onToggleArchived}
                  className={cn(
                    'flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all shadow-sm text-[10px] font-black uppercase tracking-widest',
                    isArchived
                      ? 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20'
                      : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700 hover:text-primary'
                  )}
                >
                  {isArchived ? 'Viewing Archived' : 'View Archived'}
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all shadow-sm">
                      <span>Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'Status'}</span>
                      <ChevronDown size={14} className="opacity-50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl shadow-2xl">
                    <DropdownMenuItem onClick={() => setSortBy('newest')} className="cursor-pointer rounded-xl text-xs font-bold px-3 py-2.5">Newest First</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('oldest')} className="cursor-pointer rounded-xl text-xs font-bold px-3 py-2.5">Oldest First</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('status')} className="cursor-pointer rounded-xl text-xs font-bold px-3 py-2.5">Status</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View Toggle */}
                <div className="flex items-center gap-1.5 bg-gray-100/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shrink-0 ml-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn('p-2 rounded-xl transition-all duration-300', viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-primary shadow-md' : 'text-gray-400 hover:text-gray-600')}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn('p-2 rounded-xl transition-all duration-300', viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-primary shadow-md' : 'text-gray-400 hover:text-gray-600')}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

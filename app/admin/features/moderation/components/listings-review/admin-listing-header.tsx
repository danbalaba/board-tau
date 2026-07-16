'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Search,
  History,
  Calendar,
  LayoutGrid,
  List,
  Check,
  ChevronDown,
  RefreshCw,
  Download,
  ShieldAlert,
  ClipboardList,
} from 'lucide-react';
import { IconFileTypePdf, IconTable, IconFileTypeCsv } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import Skeleton from '@/components/common/Skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import { Button } from '@/app/admin/components/ui/button';

interface AdminListingHeaderProps {
  handleRefresh?: () => void;
  onExport?: (format: 'CSV' | 'EXCEL' | 'PDF') => void;
  pendingCount?: number;
  isLoading?: boolean;
  range?: string;
  onRangeChange?: (range: string) => void;
  isArchived?: boolean;
  onToggleArchived?: () => void;
  isSuperAdmin?: boolean;
}

const DATE_RANGES = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Past Year' },
];

export function AdminListingHeader({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  handleRefresh,
  onExport,
  pendingCount = 0,
  isLoading,
  range = '30d',
  onRangeChange,
  isArchived = false,
  onToggleArchived,
  isSuperAdmin = false,
}: AdminListingHeaderProps & {
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (m: 'grid' | 'list') => void;
}) {
  const rangeLabel = DATE_RANGES.find(r => r.value === range)?.label ?? 'Last 30 Days';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-[3rem] border border-blue-500/10 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-blue-500/10 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />

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
                <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-blue-500 border border-gray-100 dark:border-gray-700">
                  <ClipboardList size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight flex items-center gap-3">
                    Listings Review
                    {pendingCount > 0 && (
                      <span className="flex items-center gap-1.5 bg-rose-500/10 px-3 py-1.5 rounded-2xl border border-rose-500/10 text-rose-500 text-[10px] tracking-[0.2em] font-black italic shadow-sm">
                        {pendingCount} PENDING
                      </span>
                    )}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                      Review property listings for quality and compliance
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
                    <Button variant="outline" className="h-9 px-4 gap-2 rounded-xl border-blue-200/60 dark:border-blue-700/60 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-100 dark:hover:bg-blue-800/40 hover:text-blue-900 dark:hover:text-blue-300">
                      <Calendar size={14} className="text-blue-500" />
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
                    "h-10 w-10 p-0 shadow-sm rounded-[0.85rem] border-gray-200/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all duration-200 group"
                  )}
                >
                  <RefreshCw size={16} className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </Button>

                {/* Export Action - Only visible to Super Admin */}
                {isSuperAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" className="h-9 gap-2 shadow-lg rounded-xl font-black uppercase text-[10px] tracking-widest relative z-10 bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20 transition-all">
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
        <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
          {isLoading ? (
            <>
              <Skeleton className="h-12 w-full lg:max-w-md rounded-2xl" />
              <div className="flex items-center gap-3 ml-auto">
                {onToggleArchived && <Skeleton className="h-12 w-[140px] rounded-2xl" />}
                <Skeleton className="h-12 w-[120px] rounded-2xl" />
                <Skeleton className="h-12 w-[88px] rounded-2xl" />
              </div>
            </>
          ) : (
            <>
              {/* Search */}
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search property or host..."
                  className="w-full pl-11 pr-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none h-12"
                />
              </div>

              <div className="flex items-center gap-3 ml-auto">
                {/* View Archived */}
                {onToggleArchived && (
                  <button
                    onClick={onToggleArchived}
                    className={cn(
                      'flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all shadow-sm text-[10px] font-black uppercase tracking-widest h-12',
                      isArchived
                        ? 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20'
                        : 'bg-white/50 dark:bg-gray-800/50 text-gray-500 border-gray-100 dark:border-gray-700 hover:text-primary backdrop-blur-sm'
                    )}
                  >
                    {isArchived ? 'Viewing Archived' : 'View Archived'}
                  </button>
                )}

                {/* Sort */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-4 py-3 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all backdrop-blur-sm shadow-sm h-12">
                      <History size={14} />
                      <span>Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'Price'}</span>
                      <ChevronDown size={14} className="opacity-50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 p-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-[150]">
                    <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 dark:border-gray-800 mb-1">
                      Sort Listings By
                    </div>
                    <DropdownMenuGroup>
                      {[
                        { value: 'newest', label: 'Newest First', icon: History },
                        { value: 'oldest', label: 'Oldest First', icon: Calendar },
                        { value: 'price_desc', label: 'Highest Price', icon: History },
                        { value: 'price_asc', label: 'Lowest Price', icon: History },
                      ].map((option) => {
                        const Icon = option.icon;
                        const isSelected = sortBy === option.value;
                        return (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() => setSortBy(option.value)}
                            className={cn(
                              'cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all',
                              isSelected ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                            )}
                          >
                            <Icon size={16} className={cn('transition-colors', isSelected ? 'text-primary' : 'text-gray-400')} />
                            {option.label}
                            {isSelected && <Check size={14} className="ml-auto" />}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm shadow-sm shrink-0">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-2.5 rounded-xl transition-all duration-300',
                      viewMode === 'grid' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-2.5 rounded-xl transition-all duration-300',
                      viewMode === 'list' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    )}
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

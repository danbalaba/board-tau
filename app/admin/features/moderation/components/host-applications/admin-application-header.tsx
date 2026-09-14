'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, RefreshCw, Search, LayoutGrid, List, Calendar, ChevronDown, Download, Check, Filter, X } from 'lucide-react';
import { Button } from '@/app/admin/components/ui/button';
import { IconFileTypePdf, IconTable, IconFileTypeCsv } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';

interface AdminApplicationHeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter?: string;
  setStatusFilter?: (val: string) => void;
  onClearFilters?: () => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (val: 'grid' | 'list') => void;
  handleRefresh: () => void;
  onExport?: (format: 'CSV' | 'EXCEL' | 'PDF') => void;
  pendingCount: number;
  isLoading: boolean;
  isFetching?: boolean;
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

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'approved', label: 'Approved Hosts' },
  { value: 'rejected', label: 'Rejected Apps' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name_asc', label: 'Applicant Name (A-Z)' },
  { value: 'business_asc', label: 'Business Name (A-Z)' },
];

export function AdminApplicationHeader({
  searchQuery,
  setSearchQuery,
  statusFilter = 'all',
  setStatusFilter,
  onClearFilters,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  handleRefresh,
  onExport,
  pendingCount,
  isLoading,
  isFetching,
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
      className="relative p-8 rounded-[3rem] border border-violet-500/10 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-violet-500/10 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-8">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-violet-500 border border-gray-100 dark:border-gray-700">
              <ShieldCheck size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight flex items-center gap-3">
                Host Applications Review
                {pendingCount > 0 && (
                  <span className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-2xl border border-amber-500/10 text-amber-500 text-[10px] tracking-[0.2em] font-black italic shadow-sm">
                    <ShieldAlert size={12} />
                    {pendingCount} PENDING
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.2em]">
                  Review and verify landlord onboarding applications to grant hosting privileges on BoardTAU
                </p>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0 ml-auto">
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
                {DATE_RANGES.map(item => {
                  const isSelected = range === item.value;
                  return (
                    <DropdownMenuItem
                      key={item.value}
                      onClick={() => onRangeChange(item.value)}
                      className={cn(
                        'text-[10px] font-black py-3 px-3.5 uppercase tracking-widest cursor-pointer rounded-xl mb-1 flex items-center justify-between transition-all outline-none',
                        isSelected
                          ? 'bg-violet-500 text-white data-[highlighted]:bg-violet-500 data-[highlighted]:text-white focus:bg-violet-500 focus:text-white hover:bg-violet-500 hover:text-white shadow-md shadow-violet-500/20'
                          : 'text-gray-600 dark:text-gray-300 data-[highlighted]:bg-violet-500/10 data-[highlighted]:text-violet-600 focus:bg-violet-500/10 focus:text-violet-600 hover:bg-violet-500/10 hover:text-violet-600'
                      )}
                    >
                      <span>{item.label}</span>
                      {isSelected && <Check size={14} className="text-white shrink-0 ml-2" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Refresh Action */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className={cn(
                "h-10 w-10 p-0 shadow-sm rounded-[0.85rem] border-gray-200/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50 hover:bg-violet-500/10 hover:border-violet-500/30 transition-all duration-200 group"
              )}
            >
              <RefreshCw size={16} className={cn("text-gray-500 dark:text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors", (isLoading || isFetching) && "animate-spin [animation-duration:2s]")} />
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
                  <DropdownMenuItem onClick={() => onExport?.('PDF')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl data-[highlighted]:bg-violet-500/10 data-[highlighted]:text-violet-600 hover:bg-violet-500/10 focus:bg-violet-500/10 focus:text-violet-600 hover:text-violet-600 transition-all text-xs font-bold text-gray-700 dark:text-gray-300 group cursor-pointer mb-1 outline-none">
                    <IconFileTypePdf className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                    PDF Document
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport?.('EXCEL')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl data-[highlighted]:bg-violet-500/10 data-[highlighted]:text-violet-600 hover:bg-violet-500/10 focus:bg-violet-500/10 focus:text-violet-600 hover:text-violet-600 transition-all text-xs font-bold text-gray-700 dark:text-gray-300 group cursor-pointer mb-1 outline-none">
                    <IconTable className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
                    Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onExport?.('CSV')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl data-[highlighted]:bg-violet-500/10 data-[highlighted]:text-violet-600 hover:bg-violet-500/10 focus:bg-violet-500/10 focus:text-violet-600 hover:text-violet-600 transition-all text-xs font-bold text-gray-700 dark:text-gray-300 group cursor-pointer outline-none">
                    <IconFileTypeCsv className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                    CSV Data
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Bottom Row – Search & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 pt-8 border-t border-gray-100 dark:border-gray-800">
          <div className="flex-1 lg:max-w-md relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or business..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3 lg:ml-auto">
            <button
              onClick={onToggleArchived}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all shadow-sm text-[10px] font-black uppercase tracking-widest h-12',
                isArchived
                  ? 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20'
                  : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700 hover:text-violet-500'
              )}
            >
              {isArchived ? 'Viewing Archived' : 'View Archived'}
            </button>

            {/* Status Filter Dropdown */}
            {setStatusFilter && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-violet-500 transition-all shadow-sm h-12">
                    <Filter size={14} className="text-violet-500" />
                    <span>Filter: {STATUS_OPTIONS.find(s => s.value === statusFilter)?.label ?? 'All Statuses'}</span>
                    <ChevronDown size={14} className="opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 p-2 rounded-2xl shadow-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                  <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 dark:border-gray-800 mb-1">
                    Filter Applications
                  </div>
                  {STATUS_OPTIONS.map((option) => {
                    const isSelected = statusFilter === option.value;
                    return (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setStatusFilter(option.value)}
                        className={cn(
                          'cursor-pointer flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all outline-none mb-1',
                          isSelected
                            ? 'bg-violet-500 text-white data-[highlighted]:bg-violet-500 data-[highlighted]:text-white focus:bg-violet-500 focus:text-white hover:bg-violet-500 hover:text-white shadow-md shadow-violet-500/20'
                            : 'text-gray-600 dark:text-gray-300 data-[highlighted]:bg-violet-500/10 data-[highlighted]:text-violet-600 focus:bg-violet-500/10 focus:text-violet-600 hover:bg-violet-500/10 hover:text-violet-600'
                        )}
                      >
                        <span>{option.label}</span>
                        {isSelected && <Check size={14} className="text-white shrink-0 ml-2" />}
                      </DropdownMenuItem>
                    );
                  })}
                  {statusFilter !== 'all' && (
                    <DropdownMenuItem
                      onClick={onClearFilters || (() => setStatusFilter('all'))}
                      className="cursor-pointer flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-rose-500 data-[highlighted]:bg-rose-500/10 data-[highlighted]:text-rose-600 focus:bg-rose-500/10 focus:text-rose-600 hover:bg-rose-500/10 hover:text-rose-600 transition-all outline-none mt-1 border-t border-gray-100 dark:border-gray-800"
                    >
                      <span>Clear Filters</span>
                      <X size={14} className="shrink-0 ml-2" />
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-violet-500 transition-all shadow-sm h-12">
                  <span>Sort: {SORT_OPTIONS.find(s => s.value === sortBy)?.label ?? 'Newest First'}</span>
                  <ChevronDown size={14} className="opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-2 rounded-2xl shadow-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 dark:border-gray-800 mb-1">
                  Sort Applications By
                </div>
                {SORT_OPTIONS.map((option) => {
                  const isSelected = sortBy === option.value;
                  return (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={cn(
                        'cursor-pointer flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all outline-none mb-1',
                        isSelected
                          ? 'bg-violet-500 text-white data-[highlighted]:bg-violet-500 data-[highlighted]:text-white focus:bg-violet-500 focus:text-white hover:bg-violet-500 hover:text-white shadow-md shadow-violet-500/20'
                          : 'text-gray-600 dark:text-gray-300 data-[highlighted]:bg-violet-500/10 data-[highlighted]:text-violet-600 focus:bg-violet-500/10 focus:text-violet-600 hover:bg-violet-500/10 hover:text-violet-600'
                      )}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check size={14} className="text-white shrink-0 ml-2" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Toggle */}
            <div className="flex items-center gap-1.5 bg-gray-100/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shrink-0 ml-2 h-12">
              <button
                onClick={() => setViewMode('grid')}
                className={cn('p-2 rounded-xl transition-all duration-300', viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-violet-500 shadow-md' : 'text-gray-400 hover:text-gray-600')}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn('p-2 rounded-xl transition-all duration-300', viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-violet-500 shadow-md' : 'text-gray-400 hover:text-gray-600')}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  History, 
  Settings2, 
  Inbox, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  LayoutGrid, 
  List,
  Check,
  ChevronDown,
  RotateCcw,
  Filter,
  Plus,
  X,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide
} from 'lucide-react';
import { cn } from '@/utils/helper';
import GenerateReportButton from '@/components/common/GenerateReportButton';
import { prepareDataForExport, exportToCSV, exportToExcel } from '@/utils/export-utils';
import { DateRange } from 'react-day-picker';
import { LandlordReservationSearch } from './landlord-reservation-search';
import { ReservationRequest } from '../hooks/use-reservation-logic';
import { LandlordMobileFilterSheet } from '@/app/landlord/components/landlord-mobile-filter-sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import { Button } from '@/app/admin/components/ui/button';
import Skeleton from '@/components/common/Skeleton';

interface LandlordReservationHeaderProps {
  sortBy: string;
  setSortBy: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (val: 'grid' | 'list') => void;
  handleGenerateReport: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  rawReservations: ReservationRequest[];
  isArchived: boolean;
  onToggleArchived: () => void;
  onCreateWalkIn?: () => void;
  isLoading?: boolean;
}

export function LandlordReservationHeader({
  sortBy,
  setSortBy,
  selectedStatus,
  setSelectedStatus,
  viewMode,
  setViewMode,
  handleGenerateReport,
  searchQuery,
  setSearchQuery,
  rawReservations,
  isArchived,
  onToggleArchived,
  onCreateWalkIn,
  isLoading
}: LandlordReservationHeaderProps) {
  const isMobile = useIsMobile();

  // Animated Arrow states for each dropdown
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Mobile Drawer Draft Filter States
  const [draftStatus, setDraftStatus] = useState(selectedStatus);
  const [draftSortBy, setDraftSortBy] = useState(sortBy);
  const [draftIsArchived, setDraftIsArchived] = useState(isArchived);

  if (isLoading) {
    return (
      <div className="relative p-4 sm:p-8 rounded-[22px] sm:rounded-[3rem] border border-primary/10 shadow-xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl z-20">
        <div className="relative z-10 flex flex-col gap-4 sm:gap-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-3.5 sm:gap-5">
              <Skeleton className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-7 sm:h-8 w-36 sm:w-48 rounded-xl" />
                <Skeleton className="h-3 sm:h-3.5 w-56 sm:w-80 rounded-lg opacity-70" />
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full md:w-auto">
              <Skeleton className="h-9 sm:h-11 w-20 sm:w-24 rounded-xl sm:rounded-2xl shrink-0" />
              <Skeleton className="h-9 sm:h-11 w-28 sm:w-36 rounded-xl sm:rounded-2xl shrink-0" />
              <Skeleton className="h-9 sm:h-11 w-28 sm:w-36 rounded-xl sm:rounded-2xl shrink-0" />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4 pt-4 sm:pt-8 border-t border-gray-100 dark:border-gray-800">
            <Skeleton className="h-10 sm:h-11 w-full lg:max-w-md rounded-xl sm:rounded-2xl" />
            <div className="hidden lg:flex items-center gap-2 lg:ml-auto">
              <Skeleton className="h-9 sm:h-10 w-28 rounded-xl" />
              <Skeleton className="h-9 sm:h-10 w-28 rounded-xl" />
              <Skeleton className="h-9 sm:h-10 w-24 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleMobileSheetOpen = (open: boolean) => {
    if (open) {
      setDraftStatus(selectedStatus);
      setDraftSortBy(sortBy);
      setDraftIsArchived(isArchived);
    }
  };

  const handleApplyMobileFilters = () => {
    setSelectedStatus(draftStatus);
    setSortBy(draftSortBy);
    if (draftIsArchived !== isArchived) {
      onToggleArchived();
    }
  };

  const handleClearMobileFilters = () => {
    setDraftStatus('all');
    setDraftSortBy('newest');
    setDraftIsArchived(false);
    setSelectedStatus('all');
    setSortBy('newest');
    if (isArchived) {
      onToggleArchived();
    }
  };

  const handleGenerateCSV = async (dateRange?: DateRange) => {
    let exportData = rawReservations;
    if (dateRange?.from) {
      const fromDate = dateRange.from;
      const toDate = dateRange.to;
      exportData = exportData.filter(r => {
        const createdAt = new Date(r.createdAt);
        if (toDate) {
          return createdAt >= fromDate && createdAt <= toDate;
        }
        return createdAt >= fromDate;
      });
    }

    const reportData = prepareDataForExport(exportData, 'reservation');
    const totalRequests = exportData.length;
    const reservedCount = exportData.filter(r => r.status?.toLowerCase() === 'reserved').length;
    const metadata = {
      reportTitle: 'Reservation Requests Business Report',
      reportId: `BTAU-RES-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      summary: [
        { label: 'Total Requests', value: `${totalRequests}` },
        { label: 'Confirmed Volume', value: `${reservedCount} Paid` }
      ],
      author: 'Landlord Management System'
    };
    exportToCSV(reportData, `Reservation_Report_${new Date().toLocaleDateString()}`, metadata);
  };

  const handleGenerateExcel = async (dateRange?: DateRange) => {
    let exportData = rawReservations;
    if (dateRange?.from) {
      const fromDate = dateRange.from;
      const toDate = dateRange.to;
      exportData = exportData.filter(r => {
        const createdAt = new Date(r.createdAt);
        if (toDate) {
          return createdAt >= fromDate && createdAt <= toDate;
        }
        return createdAt >= fromDate;
      });
    }

    const reportData = prepareDataForExport(exportData, 'reservation');
    const totalRequests = exportData.length;
    const reservedCount = exportData.filter(r => r.status?.toLowerCase() === 'reserved').length;
    const metadata = {
      reportTitle: 'Reservation Requests Business Report',
      reportId: `BTAU-RES-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      summary: [
        { label: 'Total Requests', value: `${totalRequests}` },
        { label: 'Confirmed Volume', value: `${reservedCount} Paid` }
      ],
      author: 'Landlord Management System'
    };
    exportToExcel(reportData, `Reservation_Report_${new Date().toLocaleDateString()}`, 'Reservations', metadata);
  };

  const statusOptions = [
    { value: 'all', label: 'ALL PRE-STAY', icon: Inbox },
    { value: 'PENDING_PAYMENT', label: 'PENDING PAYMENT', icon: Clock },
    { value: 'RESERVED', label: 'RESERVED (PAID)', icon: CheckCircle2 },
    { value: 'CANCELLED', label: 'CANCELLED', icon: XCircle },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-4 sm:p-8 rounded-[22px] sm:rounded-[3rem] border border-primary/10 shadow-xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl z-20"
    >
      {/* Premium Background Ambient Accents */}
      <div className="absolute inset-0 rounded-[22px] sm:rounded-[3rem] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-20 -mb-16 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 flex flex-col gap-4 sm:gap-8">
        {/* TOP ROW: Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3.5 sm:gap-5">
            <div className="w-11 h-11 sm:w-14 sm:h-14 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl flex items-center justify-center text-primary border border-gray-100 dark:border-gray-700 shrink-0">
              <Calendar className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                Reservations
              </h1>
              <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                <p className="text-[10px] sm:text-[11px] text-gray-500 font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] sm:line-clamp-1">
                  View reservation requests, check payments, and add walk-in guests
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between sm:justify-end gap-3 w-full md:w-auto">
            {/* View Mode Toggles */}
            <div className="flex items-center justify-between sm:justify-start gap-1 bg-gray-100/50 dark:bg-gray-800/50 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300",
                    viewMode === 'grid' ? "bg-white dark:bg-gray-700 text-primary shadow-md" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <LayoutGrid size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300",
                    viewMode === 'list' ? "bg-white dark:bg-gray-700 text-primary shadow-md" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  <List size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            </div>

            {/* Side-by-Side Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto shrink-0">
              <GenerateReportButton 
                onGeneratePDF={handleGenerateReport}
                onGenerateCSV={handleGenerateCSV}
                onGenerateExcel={handleGenerateExcel}
                label="Generate Report"
                outline={false}
                className="flex-1 sm:flex-none h-10 sm:h-11 px-3.5 sm:px-5 rounded-xl sm:rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary font-black uppercase text-[10px] sm:text-[11px] tracking-wider sm:tracking-widest shadow-xs border border-primary/20 transition-all flex items-center justify-center gap-1.5 shrink-0"
              />

              {onCreateWalkIn && (
                <Button 
                  onClick={onCreateWalkIn}
                  className="flex-1 sm:flex-none h-10 sm:h-11 px-3.5 sm:px-5 rounded-xl sm:rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] sm:text-[11px] tracking-wider sm:tracking-widest shadow-md shadow-primary/20 border-b-2 sm:border-b-4 border-primary/30 active:border-b-0 transition-all flex items-center justify-center gap-1.5 group shrink-0"
                >
                  <Plus size={14} className="sm:w-[16px] sm:h-[16px] group-hover:rotate-90 transition-transform duration-300 stroke-[3]" />
                  <span className="truncate">Create Walk-In</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Search & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4 pt-4 sm:pt-8 border-t border-gray-100 dark:border-gray-800">
          {/* Search Input & Mobile Filter Sheet Trigger */}
          <div className="flex items-center gap-2 w-full lg:max-w-md">
            <div className="flex-1">
              <LandlordReservationSearch 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                reservations={rawReservations}
              />
            </div>

            {/* Mobile Bottom Sheet Drawer Trigger */}
            <LandlordMobileFilterSheet 
              activeFilterCount={
                (searchQuery.trim() !== '' ? 1 : 0) + 
                (selectedStatus !== 'all' ? 1 : 0) + 
                (isArchived ? 1 : 0)
              } 
              onClearAll={handleClearMobileFilters}
              onApply={handleApplyMobileFilters}
              onOpenChange={handleMobileSheetOpen}
            >
              {/* 1. Status Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <Filter size={13} className="text-primary" /> Reservation Status
                  </span>
                  {draftStatus !== 'all' && (
                    <button onClick={() => setDraftStatus('all')} className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                      Reset
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDraftStatus(opt.value)}
                      className={cn(
                        "px-3.5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all flex items-center justify-between",
                        draftStatus === opt.value
                          ? "bg-primary/10 text-primary border-primary/30 font-black"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200/60 dark:border-gray-700"
                      )}
                    >
                      <span>{opt.label}</span>
                      {draftStatus === opt.value && <Check size={14} strokeWidth={3} className="text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Sort By Section */}
              <div className="space-y-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <History size={13} className="text-primary" /> Sort By Date
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'newest', label: 'NEWEST FIRST' },
                    { value: 'oldest', label: 'OLDEST FIRST' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDraftSortBy(opt.value)}
                      className={cn(
                        "px-3.5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all flex items-center justify-between",
                        draftSortBy === opt.value
                          ? "bg-primary/10 text-primary border-primary/30 font-black"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200/60 dark:border-gray-700"
                      )}
                    >
                      <span>{opt.label}</span>
                      {draftSortBy === opt.value && <Check size={14} strokeWidth={3} className="text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Archived Section */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw size={14} className={draftIsArchived ? "text-amber-500" : "text-gray-400"} />
                  <span className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-200">
                    Archived Reservations
                  </span>
                </div>
                <button
                  onClick={() => setDraftIsArchived(!draftIsArchived)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all",
                    draftIsArchived
                      ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                  )}
                >
                  {draftIsArchived ? "Showing Archived" : "View Active"}
                </button>
              </div>
            </LandlordMobileFilterSheet>
          </div>

          {/* Desktop Filters Group */}
          <div className="hidden lg:flex items-center gap-2 lg:ml-auto">
            <div className="flex items-center gap-2 mr-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <Settings2 size={14} />
              Filters
            </div>

            {/* Status Filter Dropdown */}
            <DropdownMenu open={statusDropdownOpen} onOpenChange={setStatusDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex-1 sm:flex-initial flex items-center justify-between sm:justify-start gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm group",
                  selectedStatus !== 'all' ? "text-primary border-primary/30 bg-primary/5" : "text-gray-500 hover:text-primary"
                )}>
                  <div className="flex items-center gap-1.5 truncate">
                    <Filter size={13} className={cn("transition-transform group-hover:scale-110 shrink-0", selectedStatus !== 'all' ? "text-primary" : "text-gray-400")} />
                    <span className="truncate max-w-[100px] sm:max-w-[110px]">
                      {selectedStatus === 'all' ? 'Status' : statusOptions.find(s => s.value === selectedStatus)?.label}
                    </span>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0 ml-1",
                    statusDropdownOpen ? "bg-primary/20 text-primary rotate-180" : "bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:text-primary"
                  )}>
                    <ChevronDown size={13} strokeWidth={3} />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isMobile ? "start" : "end"} className="w-56 max-w-[calc(100vw-2rem)] p-0 rounded-2xl shadow-2xl z-[150] overflow-hidden bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reservation Status</span>
                  {selectedStatus !== 'all' && (
                    <button
                      onClick={() => {
                        setSelectedStatus('all');
                        setStatusDropdownOpen(false);
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-100 dark:border-rose-500/20"
                    >
                      <X size={11} strokeWidth={3} /> Clear
                    </button>
                  )}
                </div>
                <div className="p-1.5 space-y-1">
                  <DropdownMenuGroup>
                    {statusOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = selectedStatus === option.value;
                      return (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => {
                            setSelectedStatus(option.value);
                            setStatusDropdownOpen(false);
                          }}
                          className={cn(
                            "cursor-pointer flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all",
                            isSelected
                              ? "bg-primary/10 text-primary font-black border border-primary/20"
                              : "text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon size={14} className={isSelected ? "text-primary" : "text-gray-400"} />
                            <span className="font-black">{option.label}</span>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 ml-2">
                              <Check size={12} className="text-primary" strokeWidth={3.5} />
                            </div>
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuGroup>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sorting Dropdown */}
            <DropdownMenu open={sortDropdownOpen} onOpenChange={setSortDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex-1 sm:flex-initial flex items-center justify-between sm:justify-start gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm group",
                  sortBy !== 'newest' ? "text-primary border-primary/30 bg-primary/5" : "text-gray-500 hover:text-primary"
                )}>
                  <div className="flex items-center gap-1.5 truncate">
                    <History size={13} className={cn("transition-transform group-hover:scale-110 shrink-0", sortBy !== 'newest' ? "text-primary" : "text-gray-400")} />
                    <span className="max-w-[85px] truncate">
                      {sortBy === 'newest' ? 'Newest' : 'Oldest'}
                    </span>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0 ml-1",
                    sortDropdownOpen ? "bg-primary/20 text-primary rotate-180" : "bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:text-primary"
                  )}>
                    <ChevronDown size={13} strokeWidth={3} />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-w-[calc(100vw-2rem)] p-0 rounded-2xl shadow-2xl z-[150] overflow-hidden bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sort By</span>
                  {sortBy !== 'newest' && (
                    <button
                      onClick={() => {
                        setSortBy('newest');
                        setSortDropdownOpen(false);
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20"
                    >
                      <RotateCcw size={10} /> Reset
                    </button>
                  )}
                </div>
                <div className="p-1.5 space-y-1">
                  <DropdownMenuGroup>
                    {[
                      { value: 'newest', label: 'NEWEST FIRST', icon: History },
                      { value: 'oldest', label: 'OLDEST FIRST', icon: Calendar },
                    ].map((option) => {
                      const Icon = option.icon;
                      const isSelected = sortBy === option.value;
                      return (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setSortDropdownOpen(false);
                          }}
                          className={cn(
                            "cursor-pointer flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all",
                            isSelected
                              ? "bg-primary/10 text-primary font-black border border-primary/20"
                              : "text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon size={14} className={isSelected ? "text-primary" : "text-gray-400"} />
                            <span className="font-black">{option.label}</span>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 ml-2">
                              <Check size={12} className="text-primary" strokeWidth={3.5} />
                            </div>
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuGroup>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Archive Toggle Button */}
            <button
              onClick={onToggleArchived}
              title={isArchived ? "Click to view active reservations" : "Click to view archived reservations"}
              className={cn(
                "flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all shadow-sm group",
                isArchived 
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-600 hover:bg-amber-500/20 font-black ring-2 ring-amber-500/20" 
                  : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 hover:text-primary font-black"
              )}
            >
              <RotateCcw size={13} className={cn("transition-transform duration-500 shrink-0", isArchived ? "rotate-180 text-amber-600" : "group-hover:-rotate-45")} />
              <span>{isArchived ? "Showing Archived" : "Archived"}</span>
              {isArchived && (
                <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold uppercase tracking-wider">
                  View Active
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

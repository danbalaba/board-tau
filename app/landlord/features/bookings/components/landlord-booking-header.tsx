'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarCheck, 
  History, 
  Calendar, 
  ArrowDownWideNarrow, 
  ArrowUpNarrowWide, 
  Settings2, 
  Inbox, 
  Clock, 
  CheckCircle2, 
  CreditCard, 
  AlertCircle, 
  LayoutGrid, 
  List, 
  Check,
  ChevronDown,
  RotateCcw,
  Filter,
  X
} from 'lucide-react';
import { cn } from '@/utils/helper';
import GenerateReportButton from '@/components/common/GenerateReportButton';
import { prepareDataForExport, exportToCSV, exportToExcel } from '@/utils/export-utils';
import { DateRange } from 'react-day-picker';
import { LandlordBookingSearch } from './landlord-booking-search';
import { Booking } from '../hooks/use-booking-logic';
import { LandlordMobileFilterSheet } from '@/app/landlord/components/landlord-mobile-filter-sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';

interface LandlordBookingHeaderProps {
  sortBy: string;
  setSortBy: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  selectedPaymentStatus: string;
  setSelectedPaymentStatus: (val: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (val: 'grid' | 'list') => void;
  handleGenerateReport: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  rawBookings: Booking[];
  isArchived: boolean;
  onToggleArchived: () => void;
}

export function LandlordBookingHeader({
  sortBy,
  setSortBy,
  selectedStatus,
  setSelectedStatus,
  selectedPaymentStatus,
  setSelectedPaymentStatus,
  viewMode,
  setViewMode,
  handleGenerateReport,
  searchQuery,
  setSearchQuery,
  rawBookings,
  isArchived,
  onToggleArchived
}: LandlordBookingHeaderProps) {
  const isMobile = useIsMobile();
  // Animated Arrow states for each dropdown
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [paymentDropdownOpen, setPaymentDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Mobile Drawer Draft Filter States
  const [draftStatus, setDraftStatus] = useState(selectedStatus);
  const [draftPaymentStatus, setDraftPaymentStatus] = useState(selectedPaymentStatus);
  const [draftSortBy, setDraftSortBy] = useState(sortBy);
  const [draftIsArchived, setDraftIsArchived] = useState(isArchived);

  const handleMobileSheetOpen = (open: boolean) => {
    if (open) {
      setDraftStatus(selectedStatus);
      setDraftPaymentStatus(selectedPaymentStatus);
      setDraftSortBy(sortBy);
      setDraftIsArchived(isArchived);
    }
  };

  const handleApplyMobileFilters = () => {
    setSelectedStatus(draftStatus);
    setSelectedPaymentStatus(draftPaymentStatus);
    setSortBy(draftSortBy);
    if (draftIsArchived !== isArchived) {
      onToggleArchived();
    }
  };

  const handleClearMobileFilters = () => {
    setDraftStatus('all');
    setDraftPaymentStatus('all');
    setDraftSortBy('newest');
    setDraftIsArchived(false);
    setSelectedStatus('all');
    setSelectedPaymentStatus('all');
    setSortBy('newest');
    if (isArchived) {
      onToggleArchived();
    }
  };

  const statusOptions = useMemo(() => [
    { value: 'all', label: 'ALL STAYS', icon: Inbox },
    { value: 'CHECKED_IN', label: 'ACTIVE (CHECKED IN)', icon: CheckCircle2 },
    { value: 'COMPLETED', label: 'COMPLETED', icon: History },
  ], []);

  const paymentOptions = useMemo(() => [
    { value: 'all', label: 'ALL PAYMENTS', icon: Inbox },
    { value: 'pending', label: 'PENDING', icon: Clock },
    { value: 'paid', label: 'PAID', icon: CreditCard },
    { value: 'failed', label: 'FAILED', icon: AlertCircle },
  ], []);

  const handleGenerateCSV = async (dateRange?: DateRange) => {
    let exportData = rawBookings;
    if (dateRange?.from) {
      const fromDate = dateRange.from;
      const toDate = dateRange.to;
      exportData = exportData.filter(b => {
        const createdAt = new Date(b.createdAt);
        if (toDate) {
          return createdAt >= fromDate && createdAt <= toDate;
        }
        return createdAt >= fromDate;
      });
    }

    const reportData = prepareDataForExport(exportData, 'booking');
    const totalRevenue = exportData.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
    const totalBookings = exportData.length;
    const metadata = {
      reportTitle: 'Booking & Revenue Business Report',
      reportId: `BTAU-BOOK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      summary: [
        { label: 'Total Revenue', value: `PHP ${totalRevenue.toLocaleString()}` },
        { label: 'Total Bookings', value: `${totalBookings}` }
      ],
      author: 'Landlord Management System'
    };
    exportToCSV(reportData, `Booking_Report_${new Date().toLocaleDateString()}`, metadata);
  };

  const handleGenerateExcel = async (dateRange?: DateRange) => {
    let exportData = rawBookings;
    if (dateRange?.from) {
      const fromDate = dateRange.from;
      const toDate = dateRange.to;
      exportData = exportData.filter(b => {
        const createdAt = new Date(b.createdAt);
        if (toDate) {
          return createdAt >= fromDate && createdAt <= toDate;
        }
        return createdAt >= fromDate;
      });
    }

    const reportData = prepareDataForExport(exportData, 'booking');
    const totalRevenue = exportData.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
    const totalBookings = exportData.length;
    const metadata = {
      reportTitle: 'Booking & Revenue Business Report',
      reportId: `BTAU-BOOK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      summary: [
        { label: 'Total Revenue', value: `PHP ${totalRevenue.toLocaleString()}` },
        { label: 'Total Bookings', value: `${totalBookings}` }
      ],
      author: 'Landlord Management System'
    };
    exportToExcel(reportData, `Booking_Report_${new Date().toLocaleDateString()}`, 'Bookings', metadata);
  };

  const hasFilterActive = selectedStatus !== 'all' || selectedPaymentStatus !== 'all';

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
              <CalendarCheck className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                Bookings
              </h1>
              <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                <p className="text-[10px] sm:text-[11px] text-gray-500 font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] sm:line-clamp-1">
                  View current stays, check guest details, and track past bookings
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2.5 w-full md:w-auto">
            {/* View Mode Toggles */}
            <div className="flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800/50 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shrink-0">
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

            <GenerateReportButton 
              onGeneratePDF={handleGenerateReport}
              onGenerateCSV={handleGenerateCSV}
              onGenerateExcel={handleGenerateExcel}
              label="Generate Report"
              outline={false}
              className="w-auto h-9 sm:h-11 px-3 sm:px-5 rounded-xl sm:rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] sm:text-[11px] tracking-wider sm:tracking-widest shadow-md shadow-primary/20 border-b-2 sm:border-b-4 border-primary/30 active:border-b-0 transition-all flex items-center justify-center gap-1.5 shrink-0"
            />
          </div>
        </div>

        {/* BOTTOM ROW: Search & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4 pt-4 sm:pt-8 border-t border-gray-100 dark:border-gray-800">
          {/* Search Input & Mobile Filter Trigger */}
          <div className="flex items-center gap-2 w-full lg:max-w-md">
            <div className="flex-1">
              <LandlordBookingSearch 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                bookings={rawBookings}
              />
            </div>

            {/* Mobile Bottom Sheet Drawer Trigger */}
            <LandlordMobileFilterSheet 
              activeFilterCount={
                (searchQuery.trim() !== '' ? 1 : 0) + 
                (selectedStatus !== 'all' ? 1 : 0) + 
                (selectedPaymentStatus !== 'all' ? 1 : 0) + 
                (isArchived ? 1 : 0)
              } 
              onClearAll={handleClearMobileFilters}
              onApply={handleApplyMobileFilters}
              onOpenChange={handleMobileSheetOpen}
            >
              {/* 1. Stay Status Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <Filter size={13} className="text-primary" /> Stay Status
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

              {/* 2. Payment Status Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <Filter size={13} className="text-primary" /> Payment Status
                  </span>
                  {draftPaymentStatus !== 'all' && (
                    <button onClick={() => setDraftPaymentStatus('all')} className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                      Reset
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {paymentOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDraftPaymentStatus(opt.value)}
                      className={cn(
                        "px-3.5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider border transition-all flex items-center justify-between",
                        draftPaymentStatus === opt.value
                          ? "bg-primary/10 text-primary border-primary/30 font-black"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200/60 dark:border-gray-700"
                      )}
                    >
                      <span>{opt.label}</span>
                      {draftPaymentStatus === opt.value && <Check size={14} strokeWidth={3} className="text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Sort By Section */}
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

              {/* 4. Archived Section */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw size={14} className={draftIsArchived ? "text-amber-500" : "text-gray-400"} />
                  <span className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-200">
                    Archived Bookings
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

            {/* 1. Stay Status Filter Dropdown */}
            <DropdownMenu open={statusDropdownOpen} onOpenChange={setStatusDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex-1 sm:flex-initial flex items-center justify-between sm:justify-start gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm group",
                  selectedStatus !== 'all' ? "text-primary border-primary/30 bg-primary/5" : "text-gray-500 hover:text-primary"
                )}>
                  <div className="flex items-center gap-1.5 truncate">
                    <Filter size={13} className={cn("transition-transform group-hover:scale-110 shrink-0", selectedStatus !== 'all' ? "text-primary" : "text-gray-400")} />
                    <span className="truncate max-w-[100px] sm:max-w-[110px]">
                      {selectedStatus === 'all' ? 'Stay Status' : statusOptions.find(s => s.value === selectedStatus)?.label}
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
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Stay Status</span>
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

            {/* 2. Payment Status Filter Dropdown */}
            <DropdownMenu open={paymentDropdownOpen} onOpenChange={setPaymentDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex-1 sm:flex-initial flex items-center justify-between sm:justify-start gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm group",
                  selectedPaymentStatus !== 'all' ? "text-primary border-primary/30 bg-primary/5" : "text-gray-500 hover:text-primary"
                )}>
                  <div className="flex items-center gap-1.5 truncate">
                    <Filter size={13} className={cn("transition-transform group-hover:scale-110 shrink-0", selectedPaymentStatus !== 'all' ? "text-primary" : "text-gray-400")} />
                    <span className="truncate max-w-[100px] sm:max-w-[110px]">
                      {selectedPaymentStatus === 'all' ? 'Payment Status' : paymentOptions.find(p => p.value === selectedPaymentStatus)?.label}
                    </span>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0 ml-1",
                    paymentDropdownOpen ? "bg-primary/20 text-primary rotate-180" : "bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:text-primary"
                  )}>
                    <ChevronDown size={13} strokeWidth={3} />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-w-[calc(100vw-2rem)] p-0 rounded-2xl shadow-2xl z-[150] overflow-hidden bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment Status</span>
                  {selectedPaymentStatus !== 'all' && (
                    <button
                      onClick={() => {
                        setSelectedPaymentStatus('all');
                        setPaymentDropdownOpen(false);
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-100 dark:border-rose-500/20"
                    >
                      <X size={11} strokeWidth={3} /> Clear
                    </button>
                  )}
                </div>
                <div className="p-1.5 space-y-1">
                  <DropdownMenuGroup>
                    {paymentOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = selectedPaymentStatus === option.value;
                      return (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => {
                            setSelectedPaymentStatus(option.value);
                            setPaymentDropdownOpen(false);
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
                    <span className="max-w-[85px] truncate">{sortBy === 'newest' ? 'Newest' : 'Oldest'}</span>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0 ml-1",
                    sortDropdownOpen ? "bg-primary/20 text-primary rotate-180" : "bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:text-primary"
                  )}>
                    <ChevronDown size={13} strokeWidth={3} />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isMobile ? "start" : "end"} className="w-56 max-w-[calc(100vw-2rem)] p-0 rounded-2xl shadow-2xl z-[150] overflow-hidden bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
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
              title={isArchived ? "Click to view active bookings" : "Click to view archived bookings"}
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


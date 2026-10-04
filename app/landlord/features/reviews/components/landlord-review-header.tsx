'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Inbox,
  Clock,
  CheckCircle2,
  LayoutGrid,
  List,
  Filter,
  Check,
  ChevronDown,
  Settings2,
  X,
  History,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/utils/helper';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import GenerateReportButton from '@/components/common/GenerateReportButton';
import { prepareDataForExport, exportToCSV, exportToExcel } from '@/utils/export-utils';
import { DateRange } from 'react-day-picker';
import { LandlordReviewSearch } from './landlord-review-search';
import { Review } from '../hooks/use-review-logic';
import { LandlordMobileFilterSheet } from '@/app/landlord/components/landlord-mobile-filter-sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import Skeleton from '@/components/common/Skeleton';

interface LandlordReviewHeaderProps {
  sortBy: string;
  setSortBy: (s: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (m: 'grid' | 'list') => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  selectedRating: string;
  setSelectedRating: (r: string) => void;
  handleGenerateReport: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  rawReviews: Review[];
  isLoading?: boolean;
}

export function LandlordReviewHeader({
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  selectedStatus,
  setSelectedStatus,
  selectedRating,
  setSelectedRating,
  handleGenerateReport,
  searchQuery,
  setSearchQuery,
  rawReviews,
  isLoading
}: LandlordReviewHeaderProps) {
  const isMobile = useIsMobile();

  // Animated Arrow states for dropdowns
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [ratingDropdownOpen, setRatingDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Mobile Drawer Draft Filter States
  const [draftStatus, setDraftStatus] = useState(selectedStatus);
  const [draftRating, setDraftRating] = useState(selectedRating);
  const [draftSortBy, setDraftSortBy] = useState(sortBy);

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
      setDraftRating(selectedRating);
      setDraftSortBy(sortBy);
    }
  };

  const handleApplyMobileFilters = () => {
    setSelectedStatus(draftStatus);
    setSelectedRating(draftRating);
    setSortBy(draftSortBy);
  };

  const handleClearMobileFilters = () => {
    setDraftStatus('all');
    setDraftRating('all');
    setDraftSortBy('newest');
    setSelectedStatus('all');
    setSelectedRating('all');
    setSortBy('newest');
  };

  const handleGenerateCSV = async (dateRange?: DateRange) => {
    let exportData = rawReviews;
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

    const reportData = prepareDataForExport(exportData, 'review');
    const totalReviews = exportData.length;
    const avgRating = totalReviews > 0 
      ? exportData.reduce((acc, r) => acc + r.rating, 0) / totalReviews 
      : 0;
    const metadata = {
      reportTitle: 'Property Reputation Business Report',
      reportId: `BTAU-REV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      summary: [
        { label: 'Average Rating', value: `${avgRating.toFixed(1)} / 5.0` },
        { label: 'Total Reviews', value: `${totalReviews}` }
      ],
      author: 'Landlord Management System'
    };
    exportToCSV(reportData, `Review_Report_${new Date().toLocaleDateString()}`, metadata);
  };

  const handleGenerateExcel = async (dateRange?: DateRange) => {
    let exportData = rawReviews;
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

    const reportData = prepareDataForExport(exportData, 'review');
    const totalReviews = exportData.length;
    const avgRating = totalReviews > 0 
      ? exportData.reduce((acc, r) => acc + r.rating, 0) / totalReviews 
      : 0;
    const metadata = {
      reportTitle: 'Property Reputation Business Report',
      reportId: `BTAU-REV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      summary: [
        { label: 'Average Rating', value: `${avgRating.toFixed(1)} / 5.0` },
        { label: 'Total Reviews', value: `${totalReviews}` }
      ],
      author: 'Landlord Management System'
    };
    exportToExcel(reportData, `Review_Report_${new Date().toLocaleDateString()}`, 'Reviews', metadata);
  };

  const statusOptions = [
    { value: 'all', label: 'ALL REVIEWS', icon: Inbox },
    { value: 'needs_response', label: 'NEEDS RESPONSE', icon: Clock },
    { value: 'responded', label: 'RESPONDED', icon: CheckCircle2 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-4 sm:p-8 rounded-[22px] sm:rounded-[3rem] border border-primary/10 shadow-xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl z-20"
    >
      {/* Premium Background Accents */}
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
              <Star className="w-5 h-5 sm:w-7 sm:h-7" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                Guest Reviews
              </h1>
              <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                <p className="text-[10px] sm:text-[11px] text-gray-500 font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] sm:line-clamp-1">
                  Read tenant reviews, check ratings, and write replies
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
              <LandlordReviewSearch
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                reviews={rawReviews}
              />
            </div>

            {/* Mobile Bottom Sheet Drawer Trigger */}
            <LandlordMobileFilterSheet 
              activeFilterCount={
                (searchQuery.trim() !== '' ? 1 : 0) + 
                (selectedStatus !== 'all' ? 1 : 0) + 
                (selectedRating !== 'all' ? 1 : 0)
              } 
              onClearAll={handleClearMobileFilters}
              onApply={handleApplyMobileFilters}
              onOpenChange={handleMobileSheetOpen}
            >
              {/* 1. Review Status Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Filter size={13} className="text-primary" /> Review Status
                  </span>
                  {draftStatus !== 'all' && (
                    <button onClick={() => setDraftStatus('all')} className="text-[10px] font-extrabold text-rose-500 hover:underline uppercase tracking-widest cursor-pointer">
                      Reset
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDraftStatus(opt.value)}
                      className={cn(
                        "px-4 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider border transition-all flex items-center justify-between cursor-pointer select-none",
                        draftStatus === opt.value
                          ? "bg-primary/10 text-primary border-2 border-primary/40 font-black shadow-xs"
                          : "bg-gray-50/80 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                      )}
                    >
                      <span>{opt.label}</span>
                      {draftStatus === opt.value && <Check size={16} strokeWidth={3} className="text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Rating Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Star size={13} className="text-amber-500 fill-amber-500" /> Guest Rating
                  </span>
                  {draftRating !== 'all' && (
                    <button onClick={() => setDraftRating('all')} className="text-[10px] font-extrabold text-rose-500 hover:underline uppercase tracking-widest cursor-pointer">
                      Reset
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {['all', '5', '4', '3', '2', '1'].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setDraftRating(rating)}
                      className={cn(
                        "px-3.5 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider border transition-all flex items-center gap-1.5 cursor-pointer select-none",
                        draftRating === rating
                          ? "bg-primary text-white border-primary shadow-md shadow-primary/20 font-black"
                          : "bg-gray-50/80 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                      )}
                    >
                      <Star size={12} className={draftRating === rating ? "text-white fill-white" : "text-amber-500 fill-amber-500"} />
                      <span>{rating === 'all' ? 'ALL RATINGS' : `${rating} STARS`}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Sort By Section */}
              <div className="space-y-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <History size={13} className="text-primary" /> Sort By
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'newest', label: 'NEWEST FIRST' },
                    { value: 'oldest', label: 'OLDEST FIRST' },
                    { value: 'rating_desc', label: 'HIGHEST RATING' },
                    { value: 'rating_asc', label: 'LOWEST RATING' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDraftSortBy(opt.value)}
                      className={cn(
                        "px-4 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider border transition-all flex items-center justify-between cursor-pointer select-none",
                        draftSortBy === opt.value
                          ? "bg-primary/10 text-primary border-2 border-primary/40 font-black shadow-xs"
                          : "bg-gray-50/80 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                      )}
                    >
                      <span>{opt.label}</span>
                      {draftSortBy === opt.value && <Check size={16} strokeWidth={3} className="text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            </LandlordMobileFilterSheet>
          </div>

          {/* Desktop Filters Group */}
          <div className="hidden lg:flex items-center gap-2 lg:ml-auto">
            <div className="flex items-center gap-2 mr-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <Settings2 size={14} />
              Filters
            </div>

            {/* 1. Status Filter Dropdown */}
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
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Review Status</span>
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

            {/* 2. Rating Filter Dropdown */}
            <DropdownMenu open={ratingDropdownOpen} onOpenChange={setRatingDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex-1 sm:flex-initial flex items-center justify-between sm:justify-start gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm group",
                  selectedRating !== 'all' ? "text-primary border-primary/30 bg-primary/5" : "text-gray-500 hover:text-primary"
                )}>
                  <div className="flex items-center gap-1.5 truncate">
                    <Star size={13} className={cn("transition-transform group-hover:scale-110 shrink-0", selectedRating !== 'all' ? "text-amber-500 fill-amber-500" : "text-gray-400")} />
                    <span className="truncate max-w-[100px] sm:max-w-[110px]">
                      {selectedRating === 'all' ? 'Rating' : `${selectedRating} Stars`}
                    </span>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0 ml-1",
                    ratingDropdownOpen ? "bg-primary/20 text-primary rotate-180" : "bg-gray-100 dark:bg-gray-700 text-gray-400 group-hover:text-primary"
                  )}>
                    <ChevronDown size={13} strokeWidth={3} />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-w-[calc(100vw-2rem)] p-0 rounded-2xl shadow-2xl z-[150] overflow-hidden bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Guest Rating</span>
                  {selectedRating !== 'all' && (
                    <button
                      onClick={() => {
                        setSelectedRating('all');
                        setRatingDropdownOpen(false);
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-100 dark:border-rose-500/20"
                    >
                      <X size={11} strokeWidth={3} /> Clear
                    </button>
                  )}
                </div>
                <div className="p-1.5 space-y-1">
                  <DropdownMenuGroup>
                    {['all', '5', '4', '3', '2', '1'].map((rating) => {
                      const isSelected = selectedRating === rating;
                      return (
                        <DropdownMenuItem
                          key={rating}
                          onClick={() => {
                            setSelectedRating(rating);
                            setRatingDropdownOpen(false);
                          }}
                          className={cn(
                            "cursor-pointer flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all",
                            isSelected
                              ? "bg-primary/10 text-primary font-black border border-primary/20"
                              : "text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Star size={14} className={isSelected ? "text-amber-500 fill-amber-500" : "text-gray-400"} />
                            <span className="font-black">{rating === 'all' ? 'ALL RATINGS' : `${rating} STARS`}</span>
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

            {/* 3. Sorting Dropdown */}
            <DropdownMenu open={sortDropdownOpen} onOpenChange={setSortDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex-1 sm:flex-initial flex items-center justify-between sm:justify-start gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm group",
                  sortBy !== 'newest' ? "text-primary border-primary/30 bg-primary/5" : "text-gray-500 hover:text-primary"
                )}>
                  <div className="flex items-center gap-1.5 truncate">
                    <History size={13} className={cn("transition-transform group-hover:scale-110 shrink-0", sortBy !== 'newest' ? "text-primary" : "text-gray-400")} />
                    <span className="max-w-[95px] truncate">
                      {[
                        { value: 'newest', label: 'Newest' },
                        { value: 'oldest', label: 'Oldest' },
                        { value: 'rating_desc', label: 'High Rating' },
                        { value: 'rating_asc', label: 'Low Rating' },
                      ].find(o => o.value === sortBy)?.label || 'Newest'}
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
                      { value: 'rating_desc', label: 'HIGHEST RATING', icon: Star },
                      { value: 'rating_asc', label: 'LOWEST RATING', icon: Star },
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
          </div>
        </div>
      </div>
    </motion.div>
  );
}

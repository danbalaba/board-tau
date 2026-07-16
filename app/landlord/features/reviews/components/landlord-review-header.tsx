'use client';

import React from 'react';
import {
  IconStar,
  IconInbox,
  IconClock,
  IconCircleCheck,
  IconLayoutGrid,
  IconList,
  IconStarFilled,
  IconFilter,
  IconCheck,
  IconChevronDown
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helper';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import GenerateReportButton from '@/components/common/GenerateReportButton';
import { prepareDataForExport, exportToCSV, exportToExcel } from '@/utils/export-utils';
import { DateRange } from 'react-day-picker';
import { LandlordReviewSearch } from './landlord-review-search';
import { Review } from '../hooks/use-review-logic';

interface LandlordReviewHeaderProps {
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
}

export function LandlordReviewHeader({
  viewMode,
  setViewMode,
  selectedStatus,
  setSelectedStatus,
  selectedRating,
  setSelectedRating,
  handleGenerateReport,
  searchQuery,
  setSearchQuery,
  rawReviews
}: LandlordReviewHeaderProps) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-[3rem] border border-primary/10 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      {/* Premium Background Accents */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        <div className="flex items-center gap-6 shrink-0">
          <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-primary border border-gray-100 dark:border-gray-700">
            <IconStar size={28} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
              Guest Reviews
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                Monitor and respond to property feedback
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto lg:justify-end">
          <div className="w-full sm:w-auto lg:min-w-[320px]">
            <LandlordReviewSearch
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              reviews={rawReviews}
            />
          </div>
                     {/* Filters Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all backdrop-blur-sm shadow-sm">
                  <IconFilter size={14} />
                  Filters {((selectedStatus !== 'all') || (selectedRating !== 'all')) && <span className="w-2 h-2 rounded-full bg-primary" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-[150]">
                <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 dark:border-gray-800 mb-1">
                  Status
                </div>
                <DropdownMenuGroup>
                  {[
                    { value: 'all', label: 'All Reviews', icon: IconInbox },
                    { value: 'pending', label: 'Pending', icon: IconClock },
                    { value: 'approved', label: 'Approved', icon: IconCircleCheck },
                  ].map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedStatus === option.value;
                    return (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setSelectedStatus(option.value)}
                        className={cn(
                          "cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
                          isSelected ? "bg-primary/10 text-primary" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        )}
                      >
                        <Icon size={16} className={cn("transition-colors", isSelected ? "text-primary" : "text-gray-400")} />
                        {option.label}
                        {isSelected && <IconCheck size={14} className="ml-auto" />}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="my-1 bg-gray-100 dark:bg-gray-800" />
                <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 dark:border-gray-800 mb-1">
                  Rating
                </div>
                <DropdownMenuGroup>
                  {['all', '5', '4', '3'].map((rating) => {
                    const isSelected = selectedRating === rating;
                    return (
                      <DropdownMenuItem
                        key={rating}
                        onClick={() => setSelectedRating(rating)}
                        className={cn(
                          "cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
                          isSelected ? "bg-amber-500/10 text-amber-600" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        )}
                      >
                        {rating === 'all' ? <IconStar size={16} className="text-gray-400" /> : <IconStarFilled size={14} className="text-amber-500" />}
                        {rating === 'all' ? 'All Ratings' : `${rating} Stars`}
                        {isSelected && <IconCheck size={14} className="ml-auto" />}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm shadow-sm shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-300",
                  viewMode === 'grid' ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <IconLayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-300",
                  viewMode === 'list' ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <IconList size={18} />
              </button>
            </div>

            <GenerateReportButton 
              onGeneratePDF={handleGenerateReport}
              onGenerateCSV={handleGenerateCSV}
              onGenerateExcel={handleGenerateExcel}
              label="Generate Report"
              className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hidden sm:flex items-center gap-2"
            />
          </div>
      </div>
    </motion.div>
  );
}

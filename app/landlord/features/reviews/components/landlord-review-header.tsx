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
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-6 rounded-2xl border border-primary/10 shadow-sm z-30"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl overflow-hidden pointer-events-none" />
      <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        <div className="flex items-center gap-4 shrink-0">
          <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-primary">
            <IconStar size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-tight truncate">
              Guest Reviews
            </h1>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider truncate">
              Monitor and respond to property feedback
            </p>
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
            
            <GenerateReportButton onGeneratePDF={handleGenerateReport} />
          </div>
      </div>
    </motion.div>
  );
}

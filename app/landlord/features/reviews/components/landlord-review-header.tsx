'use client';

import React from 'react';
import { 
  IconStar, 
  IconInbox, 
  IconClock, 
  IconCircleCheck, 
  IconCircleX, 
  IconLayoutGrid, 
  IconList,
  IconStarFilled
} from '@tabler/icons-react';
import { cn } from '@/utils/helper';
import GenerateReportButton from '@/components/common/GenerateReportButton';

interface LandlordReviewHeaderProps {
  viewMode: 'grid' | 'list';
  setViewMode: (m: 'grid' | 'list') => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  selectedRating: string;
  setSelectedRating: (r: string) => void;
  handleGenerateReport: () => Promise<void>;
}

export function LandlordReviewHeader({
  viewMode,
  setViewMode,
  selectedStatus,
  setSelectedStatus,
  selectedRating,
  setSelectedRating,
  handleGenerateReport
}: LandlordReviewHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-xl transition-all duration-300",
                viewMode === 'grid' ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <IconLayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-xl transition-all duration-300",
                viewMode === 'list' ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <IconList size={18} />
            </button>
          </div>
          
          <GenerateReportButton onGeneratePDF={handleGenerateReport} />

          <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-primary hover:scale-110 transition-transform duration-300">
            <IconStar size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-0.5 tracking-tight">
              Guest Reviews
            </h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Manage property reviews and responses
            </p>
          </div>
        </div>
        
        <div className="hidden xl:flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-2">Status</span>
            {[
              { value: 'all', label: 'All Reviews', icon: IconInbox },
              { value: 'pending', label: 'Pending', icon: IconClock },
              { value: 'approved', label: 'Approved', icon: IconCircleCheck },
              { value: 'rejected', label: 'Rejected', icon: IconCircleX },
            ].map((option) => {
              const Icon = option.icon;
              const isSelected = selectedStatus === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                    isSelected ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700"
                  )}
                >
                  <Icon size={12} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-2">Rating</span>
            {['all', '5', '4', '3', '2', '1'].map((rating) => {
              const isSelected = selectedRating === rating;
              return (
                <button
                  key={rating}
                  onClick={() => setSelectedRating(rating)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                    isSelected ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700"
                  )}
                >
                  {rating === 'all' ? (
                    <>
                      <IconInbox size={12} />
                      <span>All Ratings</span>
                    </>
                  ) : (
                    <>
                      <IconStarFilled size={10} className={isSelected ? "text-white" : "text-amber-500"} />
                      <span>{rating} Stars</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

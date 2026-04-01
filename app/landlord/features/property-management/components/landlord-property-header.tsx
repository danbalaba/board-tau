'use client';

import React from 'react';
import { 
  IconBuilding, 
  IconCalendarEvent, 
  IconHistory, 
  IconSortDescending, 
  IconSortAscending, 
  IconCircleCheck, 
  IconLayoutGrid, 
  IconList 
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helper';

interface LandlordPropertyHeaderProps {
  sortBy: string;
  setSortBy: (val: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (val: 'grid' | 'list') => void;
}

export function LandlordPropertyHeader({
  sortBy,
  setSortBy,
  viewMode,
  setViewMode
}: LandlordPropertyHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm"
    >
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-primary">
            <IconBuilding size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
              Properties
            </h1>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
              Manage your rental portfolio
            </p>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0">
          <div className="flex flex-wrap items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
            {[
              { value: 'newest', label: 'Newest', icon: IconHistory },
              { value: 'oldest', label: 'Oldest', icon: IconCalendarEvent },
              { value: 'price_desc', label: 'High Price', icon: IconSortDescending },
              { value: 'price_asc', label: 'Low Price', icon: IconSortAscending },
              { value: 'status', label: 'Status', icon: IconCircleCheck },
            ].map((option) => {
              const Icon = option.icon;
              const isSelected = sortBy === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300",
                    isSelected
                      ? "bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm"
                  )}
                >
                  <Icon size={14} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
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
        </div>
      </div>
    </motion.div>
  );
}

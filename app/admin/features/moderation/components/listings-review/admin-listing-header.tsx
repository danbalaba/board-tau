'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  IconShieldCheck, 
  IconSearch, 
  IconHistory, 
  IconCalendarEvent, 
  IconLayoutGrid, 
  IconList,
  IconCheck,
  IconChevronDown,
  IconRefresh
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import { Button } from '@/app/admin/components/ui/button';

interface AdminListingHeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (m: 'grid' | 'list') => void;
  handleRefresh: () => Promise<void>;
  pendingCount: number;
  isLoading: boolean;
}

export function AdminListingHeader({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  handleRefresh,
  pendingCount,
  isLoading
}: AdminListingHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-6 rounded-2xl border border-primary/10 shadow-sm z-30"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl overflow-hidden pointer-events-none" />
      <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        <div className="flex items-center gap-6 shrink-0">
          <div className="p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-primary">
            <IconShieldCheck size={24} />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-tight truncate flex items-center gap-3">
              Listing Assets
              {pendingCount > 0 && (
                <span className="flex items-center gap-1.5 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 text-rose-500 text-[9px] tracking-[0.2em] font-black italic">
                  {pendingCount} PENDING
                </span>
              )}
            </h1>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider truncate">
              Vetting property listings for quality and compliance
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto lg:justify-end">
          {/* Search Input */}
          <div className="relative w-full sm:w-auto lg:min-w-[320px]">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <IconSearch size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search property or landlord..."
              className="w-full pl-11 pr-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sorting Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all backdrop-blur-sm shadow-sm">
                  <IconHistory size={14} />
                  <span>Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'Price'}</span>
                  <IconChevronDown size={14} className="opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-[150]">
                <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 dark:border-gray-800 mb-1">
                  Sort Assets By
                </div>
                <DropdownMenuGroup>
                  {[
                    { value: 'newest', label: 'Newest First', icon: IconHistory },
                    { value: 'oldest', label: 'Oldest First', icon: IconCalendarEvent },
                    { value: 'price_desc', label: 'Highest Price', icon: IconHistory },
                    { value: 'price_asc', label: 'Lowest Price', icon: IconHistory },
                  ].map((option) => {
                    const Icon = option.icon;
                    const isSelected = sortBy === option.value;
                    return (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
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
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm shadow-sm shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-300",
                  viewMode === "grid" ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <IconLayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2.5 rounded-xl transition-all duration-300",
                  viewMode === "list" ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <IconList size={18} />
              </button>
            </div>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              className={cn("h-10 w-10 rounded-xl border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50", isLoading && "animate-spin")}
            >
              <IconRefresh className="w-4 h-4 text-primary" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-20 -mb-16 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
    </motion.div>
  );
}

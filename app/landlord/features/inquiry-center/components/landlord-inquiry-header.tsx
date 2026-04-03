'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  IconMail, 
  IconSearch, 
  IconHistory, 
  IconCalendarEvent, 
  IconFilter, 
  IconInbox, 
  IconClock, 
  IconCircleCheck, 
  IconCircleX, 
  IconLayoutGrid, 
  IconList,
  IconCheck
} from '@tabler/icons-react';
import { cn } from '@/utils/helper';
import GenerateReportButton from '@/components/common/GenerateReportButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';

interface LandlordInquiryHeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (m: 'grid' | 'list') => void;
  handleGenerateReport: () => Promise<void>;
}

export function LandlordInquiryHeader({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  selectedStatus,
  setSelectedStatus,
  viewMode,
  setViewMode,
  handleGenerateReport
}: LandlordInquiryHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-[32px] border border-primary/10 shadow-sm"
    >
      <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-[24px] flex items-center justify-center text-primary shadow-xl shadow-primary/10">
            <IconMail size={32} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
              Tenant Inquiries
            </h1>
            <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1 opacity-70">
              Manage your active inquiries & requests
            </p>
          </div>
        </div>

        <div className="flex flex-nowrap items-center gap-3 w-full xl:w-auto mt-4 xl:mt-0">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[160px] lg:min-w-[200px] max-w-[240px] group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
              <IconSearch size={16} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder="Search tenant or property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-gray-700 py-3 pl-11 pr-4 text-xs font-bold text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </div>

          {/* Sorting */}
          <div className="flex flex-nowrap items-center gap-1 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm flex-shrink-0">
            {[
              { value: 'newest', label: 'Newest', icon: IconHistory },
              { value: 'oldest', label: 'Oldest', icon: IconCalendarEvent },
            ].map((option) => {
              const Icon = option.icon;
              const isSelected = sortBy === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                    isSelected
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700"
                  )}
                >
                  <Icon size={12} />
                  <span className="hidden xl:inline">{option.label}</span>
                </button>
              );
            })}
          </div>

          {/* Filters Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-3 py-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all backdrop-blur-sm flex-shrink-0">
                <IconFilter size={14} />
                Filters {selectedStatus !== 'ALL' && <span className="w-2 h-2 rounded-full bg-primary" />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl">
              <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">Status</div>
              <DropdownMenuGroup>
                {[
                  { value: "ALL", label: "All Active", icon: IconInbox },
                  { value: "PENDING", label: "Pending", icon: IconClock },
                  { value: "APPROVED", label: "Approved", icon: IconCircleCheck },
                  { value: "REJECTED", label: "Rejected", icon: IconCircleX },
                ].map((option: any) => {
                  const Icon = option.icon;
                  return (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSelectedStatus(option.value)}
                      className={cn(
                        "cursor-pointer flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold transition-all",
                        selectedStatus === option.value ? "bg-primary/10 text-primary" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      )}
                    >
                      <Icon size={14} />
                      {option.label}
                      {selectedStatus === option.value && <IconCheck size={14} className="ml-auto" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm shadow-sm flex-shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-xl transition-all duration-300",
                viewMode === "grid" ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <IconLayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-xl transition-all duration-300",
                viewMode === "list" ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <IconList size={18} />
            </button>
          </div>
          
          <GenerateReportButton onGeneratePDF={handleGenerateReport} className="ml-auto flex-shrink-0" />
        </div>
      </div>
      
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-20 -mb-16 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
    </motion.div>
  );
}

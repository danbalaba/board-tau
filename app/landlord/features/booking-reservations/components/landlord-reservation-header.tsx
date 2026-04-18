'use client';

import React from 'react';
import { 
  IconCalendar, 
  IconHistory, 
  IconCalendarEvent, 
  IconFilter, 
  IconInbox, 
  IconClock, 
  IconCircleCheck, 
  IconCircleX, 
  IconLayoutGrid, 
  IconList,
  IconCheck,
  IconChevronDown
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/helper';
import GenerateReportButton from '@/components/common/GenerateReportButton';
import { LandlordReservationSearch } from './landlord-reservation-search';
import { ReservationRequest } from '../hooks/use-reservation-logic';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';

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
  onToggleArchived
}: LandlordReservationHeaderProps) {
  const statusOptions = [
    { value: 'all', label: 'All Pre-Stay', icon: IconInbox },
    { value: 'PENDING_PAYMENT', label: 'Pending Payment', icon: IconClock },
    { value: 'RESERVED', label: 'Reserved (Paid)', icon: IconCircleCheck },
    { value: 'CANCELLED', label: 'Cancelled', icon: IconCircleX },
  ];

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
            <IconCalendar size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-tight truncate">
              Reservations
            </h1>
            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider truncate">
              Review and manage incoming requests
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto lg:justify-end">
          <div className="w-full sm:w-auto lg:min-w-[320px]">
            <LandlordReservationSearch 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              reservations={rawReservations}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all backdrop-blur-sm shadow-sm">
                  <IconHistory size={14} />
                  <span>Sort: {sortBy === 'newest' ? 'Newest' : 'Oldest'}</span>
                  <IconChevronDown size={14} className="opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-[150]">
                <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 dark:border-gray-800 mb-1">
                  Sort Reservations By
                </div>
                <DropdownMenuGroup>
                  {[
                    { value: 'newest', label: 'Newest First', icon: IconHistory },
                    { value: 'oldest', label: 'Oldest First', icon: IconCalendarEvent },
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all backdrop-blur-sm shadow-sm">
                  <IconFilter size={14} />
                  Filters {selectedStatus !== 'all' && <span className="w-2 h-2 rounded-full bg-primary" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl">
                <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">Status</div>
                <DropdownMenuGroup>
                  {statusOptions.map((option: any) => {
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

            {/* Archived Toggle */}
            <button
              onClick={onToggleArchived}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-sm shadow-sm",
                isArchived 
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-600 hover:bg-amber-500/20" 
                  : "bg-white/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 text-gray-500 hover:text-primary"
              )}
            >
              <IconHistory size={14} className={isArchived ? "animate-spin-slow" : ""} />
              <span>{isArchived ? "Viewing Archived" : "View Archived"}</span>
            </button>

            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm shadow-sm shrink-0">
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
          </div>
        </div>
      </div>
    </motion.div>
  );
}

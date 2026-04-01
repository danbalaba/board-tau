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

interface LandlordReservationHeaderProps {
  sortBy: string;
  setSortBy: (s: string) => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (m: 'grid' | 'list') => void;
  handleGenerateReport: () => Promise<void>;
}

export function LandlordReservationHeader({
  sortBy,
  setSortBy,
  selectedStatus,
  setSelectedStatus,
  viewMode,
  setViewMode,
  handleGenerateReport
}: LandlordReservationHeaderProps) {
  const statusOptions = [
    { value: 'all', label: 'All Requests', icon: IconInbox },
    { value: 'pending', label: 'Pending', icon: IconClock },
    { value: 'approved', label: 'Approved', icon: IconCircleCheck },
    { value: 'rejected', label: 'Rejected', icon: IconCircleX },
  ];

  return (
    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/10 shadow-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-primary hover:scale-110 transition-transform duration-300">
            <IconCalendar size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-0.5 tracking-tight">
              Reservation Requests
            </h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Manage reservation requests from potential tenants
            </p>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0">
          <div className="flex flex-wrap items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
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
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                    isSelected
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700"
                  )}
                >
                  <Icon size={12} />
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              );
            })}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all backdrop-blur-sm">
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
        </div>
      </div>
    </div>
  );
}

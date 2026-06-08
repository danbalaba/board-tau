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
  IconCheck,
  IconChevronDown as IconChevronDownIcon
} from '@tabler/icons-react';
import { cn } from '@/utils/helper';
import GenerateReportButton from '@/components/common/GenerateReportButton';
import { prepareDataForExport, exportToCSV, exportToExcel } from '@/utils/export-utils';
import { LandlordInquirySearch } from './landlord-inquiry-search';
import { Inquiry } from '../hooks/use-inquiry-logic';
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
  rawInquiries: Inquiry[];
  isArchived: boolean;
  onToggleArchived: () => void;
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
  handleGenerateReport,
  rawInquiries,
  isArchived,
  onToggleArchived
}: LandlordInquiryHeaderProps) {
  const handleGenerateCSV = async () => {
    const reportData = prepareDataForExport(rawInquiries, 'inquiry');
    const totalInquiries = rawInquiries.length;
    const uniqueListings = new Set(rawInquiries.map(i => i.listingId)).size;
    const metadata = {
      reportTitle: 'Tenant Inquiry Business Report',
      reportId: `BTAU-INQ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      summary: [
        { label: 'Total Inquiries', value: `${totalInquiries}` },
        { label: 'Interested Properties', value: `${uniqueListings}` }
      ],
      author: 'Landlord Management System'
    };
    exportToCSV(reportData, `Inquiry_Report_${new Date().toLocaleDateString()}`, metadata);
  };

  const handleGenerateExcel = async () => {
    const reportData = prepareDataForExport(rawInquiries, 'inquiry');
    const totalInquiries = rawInquiries.length;
    const uniqueListings = new Set(rawInquiries.map(i => i.listingId)).size;
    const metadata = {
      reportTitle: 'Tenant Inquiry Business Report',
      reportId: `BTAU-INQ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      summary: [
        { label: 'Total Inquiries', value: `${totalInquiries}` },
        { label: 'Interested Properties', value: `${uniqueListings}` }
      ],
      author: 'Landlord Management System'
    };
    exportToExcel(reportData, `Inquiry_Report_${new Date().toLocaleDateString()}`, 'Inquiries', metadata);
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
            <IconMail size={28} strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
              Tenant Inquiries
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                Manage your active inquiries & requests
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto lg:justify-end">
          {/* Search Input */}
          <div className="w-full sm:w-auto lg:min-w-[320px]">
            <LandlordInquirySearch 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              inquiries={rawInquiries}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sorting */}
            {/* Sorting Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all backdrop-blur-sm shadow-sm">
                  <IconHistory size={14} />
                  <span>Sort: {sortBy === 'newest' ? 'Newest' : 'Oldest'}</span>
                  <IconChevronDownIcon size={14} className="opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-[150]">
                <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 dark:border-gray-800 mb-1">
                  Sort Inquiries By
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

            {/* Filters Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all backdrop-blur-sm shadow-sm">
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
            
            <GenerateReportButton 
              onGeneratePDF={handleGenerateReport}
              onGenerateCSV={handleGenerateCSV}
              onGenerateExcel={handleGenerateExcel}
              label="Generate Report"
              className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hidden sm:flex items-center gap-2"
            />
          </div>
        </div>
      </div>
      
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-20 -mb-16 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
    </motion.div>
  );
}

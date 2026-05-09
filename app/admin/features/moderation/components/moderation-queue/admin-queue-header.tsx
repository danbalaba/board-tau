import React from 'react';
import { motion } from 'framer-motion';
import { IconShieldCheck, IconRefresh, IconInbox, IconFilter, IconLayoutGrid, IconList } from '@tabler/icons-react';
import { Button } from '@/app/admin/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import { IconChevronDown } from '@tabler/icons-react';
import { Search } from 'lucide-react';

interface AdminQueueHeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  entityType: string;
  setEntityType: (val: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (val: 'grid' | 'list') => void;
  handleRefresh: () => void;
  totalPending: number;
  isLoading: boolean;
}

export function AdminQueueHeader({
  searchQuery,
  setSearchQuery,
  entityType,
  setEntityType,
  viewMode,
  setViewMode,
  handleRefresh,
  totalPending,
  isLoading
}: AdminQueueHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-[3rem] border border-indigo-500/10 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-indigo-500 border border-gray-100 dark:border-gray-700">
              <IconInbox size={28} stroke={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight flex items-center gap-3">
                Governance Center
                {totalPending > 0 && (
                  <span className="flex items-center gap-1.5 bg-indigo-500/10 px-3 py-1.5 rounded-2xl border border-indigo-500/10 text-indigo-500 text-[10px] tracking-[0.2em] font-black italic shadow-sm">
                    <IconShieldCheck size={12} />
                    {totalPending} ACTION REQUIRED
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                  Unified administrative oversight
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="flex items-center gap-1.5 bg-gray-100/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  viewMode === 'grid' ? "bg-white dark:bg-gray-700 text-indigo-500 shadow-md" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <IconLayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  viewMode === 'list' ? "bg-white dark:bg-gray-700 text-indigo-500 shadow-md" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <IconList size={18} />
              </button>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              className={cn("h-12 w-12 rounded-2xl border-gray-200/60 dark:border-gray-700/60 shadow-sm", isLoading && "animate-spin")}
            >
              <IconRefresh className="w-5 h-5 text-indigo-500" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-4 pt-8 border-t border-gray-100 dark:border-gray-800">
          <div className="flex-1 lg:max-w-md relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search unified queue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 lg:ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-indigo-500 transition-all shadow-sm">
                  <IconFilter size={14} className="text-indigo-500" />
                  <span>
                    {entityType === '' ? 'All Types' : 
                     entityType === 'listing' ? 'Listings' : 
                     entityType === 'hostApplication' ? 'Profiles' : 
                     'Reviews'}
                  </span>
                  <IconChevronDown size={14} className="opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl shadow-2xl">
                <DropdownMenuItem onClick={() => setEntityType('')} className="cursor-pointer rounded-xl text-xs font-bold px-3 py-2.5">
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEntityType('listing')} className="cursor-pointer rounded-xl text-xs font-bold px-3 py-2.5">
                  Properties / Listings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEntityType('hostApplication')} className="cursor-pointer rounded-xl text-xs font-bold px-3 py-2.5">
                  Host Profiles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEntityType('review')} className="cursor-pointer rounded-xl text-xs font-bold px-3 py-2.5">
                  User Reviews
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

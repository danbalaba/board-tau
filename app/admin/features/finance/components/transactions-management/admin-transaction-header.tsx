import React from 'react';
import { motion } from 'framer-motion';
import { IconCreditCard, IconRefresh, IconLayoutGrid, IconList, IconFilter, IconDownload } from '@tabler/icons-react';
import { Button } from '@/app/admin/components/ui/button';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import { IconChevronDown } from '@tabler/icons-react';

interface AdminTransactionHeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (val: 'grid' | 'list') => void;
  handleRefresh: () => void;
  isLoading: boolean;
}

export function AdminTransactionHeader({
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  handleRefresh,
  isLoading
}: AdminTransactionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-[3rem] border border-blue-500/10 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-blue-500 border border-gray-100 dark:border-gray-700">
              <IconCreditCard size={28} stroke={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight flex items-center gap-3">
                Transaction Ledger
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                  Real-time monitoring of platform financial flows
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
                  viewMode === 'grid' ? "bg-white dark:bg-gray-700 text-blue-500 shadow-md" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <IconLayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-xl transition-all duration-300",
                  viewMode === 'list' ? "bg-white dark:bg-gray-700 text-blue-500 shadow-md" : "text-gray-400 hover:text-gray-600"
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
              <IconRefresh className="w-5 h-5 text-blue-500" />
            </Button>
            
            <Button
              className="h-12 px-6 gap-2 rounded-2xl bg-gray-900 hover:bg-blue-600 dark:bg-white dark:text-gray-900 dark:hover:bg-blue-600 text-white shadow-xl shadow-blue-500/10 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
            >
              <IconDownload size={16} /> Export Ledger
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-4 pt-8 border-t border-gray-100 dark:border-gray-800">
          <div className="flex-1 lg:max-w-md relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by TX ID, User, or Property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 lg:ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-all shadow-sm">
                  <IconFilter size={14} className="text-blue-500" />
                  <span>
                    {sortBy === 'newest' ? 'Newest First' : 
                     sortBy === 'oldest' ? 'Oldest First' : 
                     sortBy === 'amount_high' ? 'Highest Amount' : 'Lowest Amount'}
                  </span>
                  <IconChevronDown size={14} className="opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl shadow-2xl">
                <DropdownMenuItem onClick={() => setSortBy('newest')} className="cursor-pointer rounded-xl text-xs font-bold px-3 py-2.5">
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('oldest')} className="cursor-pointer rounded-xl text-xs font-bold px-3 py-2.5">
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('amount_high')} className="cursor-pointer rounded-xl text-xs font-bold px-3 py-2.5">
                  Highest Amount
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('amount_low')} className="cursor-pointer rounded-xl text-xs font-bold px-3 py-2.5">
                  Lowest Amount
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

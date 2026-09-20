import React from 'react';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Plus, Search, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Skeleton from '@/components/common/Skeleton';

interface FeatureHeaderProps {
  onAdd: () => void;
  search: string;
  setSearch: (val: string) => void;
  isLoading?: boolean;
}

export function FeatureHeader({ onAdd, search, setSearch, isLoading }: FeatureHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-6 rounded-3xl border border-primary/10 shadow-lg overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl mb-6"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-4">
          {isLoading ? (
            <>
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div>
                <Skeleton className="h-7 w-48 mb-1.5 rounded-lg" />
                <Skeleton className="h-3 w-64 rounded-md" />
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl shadow-md flex items-center justify-center text-primary border border-gray-100 dark:border-gray-700 shrink-0">
                <Flag size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight flex items-center gap-3">
                  Platform Features
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.18em]">
                    Feature Toggles & Experimental Platform Capabilities
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Search & Action Controls */}
        <div className="flex items-center gap-2.5 self-end md:self-auto flex-wrap w-full md:w-auto">
          {isLoading ? (
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <Skeleton className="h-9 w-full md:w-60 rounded-xl" />
              <Skeleton className="h-9 w-32 rounded-xl" />
            </div>
          ) : (
            <>
              <div className="relative flex-1 md:w-60">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Search feature flags..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 h-9 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 rounded-xl font-bold focus:ring-2 focus:ring-primary/30 text-xs transition-all w-full text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm"
                />
              </div>
              <Button 
                onClick={onAdd}
                className="h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md bg-primary hover:bg-primary/90 text-white shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                Add Feature
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

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
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <Flag className="h-8 w-8 text-primary" />
          Platform Features
        </h1>
        <p className="text-sm font-medium text-gray-500 mt-1">
          Turn experimental features on or off
        </p>
      </div>
      
      <div className="flex items-center gap-3 w-full md:w-auto">
        {isLoading ? (
          <>
            <Skeleton className="h-11 w-full md:w-64 rounded-xl" />
            <Skeleton className="h-11 w-32 rounded-xl shrink-0" />
          </>
        ) : (
          <>
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search feature flags..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-11 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 transition-all w-full"
              />
            </div>
            <Button 
              onClick={onAdd}
              className="h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg bg-primary hover:bg-primary/90 hover:shadow-primary/20 hover:-translate-y-0.5 transition-all gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Feature
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

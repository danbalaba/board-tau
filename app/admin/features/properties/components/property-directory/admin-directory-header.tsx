import React from 'react';
import { motion } from 'framer-motion';
import { IconBuildingCommunity, IconPlus, IconLayoutGrid, IconList } from '@tabler/icons-react';
import { Button } from '@/app/admin/components/ui/button';

interface AdminDirectoryHeaderProps {
  view: 'grid' | 'list';
  setView: (view: 'grid' | 'list') => void;
}

export function AdminDirectoryHeader({ view, setView }: AdminDirectoryHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-[3rem] border border-blue-500/10 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-blue-500 border border-gray-100 dark:border-gray-700">
            <IconBuildingCommunity size={28} stroke={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight flex items-center gap-3">
              Asset Command Center
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                Orchestrate global property inventory and listings
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md p-1 shadow-sm">
            <Button 
              variant={view === 'grid' ? 'secondary' : 'ghost'} 
              size="icon" 
              className={`h-10 w-10 rounded-xl transition-all ${view === 'grid' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
              onClick={() => setView('grid')}
            >
              <IconLayoutGrid className="h-5 w-5" />
            </Button>
            <Button 
              variant={view === 'list' ? 'secondary' : 'ghost'} 
              size="icon" 
              className={`h-10 w-10 rounded-xl transition-all ${view === 'list' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
              onClick={() => setView('list')}
            >
              <IconList className="h-5 w-5" />
            </Button>
          </div>
          
          <Button
            className="h-12 px-6 gap-2 rounded-2xl bg-gray-900 hover:bg-blue-600 dark:bg-white dark:text-gray-900 dark:hover:bg-blue-600 text-white shadow-xl shadow-blue-500/10 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
          >
            <IconPlus size={16} /> Register Property
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

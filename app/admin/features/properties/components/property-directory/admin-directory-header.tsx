import React from 'react';
import { motion } from 'framer-motion';
import { IconBuildingCommunity, IconPlus, IconLayoutGrid, IconList, IconFilter, IconDownload } from '@tabler/icons-react';
import { Button } from '@/app/admin/components/ui/button';
import { cn } from '@/lib/utils';

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
              Property Directory
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                Centralized registry of all hosted assets
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <div className="flex items-center gap-1.5 bg-gray-100/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shrink-0">
            <button
              onClick={() => setView('grid')}
              className={cn(
                "p-2 rounded-xl transition-all duration-300",
                view === 'grid' ? "bg-white dark:bg-gray-700 text-blue-500 shadow-md" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <IconLayoutGrid size={18} />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                "p-2 rounded-xl transition-all duration-300",
                view === 'list' ? "bg-white dark:bg-gray-700 text-blue-500 shadow-md" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <IconList size={18} />
            </button>
          </div>

          <Button variant="outline" className="h-12 w-12 rounded-2xl border-gray-200/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all p-0">
            <IconFilter size={18} className="text-gray-500" />
          </Button>

          <Button variant="outline" className="h-12 w-12 rounded-2xl border-gray-200/60 dark:border-gray-700/60 bg-white/50 dark:bg-gray-800/50 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all p-0">
            <IconDownload size={18} className="text-gray-500" />
          </Button>
          
          <Button className="h-12 px-6 gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all">
            <IconPlus size={16} /> Add Property
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { IconFileSpreadsheet, IconSearch, IconPlus } from '@tabler/icons-react';
import { Button } from '@/app/admin/components/ui/button';
import { Search } from 'lucide-react';

export function AdminReportsHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-[3rem] border border-blue-500/10 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-blue-500 border border-gray-100 dark:border-gray-700">
              <IconFileSpreadsheet size={28} stroke={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight flex items-center gap-3">
                Financial Intelligence
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                  On-demand reporting and multi-format data visualization
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <Button
              className="h-12 px-6 gap-2 rounded-2xl bg-gray-900 hover:bg-blue-600 dark:bg-white dark:text-gray-900 dark:hover:bg-blue-600 text-white shadow-xl shadow-blue-500/10 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
            >
              <IconPlus size={16} /> New Report
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
              placeholder="Search reports by title, format, or date..."
              className="w-full h-12 pl-12 pr-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 lg:ml-auto">
            <Button variant="outline" className="h-12 px-6 gap-2 rounded-2xl border-gray-200 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-all shadow-sm">
              <IconSearch size={14} className="text-blue-500" /> Browse Catalog
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

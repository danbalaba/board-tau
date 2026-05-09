import React from 'react';
import { motion } from 'framer-motion';
import { IconUsers, IconUserPlus, IconRefresh } from '@tabler/icons-react';
import { Button } from '@/app/admin/components/ui/button';

interface AdminUserHeaderProps {
  onSync: () => void;
  onProvision: () => void;
}

export function AdminUserHeader({ onSync, onProvision }: AdminUserHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-[3rem] border border-blue-500/10 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-blue-500 border border-gray-100 dark:border-gray-700">
            <IconUsers size={28} stroke={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight flex items-center gap-3">
              Identity Management
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                Orchestrate user accounts, access levels and security profiles
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <Button
            variant="outline"
            onClick={onSync}
            className="h-12 px-6 gap-2 rounded-2xl border-gray-200/60 dark:border-gray-700/60 shadow-sm text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <IconRefresh size={16} className="text-blue-500" /> Sync State
          </Button>
          
          <Button
            onClick={onProvision}
            className="h-12 px-6 gap-2 rounded-2xl bg-gray-900 hover:bg-blue-600 dark:bg-white dark:text-gray-900 dark:hover:bg-blue-600 text-white shadow-xl shadow-blue-500/10 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
          >
            <IconUserPlus size={16} /> Provision User
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

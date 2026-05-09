import React from 'react';
import { motion } from 'framer-motion';
import { IconShield, IconPlus, IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { Button } from '@/app/admin/components/ui/button';

interface AdminRolesHeaderProps {
  onCreate: () => void;
}

export function AdminRolesHeader({ onCreate }: AdminRolesHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-[3rem] border border-emerald-500/10 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-emerald-500 border border-gray-100 dark:border-gray-700">
            <IconShield size={28} stroke={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight flex items-center gap-3">
              Security Governance
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                Manage institutional access levels and RBAC policies
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <Button
            variant="outline"
            className="h-12 px-6 gap-2 rounded-2xl border-gray-200/60 dark:border-gray-700/60 shadow-sm text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <IconAdjustmentsHorizontal size={16} className="text-emerald-500" /> Policy Audit
          </Button>
          
          <Button
            onClick={onCreate}
            className="h-12 px-6 gap-2 rounded-2xl bg-gray-900 hover:bg-emerald-600 dark:bg-white dark:text-gray-900 dark:hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/10 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
          >
            <IconPlus size={16} /> Define Role
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

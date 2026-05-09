import React from 'react';
import { motion } from 'framer-motion';
import { IconCalendar, IconFilter, IconCalendarEvent } from '@tabler/icons-react';
import { Button } from '@/app/admin/components/ui/button';

export function AdminBookingHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-8 rounded-[3rem] border border-violet-500/10 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center text-violet-500 border border-gray-100 dark:border-gray-700">
            <IconCalendar size={28} stroke={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight flex items-center gap-3">
              Reservations Ledger
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                Orchestrate and monitor global property bookings
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <Button
            variant="outline"
            className="h-12 px-6 gap-2 rounded-2xl border-gray-200/60 dark:border-gray-700/60 shadow-sm text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <IconFilter size={16} className="text-violet-500" /> Filter
          </Button>
          
          <Button
            className="h-12 px-6 gap-2 rounded-2xl bg-gray-900 hover:bg-violet-600 dark:bg-white dark:text-gray-900 dark:hover:bg-violet-600 text-white shadow-xl shadow-violet-500/10 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
          >
            <IconCalendarEvent size={16} /> Operations Calendar
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

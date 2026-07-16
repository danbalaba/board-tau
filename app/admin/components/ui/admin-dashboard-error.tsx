'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { Button } from '@/app/admin/components/ui/button';

interface AdminDashboardErrorProps {
  onRetry?: () => void;
  message?: string;
}

export function AdminDashboardError({ 
  onRetry, 
  message = "We are unable to establish a connection to the database. Please check your network or try refreshing the data feed." 
}: AdminDashboardErrorProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
    >
      <div className="relative p-10 rounded-[3rem] border border-red-500/20 shadow-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl overflow-hidden max-w-md w-full text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-500/20 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white dark:bg-gray-800 text-red-500 rounded-[1.5rem] flex items-center justify-center shadow-xl border border-red-100 dark:border-red-900/30 mb-6 group">
            <IconAlertTriangle size={40} strokeWidth={2} className="group-hover:scale-110 transition-transform duration-300" />
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
            System Disconnected
          </h2>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 max-w-[280px] leading-relaxed">
            {message}
          </p>
          
          <Button 
            size="lg" 
            onClick={() => onRetry ? onRetry() : window.location.reload()} 
            className="w-full rounded-2xl h-14 bg-red-500 hover:bg-red-600 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-red-500/20 transition-all border-b-4 border-red-700 active:border-b-0 group"
          >
            <span className="flex items-center justify-center gap-3">
              <IconRefresh className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              Restart Connection
            </span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

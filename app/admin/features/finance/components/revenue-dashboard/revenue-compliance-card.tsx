'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function RevenueComplianceCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.40 }}
      className="h-full"
    >
      <div className="rounded-[2.5rem] border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 p-8 h-full flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Compliance & Health</h3>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Platform regulatory and KYC status</p>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center py-6">
          <div className="relative flex h-36 w-36 items-center justify-center mb-8">
            <svg className="h-full w-full -rotate-90 transform">
              <circle cx="72" cy="72" r="64" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100 dark:text-gray-800" />
              <circle 
                cx="72" cy="72" r="64" 
                stroke="currentColor" 
                strokeWidth="8" 
                strokeLinecap="round" 
                fill="transparent" 
                strokeDasharray="402.1" 
                strokeDashoffset="40.21" 
                className="text-emerald-500 transition-all duration-1000 ease-out" 
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black tabular-nums text-gray-900 dark:text-white tracking-tighter">90%</span>
              <span className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] mt-1">KYC OK</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="rounded-[1.5rem] bg-white/50 dark:bg-gray-800/50 p-4 text-center shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">KYC Status</p>
              <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mt-1.5">Compliant</p>
            </div>
            <div className="rounded-[1.5rem] bg-white/50 dark:bg-gray-800/50 p-4 text-center shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Gateways</p>
              <p className="text-xs font-black text-blue-500 uppercase tracking-widest mt-1.5">Stripe Online</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

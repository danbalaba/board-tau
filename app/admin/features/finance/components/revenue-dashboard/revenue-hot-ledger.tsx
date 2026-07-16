'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { IconActivity, IconArrowUpRight, IconChevronRight } from '@tabler/icons-react';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import { cn } from "@/lib/utils";
import Link from 'next/link';
import Skeleton from '@/components/common/Skeleton';

interface RevenueHotLedgerProps {
  recentTransactions: any[];
  isTxLoading: boolean;
}

export function RevenueHotLedger({ recentTransactions, isTxLoading }: RevenueHotLedgerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.24 }}
      className="h-full"
    >
      <div className="rounded-[2.5rem] border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col h-full">
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Hot Ledger</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Real-time Feed</p>
            </div>
            <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <IconActivity className="h-5 w-5 text-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {isTxLoading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-16 w-full rounded-[1.5rem]" />
              <Skeleton className="h-16 w-full rounded-[1.5rem]" />
              <Skeleton className="h-16 w-full rounded-[1.5rem]" />
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No transaction data available.</p>
            </div>
          ) : (
            recentTransactions.map((tx) => (
              <div 
                key={tx.id} 
                className="group flex items-center gap-4 p-4 rounded-[1.5rem] bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-900/50 text-gray-500 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                  <IconArrowUpRight className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-black text-gray-900 dark:text-white truncate transition-colors">{tx.user?.name || 'Guest'}</p>
                    <p className="text-sm font-black tabular-nums text-gray-900 dark:text-white">₱{tx.totalPrice.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">{tx.paymentMethod || 'Stripe Gateway'}</p>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[9px] h-5 px-2 font-black uppercase tracking-widest border-none rounded-lg",
                        tx.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 
                        tx.paymentStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                      )}
                    >
                      {tx.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 bg-gray-50/50 dark:bg-gray-900/30 mt-auto">
          <Link href="/admin/finance/transactions" passHref legacyBehavior>
            <Button variant="ghost" className="w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white group transition-all">
              Full Transaction Logs
              <IconChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

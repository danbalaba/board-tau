'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCreditCard } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Button } from '@/app/admin/components/ui/button';
import { AdminTransactionCard } from './admin-transaction-card';

interface TransactionsListViewProps {
  filteredTransactions: any[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  viewMode: 'grid' | 'list';
}

export function TransactionsListView({
  filteredTransactions,
  isLoading,
  searchQuery,
  setSearchQuery,
  viewMode
}: TransactionsListViewProps) {
  return (
    <div className="min-h-[400px] relative mt-8">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-24 flex flex-col items-center justify-center gap-6"
          >
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin shadow-xl shadow-blue-500/10" />
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Syncing Ledger</p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            {filteredTransactions.length > 0 && (
              <div className="flex items-center gap-2 mb-6">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                </span>
                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
              </div>
            )}

            <AnimatePresence mode="wait">
              {filteredTransactions.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-16 bg-white dark:bg-gray-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center shadow-sm"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-2xl mb-4 text-blue-500">
                    <IconCreditCard size={24} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No Transactions Found</h3>
                  <p className="text-sm font-medium text-gray-400 max-w-sm mx-auto leading-relaxed">
                    {searchQuery ? `No records matching "${searchQuery}"` : "The transaction ledger is currently empty."}
                  </p>
                  {searchQuery && (
                    <Button variant="outline" onClick={() => setSearchQuery("")} className="mt-8 rounded-xl px-6 py-2.5 text-[10px] font-black uppercase tracking-widest">
                      Clear Search
                    </Button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  className={cn(
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      : "space-y-4"
                  )}
                >
                  {filteredTransactions.map((tx: any, idx: number) => (
                    <AdminTransactionCard 
                      key={`${viewMode}-${tx.id}`}
                      transaction={tx}
                      idx={idx}
                      viewMode={viewMode}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

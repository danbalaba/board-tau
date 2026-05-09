'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCreditCard, IconChartBar, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { IconArrowUpRight } from '@tabler/icons-react';

import { useTransactionsLogic } from '../../hooks/use-transactions-logic';
import { AdminTransactionHeader } from './admin-transaction-header';
import { AdminTransactionCard } from './admin-transaction-card';
import { Button } from '@/app/admin/components/ui/button';

export function TransactionsManagement() {
  const {
    filteredTransactions,
    stats,
    total,
    isLoading,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    handleRefresh
  } = useTransactionsLogic();

  const kpis = [
    { title: "Total Volume", value: total, trend: "+5.1%", icon: IconChartBar, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Gross Revenue", value: `$${stats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, trend: "+12.3%", icon: IconCreditCard, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Success Rate", value: total > 0 ? `${((stats.completedCount / total) * 100).toFixed(1)}%` : '0%', trend: "+0.5%", icon: IconCheck, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Failed Ops", value: stats.failedCount, trend: "-2.1%", icon: IconAlertCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminTransactionHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        handleRefresh={handleRefresh}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-lg rounded-[2rem] overflow-hidden group">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{kpi.title}</CardTitle>
                <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", kpi.bg)}>
                  <kpi.icon className={cn("w-5 h-5", kpi.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-gray-900 dark:text-white tabular-nums tracking-tighter">{kpi.value}</div>
                <div className="flex items-center mt-2 gap-1.5 bg-gray-50 dark:bg-gray-800/50 w-fit px-2 py-1 rounded-lg">
                  <IconArrowUpRight className={cn("w-3 h-3", kpi.trend.startsWith('+') ? "text-emerald-500" : "text-rose-500")} />
                  <span className={cn("text-[10px] font-black", kpi.trend.startsWith('+') ? "text-emerald-500" : "text-rose-500")}>{kpi.trend}</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest ml-1">vs last period</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

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
    </div>
  );
}

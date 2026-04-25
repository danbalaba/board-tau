'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/admin/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/app/admin/components/ui/table';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import { 
  IconCreditCard, 
  IconEye, 
  IconArrowUpRight, 
  IconDownload, 
  IconFilter,
  IconChartBar,
  IconClock,
  IconAlertCircle,
  IconCheck
} from '@tabler/icons-react';
import PageContainer from '@/app/admin/components/layout/page-container';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

import { useTransactions } from '@/app/admin/hooks/use-transactions';

const statusColors: Record<string, any> = {
  PAID: 'default',
  PENDING: 'secondary',
  FAILED: 'destructive',
  UNPAID: 'outline'
};

const statusLabels: Record<string, string> = {
  PAID: 'Completed',
  PENDING: 'Pending',
  FAILED: 'Failed',
  UNPAID: 'Unpaid'
};

export function TransactionsManagement() {
  const { data: apiResponse, isLoading, error } = useTransactions();
  const transactions = apiResponse?.data || [];
  const stats = apiResponse?.meta?.stats || { totalAmount: 0, completedCount: 0, failedCount: 0 };
  const total = apiResponse?.meta?.total || 0;

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading transaction ledger...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;

  const kpis = [
    { title: "Total Volume", value: total, trend: "+5.1%", icon: IconChartBar, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Gross Revenue", value: `$${stats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, trend: "+12.3%", icon: IconCreditCard, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Success Rate", value: `${((stats.completedCount / total) * 100).toFixed(1)}%`, trend: "+0.5%", icon: IconCheck, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Failed Ops", value: stats.failedCount, trend: "-2.1%", icon: IconAlertCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  return (
    <PageContainer>
      <div className="space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Transaction Ledger</h2>
            <p className="text-muted-foreground text-sm mt-1">Real-time monitoring of platform financial flows and payment integrity.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <IconFilter className="w-4 h-4" /> Filter
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <IconDownload className="w-4 h-4" /> Export
            </Button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="border-none bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.title}</CardTitle>
                  <div className={cn("p-2 rounded-lg", kpi.bg)}>
                    <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <div className="flex items-center mt-1 space-x-1">
                    <IconArrowUpRight className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-medium text-emerald-500">{kpi.trend}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">vs last period</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Ledger Card */}
        <Card className="border-none bg-card/30 backdrop-blur-md overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Active Pipeline</CardTitle>
                <CardDescription>Comprehensive log of all platform financial movements.</CardDescription>
              </div>
              <Badge variant="outline" className="bg-background/50 font-mono">
                {total} ENTRIES
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-[200px] h-12 font-semibold">Transaction ID / Date</TableHead>
                    <TableHead className="font-semibold">Identity</TableHead>
                    <TableHead className="font-semibold">Resource</TableHead>
                    <TableHead className="text-right font-semibold">Volume</TableHead>
                    <TableHead className="font-semibold">Clearance</TableHead>
                    <TableHead className="font-semibold">Method</TableHead>
                    <TableHead className="text-right font-semibold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction, index) => (
                    <TableRow 
                      key={transaction.id} 
                      className="hover:bg-muted/20 border-border/40 transition-colors"
                    >
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-mono text-muted-foreground mb-0.5">{transaction.id.slice(0, 8).toUpperCase()}</span>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <IconClock className="w-3 h-3" />
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold">
                            {(transaction.user?.name || 'U')[0]}
                          </div>
                          <span className="text-xs font-medium">{transaction.user?.name || 'Unknown User'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col max-w-[180px]">
                          <span className="text-xs truncate font-medium">{transaction.listing?.title || 'System Asset'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-bold font-mono">
                          ${transaction.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] h-5 px-2 font-bold tracking-tight",
                            transaction.paymentStatus === 'PAID' ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500" :
                            transaction.paymentStatus === 'FAILED' ? "border-rose-500/50 bg-rose-500/10 text-rose-500" :
                            "border-amber-500/50 bg-amber-500/10 text-amber-500"
                          )}
                        >
                          {statusLabels[transaction.paymentStatus] || transaction.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs">
                          <IconCreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="capitalize">{transaction.paymentMethod?.toLowerCase() || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/20"
                          onClick={() => console.log('View transaction', transaction.id)}
                        >
                          <IconEye className="h-4 w-4 text-primary" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

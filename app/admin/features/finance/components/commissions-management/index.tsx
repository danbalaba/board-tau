'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
  IconEye, 
  IconEdit, 
  IconPercentage, 
  IconWallet, 
  IconHourglassLow, 
  IconArrowUpRight,
  IconBuildingCommunity,
  IconFileInvoice,
  IconTrendingUp
} from '@tabler/icons-react';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';

import { useCommissions } from '@/app/admin/hooks/use-commissions';
import { AdminCommissionHeader } from './admin-commission-header';

const statusLabels = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed'
};

export function CommissionsManagement() {
  const { data: apiResponse, isLoading, error } = useCommissions();
  const commissions = apiResponse?.data || [];
  const stats = apiResponse?.meta?.stats || { totalCommissions: 0, paidCommissions: 0, pendingCommissions: 0, currentRate: 15 };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Analysing commission yields...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;

  const kpis = [
    { title: "Standard Rate", value: `${stats.currentRate}%`, trend: "Fixed", icon: IconPercentage, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Total Yield", value: `$${stats.totalCommissions.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, trend: "+8.4%", icon: IconWallet, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Pending Payouts", value: `$${stats.pendingCommissions.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, trend: "+1.2%", icon: IconHourglassLow, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Avg Fee/Unit", value: `$${(stats.totalCommissions / (commissions.length || 1)).toFixed(2)}`, trend: "+2.5%", icon: IconTrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminCommissionHeader />

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
                  <IconArrowUpRight className={cn("w-3 h-3", kpi.trend.startsWith('+') ? "text-emerald-500" : "text-gray-400")} />
                  <span className={cn("text-[10px] font-black", kpi.trend.startsWith('+') ? "text-emerald-500" : "text-gray-400")}>{kpi.trend}</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest ml-1">vs last cycle</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="rounded-[3rem] border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl overflow-hidden shadow-sm p-6">
          <div className="mb-6 px-4">
            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Commission Pipeline</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Detailed breakdown of processed and pending service fees</p>
          </div>
          <div className="overflow-x-auto rounded-[2rem] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                <TableRow className="hover:bg-transparent border-gray-100 dark:border-gray-800">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto">Host / Merchant</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto">Asset Reference</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto text-right">Base Volume</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto text-center">Applied Rate</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto text-right">Yield Amount</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto">Status</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((commission, i) => (
                  <TableRow 
                    key={commission.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 border-gray-100 dark:border-gray-800 transition-colors"
                  >
                    <TableCell className="py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                          <IconBuildingCommunity className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-900 dark:text-white">{commission.host}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{new Date(commission.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs">
                        <IconFileInvoice className="w-4 h-4 text-gray-400" />
                        <span className="max-w-[200px] truncate font-bold text-gray-600 dark:text-gray-300">{commission.listing}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-black text-sm text-gray-900 dark:text-white">
                      ${commission.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-gray-50 dark:bg-gray-800 font-mono font-black text-[10px] border-gray-200 dark:border-gray-700 px-3 py-1">
                        {commission.commissionRate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-black text-emerald-500">
                      ${commission.commissionAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[9px] h-6 px-3 font-black uppercase tracking-widest border-none",
                          commission.status === 'paid' ? "bg-emerald-500/10 text-emerald-500" :
                          commission.status === 'failed' ? "bg-rose-500/10 text-rose-500" :
                          "bg-amber-500/10 text-amber-500"
                        )}
                      >
                        {statusLabels[commission.status as keyof typeof statusLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-purple-500 hover:text-white text-gray-400 transition-all">
                          <IconEye className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-amber-500 hover:text-white text-gray-400 transition-all">
                          <IconEdit className="h-5 w-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

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
  IconDownload, 
  IconCalendarStats, 
  IconShieldCheck, 
  IconScale, 
  IconFileText, 
  IconArrowUpRight,
  IconCalendarEvent,
  IconClock
} from '@tabler/icons-react';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';

import { useTaxCompliance } from '@/app/admin/hooks/use-tax-compliance';
import { AdminTaxHeader } from './admin-tax-header';

const statusLabels = {
  filed: 'Filed',
  pending: 'Pending',
  failed: 'Failed'
};

export function TaxCompliance() {
  const { data: apiResponse, isLoading, error } = useTaxCompliance();
  const taxRecords = apiResponse?.data || [];
  const stats = apiResponse?.meta?.stats || { totalTaxesPaid: 0, pendingTaxes: 0, complianceRate: 0, totalRecords: 0 };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Validating regulatory compliance...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;

  const kpis = [
    { title: "Annual Yield Paid", value: `$${stats.totalTaxesPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, trend: "+4.1%", icon: IconCalendarStats, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Liability Pipeline", value: `$${stats.pendingTaxes.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, trend: "Scheduled", icon: IconScale, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Regulatory Files", value: stats.totalRecords, trend: "+12", icon: IconFileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Compliance Score", value: `${stats.complianceRate.toFixed(1)}%`, trend: "Optimal", icon: IconShieldCheck, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminTaxHeader />

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
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest ml-1">vs target</span>
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
          <div className="mb-6 flex items-center justify-between px-4">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Filing History</h3>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Archive of platform tax submissions and regulatory clearances</p>
            </div>
            <Badge variant="outline" className="bg-white dark:bg-gray-900 font-mono text-[10px] font-black tracking-widest px-3 py-1 border-gray-200 dark:border-gray-700">
              {stats.totalRecords} RECORDS DETECTED
            </Badge>
          </div>
          
          <div className="overflow-x-auto rounded-[2rem] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                <TableRow className="hover:bg-transparent border-gray-100 dark:border-gray-800">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto">Reporting Period</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto">Classification</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto text-right">Liable Amount</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto text-center">Integrity Status</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto px-6">Milestones</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxRecords.map((record, i) => (
                  <TableRow 
                    key={record.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 border-gray-100 dark:border-gray-800 transition-colors"
                  >
                    <TableCell className="py-5 font-black font-mono text-sm text-gray-900 dark:text-white">
                      {record.period}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-8 rounded-full",
                          record.taxType.includes('VAT') ? "bg-blue-500" : "bg-purple-500"
                        )} />
                        <span className="text-sm font-black text-gray-700 dark:text-gray-300">{record.taxType}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-black text-gray-900 dark:text-white">
                      ${record.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[9px] h-6 px-3 font-black uppercase tracking-widest border-none",
                          record.status === 'filed' ? "bg-emerald-500/10 text-emerald-500" :
                          record.status === 'failed' ? "bg-rose-500/10 text-rose-500" :
                          "bg-amber-500/10 text-amber-500"
                        )}
                      >
                        {statusLabels[record.status as keyof typeof statusLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          <IconCalendarEvent className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Filed: <span className="text-gray-900 dark:text-gray-300 font-mono">{record.filingDate ? new Date(record.filingDate).toLocaleDateString() : 'N/A'}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          <IconClock className={cn("w-3.5 h-3.5", record.status === 'pending' ? "text-amber-500 animate-pulse" : "text-gray-400")} />
                          <span>Due: <span className="text-gray-900 dark:text-gray-300 font-mono">{new Date(record.dueDate).toLocaleDateString()}</span></span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-blue-500 hover:text-white text-gray-400 transition-all">
                          <IconEye className="h-5 w-5" />
                        </Button>
                        {record.status === 'filed' && (
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-emerald-500 hover:text-white text-gray-400 transition-all">
                            <IconDownload className="h-5 w-5" />
                          </Button>
                        )}
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

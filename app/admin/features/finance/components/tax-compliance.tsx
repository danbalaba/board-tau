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
  IconEye, 
  IconDownload, 
  IconCalendarStats, 
  IconShieldCheck, 
  IconScale, 
  IconFileText, 
  IconArrowUpRight,
  IconFilter,
  IconCalendarEvent,
  IconClock
} from '@tabler/icons-react';
import PageContainer from '@/app/admin/components/layout/page-container';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

import { useTaxCompliance } from '@/app/admin/hooks/use-tax-compliance';

const statusColors = {
  filed: 'default',
  pending: 'secondary',
  failed: 'destructive'
};

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
    <PageContainer>
      <div className="space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Tax Compliance</h2>
            <p className="text-muted-foreground text-sm mt-1">Regulatory oversight and historical tax filing integrity management.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <IconFilter className="w-4 h-4" /> Period
            </Button>
            <Button className="h-9 gap-2">
              <IconDownload className="w-4 h-4" /> Download All
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
              <Card className="group relative overflow-hidden border-none bg-card/30 backdrop-blur-md shadow-xl transition-all hover:bg-card/40">
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
                    <span className="text-[10px] text-muted-foreground ml-1">vs target</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tax Records Table */}
        <Card className="border-none bg-card/30 backdrop-blur-md shadow-xl overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Filing History</CardTitle>
                <CardDescription>Archive of platform tax submissions and regulatory clearances.</CardDescription>
              </div>
              <Badge variant="outline" className="bg-background/50 font-mono text-[10px]">
                {stats.totalRecords} RECORDS DETECTED
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="font-semibold h-12">Reporting Period</TableHead>
                    <TableHead className="font-semibold">Classification</TableHead>
                    <TableHead className="text-right font-semibold">Liable Amount</TableHead>
                    <TableHead className="text-center font-semibold">Integrity Status</TableHead>
                    <TableHead className="font-semibold px-6">Milestones</TableHead>
                    <TableHead className="text-right font-semibold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxRecords.map((record, i) => (
                    <TableRow 
                      key={record.id} 
                      className="hover:bg-muted/20 border-border/40 transition-colors"
                    >
                      <TableCell className="py-4 font-medium font-mono text-xs">
                        {record.period}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-1.5 h-6 rounded-full",
                            record.taxType.includes('VAT') ? "bg-blue-500" : "bg-purple-500"
                          )} />
                          <span className="text-xs font-semibold">{record.taxType}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-bold">
                        ${record.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] h-5 px-2 font-bold tracking-tight border-none",
                            record.status === 'filed' ? "bg-emerald-500/10 text-emerald-500" :
                            record.status === 'failed' ? "bg-rose-500/10 text-rose-500" :
                            "bg-amber-500/10 text-amber-500"
                          )}
                        >
                          {statusLabels[record.status as keyof typeof statusLabels]}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground leading-none">
                            <IconCalendarEvent className="w-3 h-3 text-emerald-500" />
                            <span>Filed: {record.filingDate ? new Date(record.filingDate).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground leading-none">
                            <IconClock className={cn("w-3 h-3", record.status === 'pending' ? "text-amber-500 animate-pulse" : "text-muted-foreground")} />
                            <span>Due: {new Date(record.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20">
                            <IconEye className="h-4 w-4 text-primary" />
                          </Button>
                          {record.status === 'filed' && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-emerald-500/20">
                              <IconDownload className="h-4 w-4 text-emerald-500" />
                            </Button>
                          )}
                        </div>
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

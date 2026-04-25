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
  IconEdit, 
  IconPercentage, 
  IconWallet, 
  IconHourglassLow, 
  IconArrowUpRight,
  IconDownload,
  IconFilter,
  IconBuildingCommunity,
  IconFileInvoice,
  IconTrendingUp
} from '@tabler/icons-react';
import PageContainer from '@/app/admin/components/layout/page-container';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

import { useCommissions } from '@/app/admin/hooks/use-commissions';

const statusColors = {
  pending: 'secondary',
  paid: 'default',
  failed: 'destructive'
};

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
    <PageContainer>
      <div className="space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Yield Configuration</h2>
            <p className="text-muted-foreground text-sm mt-1">Manage platform fee structures and track cross-listing commission yields.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <IconFilter className="w-4 h-4" /> Filter
            </Button>
            <Button className="h-9 gap-2">
              <IconEdit className="w-4 h-4" /> Adjust Rates
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
                    <span className="text-[10px] text-muted-foreground ml-1">vs last cycle</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Commission Table */}
        <Card className="border-none bg-card/30 backdrop-blur-md shadow-xl overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Commission Pipeline</CardTitle>
                <CardDescription>Detailed breakdown of processed and pending service fees.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <IconDownload className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="font-semibold h-12">Host / Merchant</TableHead>
                    <TableHead className="font-semibold">Asset Reference</TableHead>
                    <TableHead className="text-right font-semibold">Base Volume</TableHead>
                    <TableHead className="text-center font-semibold">Applied Rate</TableHead>
                    <TableHead className="text-right font-semibold">Yield Amount</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission, i) => (
                    <TableRow 
                      key={commission.id} 
                      className="hover:bg-muted/20 border-border/40 transition-colors"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <IconBuildingCommunity className="w-3.5 h-3.5 text-blue-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold">{commission.host}</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(commission.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs">
                          <IconFileInvoice className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="max-w-[150px] truncate">{commission.listing}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        ${commission.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-background/40 font-mono text-[10px]">
                          {commission.commissionRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-bold text-emerald-500">
                        ${commission.commissionAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-[10px] h-5 px-2 font-bold tracking-tight border-none",
                            commission.status === 'paid' ? "bg-emerald-500/10 text-emerald-500" :
                            commission.status === 'failed' ? "bg-rose-500/10 text-rose-500" :
                            "bg-amber-500/10 text-amber-500"
                          )}
                        >
                          {statusLabels[commission.status as keyof typeof statusLabels]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20">
                            <IconEye className="h-4 w-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-amber-500/20">
                            <IconEdit className="h-4 w-4 text-amber-500" />
                          </Button>
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

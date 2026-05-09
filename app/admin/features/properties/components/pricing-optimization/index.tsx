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
  IconEdit, 
  IconTrendingUp, 
  IconUsers, 
  IconTarget, 
  IconArrowUpRight,
  IconDotsVertical,
  IconAdjustmentsHorizontal,
  IconBulb,
  IconPremiumRights
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

import { usePropertyPerformance } from '@/app/admin/hooks/use-property-performance';
import { AdminPricingHeader } from './admin-pricing-header';

const demandLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
};

export function PricingOptimization() {
  const { data: apiResponse, isLoading, error } = usePropertyPerformance('30d');
  const data = apiResponse?.data;
  const propertiesPricing = data?.pricingRecommendations || [];

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading pricing data...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;

  const avgPrice = propertiesPricing.length > 0 
    ? propertiesPricing.reduce((sum: number, p: any) => sum + p.currentPrice, 0) / propertiesPricing.length 
    : 0;
  
  const avgOccupancy = propertiesPricing.length > 0
    ? propertiesPricing.reduce((sum: number, p: any) => sum + p.occupancyRate, 0) / propertiesPricing.length
    : 0;

  const toAdjustCount = propertiesPricing.filter((p: any) => p.currentPrice !== p.suggestedPrice).length;

  const summaryKpis = [
    { label: 'Market Average Rate', value: `$${avgPrice.toFixed(0)}`, icon: IconPremiumRights, color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'Baseline occupancy' },
    { label: 'Aggregated Engagement', value: `${Math.round(avgOccupancy)}%`, icon: IconUsers, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Network span' },
    { label: 'Optimization Buffer', value: toAdjustCount, icon: IconAdjustmentsHorizontal, color: 'text-violet-500', bg: 'bg-violet-500/10', desc: 'Awaiting calibration' },
    { label: 'Potential Yield', value: '+12.5%', icon: IconTrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Projected uplift' },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminPricingHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryKpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-lg rounded-[2rem] overflow-hidden group">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{kpi.label}</CardTitle>
                <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", kpi.bg)}>
                  <kpi.icon className={cn("w-5 h-5", kpi.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-gray-900 dark:text-white tabular-nums tracking-tighter">{kpi.value}</div>
                <div className="flex items-center mt-2 gap-1.5 bg-gray-50 dark:bg-gray-800/50 w-fit px-2 py-1 rounded-lg">
                  <IconArrowUpRight className={cn("w-3 h-3 text-emerald-500")} />
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{kpi.desc}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
         initial={{ opacity: 0, y: 30 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.4 }}
      >
        <div className="rounded-[3rem] border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl overflow-hidden shadow-sm p-6">
          <div className="mb-6 flex items-center justify-between px-4">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Yield Recommendations</h3>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Optimal pricing vectors for active assets</p>
            </div>
            <div className="w-10 h-10 bg-amber-500/10 rounded-2xl flex items-center justify-center">
              <IconTarget className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          
          <div className="overflow-x-auto rounded-[2rem] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                <TableRow className="hover:bg-transparent border-gray-100 dark:border-gray-800">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto">Asset</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto">Live Rate</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto">Suggested</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto">Delta</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto text-center">Engagement</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto">Demand</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto">Benchmark</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {propertiesPricing.map((pricing: any) => (
                  <TableRow key={pricing.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 border-gray-100 dark:border-gray-800 transition-colors">
                    <TableCell className="py-5">
                      <div className="font-black text-sm text-gray-900 dark:text-white tracking-tight">{pricing.property}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-black tabular-nums text-sm text-gray-500">${pricing.currentPrice.toFixed(0)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-black tabular-nums text-sm text-emerald-500">${pricing.suggestedPrice.toFixed(0)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "text-[9px] h-6 px-3 font-black uppercase tracking-widest border-none",
                        pricing.suggestedPrice > pricing.currentPrice ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      )}>
                        {pricing.suggestedPrice > pricing.currentPrice ? '+' : ''}
                        {((pricing.suggestedPrice - pricing.currentPrice) / pricing.currentPrice * 100).toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="text-[11px] font-black tabular-nums text-gray-900 dark:text-white">{pricing.occupancyRate}%</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "text-[9px] h-6 px-3 font-black uppercase tracking-widest border-none",
                        pricing.demandLevel === 'high' ? "bg-amber-500/10 text-amber-500" : 
                        pricing.demandLevel === 'medium' ? "bg-blue-500/10 text-blue-500" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                      )}>
                        {(demandLabels as any)[pricing.demandLevel] || pricing.demandLevel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 font-bold text-[11px] tabular-nums">
                       ${pricing.competitorPrice.toFixed(0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-amber-500/10 hover:text-amber-500 text-gray-500">
                          <IconEdit className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500">
                          <IconDotsVertical className="h-5 w-5" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {[
          { title: 'Velocity Assets', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/20', desc: 'Optimize for max yield with +5-10% calibration.' },
          { title: 'Stagnant Stock', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/5', border: 'border-rose-500/20', desc: 'Initiate -10% corrections to stimulate bookings.' },
          { title: 'Marker Index', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', desc: 'Maintain competitive alignment within ±2%.' },
          { title: 'Dynamic Shift', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/5', border: 'border-blue-500/20', desc: 'Real-time seasonal adjustment index active.' },
        ].map((tip, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className={cn("group relative p-6 rounded-[2rem] border backdrop-blur-xl shadow-sm overflow-hidden", tip.bg, tip.border)}
          >
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className={cn("text-[10px] font-black uppercase tracking-widest", tip.color)}>{tip.title}</h3>
                <IconBulb className={cn("w-5 h-5", tip.color)} />
              </div>
              <p className={cn("text-[11px] font-bold uppercase leading-relaxed tracking-widest", tip.color, "opacity-70")}>
                {tip.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

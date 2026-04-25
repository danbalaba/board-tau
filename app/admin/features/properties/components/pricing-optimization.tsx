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
  IconTrendingUp, 
  IconUsers, 
  IconTarget, 
  IconArrowUpRight,
  IconDotsVertical,
  IconAdjustmentsHorizontal,
  IconChartBar,
  IconBulb,
  IconPremiumRights
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import PageContainer from '@/app/admin/components/layout/page-container';

import { usePropertyPerformance } from '@/app/admin/hooks/use-property-performance';

const demandColors = {
  low: 'destructive',
  medium: 'secondary',
  high: 'default'
};

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
    { label: 'Market Average Rate', value: `$${avgPrice.toFixed(0)}`, icon: IconPremiumRights, color: 'text-primary', bg: 'bg-primary/10', desc: 'Baseline occupancy' },
    { label: 'Aggregated Engagement', value: `${Math.round(avgOccupancy)}%`, icon: IconUsers, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Network span' },
    { label: 'Optimization Buffer', value: toAdjustCount, icon: IconAdjustmentsHorizontal, color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'Awaiting calibration' },
    { label: 'Potential Yield', value: '+12.5%', icon: IconTrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Projected uplift' },
  ];

  return (
    <PageContainer>
      <div className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-3xl font-bold tracking-tight">Market Intelligence</h2>
            <p className="text-muted-foreground text-sm mt-1">Optimize global pricing strategy based on real-time market trends and occupancy telemetry.</p>
          </motion.div>
          <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm bg-card/50 backdrop-blur-sm border-border/40">
            <IconChartBar className="h-4 w-4" /> Export Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryKpis.map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="group relative overflow-hidden border-none bg-card/50 backdrop-blur-sm shadow-md hover:shadow-xl transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-muted-foreground">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest">{kpi.label}</CardTitle>
                  <div className={cn("p-2 rounded-lg", kpi.bg)}>
                    <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black tabular-nums tracking-tighter">{kpi.value}</div>
                  <div className="flex items-center mt-1 space-x-1">
                    <IconArrowUpRight className={cn("w-3 h-3 text-emerald-500")} />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">{kpi.desc}</span>
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
          <Card className="border-border/40 bg-card/30 backdrop-blur-md shadow-xl overflow-hidden">
            <CardHeader className="border-b border-border/20 bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-black uppercase tracking-tight">Yield Recommendations</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 mt-0.5">Optimal pricing vectors for active assets</CardDescription>
                </div>
                <IconTarget className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-border/20">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Asset</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Live Rate</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Suggested</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Delta</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10 text-center">Engagement</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Demand</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Benchmark</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {propertiesPricing.map((pricing: any) => (
                    <TableRow key={pricing.id} className="group hover:bg-muted/20 border-border/10 transition-colors">
                      <TableCell className="py-4">
                        <div className="font-bold text-sm tracking-tight">{pricing.property}</div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="font-black tabular-nums text-sm">${pricing.currentPrice.toFixed(0)}</div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="font-black tabular-nums text-sm text-emerald-500">${pricing.suggestedPrice.toFixed(0)}</div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className={cn(
                          "text-[9px] h-5 px-1.5 font-black uppercase border-none",
                          pricing.suggestedPrice > pricing.currentPrice ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                        )}>
                          {pricing.suggestedPrice > pricing.currentPrice ? '+' : ''}
                          {((pricing.suggestedPrice - pricing.currentPrice) / pricing.currentPrice * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                         <div className="text-[10px] font-black tabular-nums">{pricing.occupancyRate}%</div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className={cn(
                          "text-[9px] h-5 px-1.5 font-black uppercase border-none",
                          pricing.demandLevel === 'high' ? "bg-primary/10 text-primary" : 
                          pricing.demandLevel === 'medium' ? "bg-blue-500/10 text-blue-500" : "bg-muted text-muted-foreground"
                        )}>
                          {(demandLabels as any)[pricing.demandLevel] || pricing.demandLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-muted-foreground font-medium text-[11px]">
                         ${pricing.competitorPrice.toFixed(0)}
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                            <IconEdit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <IconDotsVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {[
            { title: 'Velocity Assets', color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/20', desc: 'Optimize for max yield with +5-10% calibration.' },
            { title: 'Stagnant Stock', color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/20', desc: 'Initiate -10% corrections to stimulate bookings.' },
            { title: 'Marker Index', color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', desc: 'Maintain competitive alignment within ±2%.' },
            { title: 'Dynamic Shift', color: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-500/20', desc: 'Real-time seasonal adjustment index active.' },
          ].map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className={cn("group relative p-5 rounded-2xl border backdrop-blur-sm shadow-lg overflow-hidden", tip.bg, tip.border)}
            >
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={cn("text-[10px] font-black uppercase tracking-widest", tip.color)}>{tip.title}</h3>
                  <IconBulb className={cn("w-4 h-4", tip.color)} />
                </div>
                <p className={cn("text-[11px] font-bold uppercase leading-relaxed", tip.color, "opacity-70")}>
                  {tip.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

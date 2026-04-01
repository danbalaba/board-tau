// app/admin/features/moderation/components/host-applications/application-kpi-cards.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { ClipboardCheck, Hourglass, ShieldCheck, ShieldAlert, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface ApplicationKPICardsProps {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export function ApplicationKPICards({ total, pending, approved, rejected }: ApplicationKPICardsProps) {
  // Generate random trend data for sparklines
  const generateTrend = (val: number) => [
    { v: val * 0.8 }, { v: val * 0.85 }, { v: val * 0.82 }, 
    { v: val * 0.9 }, { v: val * 0.88 }, { v: val * 0.95 }, { v: val }
  ];

  const stats = [
    {
      title: 'Total Applications',
      value: total.toLocaleString(),
      description: 'System lifetime',
      icon: ClipboardCheck,
      trend: '+12%',
      trendDir: 'up',
      color: 'text-primary',
      chartColor: '#8b5cf6', // Purple
      trendData: generateTrend(total)
    },
    {
      title: 'Pending Review',
      value: pending.toLocaleString(),
      description: 'Awaiting decision',
      icon: Hourglass,
      trend: '-5%',
      trendDir: 'down',
      color: 'text-amber-500',
      chartColor: '#f59e0b', // Amber
      trendData: generateTrend(pending)
    },
    {
      title: 'Approved Hosts',
      value: approved.toLocaleString(),
      description: 'Live in platform',
      icon: ShieldCheck,
      trend: '+8%',
      trendDir: 'up',
      color: 'text-emerald-500',
      chartColor: '#10b981', // Emerald
      trendData: generateTrend(approved)
    },
    {
      title: 'Rejected Apps',
      value: rejected.toLocaleString(),
      description: 'Failed verification',
      icon: ShieldAlert,
      trend: '+2%',
      trendDir: 'up',
      color: 'text-rose-500',
      chartColor: '#f43f5e', // Rose
      trendData: generateTrend(rejected)
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 transition-all group duration-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-xl bg-muted/50 group-hover:bg-muted transition-colors", stat.color)}>
                <stat.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="pb-0">
              <div className="flex flex-col">
                <div className="text-3xl font-black tracking-tighter">{stat.value}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className={cn(
                    "flex items-center px-1.5 py-0.5 rounded-lg text-[10px] font-black",
                    stat.trendDir === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                  )}>
                    {stat.trendDir === 'up' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                    {stat.trend}
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">{stat.description}</span>
                </div>
              </div>
              
              <div className="h-16 w-full mt-6 -mx-6 opacity-30 group-hover:opacity-60 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stat.trendData}>
                    <defs>
                      <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={stat.chartColor} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={stat.chartColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={stat.chartColor}
                      strokeWidth={2}
                      fill={`url(#gradient-${index})`}
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// app/admin/features/moderation/components/moderation-queue/governance-kpi-cards.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { Clock, CheckSquare, Zap, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface GovernanceKPICardsProps {
  totalBacklog: number;
  resolutionRate: string;
  activeModerators: number;
}

export function GovernanceKPICards({ totalBacklog, resolutionRate, activeModerators }: GovernanceKPICardsProps) {
  const generateTrend = (val: number) => [
    { v: val * 0.9 }, { v: val * 1.0 }, { v: val * 0.95 }, 
    { v: val * 1.1 }, { v: val * 1.05 }, { v: val * 1.15 }, { v: val }
  ];

  const stats = [
    {
      title: 'Queue Backlog',
      value: totalBacklog.toLocaleString(),
      description: 'Awaiting review',
      icon: Clock,
      trend: '+4',
      trendDir: 'up',
      color: 'text-indigo-500',
      chartColor: '#6366f1',
      trendData: generateTrend(totalBacklog)
    },
    {
      title: 'Resolution Rate',
      value: resolutionRate,
      description: 'System efficiency',
      icon: Target,
      trend: '+2.1%',
      trendDir: 'up',
      color: 'text-emerald-500',
      chartColor: '#10b981',
      trendData: generateTrend(94)
    },
    {
      title: 'System Throughput',
      value: '1.2s',
      description: 'Avg response time',
      icon: Zap,
      trend: '-150ms',
      trendDir: 'down',
      color: 'text-amber-500',
      chartColor: '#f59e0b',
      trendData: generateTrend(120)
    },
    {
      title: 'Active Oversight',
      value: activeModerators.toLocaleString(),
      description: 'Moderators online',
      icon: CheckSquare,
      trend: 'Normal',
      trendDir: 'up',
      color: 'text-primary',
      chartColor: '#8b5cf6',
      trendData: generateTrend(activeModerators)
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
          <Card className="overflow-hidden border-border/50 bg-card/60 backdrop-blur-xl hover:border-indigo-500/20 transition-all group group duration-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-xl bg-muted/30 group-hover:bg-muted group-hover:scale-110 transition-all", stat.color)}>
                <stat.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="pb-0">
              <div className="flex flex-col">
                <div className="text-3xl font-black tracking-tighter">{stat.value}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={cn(
                    "text-[10px] font-black px-1.5 py-0.5 rounded-lg",
                    stat.trendDir === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                  )}>
                    {stat.trend}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{stat.description}</span>
                </div>
              </div>
              
              <div className="h-16 w-full mt-6 -mx-6 opacity-30 group-hover:opacity-60 transition-all duration-700">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stat.trendData}>
                    <defs>
                      <linearGradient id={`ggradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={stat.chartColor} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={stat.chartColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={stat.chartColor}
                      strokeWidth={2}
                      fill={`url(#ggradient-${index})`}
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

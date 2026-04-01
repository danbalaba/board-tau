// app/admin/features/moderation/components/listings-review/listing-kpi-cards.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { Home, AlertTriangle, CheckSquare, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface ListingKPICardsProps {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export function ListingKPICards({ total, pending, approved, rejected }: ListingKPICardsProps) {
  const generateTrend = (val: number) => [
    { v: val * 0.7 }, { v: val * 0.9 }, { v: val * 0.8 }, 
    { v: val * 1.1 }, { v: val * 0.95 }, { v: val * 1.05 }, { v: val }
  ];

  const stats = [
    {
      title: 'Active Listings',
      value: approved.toLocaleString(),
      description: 'Market supply',
      icon: Home,
      trend: '+15%',
      trendDir: 'up',
      color: 'text-emerald-500',
      chartColor: '#10b981',
      trendData: generateTrend(approved)
    },
    {
      title: 'Pending Approval',
      value: pending.toLocaleString(),
      description: 'Require review',
      icon: Clock,
      trend: '+24%',
      trendDir: 'up',
      color: 'text-amber-500',
      chartColor: '#f59e0b',
      trendData: generateTrend(pending)
    },
    {
      title: 'Flagged Content',
      value: (total - approved - pending - rejected).toLocaleString(), // Mock flagged
      description: 'User reported',
      icon: AlertTriangle,
      trend: '-12%',
      trendDir: 'down',
      color: 'text-rose-500',
      chartColor: '#f43f5e',
      trendData: generateTrend(5)
    },
    {
      title: 'Processed Today',
      value: (approved + rejected).toLocaleString(),
      description: 'Review efficiency',
      icon: CheckSquare,
      trend: '+45%',
      trendDir: 'up',
      color: 'text-primary',
      chartColor: '#8b5cf6',
      trendData: generateTrend(approved + rejected)
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="overflow-hidden border-border/40 bg-card/40 backdrop-blur-md hover:border-primary/20 transition-all group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-xl bg-muted/30 group-hover:scale-110 transition-transform", stat.color)}>
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
              
              <div className="h-14 w-full mt-4 -mx-6 opacity-20 group-hover:opacity-40 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stat.trendData}>
                    <defs>
                      <linearGradient id={`lgradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={stat.chartColor} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={stat.chartColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="step"
                      dataKey="v"
                      stroke={stat.chartColor}
                      strokeWidth={2}
                      fill={`url(#lgradient-${index})`}
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

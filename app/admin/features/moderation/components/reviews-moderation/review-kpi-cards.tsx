// app/admin/features/moderation/components/reviews-moderation/review-kpi-cards.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { MessageSquare, Star, ShieldCheck, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface ReviewKPICardsProps {
  total: number;
  pending: number;
  averageRating: string;
}

export function ReviewKPICards({ total, pending, averageRating }: ReviewKPICardsProps) {
  const generateTrend = (val: number) => [
    { v: val * 0.8 }, { v: val * 1.1 }, { v: val * 0.9 }, 
    { v: val * 1.2 }, { v: val * 0.85 }, { v: val * 0.95 }, { v: val }
  ];

  const stats = [
    {
      title: 'Total Feedback',
      value: total.toLocaleString(),
      description: 'Platform lifetime',
      icon: MessageSquare,
      trend: '+18%',
      trendDir: 'up',
      color: 'text-primary',
      chartColor: '#8b5cf6',
      trendData: generateTrend(total)
    },
    {
      title: 'Pending Neutrality',
      value: pending.toLocaleString(),
      description: 'Awaiting review',
      icon: Activity,
      trend: '+5%',
      trendDir: 'up',
      color: 'text-amber-500',
      chartColor: '#f59e0b',
      trendData: generateTrend(pending)
    },
    {
      title: 'Platform Reputation',
      value: averageRating,
      description: 'System-wide avg',
      icon: Star,
      trend: '+0.2',
      trendDir: 'up',
      color: 'text-amber-400',
      chartColor: '#fbbf24',
      trendData: generateTrend(parseFloat(averageRating) * 10)
    },
    {
      title: 'Approved Trust',
      value: (total - pending).toLocaleString(),
      description: 'Verified reviews',
      icon: ShieldCheck,
      trend: '+12%',
      trendDir: 'up',
      color: 'text-emerald-500',
      chartColor: '#10b981',
      trendData: generateTrend(total - pending)
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
        >
          <Card className="overflow-hidden border-border/50 bg-card/40 backdrop-blur-md hover:shadow-2xl transition-all group duration-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-xl bg-muted/40", stat.color)}>
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
              
              <div className="h-16 w-full mt-6 -mx-6 opacity-20 group-hover:opacity-50 transition-all duration-700">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stat.trendData}>
                    <defs>
                      <linearGradient id={`rgradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={stat.chartColor} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={stat.chartColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={stat.chartColor}
                      strokeWidth={2}
                      fill={`url(#rgradient-${index})`}
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

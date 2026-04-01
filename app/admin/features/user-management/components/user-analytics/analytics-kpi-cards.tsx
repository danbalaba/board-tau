// app/admin/features/user-management/components/user-analytics/analytics-kpi-cards.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { Users, TrendingUp, Activity, UserCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { UserAnalytics } from '@/app/admin/hooks/use-user-analytics';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface AnalyticsKPICardsProps {
  data: UserAnalytics;
}

export function AnalyticsKPICards({ data }: AnalyticsKPICardsProps) {
  // Calculate verified hosts from the verificationStatus array
  const verifiedHostsCount = data.verificationStatus?.find((v: any) => v.isVerifiedLandlord)?.count || 0;

  // Generate random trend data for sparklines based on real values
  const generateTrend = (val: number) => [
    { v: val * 0.8 }, { v: val * 0.85 }, { v: val * 0.82 }, 
    { v: val * 0.9 }, { v: val * 0.88 }, { v: val * 0.95 }, { v: val }
  ];

  const stats = [
    {
      title: 'Total Users',
      value: data.totalUsers.toLocaleString(),
      description: '+12.5% from last month',
      icon: Users,
      trend: '+12.5%',
      trendDir: 'up',
      color: 'text-primary',
      chartColor: '#2f7d6d',
      trendData: generateTrend(data.totalUsers)
    },
    {
      title: 'Active Users',
      value: data.activeUsers.toLocaleString(),
      description: '+5.2% from last week',
      icon: Activity,
      trend: '+5.2%',
      trendDir: 'up',
      color: 'text-emerald-500',
      chartColor: '#10b981',
      trendData: generateTrend(data.activeUsers)
    },
    {
      title: 'Verified Hosts',
      value: verifiedHostsCount.toLocaleString(),
      description: '+2 new today',
      icon: UserCheck,
      trend: '+0.8%',
      trendDir: 'up',
      color: 'text-blue-500',
      chartColor: '#3b82f6',
      trendData: generateTrend(verifiedHostsCount)
    },
    {
      title: 'New Users Today',
      value: data.newUsers.toLocaleString(),
      description: '-2.1% from yesterday',
      icon: TrendingUp,
      trend: '-2.1%',
      trendDir: 'down',
      color: 'text-amber-500',
      chartColor: '#f59e0b',
      trendData: generateTrend(data.newUsers)
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="overflow-hidden border-border/50 hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={cn("w-4 h-4", stat.color)} />
            </CardHeader>
            <CardContent className="pb-0">
              <div className="flex flex-col">
                <div className="text-2xl font-black tracking-tighter">{stat.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  {stat.trendDir === 'up' ? (
                    <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 text-rose-500" />
                  )}
                  <p className={cn(
                    "text-[10px] font-bold tracking-tight",
                    stat.trendDir === 'up' ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {stat.trend} <span className="text-muted-foreground/60 font-medium">vs Last Week</span>
                  </p>
                </div>
              </div>
              
              <div className="h-12 w-full mt-4 -mx-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stat.trendData}>
                    <defs>
                      <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={stat.chartColor} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={stat.chartColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke={stat.chartColor}
                      strokeWidth={1.5}
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

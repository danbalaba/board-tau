// app/admin/features/user-management/components/user-analytics/analytics-kpi-cards.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { 
  IconUsers, 
  IconTrendingUp, 
  IconActivity, 
  IconUserCheck, 
  IconArrowUpRight, 
  IconArrowDownRight 
} from '@tabler/icons-react';
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
      title: 'Total Identities',
      value: data.totalUsers.toLocaleString(),
      description: '+12.5% from last month',
      icon: IconUsers,
      trend: '+12.5%',
      trendDir: 'up',
      color: 'text-primary',
      bg: 'bg-primary/10',
      chartColor: 'var(--primary)',
      trendData: generateTrend(data.totalUsers)
    },
    {
      title: 'Active Sessions',
      value: data.activeUsers.toLocaleString(),
      description: '+5.2% from last week',
      icon: IconActivity,
      trend: '+5.2%',
      trendDir: 'up',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      chartColor: '#10b981',
      trendData: generateTrend(data.activeUsers)
    },
    {
      title: 'Verified Governance',
      value: verifiedHostsCount.toLocaleString(),
      description: '+2 new today',
      icon: IconUserCheck,
      trend: '+0.8%',
      trendDir: 'up',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      chartColor: '#3b82f6',
      trendData: generateTrend(verifiedHostsCount)
    },
    {
      title: 'Registration Velocity',
      value: data.newUsers.toLocaleString(),
      description: '-2.1% from yesterday',
      icon: IconTrendingUp,
      trend: '-2.1%',
      trendDir: 'down',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
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
          <Card className="group relative overflow-hidden border-none bg-card/30 backdrop-blur-md shadow-xl transition-all hover:bg-card/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent className="pb-0">
              <div className="flex flex-col">
                <div className="text-3xl font-black tabular-nums tracking-tighter">{stat.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  {stat.trendDir === 'up' ? (
                    <IconArrowUpRight className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <IconArrowDownRight className="w-3 h-3 text-rose-500" />
                  )}
                  <p className={cn(
                    "text-[10px] font-bold tracking-tight",
                    stat.trendDir === 'up' ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {stat.trend} <span className="text-muted-foreground/60 font-medium ml-1">vs Last Week</span>
                  </p>
                </div>
              </div>
              
              <div className="h-14 w-full mt-4 -mx-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stat.trendData}>
                    <defs>
                      <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={stat.chartColor} stopOpacity={0.3} />
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

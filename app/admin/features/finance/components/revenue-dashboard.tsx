'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Badge } from '@/app/admin/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from '@/app/admin/components/ui/chart';
import {
  IconTrendingUp,
  IconCurrencyDollar,
  IconCreditCard,
  IconReceipt2,
  IconWallet,
  IconArrowUpRight,
  IconFileExport,
  IconCalendarEvent,
  IconActivity,
  IconChevronRight
} from '@tabler/icons-react';
import PageContainer from '@/app/admin/components/layout/page-container';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

const revenueData = [
  { month: 'Jan', revenue: 45000, profit: 32000, expenses: 13000 },
  { month: 'Feb', revenue: 52000, profit: 38000, expenses: 14000 },
  { month: 'Mar', revenue: 48000, profit: 34000, expenses: 14000 },
  { month: 'Apr', revenue: 61000, profit: 45000, expenses: 16000 },
  { month: 'May', revenue: 55000, profit: 40000, expenses: 15000 },
  { month: 'Jun', revenue: 67000, profit: 51000, expenses: 16000 },
  { month: 'Jul', revenue: 82000, profit: 64000, expenses: 18000 }
];

const chartConfig = {
  revenue: {
    label: 'Gross Revenue',
    color: 'var(--primary)'
  },
  profit: {
    label: 'Net Profit',
    color: '#10b981'
  }
} satisfies ChartConfig;

const RecentTransactions = [
  { id: 'TX-9012', user: 'Emma Wilson', amount: 1450.0, status: 'Completed', date: '2 mins ago', method: 'Visa •• 4242' },
  { id: 'TX-9011', user: 'James Chen', amount: 840.5, status: 'Pending', date: '15 mins ago', method: 'Stripe / Apple Pay' },
  { id: 'TX-9010', user: 'Sarah Miller', amount: 2100.0, status: 'Completed', date: '1h ago', method: 'Bank Transfer' },
  { id: 'TX-9009', user: 'Liam Taylor', amount: 125.0, status: 'Refunded', date: '3h ago', method: 'MasterCard •• 8812' }
];

export function RevenueDashboard() {
  return (
    <PageContainer>
      <div className="space-y-8 pb-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-3xl font-bold tracking-tight">Financial Control</h2>
            <p className="text-muted-foreground text-sm mt-1">Global revenue distribution, transaction analytics and profit margins.</p>
          </motion.div>
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <IconCalendarEvent className="h-4 w-4" /> Quarter View
            </Button>
            <Button className="h-9 gap-2">
              <IconFileExport className="h-4 w-4" /> Financial Export
            </Button>
          </motion.div>
        </div>

        {/* Core Financial KPI Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Gross Revenue', value: '$284,930', growth: '+14.2%', icon: IconCurrencyDollar, color: 'text-primary', bg: 'bg-primary/10' },
            { title: 'Net Profit', value: '$192,420', growth: '+11.8%', icon: IconWallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { title: 'Total Expenses', value: '$92,510', growth: '+4.5%', icon: IconReceipt2, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { title: 'Active Payouts', value: '$45,200', growth: '-2.1%', icon: IconCreditCard, color: 'text-sky-500', bg: 'bg-sky-500/10' }
          ].map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="group relative overflow-hidden border-none bg-card/30 backdrop-blur-md shadow-xl transition-all hover:bg-card/40">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{kpi.title}</CardTitle>
                  <div className={cn("p-2 rounded-lg", kpi.bg)}>
                    <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black tabular-nums">{kpi.value}</div>
                  <div className="mt-2 flex items-center gap-1 text-xs font-bold">
                    <IconArrowUpRight className={cn("h-3 w-3", kpi.growth.startsWith('+') ? 'text-emerald-500' : 'text-rose-500')} />
                    <span className={kpi.growth.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}>
                      {kpi.growth}
                    </span>
                    <span className="text-muted-foreground font-medium ml-1">vs prev query</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Primary Analytics Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-none bg-card/30 backdrop-blur-md shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Revenue Performance Index</CardTitle>
                  <CardDescription>Real-time projection across key fiscal milestones.</CardDescription>
                </div>
                <div className="flex items-center gap-3 px-3 py-1.5 bg-muted/40 rounded-xl text-[10px] font-bold uppercase tracking-tighter border border-border/40">
                  <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" /> Volume</span>
                  <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-emerald-500" /> Margin</span>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px] w-full pt-6">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/40" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" />
                    <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-muted-foreground" tickFormatter={(v) => `$${v/1000}k`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                    <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={3} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Transaction Feed */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-none bg-card/30 backdrop-blur-md shadow-xl overflow-hidden h-full">
              <CardHeader className="border-b border-border/40 bg-muted/20 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-md font-bold uppercase tracking-tight">Hot Ledger</CardTitle>
                  <IconActivity className="h-4 w-4 text-primary animate-pulse" />
                </div>
                <CardDescription className="text-xs uppercase font-semibold text-muted-foreground tracking-tighter">Real-time Authorization Feed</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                  {RecentTransactions.map((tx, idx) => (
                    <motion.div 
                      key={tx.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + (idx * 0.1) }}
                      className="group flex items-center gap-4 p-4 transition-colors hover:bg-primary/5"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 border border-border/40 text-primary group-hover:scale-110 transition-transform">
                        <IconArrowUpRight className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{tx.user}</p>
                          <p className="text-sm font-black text-right tabular-nums">${tx.amount.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">{tx.method}</p>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[9px] h-4 px-1.5 font-black uppercase border-none",
                              tx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                              tx.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                            )}
                          >
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-4 border-t border-border/30">
                  <Button variant="ghost" className="w-full h-10 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-primary/10 hover:text-primary group">
                    Full Analytics Log
                    <IconChevronRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Secondary Insights Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-none bg-card/30 backdrop-blur-md shadow-md">
              <CardHeader>
                <CardTitle className="text-md">Payout Distribution</CardTitle>
                <CardDescription>Allocation of funds between hosts and platform</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full pt-4">
                  <BarChart data={revenueData.slice(-4)}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/40" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-[10px] font-bold" />
                    <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="revenue" fill="var(--chart-1)" radius={[4, 4, 0, 0]} barSize={40} name="Total Volume" />
                    <Bar dataKey="profit" fill="var(--chart-2)" radius={[4, 4, 0, 0]} barSize={40} name="Platform Fee" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="border-none bg-card/30 backdrop-blur-md shadow-md">
                <CardHeader>
                  <CardTitle className="text-md">Tax & Compliance Score</CardTitle>
                  <CardDescription>System assessment of financial regulation adherence</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <div className="relative flex h-32 w-32 items-center justify-center">
                    <svg className="h-full w-full -rotate-90 transform">
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/20" />
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364.4" strokeDashoffset="36.4" className="text-emerald-500 transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-black">92%</span>
                      <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">Compliant</span>
                    </div>
                  </div>
                  <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                    <div className="group rounded-xl border border-border/40 bg-muted/20 p-3 text-center transition-colors hover:bg-emerald-500/5">
                      <p className="text-[10px] font-black uppercase text-muted-foreground group-hover:text-emerald-500 transition-colors">KyC Status</p>
                      <p className="text-sm font-bold text-emerald-500 uppercase mt-1">Verified</p>
                    </div>
                    <div className="group rounded-xl border border-border/40 bg-muted/20 p-3 text-center transition-colors hover:bg-primary/5">
                      <p className="text-[10px] font-black uppercase text-muted-foreground group-hover:text-primary transition-colors">Tax Filings</p>
                      <p className="text-sm font-bold text-primary uppercase mt-1">Scheduled</p>
                    </div>
                  </div>
                </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageContainer>
  );
}

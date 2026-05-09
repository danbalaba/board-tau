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
  IconCurrencyDollar,
  IconCreditCard,
  IconReceipt2,
  IconWallet,
  IconArrowUpRight,
  IconActivity,
  IconChevronRight
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { AdminRevenueHeader } from './admin-revenue-header';

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
  const kpis = [
    { title: 'Gross Revenue', value: '$284,930', growth: '+14.2%', icon: IconCurrencyDollar, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Net Profit', value: '$192,420', growth: '+11.8%', icon: IconWallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Total Expenses', value: '$92,510', growth: '+4.5%', icon: IconReceipt2, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'Active Payouts', value: '$45,200', growth: '-2.1%', icon: IconCreditCard, color: 'text-purple-500', bg: 'bg-purple-500/10' }
  ];

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminRevenueHeader />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-lg rounded-[2rem] overflow-hidden group">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{kpi.title}</CardTitle>
                <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", kpi.bg)}>
                  <kpi.icon className={cn("w-5 h-5", kpi.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-gray-900 dark:text-white tabular-nums tracking-tighter">{kpi.value}</div>
                <div className="flex items-center mt-2 gap-1.5 bg-gray-50 dark:bg-gray-800/50 w-fit px-2 py-1 rounded-lg">
                  <IconArrowUpRight className={cn("w-3 h-3", kpi.growth.startsWith('+') ? "text-emerald-500" : "text-rose-500")} />
                  <span className={cn("text-[10px] font-black", kpi.growth.startsWith('+') ? "text-emerald-500" : "text-rose-500")}>{kpi.growth}</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest ml-1">vs prev query</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="rounded-[3rem] border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl overflow-hidden shadow-sm p-8 h-full">
            <div className="flex flex-row items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Revenue Performance</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Real-time projection across key fiscal milestones</p>
              </div>
              <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-[10px] font-black uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-blue-500" /> Volume</span>
                <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-emerald-500" /> Margin</span>
              </div>
            </div>
            
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" />
                <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-gray-400" tickFormatter={(v) => `$${v/1000}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={3} />
              </AreaChart>
            </ChartContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="rounded-[3rem] border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl overflow-hidden shadow-sm flex flex-col h-full">
            <div className="border-b border-gray-100 dark:border-gray-800 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Hot Ledger</h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Real-time Feed</p>
                </div>
                <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                  <IconActivity className="h-5 w-5 text-emerald-500 animate-pulse" />
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {RecentTransactions.map((tx, idx) => (
                <div 
                  key={tx.id} 
                  className="group flex items-center gap-4 p-4 rounded-[2rem] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 transition-all">
                    <IconArrowUpRight className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-black text-gray-900 dark:text-white truncate transition-colors">{tx.user}</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white tabular-nums">${tx.amount.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">{tx.method}</p>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[9px] h-5 px-2 font-black uppercase tracking-widest border-none",
                          tx.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                          tx.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                        )}
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <Button variant="ghost" className="w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white group transition-all">
                Full Analytics Log
                <IconChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="rounded-[3rem] border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl overflow-hidden shadow-sm p-8">
            <div className="mb-6">
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Payout Distribution</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Allocation of funds between hosts and platform</p>
            </div>
            
            <ChartContainer config={chartConfig} className="h-[250px] w-full pt-4">
              <BarChart data={revenueData.slice(-4)}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" />
                <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold text-gray-400" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} name="Total Volume" />
                <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} name="Platform Fee" />
              </BarChart>
            </ChartContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="rounded-[3rem] border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl overflow-hidden shadow-sm p-8 h-full flex flex-col">
            <div className="mb-6">
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Tax & Compliance Score</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">System assessment of financial regulation adherence</p>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center py-4">
              <div className="relative flex h-40 w-40 items-center justify-center mb-8">
                <svg className="h-full w-full -rotate-90 transform drop-shadow-xl">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100 dark:text-gray-800" />
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" strokeLinecap="round" fill="transparent" strokeDasharray="439.8" strokeDashoffset="35.18" className="text-emerald-500 transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">92%</span>
                  <span className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] mt-1">Compliant</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full px-4">
                <div className="group rounded-[1.5rem] border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 text-center transition-all hover:bg-emerald-500 hover:border-emerald-500 shadow-sm hover:shadow-xl hover:shadow-emerald-500/20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-emerald-100 transition-colors">KyC Status</p>
                  <p className="text-sm font-black text-emerald-500 group-hover:text-white uppercase mt-1">Verified</p>
                </div>
                <div className="group rounded-[1.5rem] border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 text-center transition-all hover:bg-blue-500 hover:border-blue-500 shadow-sm hover:shadow-xl hover:shadow-blue-500/20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-blue-100 transition-colors">Tax Filings</p>
                  <p className="text-sm font-black text-blue-500 group-hover:text-white uppercase mt-1">Scheduled</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

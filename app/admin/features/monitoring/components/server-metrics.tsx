'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/admin/components/ui/card';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
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
  IconCpu,
  IconActivity,
  IconArrowUpRight,
  IconArrowDownRight,
  IconCloud,
  IconNetwork,
  IconRefresh,
  IconLayoutDashboard,
  IconServer,
  IconDatabase,
  IconCircleCheck
} from '@tabler/icons-react';
import { Button } from '@/app/admin/components/ui/button';
import PageContainer from '@/app/admin/components/layout/page-container';
import { cn } from '@/app/admin/lib/utils';
import { toast } from 'sonner';

const chartConfig = {
  value: {
    label: 'Utilization',
    color: 'var(--chart-1)'
  },
  inbound: {
    label: 'Inbound',
    color: 'var(--chart-1)'
  },
  outbound: {
    label: 'Outbound',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig;

interface MetricsData {
  current: {
    cpuUsage: number;
    memoryUsage: number;
    networkIn: number;
    networkOut: number;
    loadAvg: {
      '1m': number;
      '5m': number;
      '15m': number;
    };
    processes: {
      total: number;
      active: number;
    };
  };
  history: {
    cpu: { time: string; value: number }[];
    memory: { time: string; value: number }[];
    network: { time: string; inbound: number; outbound: number }[];
  };
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function ServerMetrics() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fetchMetrics = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch('/api/admin/monitoring/servers');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error('Failed to fetch server metrics');
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast.error('An error occurred while fetching metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchMetrics();
    const interval = setInterval(() => fetchMetrics(true), 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse font-black uppercase tracking-widest text-[10px]">Syncing Node Telemetry...</p>
      </div>
    );
  }

  if (!data) return null;

  const { current, history } = data;

  const kpis = [
    { label: 'CPU Cluster Usage', value: `${current.cpuUsage}%`, peak: `${Math.max(...history.cpu.map(h => h.value))}%`, avg: `${Math.round(history.cpu.reduce((a, b) => a + b.value, 0) / history.cpu.length)}%`, icon: IconCpu, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Memory Allocation', value: `${current.memoryUsage}%`, peak: `${Math.max(...history.memory.map(h => h.value))}%`, avg: `${Math.round(history.memory.reduce((a, b) => a + b.value, 0) / history.memory.length)}%`, icon: IconServer, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Network Inbound', value: `${current.networkIn} MB/s`, peak: `${Math.max(...history.network.map(h => h.inbound))} MB/s`, avg: `${Math.round(history.network.reduce((a, b) => a + b.inbound, 0) / history.network.length)} MB/s`, icon: IconNetwork, color: 'text-amber-500', bg: 'bg-amber-500/10' }
  ];

  return (
    <PageContainer
      pageTitle="Telemetric Performance"
      pageDescription="Hyper-V infrastructure load and compute allocation analytics"
      pageHeaderAction={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2 font-black uppercase text-[10px] tracking-widest">
            <IconLayoutDashboard className="h-4 w-4" /> Cluster View
          </Button>
          <Button size="sm" className="h-9 gap-2 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest" onClick={() => fetchMetrics(true)} disabled={refreshing}>
            <IconRefresh className={cn("h-4 w-4", refreshing && "animate-spin")} /> Sync Node
          </Button>
        </div>
      }
    >
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kpis.map((stat, i) => (
            <motion.div key={i} variants={item}>
              <Card className="group relative overflow-hidden border-none bg-card/30 backdrop-blur-md shadow-xl transition-all hover:bg-card/40">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
                  <div className={cn("rounded-lg p-2 transition-transform group-hover:scale-110", stat.bg)}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black tracking-tight tabular-nums">{stat.value}</div>
                  <div className="mt-1 flex items-center justify-between text-[10px] font-medium text-muted-foreground/60 uppercase tracking-tight">
                    <span>Peak: {stat.peak}</span>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <span>Avg: {stat.avg}</span>
                  </div>
                </CardContent>
                <div className={cn("absolute bottom-0 left-0 h-1 w-full opacity-30", stat.bg.replace('/10', ''))} />
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={item}>
            <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-black">CPU Telemetry</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Active Core Utilization Trends</CardDescription>
                  </div>
                  <IconCpu className="h-5 w-5 text-blue-500 opacity-50" />
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[240px] w-full">
                  <AreaChart data={history.cpu}>
                    <defs>
                      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="value" name="CPU %" stroke="var(--chart-1)" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={3} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-black">Memory Allocation</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">RAM Consumption Metrics</CardDescription>
                  </div>
                  <IconServer className="h-5 w-5 text-emerald-500 opacity-50" />
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[240px] w-full">
                  <AreaChart data={history.memory}>
                    <defs>
                      <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="value" name="Memory %" stroke="var(--chart-2)" fillOpacity={1} fill="url(#colorMemory)" strokeWidth={3} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={item}>
          <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-black">Network Throughput</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Inbound vs Outbound Data Transmission</CardDescription>
                </div>
                <IconNetwork className="h-5 w-5 text-purple-500 opacity-50" />
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <LineChart data={history.network}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="inbound" name="Inbound (MB/s)" stroke="var(--chart-1)" strokeWidth={4} dot={false} strokeLinecap="round" />
                  <Line type="monotone" dataKey="outbound" name="Outbound (MB/s)" stroke="var(--chart-2)" strokeWidth={4} dot={false} strokeLinecap="round" />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Engine Load', value: `${current.loadAvg['1m']}`, peak: `${current.loadAvg['15m']}`, icon: IconActivity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Active Tasks', value: current.processes.active.toString(), peak: current.processes.total.toString(), icon: IconActivity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Pool Health', value: '99.9%', peak: '100%', icon: IconCloud, color: 'text-purple-500', bg: 'bg-purple-500/10' }
          ].map((stat, i) => (
            <motion.div key={i} variants={item}>
              <Card className="group relative overflow-hidden border-none bg-card/30 backdrop-blur-md shadow-xl transition-all hover:bg-card/40">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
                  <div className={cn("rounded-lg p-2 transition-transform group-hover:scale-110", stat.bg)}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black tracking-tight tabular-nums">{stat.value}</div>
                  <div className="mt-1 flex items-center space-x-1">
                    <span className={cn("text-[9px] font-black uppercase tracking-wider", stat.color)}>Peak: {stat.peak}</span>
                    <span className="text-[9px] text-muted-foreground/60 tracking-tighter uppercase font-bold">Health Level</span>
                  </div>
                </CardContent>
                <div className={cn("absolute bottom-0 left-0 h-1 w-full opacity-30", stat.bg.replace('/10', ''))} />
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </PageContainer>
  );
}

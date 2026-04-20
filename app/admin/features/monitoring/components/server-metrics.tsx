'use client';

import React from 'react';
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
  IconDatabase
} from '@tabler/icons-react';
import { Button } from '@/app/admin/components/ui/button';
import PageContainer from '@/app/admin/components/layout/page-container';
import { cn } from '@/app/admin/lib/utils';

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

// Sample server metrics data
const cpuData = [
  { time: '09:00', value: 45 },
  { time: '09:15', value: 52 },
  { time: '09:30', value: 65 },
  { time: '09:45', value: 58 },
  { time: '10:00', value: 72 },
  { time: '10:15', value: 68 },
  { time: '10:30', value: 55 },
  { time: '10:45', value: 61 },
  { time: '11:00', value: 75 },
  { time: '11:15', value: 80 },
  { time: '11:30', value: 70 },
  { time: '11:45', value: 65 }
];

const memoryData = [
  { time: '09:00', value: 68 },
  { time: '09:15', value: 72 },
  { time: '09:30', value: 78 },
  { time: '09:45', value: 80 },
  { time: '10:00', value: 85 },
  { time: '10:15', value: 88 },
  { time: '10:30', value: 82 },
  { time: '10:45', value: 80 },
  { time: '11:00', value: 85 },
  { time: '11:15', value: 88 },
  { time: '11:30', value: 82 },
  { time: '11:45', value: 80 }
];

const networkData = [
  { time: '09:00', inbound: 4.5, outbound: 2.3 },
  { time: '09:15', inbound: 5.2, outbound: 2.8 },
  { time: '09:30', inbound: 6.1, outbound: 3.2 },
  { time: '09:45', inbound: 5.8, outbound: 3.0 },
  { time: '10:00', inbound: 7.5, outbound: 4.1 },
  { time: '10:15', inbound: 6.8, outbound: 3.8 },
  { time: '10:30', inbound: 5.5, outbound: 2.9 },
  { time: '10:45', inbound: 6.1, outbound: 3.3 },
  { time: '11:00', inbound: 8.2, outbound: 4.5 },
  { time: '11:15', inbound: 9.1, outbound: 5.2 },
  { time: '11:30', inbound: 7.8, outbound: 4.3 },
  { time: '11:45', inbound: 6.5, outbound: 3.6 }
];

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
  return (
    <PageContainer
      pageTitle="Telemetric Performance"
      pageDescription="Hyper-V infrastructure load and compute allocation analytics"
      pageHeaderAction={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <IconLayoutDashboard className="h-4 w-4" /> Cluster View
          </Button>
          <Button size="sm" className="h-9 gap-2 shadow-lg shadow-primary/20" onClick={() => window.location.reload()}>
            <IconRefresh className="h-4 w-4" /> Sync Node
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
        {[
          { label: 'CPU Cluster Usage', value: '80%', peak: '95%', avg: '72%', icon: IconCpu, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Memory Allocation', value: '64 GB', peak: '58 GB', avg: '42 GB', icon: IconServer, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Storage Cluster', value: '2.4 TB', peak: '2.1 TB', avg: '1.8 TB', icon: IconDatabase, color: 'text-amber-500', bg: 'bg-amber-500/10' }
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
                <AreaChart data={cpuData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="value" name="CPU %" stroke="var(--chart-1)" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
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
                <AreaChart data={memoryData}>
                  <defs>
                    <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
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
              <IconServer className="h-5 w-5 text-purple-500 opacity-50" />
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <LineChart data={networkData}>
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
          { label: 'Engine Load', value: '12%', peak: '45%', icon: IconActivity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Active Tasks', value: '12', peak: '24', icon: IconActivity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
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

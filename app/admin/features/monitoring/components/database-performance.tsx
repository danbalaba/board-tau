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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import {
  IconDatabase,
  IconBolt,
  IconCloud,
  IconAlertTriangle,
  IconSearch,
  IconArrowUpRight,
  IconActivity,
  IconLayersIntersect,
  IconRefresh,
  IconLayoutDashboard
} from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import PageContainer from '@/app/admin/components/layout/page-container';

// Sample database performance data
const queryPerformanceData = [
  { query: 'SELECT * FROM users', avgTime: 120, count: 1500 },
  { query: 'SELECT * FROM properties', avgTime: 85, count: 2200 },
  { query: 'SELECT * FROM bookings', avgTime: 150, count: 1800 },
  { query: 'SELECT * FROM reviews', avgTime: 95, count: 1200 },
  { query: 'SELECT * FROM payments', avgTime: 110, count: 950 },
  { query: 'SELECT * FROM host_applications', avgTime: 75, count: 350 }
];

const connectionData = [
  { time: '09:00', active: 120, idle: 35 },
  { time: '09:15', active: 135, idle: 42 },
  { time: '09:30', active: 145, idle: 45 },
  { time: '09:45', active: 130, idle: 38 },
  { time: '10:00', active: 150, idle: 50 },
  { time: '10:15', active: 142, idle: 48 },
  { time: '10:30', active: 138, idle: 43 },
  { time: '10:45', active: 140, idle: 40 },
  { time: '11:00', active: 155, idle: 55 },
  { time: '11:15', active: 160, idle: 58 },
  { time: '11:30', active: 148, idle: 45 },
  { time: '11:45', active: 142, idle: 42 }
];

const cachePerformanceData = [
  { time: '09:00', hits: 85, misses: 15 },
  { time: '09:15', hits: 88, misses: 12 },
  { time: '09:30', hits: 92, misses: 8 },
  { time: '09:45', hits: 87, misses: 13 },
  { time: '10:00', hits: 83, misses: 17 },
  { time: '10:15', hits: 89, misses: 11 },
  { time: '10:30', hits: 91, misses: 9 },
  { time: '10:45', hits: 86, misses: 14 },
  { time: '11:00', hits: 84, misses: 16 },
  { time: '11:15', hits: 88, misses: 12 },
  { time: '11:30', hits: 90, misses: 10 },
  { time: '11:45', hits: 87, misses: 13 }
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

export function DatabasePerformance() {
  return (
    <PageContainer
      pageTitle="Engine Telemetry"
      pageDescription="Deep database diagnostics and query latency optimization ledger"
      pageHeaderAction={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <IconLayoutDashboard className="h-4 w-4" /> Pool Config
          </Button>
          <Button size="sm" className="h-9 gap-2 shadow-lg shadow-primary/20" onClick={() => window.location.reload()}>
            <IconRefresh className="h-4 w-4" /> Refresh Engine
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Hyper-Pool Conn', value: '160', peak: '200', icon: IconDatabase, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Queries / Sec', value: '245', peak: '310', icon: IconBolt, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Cache Hit Rate', value: '88%', peak: '92%', icon: IconLayersIntersect, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Slow Traces', value: '12', peak: '156', icon: IconAlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' }
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
                  <span>Peak Ops: {stat.peak}</span>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-black">Top Query Latency</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Average Execution Time per Procedure</CardDescription>
              </div>
              <IconSearch className="h-5 w-5 text-blue-500 opacity-50" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={queryPerformanceData} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <YAxis dataKey="query" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700 }} width={120} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                    />
                    <Bar dataKey="avgTime" name="Latency (ms)" radius={[0, 4, 4, 0]}>
                      {queryPerformanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.avgTime > 130 ? 'var(--chart-2)' : 'var(--chart-1)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-black">Connection Logistics</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Active vs Idle Database Instances</CardDescription>
              </div>
              <IconActivity className="h-5 w-5 text-emerald-500 opacity-50" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={connectionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }} />
                    <Line type="monotone" dataKey="active" name="Active Cluster" stroke="var(--chart-1)" strokeWidth={4} dot={false} strokeLinecap="round" />
                    <Line type="monotone" dataKey="idle" name="Pending Pool" stroke="var(--chart-2)" strokeWidth={4} dot={false} strokeLinecap="round" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black">Cache Efficiency Matrix</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Hit/Miss Distribution Over T-Intervals</CardDescription>
            </div>
            <IconLayersIntersect className="h-5 w-5 text-purple-500 opacity-50" />
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cachePerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                  />
                  <Legend iconType="square" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }} />
                  <Bar dataKey="hits" name="Cache Hits (%)" stackId="a" fill="var(--chart-1)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="misses" name="Cold Misses (%)" stackId="a" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Storage Allocation', value: '85 GB', desc: 'Total: 100 GB (85%)', icon: IconDatabase, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Memory Footprint', value: '12.5 GB', desc: 'Used: 78% of 16 GB', icon: IconCloud, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Index Velocity', value: '92%', desc: 'Optimal Seek Ratio', icon: IconSearch, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
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
                <p className="text-[10px] text-muted-foreground/80 mt-1 font-medium">{stat.desc}</p>
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

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
  IconActivity,
  IconLayersIntersect,
  IconRefresh,
  IconLayoutDashboard
} from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import PageContainer from '@/app/admin/components/layout/page-container';
import { toast } from 'sonner';

interface DatabaseData {
  summary: {
    activeConnections: number;
    queriesPerSecond: number;
    cacheHitRate: number;
    slowQueries: number;
  };
  storage: {
    totalSizeMB: number;
    dataSizeMB: number;
    indexSizeMB: number;
    objects: number;
    collections: number;
  };
  collectionStats: {
    name: string;
    count: number;
    avgTime: number;
  }[];
  history: {
    connections: { time: string; active: number; idle: number }[];
    cache: { time: string; hits: number; misses: number }[];
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

export function DatabasePerformance() {
  const [data, setData] = useState<DatabaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch('/api/admin/monitoring/database');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error('Failed to fetch database metrics');
      }
    } catch (error) {
      console.error('Error fetching db metrics:', error);
      toast.error('An error occurred while fetching database metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
    const interval = setInterval(() => fetchData(true), 120000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse font-black uppercase tracking-widest text-[10px]">Assembling Engine Telemetry...</p>
      </div>
    );
  }

  if (!data) return null;

  const { summary, storage, collectionStats, history } = data;

  const kpis = [
    { label: 'Hyper-Pool Conn', value: summary.activeConnections.toString(), peak: '200', icon: IconDatabase, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Queries / Sec', value: summary.queriesPerSecond.toString(), peak: '310', icon: IconBolt, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Cache Hit Rate', value: `${summary.cacheHitRate}%`, peak: '92%', icon: IconLayersIntersect, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Slow Traces', value: summary.slowQueries.toString(), peak: '156', icon: IconAlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' }
  ];

  return (
    <PageContainer
      pageTitle="Engine Telemetry"
      pageDescription="Deep database diagnostics and query latency optimization ledger"
      pageHeaderAction={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2 font-black uppercase text-[10px] tracking-widest">
            <IconLayoutDashboard className="h-4 w-4" /> Pool Config
          </Button>
          <Button size="sm" className="h-9 gap-2 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest" onClick={() => fetchData(true)} disabled={refreshing}>
            <IconRefresh className={cn("h-4 w-4", refreshing && "animate-spin")} /> Refresh Engine
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
                    <span>Active Ops</span>
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
                  <CardTitle className="text-base font-black">Collection Analysis</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Document Distribution and Latency per Cluster</CardDescription>
                </div>
                <IconSearch className="h-5 w-5 text-blue-500 opacity-50" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={collectionStats} layout="vertical" margin={{ left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700 }} width={120} />
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }}
                      />
                      <Bar dataKey="count" name="Document Count" radius={[0, 4, 4, 0]}>
                        {collectionStats.map((entry, index) => (
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
                    <LineChart data={history.connections}>
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
                  <BarChart data={history.cache}>
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
            { label: 'Storage Allocation', value: `${storage.totalSizeMB} MB`, desc: `Data: ${storage.dataSizeMB} MB`, icon: IconDatabase, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Index Footprint', value: `${storage.indexSizeMB} MB`, desc: `Across ${storage.collections} Collections`, icon: IconCloud, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Object Velocity', value: storage.objects.toLocaleString(), desc: 'Total Managed Documents', icon: IconSearch, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
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
                  <p className="text-[10px] text-muted-foreground/80 mt-1 font-medium uppercase tracking-tight">{stat.desc}</p>
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

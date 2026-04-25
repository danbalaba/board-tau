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
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import {
  IconActivity,
  IconRefresh,
  IconAlertTriangle,
  IconEye,
  IconLink,
  IconBolt,
  IconFlame,
  IconNetwork,
  IconLayoutDashboard
} from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';
import PageContainer from '@/app/admin/components/layout/page-container';
import { toast } from 'sonner';

interface ApiData {
  summary: {
    totalRequests: number;
    avgResponseTime: number;
    errorRate: number;
    throughput: number;
  };
  performance: { time: string; avgResponse: number; requests: number }[];
  endpoints: {
    endpoint: string;
    avgTime: number;
    errorRate: number;
    status: 'healthy' | 'warning' | 'critical';
  }[];
  errors: {
    id: string;
    type: string;
    endpoint: string;
    occurrences: number;
    lastSeen: string;
    severity: 'warning' | 'critical';
  }[];
}

const statusStyles: Record<string, { badge: string; color: string; bg: string; dot: string }> = {
  healthy: {
    badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/5',
    dot: 'bg-emerald-500'
  },
  warning: {
    badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    color: 'text-amber-500',
    bg: 'bg-amber-500/5',
    dot: 'bg-amber-500'
  },
  critical: {
    badge: 'bg-red-500/10 text-red-500 border-red-500/20',
    color: 'text-red-500',
    bg: 'bg-red-500/5',
    dot: 'bg-red-500'
  }
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function ApiMonitoring() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch('/api/admin/monitoring/api');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error('Failed to fetch API metrics');
      }
    } catch (error) {
      console.error('Error fetching API metrics:', error);
      toast.error('An error occurred while fetching API metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
    const interval = setInterval(() => fetchData(true), 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse font-black uppercase tracking-widest text-[10px]">Assembling Gateway Intelligence...</p>
      </div>
    );
  }

  if (!data) return null;

  const { summary, performance, endpoints, errors } = data;

  const kpis = [
    { label: 'Total Volume', value: summary.totalRequests.toLocaleString(), sub: 'Last 24h', icon: IconActivity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Response Delta', value: `${summary.avgResponseTime}ms`, sub: 'P95: 210ms', icon: IconBolt, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Failure Ratio', value: `${summary.errorRate}%`, sub: 'Healthy < 1%', icon: IconFlame, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Ingress RPS', value: summary.throughput.toString(), sub: 'Active Throughput', icon: IconNetwork, color: 'text-purple-500', bg: 'bg-purple-500/10' }
  ];

  return (
    <PageContainer
      pageTitle="Gateway Intelligence"
      pageDescription="Edge-level API performance and traffic volume analytics"
      pageHeaderAction={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2 font-black uppercase text-[10px] tracking-widest">
            <IconLayoutDashboard className="h-4 w-4" /> Endpoint List
          </Button>
          <Button size="sm" className="h-9 gap-2 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest" onClick={() => fetchData(true)} disabled={refreshing}>
            <IconRefresh className={cn("h-4 w-4", refreshing && "animate-spin")} /> Force Sync
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
                  <div className="text-2xl font-black tracking-tight tabular-nums">{stat.value}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">
                    {stat.sub}
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
                  <CardTitle className="text-base font-black">Temporal Throughput</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Average Response vs Request Volume Distribution</CardDescription>
                </div>
                <IconActivity className="h-5 w-5 text-blue-500 opacity-50" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performance}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }} />
                      <Line yAxisId="left" type="monotone" dataKey="avgResponse" name="Response (ms)" stroke="var(--chart-1)" strokeWidth={4} dot={false} strokeLinecap="round" />
                      <Line yAxisId="right" type="monotone" dataKey="requests" name="Traffic Volume" stroke="var(--chart-2)" strokeWidth={4} dot={false} strokeLinecap="round" strokeDasharray="4 4" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-black">Endpoint Load Velocity</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Mean Response Time per Microservice Ingress</CardDescription>
                </div>
                <IconNetwork className="h-5 w-5 text-emerald-500 opacity-50" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={endpoints}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="endpoint" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                      <Bar dataKey="avgTime" name="Mean Time (ms)" radius={[6, 6, 0, 0]}>
                        {endpoints.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.status === 'healthy' ? 'var(--chart-1)' : entry.status === 'warning' ? 'var(--chart-3)' : 'var(--chart-2)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={item}>
          <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl font-black">Endpoint Status Matrix</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Real-time health status of secondary microservices</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="divide-y divide-border/20">
                {endpoints.map((endpoint, index) => {
                  const style = statusStyles[endpoint.status] || statusStyles.healthy;
                  return (
                    <div key={index} className="group relative flex items-center justify-between p-6 transition-all hover:bg-white/5">
                      <div className="flex items-center space-x-4">
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shadow-inner transition-transform group-hover:scale-110", style.bg)}>
                          <IconLink className={cn("h-5 w-5", style.color)} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                             <h3 className="text-sm font-black tracking-tight font-mono">{endpoint.endpoint}</h3>
                             <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-border/20", style.bg)}>
                                <div className={cn("h-1 w-1 rounded-full animate-pulse", style.dot)} />
                                <span className={cn("text-[8px] font-black uppercase tracking-wider", style.color)}>{endpoint.status}</span>
                             </div>
                          </div>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-tighter mt-0.5">
                            Mean: <span className="text-foreground font-bold">{endpoint.avgTime}ms</span> • Errors: <span className={cn("font-bold", endpoint.errorRate > 1 ? 'text-red-500' : 'text-emerald-500')}>{endpoint.errorRate}%</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 border-border/20 hover:bg-white/10 gap-1.5 px-3 font-black uppercase text-[10px] tracking-widest"
                        >
                          <IconEye className="h-3.5 w-3.5" />
                          Inspect
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-black">Diagnostic Event Log</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Latest critical API failure incidents</CardDescription>
              </div>
              <IconAlertTriangle className="h-5 w-5 text-red-500 opacity-50" />
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-4">
                {errors.length > 0 ? errors.map((error) => {
                   const style = statusStyles[error.severity] || statusStyles.warning;
                   return (
                    <div key={error.id} className={cn("flex items-start gap-4 p-4 rounded-2xl border transition-all", 
                      error.severity === 'critical' ? 'border-red-500/10 bg-red-500/5 hover:bg-red-500/10' : 'border-amber-500/10 bg-amber-500/5 hover:bg-amber-500/10'
                    )}>
                      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-inner", 
                        error.severity === 'critical' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'
                      )}>
                        <IconAlertTriangle className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                           <h4 className={cn("text-sm font-black uppercase tracking-tight", 
                             error.severity === 'critical' ? 'text-red-500' : 'text-amber-500'
                           )}>{error.type}</h4>
                           <Badge variant="outline" className={cn("border-none text-[9px] font-black uppercase", 
                             error.severity === 'critical' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                           )}>{error.severity}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Failure at <span className="font-mono text-foreground font-bold">{error.endpoint}</span> - {error.occurrences} occurrences recently.
                        </p>
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-2">Detected {error.lastSeen}</p>
                      </div>
                    </div>
                   );
                }) : (
                  <div className="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10">
                     <IconBolt className="w-8 h-8 text-white/10 mx-auto mb-2" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">No diagnostic events detected</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}

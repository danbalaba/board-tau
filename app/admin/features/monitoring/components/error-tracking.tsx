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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  IconAlertTriangle,
  IconRefresh,
  IconEye,
  IconFlame,
  IconBug,
  IconActivity,
  IconChartPie,
  IconFileReport,
  IconChecklist,
  IconLayoutDashboard,
  IconBolt
} from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';
import PageContainer from '@/app/admin/components/layout/page-container';
import { toast } from 'sonner';

interface ErrorData {
  summary: {
    totalErrors: number;
    criticalErrors: number;
    errorRate: number;
    resolutionRate: number;
  };
  trends: { time: string; count: number; highSeverity: number }[];
  distribution: { name: string; value: number; color: string }[];
  recent: {
    id: string;
    errorType: string;
    message: string;
    stackTrace: string;
    occurrences: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
    lastOccurred: string;
  }[];
}

const severityStyles: Record<string, { badge: string; color: string; bg: string; icon: any }> = {
  critical: {
    badge: 'bg-red-500/10 text-red-500 border-red-500/20',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    icon: IconFlame
  },
  high: {
    badge: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    icon: IconAlertTriangle
  },
  medium: {
    badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    icon: IconBug
  },
  low: {
    badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    icon: IconActivity
  },
  info: {
    badge: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    color: 'text-slate-500',
    bg: 'bg-slate-500/10',
    icon: IconFileReport
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
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 }
};

export function ErrorTracking() {
  const [data, setData] = useState<ErrorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch('/api/admin/monitoring/errors');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error('Failed to fetch error metrics');
      }
    } catch (error) {
      console.error('Error fetching error metrics:', error);
      toast.error('An error occurred while fetching error tracking data');
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
        <p className="text-muted-foreground animate-pulse font-black uppercase tracking-widest text-[10px]">Scanning System Diagnostic Tracks...</p>
      </div>
    );
  }

  if (!data) return null;

  const { summary, trends, distribution, recent } = data;

  const kpis = [
    { label: 'Total Exceptions', value: summary.totalErrors.toString(), trend: 'Last 24h', icon: IconBug, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Critical Paths', value: summary.criticalErrors.toString(), trend: 'Priority Triage', icon: IconFlame, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Global Error %', value: `${summary.errorRate}%`, trend: 'Healthy < 1%', icon: IconActivity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Resolution Rate', value: `${summary.resolutionRate}%`, trend: 'Last 7 days', icon: IconChecklist, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
  ];

  return (
    <PageContainer
      pageTitle="Diagnostic Tracks"
      pageDescription="Automated anomaly detection and application-wide error tracking"
      pageHeaderAction={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2 font-black uppercase text-[10px] tracking-widest">
            <IconLayoutDashboard className="h-4 w-4" /> Error Config
          </Button>
          <Button size="sm" className="h-9 gap-2 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest" onClick={() => fetchData(true)} disabled={refreshing}>
            <IconRefresh className={cn("h-4 w-4", refreshing && "animate-spin")} /> Re-Scan
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
                  <p className="text-[10px] font-bold text-muted-foreground/60 uppercase mt-1">{stat.trend}</p>
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
                  <CardTitle className="text-base font-black">Anomaly Trend</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Exception frequency per T-Interval</CardDescription>
                </div>
                <IconActivity className="h-5 w-5 text-red-500 opacity-50" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                      <Bar dataKey="count" name="Interval Errors" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
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
                  <CardTitle className="text-base font-black">Classification Spectrum</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Error distribution by failure category</CardDescription>
                </div>
                <IconChartPie className="h-5 w-5 text-emerald-500 opacity-50" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distribution}
                        cx="55%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                      <Legend layout="vertical" align="left" verticalAlign="middle" iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div variants={item}>
          <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl font-black">Active Incident Ledger</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Real-time trace of unique system exceptions</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="divide-y divide-border/20">
                {recent.length > 0 ? recent.map((error) => {
                  const style = severityStyles[error.severity] || severityStyles.medium;
                  const IconComp = style.icon;
                  return (
                    <div key={error.id} className="group relative flex items-start gap-4 p-6 transition-all hover:bg-white/5">
                      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner transition-transform group-hover:scale-110", style.bg)}>
                        <IconComp className={cn("h-6 w-6", style.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <h4 className="text-base font-black tracking-tight font-mono">{error.errorType}</h4>
                             <Badge variant="outline" className={cn("text-[9px] font-black uppercase px-2", style.badge)}>
                               {error.severity}
                             </Badge>
                             <Badge variant="outline" className="text-[9px] font-black uppercase px-2 bg-white/5 border-white/10">{error.occurrences}x Count</Badge>
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{error.lastOccurred}</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground/90 mt-1">{error.message}</p>
                        <div className="mt-2 text-[10px] font-mono text-muted-foreground/80 bg-black/20 p-2 rounded-lg border border-border/20 line-clamp-1 group-hover:line-clamp-none transition-all">
                          {error.stackTrace}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 border-border/20 hover:bg-white/10 gap-2 px-4 shrink-0 font-black uppercase text-[10px] tracking-widest"
                      >
                        <IconEye className="h-4 w-4" />
                        Trace
                      </Button>
                    </div>
                  );
                }) : (
                  <div className="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10 mx-6">
                     <IconBolt className="w-8 h-8 text-white/10 mx-auto mb-2" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">No active incidents captured</p>
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

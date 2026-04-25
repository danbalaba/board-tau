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
  IconLayoutDashboard
} from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';
import PageContainer from '@/app/admin/components/layout/page-container';

// Sample error tracking data
const errorTrendData = [
  { time: '09:00', count: 12, severity: 'low' },
  { time: '09:15', count: 8, severity: 'low' },
  { time: '09:30', count: 15, severity: 'medium' },
  { time: '09:45', count: 10, severity: 'low' },
  { time: '10:00', count: 25, severity: 'high' },
  { time: '10:15', count: 18, severity: 'medium' },
  { time: '10:30', count: 14, severity: 'medium' },
  { time: '10:45', count: 20, severity: 'high' },
  { time: '11:00', count: 28, severity: 'high' },
  { time: '11:15', count: 32, severity: 'high' },
  { time: '11:30', count: 25, severity: 'high' },
  { time: '11:45', count: 18, severity: 'medium' }
];

const errorByTypeData = [
  { name: '5xx Errors', value: 45, color: 'var(--chart-2)' },
  { name: '4xx Errors', value: 30, color: 'var(--chart-3)' },
  { name: '3xx Errors', value: 15, color: 'var(--chart-1)' },
  { name: '2xx Errors', value: 10, color: 'var(--chart-4)' }
];

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

const severityStyles: Record<Severity, { badge: string; color: string; bg: string; icon: any }> = {
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

const recentErrorsData: Array<{
  id: string;
  errorType: string;
  message: string;
  stackTrace: string;
  occurrences: number;
  severity: Severity;
  lastOccurred: string;
}> = [
  {
    id: '1',
    errorType: '500 | SQL Ingress Failure',
    message: 'Failed to connect to primary database cluster',
    stackTrace: 'Error at /api/host-applications -> db.connect()',
    occurrences: 150,
    severity: 'high',
    lastOccurred: '2m ago'
  },
  {
    id: '2',
    errorType: '408 | Payment Timeout',
    message: 'Stripe API handshake latency peak detected',
    stackTrace: 'Error at /api/payments -> stripe.capture()',
    occurrences: 45,
    severity: 'medium',
    lastOccurred: '5m ago'
  },
  {
    id: '3',
    errorType: '401 | Auth Delta Guard',
    message: 'Invalid JWT signature detected from unknown origin',
    stackTrace: 'Error at /api/auth -> jwt.verify()',
    occurrences: 28,
    severity: 'medium',
    lastOccurred: '10m ago'
  },
  {
    id: '4',
    errorType: '503 | Cache Store Cold',
    message: 'Redis cluster unreachable during peak allocation',
    stackTrace: 'Error at /api/cache -> redis.mget()',
    occurrences: 12,
    severity: 'low',
    lastOccurred: '15m ago'
  }
];

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
  return (
    <PageContainer
      pageTitle="Diagnostic Tracks"
      pageDescription="Automated anomaly detection and application-wide error tracking"
      pageHeaderAction={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <IconLayoutDashboard className="h-4 w-4" /> Error Config
          </Button>
          <Button size="sm" className="h-9 gap-2 shadow-lg shadow-primary/20" onClick={() => window.location.reload()}>
            <IconRefresh className="h-4 w-4" /> Re-Scan
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
          { label: 'Total Exceptions', value: '287', trend: 'Last 24h', icon: IconBug, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Critical Paths', value: '45', trend: 'Priority Triage', icon: IconFlame, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Global Error %', value: '1.2%', trend: 'Healthy < 1%', icon: IconActivity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Resolution Rate', value: '85%', trend: 'Last 7 days', icon: IconChecklist, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
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
                  <BarChart data={errorTrendData}>
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
                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Error distribution by HTTP classification</CardDescription>
              </div>
              <IconChartPie className="h-5 w-5 text-emerald-500 opacity-50" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={errorByTypeData}
                      cx="55%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {errorByTypeData.map((entry, index) => (
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
              {recentErrorsData.map((error) => {
                const style = severityStyles[error.severity];
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
                      className="h-9 border-border/20 hover:bg-white/10 gap-2 px-4 shrink-0"
                      onClick={() => console.log('View error details')}
                    >
                      <IconEye className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase">Trace</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </motion.div>
    </PageContainer>
  );
}

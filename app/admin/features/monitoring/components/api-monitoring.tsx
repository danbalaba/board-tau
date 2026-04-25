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
  IconArrowUpRight,
  IconFlame,
  IconBolt,
  IconShieldLock,
  IconNetwork,
  IconLayoutDashboard
} from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';
import PageContainer from '@/app/admin/components/layout/page-container';

// Sample API monitoring data
const apiPerformanceData = [
  { time: '09:00', avgResponse: 120, requests: 1500 },
  { time: '09:15', avgResponse: 135, requests: 1650 },
  { time: '09:30', avgResponse: 145, requests: 1800 },
  { time: '09:45', avgResponse: 130, requests: 1700 },
  { time: '10:00', avgResponse: 150, requests: 2000 },
  { time: '10:15', avgResponse: 142, requests: 1900 },
  { time: '10:30', avgResponse: 138, requests: 1850 },
  { time: '10:45', avgResponse: 140, requests: 1880 },
  { time: '11:00', avgResponse: 155, requests: 2100 },
  { time: '11:15', avgResponse: 160, requests: 2200 },
  { time: '11:30', avgResponse: 148, requests: 2050 },
  { time: '11:45', avgResponse: 142, requests: 1980 }
];

type Status = 'healthy' | 'warning' | 'critical';

const statusStyles: Record<Status, { badge: string; color: string; bg: string; dot: string }> = {
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

const endpointPerformanceData: Array<{
  endpoint: string;
  avgTime: number;
  errorRate: number;
  status: Status;
}> = [
  { endpoint: '/api/properties', avgTime: 120, errorRate: 0.2, status: 'healthy' },
  { endpoint: '/api/bookings', avgTime: 150, errorRate: 0.8, status: 'warning' },
  { endpoint: '/api/users', avgTime: 95, errorRate: 0.1, status: 'healthy' },
  { endpoint: '/api/payments', avgTime: 250, errorRate: 1.5, status: 'warning' },
  { endpoint: '/api/reviews', avgTime: 85, errorRate: 0.3, status: 'healthy' },
  { endpoint: '/api/host-applications', avgTime: 180, errorRate: 2.1, status: 'critical' }
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
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function ApiMonitoring() {
  return (
    <PageContainer
      pageTitle="Gateway Intelligence"
      pageDescription="Edge-level API performance and traffic volume analytics"
      pageHeaderAction={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <IconLayoutDashboard className="h-4 w-4" /> Endpoint List
          </Button>
          <Button size="sm" className="h-9 gap-2 shadow-lg shadow-primary/20" onClick={() => window.location.reload()}>
            <IconRefresh className="h-4 w-4" /> Force Sync
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
          { label: 'Total Volume', value: '22,560', sub: 'Last 24h', icon: IconActivity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Response Delta', value: '142ms', sub: 'P95: 210ms', icon: IconBolt, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Failure Ratio', value: '0.8%', sub: 'Healthy < 1%', icon: IconFlame, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Ingress RPS', value: '261', sub: 'Peak: 315', icon: IconNetwork, color: 'text-purple-500', bg: 'bg-purple-500/10' }
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
                  <LineChart data={apiPerformanceData}>
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
                  <BarChart data={endpointPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="endpoint" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                    <Bar dataKey="avgTime" name="Mean Time (ms)" radius={[6, 6, 0, 0]}>
                      {endpointPerformanceData.map((entry, index) => (
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
              {endpointPerformanceData.map((endpoint, index) => {
                const style = statusStyles[endpoint.status];
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
                        className="h-8 border-border/20 hover:bg-white/10 gap-1.5 px-3"
                        onClick={() => console.log('View', endpoint.endpoint)}
                      >
                        <IconEye className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-black uppercase">Inspect</span>
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
              <div className="flex items-start gap-4 p-4 rounded-2xl border border-red-500/10 bg-red-500/5 transition-all hover:bg-red-500/10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-500 shadow-inner">
                  <IconAlertTriangle className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                     <h4 className="text-sm font-black uppercase tracking-tight text-red-500">500 | Internal Server Triage</h4>
                     <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-[9px] font-black uppercase">Critical</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ingress failure at <span className="font-mono text-foreground font-bold">/api/host-applications</span> - 150+ occurrences in 15m.
                  </p>
                  <p className="text-[10px] font-bold text-red-400/60 uppercase tracking-widest mt-2">Triggered 2m ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl border border-amber-500/10 bg-amber-500/5 transition-all hover:bg-amber-500/10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500 shadow-inner">
                  <IconBolt className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                     <h4 className="text-sm font-black uppercase tracking-tight text-amber-500">408 | Request Timeout Delta</h4>
                     <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] font-black uppercase">Warning</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Network timeout at <span className="font-mono text-foreground font-bold">/api/payments</span> - Stripe intent handshake stalled.
                  </p>
                  <p className="text-[10px] font-bold text-amber-400/60 uppercase tracking-widest mt-2">Detected 5m ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      </motion.div>
    </PageContainer>
  );
}

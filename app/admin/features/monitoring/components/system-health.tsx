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
  IconEye,
  IconRefresh,
  IconAlertTriangle,
  IconCircleCheck,
  IconActivity,
  IconCpu,
  IconDatabase,
  IconMail,
  IconBolt,
  IconServer,
  IconArrowUpRight,
  IconArrowDownRight,
  IconLayoutDashboard
} from '@tabler/icons-react';
import PageContainer from '@/app/admin/components/layout/page-container';
import { cn } from '@/app/admin/lib/utils';

interface Service {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  responseTime: number;
  lastChecked: string;
  icon: any;
}

const services: Service[] = [
  {
    id: '1',
    name: 'Main API Gateway',
    status: 'healthy',
    uptime: '15d 8h',
    responseTime: 120,
    lastChecked: new Date().toISOString(),
    icon: IconActivity
  },
  {
    id: '2',
    name: 'Primary Database (Postgres)',
    status: 'healthy',
    uptime: '22d 5h',
    responseTime: 85,
    lastChecked: new Date().toISOString(),
    icon: IconDatabase
  },
  {
    id: '3',
    name: 'Redis Cache Layer',
    status: 'warning',
    uptime: '10d 2h',
    responseTime: 450,
    lastChecked: new Date().toISOString(),
    icon: IconBolt
  },
  {
    id: '4',
    name: 'SMTP Email Service',
    status: 'healthy',
    uptime: '8d 12h',
    responseTime: 250,
    lastChecked: new Date().toISOString(),
    icon: IconMail
  }
];

const kpis = [
  {
    label: "Network Latency",
    value: "124ms",
    trend: "Optimal",
    trendColor: "text-emerald-500",
    icon: IconActivity,
    bg: "bg-emerald-500/10",
    color: "text-emerald-500"
  },
  {
    label: "Uptime Score",
    value: "99.98%",
    trend: "+0.02%",
    trendColor: "text-emerald-500",
    icon: IconCircleCheck,
    bg: "bg-blue-500/10",
    color: "text-blue-500"
  },
  {
    label: "Active Load",
    value: "42.5%",
    trend: "Stable",
    trendColor: "text-muted-foreground",
    icon: IconCpu,
    bg: "bg-purple-500/10",
    color: "text-purple-500"
  },
  {
    label: "Alerts (24h)",
    value: "3",
    trend: "1 Pending",
    trendColor: "text-amber-500",
    icon: IconAlertTriangle,
    bg: "bg-amber-500/10",
    color: "text-amber-500"
  }
];

const statusStyles = {
  healthy: {
    badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    icon: 'text-emerald-500',
    bg: 'bg-emerald-500/5',
    pill: 'bg-emerald-500'
  },
  warning: {
    badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    icon: 'text-amber-500',
    bg: 'bg-amber-500/5',
    pill: 'bg-amber-500'
  },
  critical: {
    badge: 'bg-red-500/10 text-red-500 border-red-500/20',
    icon: 'text-red-500',
    bg: 'bg-red-500/5',
    pill: 'bg-red-500'
  }
};

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

export function SystemHealth() {
  return (
    <PageContainer
      pageTitle="Sentinel System Health"
      pageDescription="Real-time infrastructure telemetry and autonomous system monitoring"
      pageHeaderAction={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <IconLayoutDashboard className="h-4 w-4" /> Export Logs
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
        {/* Telemetry Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                  <div className="mt-1 flex items-center space-x-1">
                    <span className={cn("text-[10px] font-bold uppercase", stat.trendColor)}>{stat.trend}</span>
                    <span className="text-[10px] text-muted-foreground/60 tracking-tighter">Current Status</span>
                  </div>
                </CardContent>
                <div className={cn("absolute bottom-0 left-0 h-1 w-full opacity-30", stat.bg.replace('/10', ''))} />
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Infrastructure Core */}
          <motion.div variants={item} className="lg:col-span-2">
            <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black">Infrastructure Core</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Live heartbeat of critical system components</CardDescription>
                </div>
                <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 font-black uppercase tracking-widest text-[9px]">
                  All Systems Operational
                </Badge>
              </CardHeader>
              <CardContent className="px-0">
                <div className="divide-y divide-border/20">
                  {services.map((service) => {
                    const style = statusStyles[service.status];
                    const IconComp = service.icon;
                    return (
                      <div key={service.id} className="group relative flex flex-col gap-4 p-6 transition-all hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner transition-transform group-hover:scale-110", style.bg)}>
                            <IconComp className={cn("h-6 w-6", style.icon)} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold tracking-tight text-base">{service.name}</h3>
                              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-border/20 bg-muted/20">
                                <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", style.pill)} />
                                <span className={cn("text-[9px] font-black uppercase tracking-wider", style.icon)}>{service.status}</span>
                              </div>
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
                              <span className="flex items-center gap-1"><IconActivity className="h-3 w-3" /> {service.uptime} uptime</span>
                              <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                              <span className="flex items-center gap-1 font-mono">{service.responseTime}ms ping</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-6 sm:justify-end">
                           <div className="hidden text-right sm:block">
                              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Last Synced</p>
                              <p className="text-xs font-mono font-bold">{new Date(service.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                           </div>
                           <Button variant="outline" size="sm" className="h-9 border-border/40 hover:bg-white/10 gap-2">
                             <IconEye className="h-4 w-4" /> Telemetry
                           </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="space-y-6">
            {/* System Performance Progress */}
            <motion.div variants={item}>
              <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                   <div>
                      <CardTitle className="text-base font-black">Performance</CardTitle>
                      <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Global Resource Allocation</CardDescription>
                   </div>
                   <IconServer className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { label: 'CPU Cluster', value: 65, color: 'bg-blue-500', icon: IconCpu },
                    { label: 'Memory', value: 82, color: 'bg-emerald-500', icon: IconServer },
                    { label: 'Disk I/O', value: 45, color: 'bg-amber-500', icon: IconDatabase }
                  ].map((metric) => (
                    <div key={metric.label} className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider">
                        <span className="flex items-center gap-2"><metric.icon className="h-3 w-3" /> {metric.label}</span>
                        <span className="font-mono text-muted-foreground">{metric.value}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5 border border-white/5">
                        <motion.div 
                          className={cn("h-full", metric.color)}
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.value}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Incident Ledger */}
            <motion.div variants={item}>
              <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between">
                   <div>
                      <CardTitle className="text-base font-black">Incident Ledger</CardTitle>
                      <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Recent detected anomalies</CardDescription>
                   </div>
                   <IconAlertTriangle className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-3">
                  <div className="space-y-3">
                     {[
                       { title: 'Cluster Memory Peak', time: '12m ago', desc: 'Node 04 reached 89% peak', color: 'text-red-500', bg: 'bg-red-500/10' },
                       { title: 'Partial CDN Latency', time: '45m ago', desc: 'SEA nodes reporting +150ms delta', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                       { title: 'Database Cold Boot', time: '1h ago', desc: 'Replica instance successfully rotated', color: 'text-blue-500', bg: 'bg-blue-500/10' }
                     ].map((alert, i) => (
                       <div key={i} className="flex gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 transition-all hover:bg-white/10">
                          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-inner", alert.bg)}>
                             <IconAlertTriangle className={cn("h-4 w-4", alert.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between mb-0.5">
                                <h4 className="text-[11px] font-black uppercase truncate">{alert.title}</h4>
                                <span className="text-[9px] font-mono text-muted-foreground shrink-0">{alert.time}</span>
                             </div>
                             <p className="text-[10px] text-muted-foreground line-clamp-1">{alert.desc}</p>
                          </div>
                       </div>
                     ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </PageContainer>
  );
}

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
  IconLayoutDashboard,
  IconCircleX,
  IconInfoCircle
} from '@tabler/icons-react';
import PageContainer from '@/app/admin/components/layout/page-container';
import { cn } from '@/app/admin/lib/utils';
import { toast } from 'sonner';

interface Service {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  responseTime: number;
  lastChecked: string;
}

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'healthy' | 'warning' | 'critical' | 'info';
  timestamp: string;
}

interface HealthData {
  services: Service[];
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    diskSpace: number;
  };
  alerts: Alert[];
}

const statusStyles = {
  healthy: {
    badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    icon: 'text-emerald-500',
    bg: 'bg-emerald-500/5',
    pill: 'bg-emerald-500',
    Icon: IconCircleCheck
  },
  warning: {
    badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    icon: 'text-amber-500',
    bg: 'bg-amber-500/5',
    pill: 'bg-amber-500',
    Icon: IconAlertTriangle
  },
  critical: {
    badge: 'bg-red-500/10 text-red-500 border-red-500/20',
    icon: 'text-red-500',
    bg: 'bg-red-500/5',
    pill: 'bg-red-500',
    Icon: IconCircleX
  },
  info: {
    badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    icon: 'text-blue-500',
    bg: 'bg-blue-500/5',
    pill: 'bg-blue-500',
    Icon: IconInfoCircle
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

const getServiceIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('api') || lower.includes('gateway')) return IconActivity;
  if (lower.includes('database') || lower.includes('postgres') || lower.includes('mongo')) return IconDatabase;
  if (lower.includes('cache') || lower.includes('redis')) return IconBolt;
  if (lower.includes('email') || lower.includes('smtp')) return IconMail;
  return IconServer;
};

export function SystemHealth() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealthData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch('/api/admin/monitoring/health');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error('Failed to fetch system health');
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
      toast.error('An error occurred while fetching system health');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(() => fetchHealthData(true), 300000); 
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse font-black uppercase tracking-widest text-[10px]">Synchronizing Sentinel Telemetry...</p>
      </div>
    );
  }

  const services = data?.services || [];
  const performance = data?.performance || { cpuUsage: 0, memoryUsage: 0, diskSpace: 0 };
  const alerts = data?.alerts || [];

  const kpis = [
    {
      label: "Total Services",
      value: services.length.toString(),
      trend: "All Connected",
      trendColor: "text-emerald-500",
      icon: IconServer,
      bg: "bg-blue-500/10",
      color: "text-blue-500"
    },
    {
      label: "Healthy Nodes",
      value: services.filter(s => s.status === 'healthy').length.toString(),
      trend: "Optimal",
      trendColor: "text-emerald-500",
      icon: IconCircleCheck,
      bg: "bg-emerald-500/10",
      color: "text-emerald-500"
    },
    {
      label: "System Load",
      value: `${performance.cpuUsage}%`,
      trend: performance.cpuUsage > 80 ? "Critical" : "Stable",
      trendColor: performance.cpuUsage > 80 ? "text-red-500" : "text-muted-foreground",
      icon: IconCpu,
      bg: "bg-purple-500/10",
      color: "text-purple-500"
    },
    {
      label: "Active Alerts",
      value: alerts.length.toString(),
      trend: alerts.some(a => a.severity === 'critical') ? "Action Required" : "No Critical Incidents",
      trendColor: alerts.some(a => a.severity === 'critical') ? "text-red-500" : "text-amber-500",
      icon: IconAlertTriangle,
      bg: "bg-amber-500/10",
      color: "text-amber-500"
    }
  ];

  return (
    <PageContainer
      pageTitle="Sentinel System Health"
      pageDescription="Real-time infrastructure telemetry and autonomous system monitoring"
      pageHeaderAction={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2 font-black uppercase text-[10px] tracking-widest">
            <IconLayoutDashboard className="h-4 w-4" /> Export Logs
          </Button>
          <Button 
            size="sm" 
            className="h-9 gap-2 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest" 
            onClick={() => fetchHealthData(true)}
            disabled={refreshing}
          >
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
                <Badge variant="outline" className={cn(
                  "font-black uppercase tracking-widest text-[9px]",
                  services.every(s => s.status === 'healthy') 
                    ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" 
                    : "bg-amber-500/5 text-amber-500 border-amber-500/20"
                )}>
                  {services.every(s => s.status === 'healthy') ? 'All Systems Operational' : 'Degraded Performance Detected'}
                </Badge>
              </CardHeader>
              <CardContent className="px-0">
                <div className="divide-y divide-border/20">
                  {services.map((service) => {
                    const style = statusStyles[service.status] || statusStyles.info;
                    const IconComp = getServiceIcon(service.name);
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
                           <Button variant="outline" size="sm" className="h-9 border-border/40 hover:bg-white/10 gap-2 font-black uppercase text-[10px] tracking-widest">
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
                    { label: 'CPU Cluster', value: performance.cpuUsage, color: 'bg-blue-500', icon: IconCpu },
                    { label: 'Memory Load', value: performance.memoryUsage, color: 'bg-emerald-500', icon: IconServer },
                    { label: 'Storage Cap', value: performance.diskSpace, color: 'bg-amber-500', icon: IconDatabase }
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
                  <div className="space-y-3 pb-3">
                     {alerts.length > 0 ? alerts.map((alert, i) => {
                       const style = statusStyles[alert.severity as keyof typeof statusStyles] || statusStyles.info;
                       return (
                        <div key={alert.id} className="flex gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 transition-all hover:bg-white/10">
                           <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-inner", style.bg)}>
                              <style.Icon className={cn("h-4 w-4", style.icon)} />
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                 <h4 className="text-[11px] font-black uppercase truncate">{alert.title}</h4>
                                 <span className="text-[9px] font-mono text-muted-foreground shrink-0">
                                   {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                 </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground line-clamp-1">{alert.description}</p>
                           </div>
                        </div>
                       );
                     }) : (
                       <div className="text-center py-6">
                         <IconCircleCheck className="w-8 h-8 text-emerald-500/20 mx-auto mb-2" />
                         <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">No anomalies detected in the last 24h</p>
                       </div>
                     )}
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

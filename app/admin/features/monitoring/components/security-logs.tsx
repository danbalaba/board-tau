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
  IconShieldLock,
  IconRefresh,
  IconEye,
  IconAlertTriangle,
  IconWorld,
  IconUserSearch,
  IconLogin,
  IconLockAccess,
  IconSettingsAutomation,
  IconDatabaseExport,
  IconFingerprint,
  IconLayoutDashboard
} from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';
import PageContainer from '@/app/admin/components/layout/page-container';
import { toast } from 'sonner';

type Severity = 'low' | 'medium' | 'high' | 'critical';
type EventType = 'login' | 'failed-login' | 'data-access' | 'unauthorized-access' | 'security-scan' | 'configuration-change';

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: EventType;
  severity: Severity;
  user: string;
  ip: string;
  location: string;
  details: string;
}

interface SecurityData {
  summary: {
    totalEvents: number;
    highSeverity: number;
    failedLogins: number;
    securityScans: number;
  };
  events: SecurityEvent[];
  topCountries: { name: string; count: number; risk: 'low' | 'medium' | 'high' }[];
  distribution: { type: string; count: number }[];
  topUsers: { name: string; count: number; risk: 'low' | 'medium' | 'high' }[];
}

const severityStyles: Record<Severity, { badge: string; color: string; bg: string }> = {
  low: {
    badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/5'
  },
  medium: {
    badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    color: 'text-amber-500',
    bg: 'bg-amber-500/5'
  },
  high: {
    badge: 'bg-red-500/10 text-red-500 border-red-500/20',
    color: 'text-red-500',
    bg: 'bg-red-500/5'
  },
  critical: {
    badge: 'bg-red-600/20 text-red-600 border-red-600/30',
    color: 'text-red-600',
    bg: 'bg-red-600/10'
  }
};

const eventIcons: Record<string, any> = {
  'login': IconLogin,
  'failed-login': IconLockAccess,
  'data-access': IconDatabaseExport,
  'unauthorized-access': IconShieldLock,
  'security-scan': IconFingerprint,
  'configuration-change': IconSettingsAutomation
};

const riskBadgeColors: Record<string, 'default' | 'secondary' | 'destructive'> = {
  low: 'default',
  medium: 'secondary',
  high: 'destructive'
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

export function SecurityLogs() {
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch('/api/admin/monitoring/security');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error('Failed to fetch security logs');
      }
    } catch (error) {
      console.error('Error fetching security logs:', error);
      toast.error('An error occurred while fetching security data');
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
        <p className="text-muted-foreground animate-pulse font-black uppercase tracking-widest text-[10px]">Assembling Infra Guard Audit...</p>
      </div>
    );
  }

  if (!data) return null;

  const { summary, events, topCountries, distribution, topUsers } = data;

  const kpis = [
    { label: 'Total Audit Log', value: summary.totalEvents.toString(), trend: 'Last 24h', icon: IconFingerprint, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Threat Vectors', value: summary.highSeverity.toString(), trend: 'Requires Triage', icon: IconShieldLock, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Failed Access', value: summary.failedLogins.toString(), trend: 'Auth Anomalies', icon: IconLockAccess, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Shield Scans', value: summary.securityScans.toString(), trend: '100% Surface', icon: IconSettingsAutomation, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
  ];

  return (
    <PageContainer
      pageTitle="Infra Guard Audit"
      pageDescription="Global security audit trail and autonomous threat detection stream"
      pageHeaderAction={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2 font-black uppercase text-[10px] tracking-widest">
            <IconLayoutDashboard className="h-4 w-4" /> Policy Center
          </Button>
          <Button size="sm" className="h-9 gap-2 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest" onClick={() => fetchData(true)} disabled={refreshing}>
            <IconRefresh className={cn("h-4 w-4", refreshing && "animate-spin")} /> Audit Scan
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

        <motion.div variants={item}>
          <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl font-black">Autonomous Audit Stream</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Global security activity in chronological sequence</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="divide-y divide-border/20">
                {events.length > 0 ? events.map((event) => {
                  const style = severityStyles[event.severity] || severityStyles.low;
                  const IconComp = eventIcons[event.type] || IconFingerprint;
                  return (
                     <div key={event.id} className="group relative flex items-start gap-4 p-6 transition-all hover:bg-white/5">
                      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner transition-transform group-hover:scale-110", style.bg)}>
                        <IconComp className={cn("h-6 w-6", style.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <h4 className="text-base font-black tracking-tight uppercase">{event.type.replace('-', ' ')}</h4>
                             <Badge variant="outline" className={cn("text-[9px] font-black uppercase px-2", style.badge)}>
                               {event.severity} Severity
                             </Badge>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-muted-foreground/60">{new Date(event.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-foreground/80 font-medium">
                          <span className="flex items-center gap-1.5"><IconUserSearch className="h-3.5 w-3.5 text-muted-foreground" /> {event.user}</span>
                          <span className="h-1 w-1 rounded-full bg-border" />
                          <span className="flex items-center gap-1.5 font-mono text-muted-foreground">{event.ip}</span>
                          <span className="h-1 w-1 rounded-full bg-border" />
                          <span className="flex items-center gap-1.5"><IconWorld className="h-3.5 w-3.5 text-muted-foreground" /> {event.location}</span>
                        </div>
                        <p className="text-sm text-muted-foreground/80 mt-2 leading-relaxed italic border-l-2 border-border/40 pl-3">"{event.details}"</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 border-border/20 hover:bg-white/10 gap-2 px-4 shrink-0 font-black uppercase text-[10px] tracking-widest"
                      >
                        <IconEye className="h-4 w-4" />
                        Inspect
                      </Button>
                     </div>
                  );
                }) : (
                  <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10 mx-6">
                     <IconShieldLock className="w-8 h-8 text-white/10 mx-auto mb-2" />
                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">No security events recorded in this period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={item}>
            <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md overflow-hidden h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                 <div>
                    <CardTitle className="text-base font-black uppercase tracking-tight">Geographic Origin</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Events by top regions</CardDescription>
                 </div>
                 <IconWorld className="h-5 w-5 text-muted-foreground/50" />
              </CardHeader>
              <CardContent className="space-y-3 pb-6">
                {topCountries.map((origin) => (
                  <div key={origin.name} className="group space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                      <span>{origin.name}</span>
                      <span className="font-mono text-muted-foreground">{origin.count} hits</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5 border border-white/5">
                      <motion.div 
                        className={cn("h-full", origin.risk === 'high' ? 'bg-red-500' : origin.risk === 'medium' ? 'bg-amber-500' : 'bg-emerald-500')}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.min(100, (origin.count / (topCountries[0]?.count || 1)) * 100)}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md overflow-hidden h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                 <div>
                    <CardTitle className="text-base font-black uppercase tracking-tight">Event Taxonomy</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Security event distribution</CardDescription>
                 </div>
                 <IconFingerprint className="h-5 w-5 text-muted-foreground/50" />
              </CardHeader>
              <CardContent className="space-y-3 pb-6">
                {distribution.map((type) => (
                  <div key={type.type} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 transition-all hover:bg-white/10">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground truncate max-w-[140px]">{type.type}</span>
                    <Badge variant="outline" className="text-[10px] font-black border-none px-2 bg-primary/10 text-primary">
                      {type.count}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md overflow-hidden h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                 <div>
                    <CardTitle className="text-base font-black uppercase tracking-tight">Vulnerability Vector</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Priority identities by volume</CardDescription>
                 </div>
                 <IconUserSearch className="h-5 w-5 text-muted-foreground/50" />
              </CardHeader>
              <CardContent className="space-y-3 pb-6">
                {topUsers.map((user) => (
                  <div key={user.name} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 transition-all hover:bg-white/10">
                    <span className="text-[10px] font-black tracking-wider text-muted-foreground truncate max-w-[140px]">{user.name}</span>
                    <Badge variant="outline" className={cn("text-[10px] font-black border-none px-2", 
                      user.risk === 'high' ? 'bg-red-500/10 text-red-500' : user.risk === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                    )}>
                      {user.count} ops
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </PageContainer>
  );
}

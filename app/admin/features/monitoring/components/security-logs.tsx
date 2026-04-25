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

type Severity = 'low' | 'medium' | 'high';
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

const securityEvents: SecurityEvent[] = [
  {
    id: '1',
    timestamp: '2024-01-10T11:32:45Z',
    type: 'failed-login',
    severity: 'high',
    user: 'johndoe@example.com',
    ip: '192.168.1.105',
    location: 'New York, NY',
    details: 'Multiple failed login attempts from primary IP range'
  },
  {
    id: '2',
    timestamp: '2024-01-10T11:28:12Z',
    type: 'unauthorized-access',
    severity: 'high',
    user: 'anonymous',
    ip: '45.123.45.67',
    location: 'Moscow, Russia',
    details: 'Attempt to access restricted infra endpoint /admin/config'
  },
  {
    id: '3',
    timestamp: '2024-01-10T11:25:00Z',
    type: 'configuration-change',
    severity: 'medium',
    user: 'admin@boardtau.com',
    ip: '10.0.0.5',
    location: 'San Francisco, CA',
    details: 'Global database cluster configuration updated'
  },
  {
    id: '4',
    timestamp: '2024-01-10T11:20:30Z',
    type: 'data-access',
    severity: 'low',
    user: 'sarah@example.com',
    ip: '172.16.0.23',
    location: 'London, UK',
    details: 'Standard property data export requested and delivered'
  },
  {
    id: '5',
    timestamp: '2024-01-10T11:15:45Z',
    type: 'security-scan',
    severity: 'low',
    user: 'system',
    ip: '10.0.0.1',
    location: 'San Francisco, CA',
    details: 'Daily autonomous security scan completed successfully'
  },
  {
    id: '6',
    timestamp: '2024-01-10T11:10:00Z',
    type: 'login',
    severity: 'low',
    user: 'mike@example.com',
    ip: '192.168.2.45',
    location: 'Chicago, IL',
    details: 'Successful auth from new identified device profile'
  }
];

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
  }
};

const eventIcons: Record<EventType, any> = {
  'login': IconLogin,
  'failed-login': IconLockAccess,
  'data-access': IconDatabaseExport,
  'unauthorized-access': IconShieldLock,
  'security-scan': IconFingerprint,
  'configuration-change': IconSettingsAutomation
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
  return (
    <PageContainer
      pageTitle="Infra Guard Audit"
      pageDescription="Global security audit trail and autonomous threat detection stream"
      pageHeaderAction={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <IconLayoutDashboard className="h-4 w-4" /> Policy Center
          </Button>
          <Button size="sm" className="h-9 gap-2 shadow-lg shadow-primary/20" onClick={() => window.location.reload()}>
            <IconRefresh className="h-4 w-4" /> Audit Scan
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
          { label: 'Total Audit Log', value: '156', trend: '+8% vs T-24', icon: IconFingerprint, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Threat Vectors', value: '23', trend: 'Critical Level', icon: IconShieldLock, color: 'text-red-500', bg: 'bg-red-500/10' },
          { label: 'Failed Access', value: '8', trend: 'Blocked IPs', icon: IconLockAccess, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Shield Scans', value: '4', trend: '100% Surface', icon: IconSettingsAutomation, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
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

      <motion.div variants={item}>
        <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl font-black">Autonomous Audit Stream</CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Global security activity in chronological sequence</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="divide-y divide-border/20">
              {securityEvents.map((event) => {
                const style = severityStyles[event.severity];
                const IconComp = eventIcons[event.type];
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
                      className="h-9 border-border/20 hover:bg-white/10 gap-2 px-4 shrink-0"
                      onClick={() => console.log('View', event.id)}
                    >
                      <IconEye className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase">Inspect</span>
                    </Button>
                   </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={item}>
          <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
               <div>
                  <CardTitle className="text-base font-black uppercase tracking-tight">Geographic Origin</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Events by top 5 regions</CardDescription>
               </div>
               <IconWorld className="h-5 w-5 text-muted-foreground/50" />
            </CardHeader>
            <CardContent className="space-y-3 pb-6">
              {[
                { label: 'United States', value: 85, color: 'bg-emerald-500' },
                { label: 'United Kingdom', value: 24, color: 'bg-blue-500' },
                { label: 'Russia', value: 18, color: 'bg-red-500' },
                { label: 'Canada', value: 12, color: 'bg-slate-500' },
                { label: 'Germany', value: 7, color: 'bg-purple-500' }
              ].map((origin) => (
                <div key={origin.label} className="group space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                    <span>{origin.label}</span>
                    <span className="font-mono text-muted-foreground">{origin.value} hits</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5 border border-white/5">
                    <motion.div 
                      className={cn("h-full", origin.color)}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(origin.value / 85) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
               <div>
                  <CardTitle className="text-base font-black uppercase tracking-tight">Event Taxonomy</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Security event distribution</CardDescription>
               </div>
               <IconFingerprint className="h-5 w-5 text-muted-foreground/50" />
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              {[
                { label: 'Auth Success', value: 45, color: 'text-emerald-500' },
                { label: 'Failed Access', value: 8, color: 'text-red-500' },
                { label: 'Data I/O', value: 32, color: 'text-blue-500' },
                { label: 'Config Shift', value: 18, color: 'text-amber-500' },
                { label: 'Health Scans', value: 4, color: 'text-slate-500' }
              ].map((type) => (
                <div key={type.label} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 transition-all hover:bg-white/10">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{type.label}</span>
                  <Badge variant="outline" className={cn("text-[10px] font-black border-none px-2", type.color.replace('text-', 'bg-') + '/10', type.color)}>
                    {type.value}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
               <div>
                  <CardTitle className="text-base font-black uppercase tracking-tight">Vulnerability Vector</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Priority identities by volume</CardDescription>
               </div>
               <IconUserSearch className="h-5 w-5 text-muted-foreground/50" />
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              {[
                { label: 'admin@boardtau.com', value: 28, color: 'text-emerald-500' },
                { label: 'johndoe@example.com', value: 15, color: 'text-red-500' },
                { label: 'sarah@example.com', value: 12, color: 'text-blue-500' },
                { label: 'mike@example.com', value: 9, color: 'text-slate-500' },
                { label: 'system_root', value: 4, color: 'text-purple-500' }
              ].map((user) => (
                <div key={user.label} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 transition-all hover:bg-white/10">
                  <span className="text-[10px] font-black tracking-wider text-muted-foreground truncate max-w-[140px]">{user.label}</span>
                  <Badge variant="outline" className={cn("text-[10px] font-black border-none px-2", user.color.replace('text-', 'bg-') + '/10', user.color)}>
                    {user.value} ops
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

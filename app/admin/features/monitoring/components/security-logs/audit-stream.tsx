import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import { IconLogin, IconLockAccess, IconDatabaseExport, IconShieldLock, IconFingerprint, IconSettingsAutomation, IconUserSearch, IconWorld, IconEye } from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';

type Severity = 'low' | 'medium' | 'high';
type EventType = 'login' | 'failed-login' | 'data-access' | 'unauthorized-access' | 'security-scan' | 'configuration-change';

const securityEvents = [
  { id: '1', timestamp: '2024-01-10T11:32:45Z', type: 'failed-login' as EventType, severity: 'high' as Severity, user: 'johndoe@example.com', ip: '192.168.1.105', location: 'New York, NY', details: 'Multiple failed login attempts from primary IP range' },
  { id: '2', timestamp: '2024-01-10T11:28:12Z', type: 'unauthorized-access' as EventType, severity: 'high' as Severity, user: 'anonymous', ip: '45.123.45.67', location: 'Moscow, Russia', details: 'Attempt to access restricted infra endpoint /admin/config' },
  { id: '3', timestamp: '2024-01-10T11:25:00Z', type: 'configuration-change' as EventType, severity: 'medium' as Severity, user: 'admin@boardtau.com', ip: '10.0.0.5', location: 'San Francisco, CA', details: 'Global database cluster configuration updated' },
  { id: '4', timestamp: '2024-01-10T11:20:30Z', type: 'data-access' as EventType, severity: 'low' as Severity, user: 'sarah@example.com', ip: '172.16.0.23', location: 'London, UK', details: 'Standard property data export requested and delivered' },
  { id: '5', timestamp: '2024-01-10T11:15:45Z', type: 'security-scan' as EventType, severity: 'low' as Severity, user: 'system', ip: '10.0.0.1', location: 'San Francisco, CA', details: 'Daily autonomous security scan completed successfully' },
  { id: '6', timestamp: '2024-01-10T11:10:00Z', type: 'login' as EventType, severity: 'low' as Severity, user: 'mike@example.com', ip: '192.168.2.45', location: 'Chicago, IL', details: 'Successful auth from new identified device profile' }
];

const severityStyles = {
  low: { badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', color: 'text-emerald-500', bg: 'bg-emerald-500/10', pill: 'bg-emerald-500' },
  medium: { badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20', color: 'text-amber-500', bg: 'bg-amber-500/10', pill: 'bg-amber-500' },
  high: { badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20', color: 'text-rose-500', bg: 'bg-rose-500/10', pill: 'bg-rose-500' }
};

const eventIcons: Record<EventType, any> = {
  'login': IconLogin,
  'failed-login': IconLockAccess,
  'data-access': IconDatabaseExport,
  'unauthorized-access': IconShieldLock,
  'security-scan': IconFingerprint,
  'configuration-change': IconSettingsAutomation
};

export function SecurityAuditStream() {
  return (
    <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl rounded-[2.5rem] overflow-hidden p-2">
      <CardHeader className="p-8 pb-4">
        <CardTitle className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Autonomous Audit Stream</CardTitle>
        <CardDescription className="text-[10px] uppercase font-black text-gray-500 tracking-[0.2em] mt-1">Chronological sequence of security operations</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {securityEvents.map((event) => {
            const style = severityStyles[event.severity];
            const IconComp = eventIcons[event.type];
            return (
               <div key={event.id} className="group relative flex items-start gap-6 p-8 transition-all hover:bg-white/40 dark:hover:bg-gray-800/40">
                <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110", style.bg)}>
                  <IconComp className={cn("h-7 w-7", style.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <h4 className="text-lg font-black tracking-tight uppercase text-gray-900 dark:text-white">{event.type.replace('-', ' ')}</h4>
                       <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm", style.badge)}>
                         <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", style.pill)} />
                         <span className="text-[9px] font-black uppercase tracking-wider">{event.severity}</span>
                       </div>
                    </div>
                    <span className="text-[10px] font-mono font-black text-gray-400 tabular-nums">{new Date(event.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <span className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-100/50 dark:bg-gray-800/50"><IconUserSearch size={14} className="text-violet-500" /> {event.user}</span>
                    <span className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-100/50 dark:bg-gray-800/50 font-mono text-indigo-500 lowercase">{event.ip}</span>
                    <span className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-100/50 dark:bg-gray-800/50"><IconWorld size={14} className="text-blue-500" /> {event.location}</span>
                  </div>
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mt-3 leading-relaxed italic border-l-4 border-violet-500/20 pl-4 py-1">"{event.details}"</p>
                </div>
                <Button variant="outline" className="h-11 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-violet-500 hover:text-white hover:border-violet-500 gap-2 px-6 text-[10px] font-black uppercase tracking-widest transition-all shrink-0 mt-1">
                  <IconEye size={16} /> Inspect
                </Button>
               </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

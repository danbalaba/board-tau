'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/admin/components/ui/card';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import { Eye, RefreshCw, AlertTriangle, ShieldCheck, UserX, Globe, ShieldAlert } from 'lucide-react';
import { Skeleton } from '@/app/admin/components/ui/skeleton';
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

const severityColors: Record<Severity, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  low: 'default',
  medium: 'secondary',
  high: 'destructive',
  critical: 'destructive'
};

const riskBadgeColors: Record<string, 'default' | 'secondary' | 'destructive'> = {
  low: 'default',
  medium: 'secondary',
  high: 'destructive'
};

export function SecurityLogs() {
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    fetchData();
    // Security logs don't need extremely high frequency polling unless under attack
    const interval = setInterval(() => fetchData(true), 120000); // 2 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  const { summary, events, topCountries, distribution, topUsers } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Security Logs</h2>
          <p className="text-muted-foreground">Monitor real-time security events and threat vectors</p>
        </div>
        <Button 
          onClick={() => fetchData(true)} 
          disabled={refreshing}
          variant="outline"
          className="shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center">
              <ShieldCheck className="h-3 w-3 mr-2 text-blue-500" />
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.totalEvents}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase">Last 24 Hours</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center">
              <ShieldAlert className="h-3 w-3 mr-2 text-red-600" />
              High Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{summary.highSeverity}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase">Requires Triage</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center">
              <UserX className="h-3 w-3 mr-2 text-amber-600" />
              Failed Logins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{summary.failedLogins}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase">Auth Failures</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center">
              <Globe className="h-3 w-3 mr-2 text-green-600" />
              Active Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{summary.securityScans}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase">Health Checks</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
        <CardHeader className="bg-muted/20 border-b">
          <CardTitle className="text-base font-bold">Audit & Security Feed</CardTitle>
          <CardDescription>Chronological log of all system security interactions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {events.map((event) => (
              <div key={event.id} className="p-4 hover:bg-muted/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full mt-1 ${
                      event.severity === 'high' || event.severity === 'critical' ? 'bg-red-100 text-red-600' :
                      event.severity === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                    }`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-foreground capitalize">
                          {event.type.replace('-', ' ')}
                        </h4>
                        <Badge variant={severityColors[event.severity]} className="text-[9px] px-1.5 h-4 uppercase tracking-tighter">
                          {event.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">
                        <span className="text-foreground font-bold">{event.user}</span> • {event.ip} • <span className="italic">{event.location}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground bg-muted/50 p-2 rounded border mt-2 font-mono">
                        {event.details}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end space-y-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(event.timestamp).toLocaleString()}</span>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest">
                      <Eye className="h-3 w-3 mr-1" />
                      Trace
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-muted/10 border-t flex justify-center">
            <Button variant="link" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Download Full Security Audit Log (.CSV)
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="bg-muted/10 border-b pb-3 pt-4">
            <CardTitle className="text-sm font-bold flex items-center">
              <Globe className="h-4 w-4 mr-2 text-blue-500" />
              Geographic Vectors
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {topCountries.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs font-medium">{c.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-muted-foreground">{c.count}</span>
                    <Badge variant={riskBadgeColors[c.risk]} className="text-[8px] px-1 h-3.5 uppercase">
                      {c.risk}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="bg-muted/10 border-b pb-3 pt-4">
            <CardTitle className="text-sm font-bold flex items-center">
              <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
              Event Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {distribution.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs font-medium">{d.type}</span>
                  <Badge variant="outline" className="text-[10px] font-bold">{d.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="bg-muted/10 border-b pb-3 pt-4">
            <CardTitle className="text-sm font-bold flex items-center">
              <UserX className="h-4 w-4 mr-2 text-amber-500" />
              High-Risk Identities
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {topUsers.map((u, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs font-medium truncate max-w-[120px]" title={u.name}>{u.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-muted-foreground">{u.count}</span>
                    <Badge variant={riskBadgeColors[u.risk]} className="text-[8px] px-1 h-3.5 uppercase">
                      {u.risk}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


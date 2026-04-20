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
import { Eye, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';
import { Skeleton } from '@/app/admin/components/ui/skeleton';
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

const statusColors = {
  healthy: 'default',
  warning: 'secondary',
  critical: 'destructive',
  info: 'outline'
};

const statusLabels = {
  healthy: 'Healthy',
  warning: 'Warning',
  critical: 'Critical',
  info: 'Info'
};

const statusIcons = {
  healthy: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  critical: <XCircle className="h-5 w-5 text-red-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />
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
    // Auto refresh every 5 minutes to keep it updated without too much load
    const interval = setInterval(() => fetchHealthData(true), 300000); 
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
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const services = data?.services || [];
  const performance = data?.performance || { cpuUsage: 0, memoryUsage: 0, diskSpace: 0 };
  const alerts = data?.alerts || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Health</h2>
          <p className="text-muted-foreground">Real-time status of services and platform infrastructure</p>
        </div>
        <Button 
          onClick={() => fetchHealthData(true)} 
          disabled={refreshing}
          variant="outline"
          className="shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50/30 border-blue-100 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-blue-600">Total Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{services.length}</div>
            <p className="text-xs text-blue-600/70 font-medium mt-1">Platform modules</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50/30 border-green-100 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-green-600">Healthy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {services.filter(s => s.status === 'healthy').length}
            </div>
            <p className="text-xs text-green-600/70 font-medium mt-1">Operational now</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50/30 border-yellow-100 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-yellow-600">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">
              {services.filter(s => s.status === 'warning').length}
            </div>
            <p className="text-xs text-yellow-600/70 font-medium mt-1">Attention needed</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50/30 border-red-100 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-red-600">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">
              {services.filter(s => s.status === 'critical').length}
            </div>
            <p className="text-xs text-red-600/70 font-medium mt-1">System outages</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle>Service Status</CardTitle>
          <CardDescription>Live health checks for all platform dependencies</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-b">
            {services.map((service, index) => (
              <div 
                key={service.id} 
                className={`flex items-center justify-between p-6 hover:bg-muted/10 transition-colors ${index % 2 === 0 ? 'border-r' : ''}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl border ${
                    service.status === 'healthy' ? 'bg-green-50 border-green-100' : 
                    service.status === 'warning' ? 'bg-yellow-50 border-yellow-100' : 
                    'bg-red-50 border-red-100'
                  }`}>
                    {statusIcons[service.status as keyof typeof statusIcons]}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{service.name}</h3>
                    <div className="flex flex-col space-y-1 mt-0.5">
                      <p className="text-[11px] text-muted-foreground font-medium">
                        Uptime: <span className="text-foreground">{service.uptime}</span>
                      </p>
                      {service.responseTime > 0 && (
                        <p className="text-[11px] text-muted-foreground font-medium">
                          Latency: <span className="text-foreground">{service.responseTime}ms</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={statusColors[service.status as keyof typeof statusColors] as any} 
                    className="capitalize px-3 py-0.5"
                  >
                    {statusLabels[service.status as keyof typeof statusLabels]}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-muted/10 flex justify-between items-center text-[10px] text-muted-foreground font-medium uppercase tracking-widest px-6">
            <span>Last global check: {new Date().toLocaleTimeString()}</span>
            <span>All checks verified by BoardTAU Monitor</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-lg">System Performance</CardTitle>
            <CardDescription>Server resource utilization metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold">CPU Utilization</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  performance.cpuUsage > 80 ? 'bg-red-100 text-red-700' : 
                  performance.cpuUsage > 60 ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-blue-100 text-blue-700'
                }`}>
                  {performance.cpuUsage}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                    performance.cpuUsage > 80 ? 'bg-red-500' : 
                    performance.cpuUsage > 60 ? 'bg-yellow-500' : 
                    'bg-blue-500'
                  }`}
                  style={{ width: `${performance.cpuUsage}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold">Memory Load</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  performance.memoryUsage > 85 ? 'bg-red-100 text-red-700' : 
                  performance.memoryUsage > 70 ? 'bg-yellow-100 text-yellow-700' : 
                  'bg-green-100 text-green-700'
                }`}>
                  {performance.memoryUsage}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                    performance.memoryUsage > 85 ? 'bg-red-500' : 
                    performance.memoryUsage > 70 ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`}
                  style={{ width: `${performance.memoryUsage}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold">Storage Capacity</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  {performance.diskSpace}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                    performance.diskSpace > 90 ? 'bg-red-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${performance.diskSpace}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-lg">Recent Health Alerts</CardTitle>
            <CardDescription>Infrastructure & security events</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`flex items-start space-x-4 p-4 rounded-2xl border transition-all ${
                      alert.severity === 'critical' ? 'bg-red-50/50 border-red-100' : 
                      alert.severity === 'warning' ? 'bg-yellow-50/50 border-yellow-100' : 
                      alert.severity === 'info' ? 'bg-blue-50/50 border-blue-100' :
                      'bg-green-50/50 border-green-100'
                    }`}
                  >
                    <div className="mt-1">
                      {statusIcons[alert.severity as keyof typeof statusIcons] || statusIcons.info}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm">{alert.title}</h4>
                        <span className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs mt-1 text-muted-foreground leading-relaxed">{alert.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="font-bold text-lg text-foreground">Systems Nominal</h4>
                  <p className="text-sm text-muted-foreground max-w-[200px] mt-2">All platform components are operating within normal parameters.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


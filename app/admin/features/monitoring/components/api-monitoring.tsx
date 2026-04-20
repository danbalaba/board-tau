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
import { Eye, RefreshCw, AlertTriangle, Activity, Zap, Globe, ShieldAlert } from 'lucide-react';
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
  AreaChart,
  Area
} from 'recharts';
import { Skeleton } from '@/app/admin/components/ui/skeleton';
import { toast } from 'sonner';

interface ApiData {
  summary: {
    totalRequests: number;
    avgResponseTime: number;
    errorRate: number;
    throughput: number;
  };
  performance: { time: string; avgResponse: number; requests: number }[];
  endpoints: {
    endpoint: string;
    avgTime: number;
    errorRate: number;
    status: 'healthy' | 'warning' | 'critical';
  }[];
  errors: {
    id: string;
    type: string;
    endpoint: string;
    occurrences: number;
    lastSeen: string;
    severity: 'warning' | 'critical';
  }[];
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive'> = {
  healthy: 'default',
  warning: 'secondary',
  critical: 'destructive'
};

export function ApiMonitoring() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch('/api/admin/monitoring/api');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error('Failed to fetch API metrics');
      }
    } catch (error) {
      console.error('Error fetching API metrics:', error);
      toast.error('An error occurred while fetching API metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every minute
    const interval = setInterval(() => fetchData(true), 60000);
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary, performance, endpoints, errors } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">API Monitoring</h2>
          <p className="text-muted-foreground">Monitor real-time API traffic and endpoint health</p>
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
        <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
          <div className="h-1 bg-blue-500 w-full" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center">
              <Activity className="h-3 w-3 mr-2" />
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalRequests.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase">Last 24 Hours</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
          <div className="h-1 bg-green-500 w-full" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center">
              <Zap className="h-3 w-3 mr-2" />
              Latency (Avg)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.avgResponseTime} ms</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase">95th Percentile: 205 ms</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
          <div className="h-1 bg-red-500 w-full" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center">
              <ShieldAlert className="h-3 w-3 mr-2" />
              Error Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.errorRate}%</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase">Target: &lt; 1%</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
          <div className="h-1 bg-purple-500 w-full" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center">
              <Globe className="h-3 w-3 mr-2" />
              Throughput
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.throughput}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase">Req / Second</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
          <CardHeader className="bg-muted/20 border-b">
            <CardTitle className="text-base font-bold">Traffic & Latency</CardTitle>
            <CardDescription>Request volume vs. response time</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performance}>
                  <defs>
                    <linearGradient id="colorReqMetrics" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area yAxisId="right" type="monotone" dataKey="requests" name="Total Requests" stroke="#10b981" fillOpacity={1} fill="url(#colorReqMetrics)" />
                  <Line yAxisId="left" type="monotone" dataKey="avgResponse" name="Avg Latency (ms)" stroke="#3b82f6" strokeWidth={3} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
          <CardHeader className="bg-muted/20 border-b">
            <CardTitle className="text-base font-bold">Endpoint Distribution</CardTitle>
            <CardDescription>Response time comparison per route</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={endpoints} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis dataKey="endpoint" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--foreground))', fontWeight: 'bold' }} width={120} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="avgTime" name="Avg Time (ms)" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm ring-1 ring-border overflow-hidden">
          <CardHeader className="bg-muted/20 border-b">
            <CardTitle className="text-base font-bold">Endpoint Status</CardTitle>
            <CardDescription>Real-time availability monitoring</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {endpoints.map((endpoint, index) => (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-muted/5 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-2.5 h-2.5 rounded-full ring-4 ring-offset-2 ${
                      endpoint.status === 'healthy' ? 'bg-green-500 ring-green-500/10' :
                      endpoint.status === 'warning' ? 'bg-yellow-500 ring-yellow-500/10' : 'bg-red-500 ring-red-500/10'
                    }`}></div>
                    <div>
                      <h3 className="text-sm font-bold">{endpoint.endpoint}</h3>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase">
                        Latency: {endpoint.avgTime}ms • Failures: {endpoint.errorRate}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={statusColors[endpoint.status]} className="text-[10px] px-2 py-0">
                      {endpoint.status.toUpperCase()}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
          <CardHeader className="bg-muted/20 border-b">
            <CardTitle className="text-base font-bold">Anomalies & Errors</CardTitle>
            <CardDescription>Identified API issues</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {errors.map((error) => (
                <div key={error.id} className={`p-4 rounded-xl border ${
                  error.severity === 'critical' ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'
                }`}>
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                      error.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                    <div className="flex-1">
                      <h4 className={`text-sm font-bold ${
                        error.severity === 'critical' ? 'text-red-900' : 'text-yellow-900'
                      }`}>{error.type}</h4>
                      <p className={`text-[10px] mt-1 font-bold uppercase opacity-70 ${
                        error.severity === 'critical' ? 'text-red-700' : 'text-yellow-700'
                      }`}>{error.endpoint}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[9px] font-bold opacity-60 uppercase">{error.occurrences} Events</span>
                        <span className="text-[9px] font-bold opacity-60 uppercase">{error.lastSeen}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" className="w-full text-[10px] font-bold uppercase tracking-widest border-dashed h-10 mt-2">
                View All Error Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


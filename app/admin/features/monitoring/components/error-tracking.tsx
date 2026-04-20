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
import { Eye, RefreshCw, AlertTriangle, ShieldX, Activity, CheckCircle2 } from 'lucide-react';
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
import { Skeleton } from '@/app/admin/components/ui/skeleton';
import { toast } from 'sonner';

interface ErrorData {
  summary: {
    totalErrors: number;
    criticalErrors: number;
    errorRate: number;
    resolutionRate: number;
  };
  trends: { time: string; count: number; highSeverity: number }[];
  distribution: { name: string; value: number; color: string }[];
  recent: {
    id: string;
    errorType: string;
    message: string;
    stackTrace: string;
    occurrences: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
    lastOccurred: string;
  }[];
}

const severityColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  critical: 'destructive',
  high: 'destructive',
  medium: 'secondary',
  low: 'default'
};

export function ErrorTracking() {
  const [data, setData] = useState<ErrorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch('/api/admin/monitoring/errors');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error('Failed to fetch error metrics');
      }
    } catch (error) {
      console.error('Error fetching error metrics:', error);
      toast.error('An error occurred while fetching error tracking data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every minute to stay updated on new incidents
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

  const { summary, trends, distribution, recent } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Error Tracking</h2>
          <p className="text-muted-foreground">Monitor system anomalies and exception trends</p>
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
              <Activity className="h-3 w-3 mr-2 text-red-500" />
              Total Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.totalErrors}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase">Last 24 Hours</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center">
              <ShieldX className="h-3 w-3 mr-2 text-red-600" />
              Critical Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{summary.criticalErrors}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase">Immediate Action Req.</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center">
              <AlertTriangle className="h-3 w-3 mr-2 text-amber-500" />
              Error Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.errorRate}%</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase">Threshold: 1.0%</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-2 text-green-500" />
              Resolution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{summary.resolutionRate}%</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium uppercase">Solved by dev team</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
          <CardHeader className="bg-muted/20 border-b">
            <CardTitle className="text-base font-bold">Exception Trends</CardTitle>
            <CardDescription>Error volume over the last 3 hours</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="count" name="Total Errors" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={16} />
                  <Bar dataKey="highSeverity" name="High Severity" fill="#991b1b" radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
          <CardHeader className="bg-muted/20 border-b">
            <CardTitle className="text-base font-bold">Error Distribution</CardTitle>
            <CardDescription>Breakdown by failure category</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
        <CardHeader className="bg-muted/20 border-b">
          <CardTitle className="text-base font-bold">Recent Incident Log</CardTitle>
          <CardDescription>Latest unique errors captured by the system</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recent.map((error) => (
              <div key={error.id} className="p-5 hover:bg-muted/5 transition-colors group">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg mt-0.5 ${
                      error.severity === 'critical' || error.severity === 'high' ? 'bg-red-100' : 'bg-amber-100'
                    }`}>
                      <AlertTriangle className={`h-4 w-4 ${
                        error.severity === 'critical' || error.severity === 'high' ? 'text-red-700' : 'text-amber-700'
                      }`} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-bold text-foreground group-hover:text-blue-600 transition-colors">
                          {error.errorType}
                        </h4>
                        <Badge variant={severityColors[error.severity]} className="text-[9px] px-1.5 h-4 uppercase tracking-tighter">
                          {error.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">{error.message}</p>
                      <code className="block text-[10px] bg-muted px-2 py-1 rounded mt-2 border text-muted-foreground overflow-x-auto whitespace-nowrap">
                        {error.stackTrace}
                      </code>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-[10px] font-bold">
                        {error.occurrences} EVENTS
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{error.lastOccurred}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-muted/10 border-t flex justify-center">
            <Button variant="link" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              View Extended Error Audit Log
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


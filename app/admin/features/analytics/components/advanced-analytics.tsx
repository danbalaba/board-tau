'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/admin/components/ui/select';
import { Switch } from '@/app/admin/components/ui/switch';
import { Label } from '@/app/admin/components/ui/label';
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
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { Skeleton } from '@/app/admin/components/ui/skeleton';
import { toast } from 'sonner';
import { Download, RefreshCw, TrendingUp, TrendingDown, Users, DollarSign, Calendar, MapPin } from 'lucide-react';

interface AnalyticsData {
  summary: {
    revenue: number;
    bookings: number;
    activeUsers: number;
    avgValue: number;
    trends: {
      revenue: string;
      bookings: string;
      users: string;
      avgValue: string;
    }
  };
  revenueTrends: { name: string; revenue: number; bookings: number }[];
  propertyTypeData: { name: string; value: number; color: string }[];
  locationData: { name: string; value: number; color: string }[];
  performanceData: { subject: string; value: number; fullMark: number }[];
  topProperties: { name: string; location: string; occupancy: number; rating: string }[];
  popularLocations: { name: string; bookings: number; growth: number }[];
}

export function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await fetch(`/api/admin/analytics/advanced?range=${timeRange}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error('Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('An error occurred while fetching analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => fetchData(true), 60000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, timeRange]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[350px] w-full rounded-xl" />
          <Skeleton className="h-[350px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Advanced Analytics</h2>
          <p className="text-muted-foreground">Comprehensive business intelligence across the platform</p>
        </div>
        <div className="flex items-center space-x-3 bg-muted/30 p-1.5 rounded-lg border">
          <div className="flex items-center space-x-2 px-2">
            <Switch
              id="autoRefresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              className="scale-90"
            />
            <Label htmlFor="autoRefresh" className="text-xs font-bold uppercase tracking-widest cursor-pointer">
              Live
            </Label>
          </div>
          <div className="w-px h-4 bg-border" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger id="timeRange" className="w-[140px] h-8 text-xs font-bold uppercase border-none shadow-none focus:ring-0">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => fetchData(true)} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center">
              <DollarSign className="h-3 w-3 mr-2 text-emerald-500" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.summary.revenue.toLocaleString()}</div>
            <div className={`flex items-center mt-2 text-xs font-bold ${data.summary.trends.revenue.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
              {data.summary.trends.revenue.startsWith('+') ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {data.summary.trends.revenue}
              <span className="ml-1.5 text-muted-foreground font-normal">vs prev.</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center">
              <Calendar className="h-3 w-3 mr-2 text-blue-500" />
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.bookings.toLocaleString()}</div>
            <div className={`flex items-center mt-2 text-xs font-bold ${data.summary.trends.bookings.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
              {data.summary.trends.bookings.startsWith('+') ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {data.summary.trends.bookings}
              <span className="ml-1.5 text-muted-foreground font-normal">vs prev.</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center">
              <Users className="h-3 w-3 mr-2 text-amber-500" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.activeUsers.toLocaleString()}</div>
            <div className={`flex items-center mt-2 text-xs font-bold ${data.summary.trends.users.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
              {data.summary.trends.users.startsWith('+') ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {data.summary.trends.users}
              <span className="ml-1.5 text-muted-foreground font-normal">vs prev.</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-2 text-purple-500" />
              Avg Booking Val
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.summary.avgValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div className={`flex items-center mt-2 text-xs font-bold ${data.summary.trends.avgValue.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
              {data.summary.trends.avgValue.startsWith('+') ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {data.summary.trends.avgValue}
              <span className="ml-1.5 text-muted-foreground font-normal">vs prev.</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 border-b bg-muted/10">
          <div>
            <CardTitle className="text-base font-bold">Revenue & Volume Dynamics</CardTitle>
            <CardDescription>Performance trends across the selected timeframe</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs font-bold uppercase tracking-widest">
            <Download className="h-3.5 w-3.5 mr-2" />
            Export Data
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.revenueTrends}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600 }}
                  tickMargin={12}
                />
                <YAxis 
                  yAxisId="left" 
                  orientation="left" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600 }}
                  tickFormatter={(v) => `$${v}`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }} />
                <Bar yAxisId="left" dataKey="revenue" fill="hsl(var(--primary))" name="Revenue ($)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="bookings" fill="#82ca9d" name="Bookings" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="border-b bg-muted/10 pb-4">
            <CardTitle className="text-sm font-bold">Inventory Segmentation</CardTitle>
            <CardDescription>Property counts by asset class</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.propertyTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.propertyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  />
                  <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="border-b bg-muted/10 pb-4">
            <CardTitle className="text-sm font-bold">Regional Distribution</CardTitle>
            <CardDescription>Top performing neighborhoods by asset density</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.locationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.locationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  />
                  <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-none shadow-sm ring-1 ring-border">
          <CardHeader className="border-b bg-muted/10 pb-4">
            <CardTitle className="text-sm font-bold">Platform Scorecard</CardTitle>
            <CardDescription>Operational health radar</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data.performanceData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="hsl(var(--primary))"
                    fillOpacity={0.5}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-sm ring-1 ring-border">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/10 pb-4">
            <div>
              <CardTitle className="text-sm font-bold">High Yield Properties</CardTitle>
              <CardDescription>Top assets by booking conversion</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest">
              Explore All
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              {data.topProperties.map((property, index) => (
                <div key={index} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center font-bold text-xs text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{property.name}</p>
                      <div className="flex items-center text-[10px] font-medium text-muted-foreground uppercase mt-0.5">
                        <MapPin className="h-2.5 w-2.5 mr-1" />
                        {property.location}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end space-x-3">
                       <div className="text-right">
                        <p className="text-sm font-bold">{property.occupancy}%</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Occupancy</p>
                       </div>
                       <div className="h-8 w-px bg-border mx-1" />
                       <div className="text-right">
                        <p className="text-sm font-bold text-amber-500">★ {property.rating}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Rating</p>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm ring-1 ring-border overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground pb-6">
          <CardTitle className="text-lg font-bold">Automated Intelligence Reports</CardTitle>
          <CardDescription className="text-primary-foreground/80">Configure smart delivery of business insights</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Report Engine</Label>
              <Select defaultValue="revenue">
                <SelectTrigger className="h-9 font-medium text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Financial Summary</SelectItem>
                  <SelectItem value="occupancy">Occupancy Trends</SelectItem>
                  <SelectItem value="security">Security Audit</SelectItem>
                  <SelectItem value="full">Comprehensive Platform BI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cadence</Label>
              <Select defaultValue="weekly">
                <SelectTrigger className="h-9 font-medium text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily 8:00 AM</SelectItem>
                  <SelectItem value="weekly">Weekly (Monday)</SelectItem>
                  <SelectItem value="monthly">Monthly (1st)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Output Format</Label>
              <Select defaultValue="pdf">
                <SelectTrigger className="h-9 font-medium text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">Professional PDF</SelectItem>
                  <SelectItem value="csv">Raw Dataset (CSV)</SelectItem>
                  <SelectItem value="xlsx">Excel Workbook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Channel</Label>
              <Select defaultValue="email">
                <SelectTrigger className="h-9 font-medium text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Admin Email Feed</SelectItem>
                  <SelectItem value="slack">Slack #bi-reports</SelectItem>
                  <SelectItem value="webhook">Custom Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-end pt-8 gap-3">
             <Button variant="outline" className="text-xs font-bold uppercase tracking-widest px-6">
              Preview
            </Button>
            <Button className="text-xs font-bold uppercase tracking-widest px-8 shadow-lg shadow-primary/20">
              Enable Intelligence Feed
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

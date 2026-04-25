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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import {
  IconActivity,
  IconRefresh,
  IconCalendarStats,
  IconDownload,
  IconCreditCard,
  IconUsers,
  IconChartBar,
  IconTrophy,
  IconLayoutDashboard,
  IconDatabase,
  IconCloud,
  IconSearch,
  IconBolt,
  IconLayersIntersect,
  IconAlertTriangle,
  IconEye,
  IconMapPin,
  IconStar
} from '@tabler/icons-react';
import { cn } from '@/app/admin/lib/utils';
import PageContainer from '@/app/admin/components/layout/page-container';
import { Badge } from '@/app/admin/components/ui/badge';

// Sample data
const revenueData = [
  { name: 'Jan', revenue: 4000, bookings: 2400, users: 1000 },
  { name: 'Feb', revenue: 3000, bookings: 1398, users: 1100 },
  { name: 'Mar', revenue: 2000, bookings: 9800, users: 1200 },
  { name: 'Apr', revenue: 2780, bookings: 3908, users: 1300 },
  { name: 'May', revenue: 1890, bookings: 4800, users: 1400 },
  { name: 'Jun', revenue: 2390, bookings: 3800, users: 1500 },
  { name: 'Jul', revenue: 3490, bookings: 4300, users: 1600 }
];

const propertyTypeData = [
  { name: 'Studio', value: 400, color: 'var(--chart-1)' },
  { name: '1 Bedroom', value: 300, color: 'var(--chart-2)' },
  { name: '2 Bedrooms', value: 300, color: 'var(--chart-3)' },
  { name: '3+ Bedrooms', value: 200, color: 'var(--chart-4)' }
];

const locationData = [
  { name: 'Central Region', value: 650, color: 'var(--chart-1)' },
  { name: 'North Region', value: 450, color: 'var(--chart-2)' },
  { name: 'East Region', value: 550, color: 'var(--chart-3)' },
  { name: 'West Region', value: 350, color: 'var(--chart-4)' },
  { name: 'North-East Region', value: 400, color: 'var(--chart-5)' }
];

const performanceData = [
  { subject: 'Occupancy', value: 95, fullMark: 100 },
  { subject: 'Booking Rate', value: 85, fullMark: 100 },
  { subject: 'Revenue', value: 90, fullMark: 100 },
  { subject: 'Customer Satisfaction', value: 88, fullMark: 100 },
  { subject: 'Response Time', value: 82, fullMark: 100 },
  { subject: 'Cancellation Rate', value: 75, fullMark: 100 }
];

export function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <PageContainer
      pageTitle="Business Intelligence"
      pageDescription="Advanced platform telemetry and predictive analytics dashboard"
      pageHeaderAction={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-card/30 px-3 py-1.5 backdrop-blur-md shadow-inner">
            <Label htmlFor="autoRefresh" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Live Feed
            </Label>
            <Switch
              id="autoRefresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 gap-2 shadow-lg hover:bg-white/5 border-border/40">
            <IconDownload className="h-4 w-4" /> Export Ledger
          </Button>
          <Button size="sm" className="h-9 gap-2 shadow-lg shadow-primary/20" onClick={() => window.location.reload()}>
            <IconRefresh className="h-4 w-4" /> Re-Sync
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">System Nominal</p>
            </div>
            <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-tighter">
              Last calculated: {mounted ? new Date().toLocaleTimeString() : '--:--:--'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <IconCalendarStats className="h-4 w-4 text-muted-foreground/40" />
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger id="timeRange" className="w-[200px] h-9 bg-card/30 border-border/40 shadow-xl backdrop-blur-md font-bold text-xs uppercase tracking-tight">
                <SelectValue placeholder="Time Horizon" />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-xl border-border/40">
                <SelectItem value="24h" className="text-xs uppercase font-bold">Horizon: T-24 Hours</SelectItem>
                <SelectItem value="7d" className="text-xs uppercase font-bold">Horizon: T-7 Days</SelectItem>
                <SelectItem value="30d" className="text-xs uppercase font-bold">Horizon: T-30 Days</SelectItem>
                <SelectItem value="90d" className="text-xs uppercase font-bold">Horizon: T-90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Gross Platform Volume', value: '$128,430', trend: '+12%', icon: IconCreditCard, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Confirmed Bookings', value: '1,248', trend: '+8%', icon: IconChartBar, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Active Edge Users', value: '2,893', trend: '-3%', icon: IconUsers, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Market Share Index', value: '94.2', trend: '+0.4%', icon: IconTrophy, color: 'text-purple-500', bg: 'bg-purple-500/10' }
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="group relative overflow-hidden border-none bg-card/30 backdrop-blur-md shadow-xl transition-all hover:bg-card/40">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
                  <div className={cn("rounded-lg p-2 transition-transform group-hover:scale-110", stat.bg)}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black tracking-tight tabular-nums">{stat.value}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Badge variant="outline" className={cn("text-[9px] font-black uppercase border-none px-1.5 h-4", stat.trend.includes('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500')}>
                      {stat.trend}
                    </Badge>
                    <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">vs prev period</span>
                  </div>
                </CardContent>
                <div className={cn("absolute bottom-0 left-0 h-1 w-full opacity-30", stat.bg.replace('/10', ''))} />
              </Card>
            </motion.div>
          ))}
        </div>

      {/* Revenue vs Bookings */}
      <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black tracking-tight">Revenue Dynamics</CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Comparison of gross platform volume vs booking velocity</CardDescription>
          </div>
          <IconChartBar className="h-5 w-5 text-blue-500 opacity-50" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontWeight: 700 }} />
                <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontWeight: 700 }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontWeight: 700 }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                <Bar yAxisId="left" dataKey="revenue" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="Revenue ($)" />
                <Bar yAxisId="right" dataKey="bookings" fill="var(--chart-2)" radius={[4, 4, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black tracking-tight">Portfolio Allocation</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Inventory distribution by unit typology</CardDescription>
              </div>
              <IconLayoutDashboard className="h-5 w-5 text-emerald-500 opacity-50" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={propertyTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {propertyTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black tracking-tight">Regional Density</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Geographical distribution of active listings</CardDescription>
              </div>
              <IconMapPin className="h-5 w-5 text-amber-500 opacity-50" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={locationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {locationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black tracking-tight">System Performance Metrics</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Comprehensive platform health and satisfaction analysis</CardDescription>
            </div>
            <IconActivity className="h-5 w-5 text-purple-500 opacity-50" />
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={performanceData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontWeight: 700 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} axisLine={false} tick={false} />
                  <Radar
                    name="Performance Score"
                    dataKey="value"
                    stroke="var(--chart-1)"
                    strokeWidth={3}
                    fill="var(--chart-1)"
                    fillOpacity={0.3}
                  />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg font-black tracking-tight">Alpha Properties</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Highest occupancy assets by region</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 border-border/40">
                Full Audit
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Luxury Studio #1', location: 'Central Business District', occupancy: 98, rating: 4.8 },
                  { name: 'Cozy 1 Bedroom', location: 'Tiong Bahru', occupancy: 95, rating: 4.7 },
                  { name: 'Spacious 2 Bedroom', location: 'Holland Village', occupancy: 93, rating: 4.6 },
                  { name: 'Modern Studio', location: 'Bugis', occupancy: 92, rating: 4.5 }
                ].map((property, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 transition-all hover:bg-white/10">
                    <div className="space-y-1">
                      <p className="text-sm font-black tracking-tight uppercase">{property.name}</p>
                      <div className="flex items-center gap-1.5 opacity-60">
                        <IconMapPin className="h-3 w-3" />
                        <p className="text-[10px] font-bold uppercase tracking-tight">{property.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-500 tabular-nums">{property.occupancy}%</p>
                      <div className="flex items-center justify-end gap-1 text-[10px] font-black text-amber-500">
                        <IconStar className="h-3 w-3 fill-amber-500" />
                        {property.rating}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg font-black tracking-tight">Regional Momentum</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Global locations with highest booking velocity</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 border-border/40">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Central Business District', bookings: 284, growth: 15 },
                  { name: 'Tiong Bahru', bookings: 256, growth: 12 },
                  { name: 'Holland Village', bookings: 237, growth: 8 },
                  { name: 'Bugis', bookings: 218, growth: 5 }
                ].map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 transition-all hover:bg-white/10">
                    <div className="space-y-1">
                      <p className="text-sm font-black tracking-tight uppercase">{location.name}</p>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[9px] font-black uppercase border-none bg-emerald-500/10 text-emerald-500 h-4 px-1.5">
                          ↑ {location.growth}% Growth
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right font-black">
                      <p className="text-sm tabular-nums">{location.bookings}</p>
                      <p className="text-[9px] text-muted-foreground/40 uppercase tracking-widest">Total Bookings</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none bg-card/30 shadow-xl backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <div>
              <CardTitle className="text-xl font-black tracking-tight">Intelligence Scheduling</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Automated report generation and multi-channel dissemination</CardDescription>
            </div>
            <IconCloud className="h-6 w-6 text-emerald-500 opacity-50" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-3">
                <Label htmlFor="reportType" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Intelligence Pack</Label>
                <Select defaultValue="weekly">
                  <SelectTrigger id="reportType" className="bg-white/5 border-white/10 h-10 font-bold text-xs uppercase">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-xl border-border/40">
                    <SelectItem value="daily" className="text-xs uppercase font-bold">Protocol: Daily Brief</SelectItem>
                    <SelectItem value="weekly" className="text-xs uppercase font-bold">Protocol: Weekly Audit</SelectItem>
                    <SelectItem value="monthly" className="text-xs uppercase font-bold">Protocol: Monthly Recon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="frequency" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Transmission Frequency</Label>
                <Select defaultValue="weekly">
                  <SelectTrigger id="frequency" className="bg-white/5 border-white/10 h-10 font-bold text-xs uppercase">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-xl border-border/40">
                    <SelectItem value="daily" className="text-xs uppercase font-bold">Cycle: T-24H</SelectItem>
                    <SelectItem value="weekly" className="text-xs uppercase font-bold">Cycle: T-7D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="format" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Output Compression</Label>
                <Select defaultValue="pdf">
                  <SelectTrigger id="format" className="bg-white/5 border-white/10 h-10 font-bold text-xs uppercase">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-xl border-border/40">
                    <SelectItem value="pdf" className="text-xs uppercase font-bold">Format: Secure PDF</SelectItem>
                    <SelectItem value="csv" className="text-xs uppercase font-bold">Format: RAW Dataset</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="delivery" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Dissemination Edge</Label>
                <Select defaultValue="email">
                  <SelectTrigger id="delivery" className="bg-white/5 border-white/10 h-10 font-bold text-xs uppercase">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-xl border-border/40">
                    <SelectItem value="email" className="text-xs uppercase font-bold">Channel: Encrypted Mail</SelectItem>
                    <SelectItem value="slack" className="text-xs uppercase font-bold">Channel: Secure Slack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-8 mt-4 border-t border-white/5">
              <Button className="h-10 px-6 gap-2 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest">
                <IconCloud className="h-4 w-4" />
                Initialize Schedule
              </Button>
              <Button variant="outline" className="h-10 px-6 gap-2 hover:bg-white/5 border-border/40 font-black uppercase text-[10px] tracking-widest">
                <IconDatabase className="h-4 w-4" />
                Global Templates
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

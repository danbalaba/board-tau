'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/admin/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/app/admin/components/ui/table';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import { 
  IconEye, 
  IconCalendar, 
  IconUsers, 
  IconClipboardCheck, 
  IconClipboardX, 
  IconClock,
  IconArrowUpRight,
  IconDotsVertical,
  IconBuildingCommunity
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import PageContainer from '@/app/admin/components/layout/page-container';

import { usePropertyPerformance } from '@/app/admin/hooks/use-property-performance';

const statusColors = {
  reserved: 'default',
  pending: 'secondary',
  cancelled: 'destructive',
  completed: 'outline'
};

const statusLabels = {
  reserved: 'Confirmed',
  pending: 'Pending',
  cancelled: 'Cancelled',
  completed: 'Completed'
};

export function OccupancyTracking() {
  const { data: apiResponse, isLoading, error } = usePropertyPerformance('30d');
  const data = apiResponse?.data;
  const bookings = data?.recentBookings || [];
  const stats = data?.bookingStats || { confirmed: 0, pending: 0, cancelled: 0 };
  const occupancyData = data?.occupancyByProperty || [];

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading occupancy data...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;

  const highDemandCount = occupancyData.filter((p: any) => p.occupancy > 90).length;
  const goodPerfCount = occupancyData.filter((p: any) => p.occupancy >= 70 && p.occupancy <= 90).length;
  const needsAttentionCount = occupancyData.filter((p: any) => p.occupancy < 70).length;

  const summaryKpis = [
    { label: 'Network Reservations', value: stats.confirmed, icon: IconClipboardCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Confirmed active' },
    { label: 'Pending Validation', value: stats.pending, icon: IconClock, color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'Awaiting review' },
    { label: 'System Cancellations', value: stats.cancelled, icon: IconClipboardX, color: 'text-rose-500', bg: 'bg-rose-500/10', desc: 'Incomplete cycles' },
    { label: 'Average Stay', value: `${data?.averageStay || 0} Nights`, icon: IconCalendar, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Duration metric' },
  ];

  return (
    <PageContainer>
      <div className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-3xl font-bold tracking-tight">Occupancy Logistics</h2>
            <p className="text-muted-foreground text-sm mt-1">Track and manage global property bookings and real-time occupancy telemetry.</p>
          </motion.div>
          <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm bg-card/50 backdrop-blur-sm border-border/40">
            <IconCalendar className="h-4 w-4" /> Full Schedule
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryKpis.map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="group relative overflow-hidden border-none bg-card/50 backdrop-blur-sm shadow-md hover:shadow-xl transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-muted-foreground">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest">{kpi.label}</CardTitle>
                  <div className={cn("p-2 rounded-lg", kpi.bg)}>
                    <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-black tabular-nums tracking-tighter">{kpi.value}</div>
                  <div className="flex items-center mt-1 space-x-1">
                    <IconArrowUpRight className={cn("w-3 h-3 text-emerald-500")} />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">{kpi.desc}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
        >
          <Card className="border-border/40 bg-card/30 backdrop-blur-md shadow-xl overflow-hidden">
            <CardHeader className="border-b border-border/20 bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-black uppercase tracking-tight">Recent Reservoir Feed</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 mt-0.5">Real-time incoming booking stream</CardDescription>
                </div>
                <IconBuildingCommunity className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-border/20">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Guest Identity</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Asset Reference</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10 text-center">Interval</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Validation</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10 text-right">Volume</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking: any) => (
                    <TableRow key={booking.id} className="group hover:bg-muted/20 border-border/10 transition-colors">
                      <TableCell className="py-4">
                        <div className="font-bold text-sm tracking-tight">{booking.guest}</div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter truncate max-w-[150px]">
                          {booking.property}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-black tabular-nums">{booking.checkIn}</span>
                          <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tighter">to {booking.checkOut}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className={cn(
                          "text-[9px] h-5 px-1.5 font-black uppercase border-none",
                          booking.status === 'reserved' ? "bg-emerald-500/10 text-emerald-500" : 
                          booking.status === 'pending' ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground"
                        )}>
                          {(statusLabels as any)[booking.status] || booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <div className="font-black tabular-nums text-sm">${booking.totalAmount.toLocaleString()}</div>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <IconDotsVertical className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="group relative p-6 bg-blue-500/5 rounded-2xl border border-blue-500/20 backdrop-blur-sm shadow-lg overflow-hidden"
          >
            <div className="absolute -top-4 -right-4 h-24 w-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-black uppercase text-blue-500 tracking-widest">High Velocity</h3>
                <IconArrowUpRight className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-3xl font-black text-blue-500 tabular-nums">{highDemandCount}</p>
              <p className="text-[11px] font-bold text-blue-500/60 uppercase mt-1">Assets with {'>'} 90% engagement</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="group relative p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 backdrop-blur-sm shadow-lg overflow-hidden"
          >
            <div className="absolute -top-4 -right-4 h-24 w-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Optimal Performance</h3>
                <IconBuildingCommunity className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-black text-emerald-500 tabular-nums">{goodPerfCount}</p>
              <p className="text-[11px] font-bold text-emerald-500/60 uppercase mt-1">Assets at 70-90% utilization</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="group relative p-6 bg-amber-500/5 rounded-2xl border border-amber-500/20 backdrop-blur-sm shadow-lg overflow-hidden"
          >
            <div className="absolute -top-4 -right-4 h-24 w-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Attention Required</h3>
                <IconClock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-3xl font-black text-amber-500 tabular-nums">{needsAttentionCount}</p>
              <p className="text-[11px] font-bold text-amber-500/60 uppercase mt-1">Assets performing under 70%</p>
            </div>
          </motion.div>
        </div>
      </div>
    </PageContainer>
  );
}

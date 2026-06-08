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
  IconCalendar, 
  IconClipboardCheck, 
  IconClipboardX, 
  IconClock,
  IconArrowUpRight,
  IconDotsVertical,
  IconBuildingCommunity
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

import { usePropertyPerformance } from '@/app/admin/hooks/use-property-performance';
import { AdminOccupancyHeader } from './admin-occupancy-header';

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
    <div className="p-6 lg:p-10 space-y-6">
      <AdminOccupancyHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryKpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-lg rounded-[2rem] overflow-hidden group">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{kpi.label}</CardTitle>
                <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", kpi.bg)}>
                  <kpi.icon className={cn("w-5 h-5", kpi.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-gray-900 dark:text-white tabular-nums tracking-tighter">{kpi.value}</div>
                <div className="flex items-center mt-2 gap-1.5 bg-gray-50 dark:bg-gray-800/50 w-fit px-2 py-1 rounded-lg">
                  <IconArrowUpRight className={cn("w-3 h-3 text-emerald-500")} />
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{kpi.desc}</span>
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
        <div className="rounded-[3rem] border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl overflow-hidden shadow-sm p-6">
          <div className="mb-6 flex items-center justify-between px-4">
            <div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Recent Reservoir Feed</h3>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Real-time incoming booking stream</p>
            </div>
            <div className="w-10 h-10 bg-cyan-500/10 rounded-2xl flex items-center justify-center">
              <IconBuildingCommunity className="w-5 h-5 text-cyan-500" />
            </div>
          </div>
          
          <div className="overflow-x-auto rounded-[2rem] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                <TableRow className="hover:bg-transparent border-gray-100 dark:border-gray-800">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto">Guest Identity</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto">Asset Reference</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto text-center">Interval</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto text-center">Validation</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto text-right">Volume</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking: any) => (
                  <TableRow key={booking.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 border-gray-100 dark:border-gray-800 transition-colors">
                    <TableCell className="py-5">
                      <div className="font-black text-sm text-gray-900 dark:text-white tracking-tight">{booking.guest}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-[10px] font-bold uppercase text-gray-500 tracking-widest truncate max-w-[150px]">
                        {booking.property}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-[11px] font-black tabular-nums text-gray-900 dark:text-white">{booking.checkIn}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">to {booking.checkOut}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={cn(
                        "text-[9px] h-6 px-3 font-black uppercase tracking-widest border-none",
                        booking.status === 'reserved' ? "bg-emerald-500/10 text-emerald-500" : 
                        booking.status === 'pending' ? "bg-amber-500/10 text-amber-500" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                      )}>
                        {(statusLabels as any)[booking.status] || booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-black tabular-nums text-sm text-gray-900 dark:text-white">${booking.totalAmount.toLocaleString()}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-700">
                        <IconDotsVertical className="h-5 w-5 text-gray-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="group relative p-8 bg-blue-500/5 rounded-[2.5rem] border border-blue-500/20 backdrop-blur-xl shadow-sm overflow-hidden"
        >
          <div className="absolute -top-4 -right-4 h-32 w-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest">High Velocity</h3>
              <IconArrowUpRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-4xl font-black text-blue-600 dark:text-blue-400 tabular-nums">{highDemandCount}</p>
            <p className="text-[10px] font-bold text-blue-500/60 uppercase tracking-widest mt-2">Assets with {'>'} 90% engagement</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="group relative p-8 bg-emerald-500/5 rounded-[2.5rem] border border-emerald-500/20 backdrop-blur-xl shadow-sm overflow-hidden"
        >
          <div className="absolute -top-4 -right-4 h-32 w-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest">Optimal Performance</h3>
              <IconBuildingCommunity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{goodPerfCount}</p>
            <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest mt-2">Assets at 70-90% utilization</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="group relative p-8 bg-amber-500/5 rounded-[2.5rem] border border-amber-500/20 backdrop-blur-xl shadow-sm overflow-hidden"
        >
          <div className="absolute -top-4 -right-4 h-32 w-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest">Attention Required</h3>
              <IconClock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-4xl font-black text-amber-600 dark:text-amber-400 tabular-nums">{needsAttentionCount}</p>
            <p className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest mt-2">Assets performing under 70%</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

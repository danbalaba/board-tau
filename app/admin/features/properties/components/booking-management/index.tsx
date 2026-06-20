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
  IconClipboardCheck, 
  IconClock, 
  IconCircleCheck, 
  IconTrendingUp,
  IconDotsVertical,
  IconUser,
  IconBuildingCommunity,
  IconArrowUpRight
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

import { usePropertyPerformance } from '@/app/admin/hooks/use-property-performance';
import { AdminBookingHeader } from './admin-booking-header';

const statusLabels = {
  reserved: 'Confirmed',
  checked_in: 'Checked In',
  pending: 'Pending',
  cancelled: 'Cancelled',
  completed: 'Completed'
};

export function BookingManagement() {
  const { data: apiResponse, isLoading, error } = usePropertyPerformance('30d');
  const data = apiResponse?.data;
  const bookings = data?.recentBookings || [];
  const stats = data?.bookingStats || { confirmed: 0, pending: 0, completed: 0, cancelled: 0 };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading bookings...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;

  const statsKpis = [
    { label: 'Confirmed Assets', value: stats.confirmed, icon: IconCircleCheck, color: 'text-violet-500', bg: 'bg-violet-500/10', desc: 'Active pipeline' },
    { label: 'Pending Validation', value: stats.pending, icon: IconClock, color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'Verification queue' },
    { label: 'Execution Cycle', value: stats.completed, icon: IconClipboardCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Settled assets' },
    { label: 'Aggregated Yield', value: `$${data?.totalRevenue?.toLocaleString() || '0'}`, icon: IconTrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Gross network' },
  ];

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminBookingHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsKpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="group relative bg-white dark:bg-gray-900 rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-500 shadow-sm overflow-hidden h-full">
              <div className="flex items-start justify-between mb-4">
                <div className={cn('w-12 h-12 rounded-[18px] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm', kpi.bg, kpi.color)}>
                  <kpi.icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{kpi.label}</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter group-hover:text-primary transition-colors">{kpi.value}</p>
                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 w-fit px-2 py-0.5 rounded-lg">
                  <IconArrowUpRight className="w-3 h-3 text-emerald-500" />
                  <span className="text-[11px] font-bold text-emerald-500">{kpi.desc}</span>
                </div>
              </div>
            </div>
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
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Active Reservations Feed</h3>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Real-time engagement telemetry</p>
            </div>
            <div className="w-10 h-10 bg-violet-500/10 rounded-2xl flex items-center justify-center">
              <IconBuildingCommunity className="w-5 h-5 text-violet-500" />
            </div>
          </div>
          
          <div className="overflow-x-auto rounded-[2rem] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                <TableRow className="hover:bg-transparent border-gray-100 dark:border-gray-800">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest py-6 h-auto">Guest / Identity</TableHead>
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
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                          <IconUser className="h-5 w-5 text-violet-500" />
                        </div>
                        <div>
                          <div className="font-black text-sm text-gray-900 dark:text-white tracking-tight">{booking.guest}</div>
                          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{booking.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-[10px] font-black uppercase text-gray-500 tracking-tighter truncate max-w-[150px]">
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
                        booking.status === 'reserved' || booking.status === 'confirmed' ? "bg-emerald-500/10 text-emerald-500" : 
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="rounded-[3rem] border border-emerald-500/10 bg-emerald-500/5 backdrop-blur-xl shadow-sm h-full">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Upcoming Check-ins</CardTitle>
                </div>
                <div className="h-10 w-10 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                  <IconClock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              {bookings
                .filter((booking: any) => (booking.status === 'reserved' || booking.status === 'confirmed') && new Date(booking.checkIn) >= new Date())
                .sort((a: any, b: any) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
                .slice(0, 3)
                .map((booking: any) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-white dark:bg-gray-900 border border-emerald-500/20 group hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="text-[10px] font-black tabular-nums bg-emerald-500 text-white h-12 w-12 rounded-xl flex flex-col items-center justify-center p-1 leading-none shadow-md shadow-emerald-500/20">
                         <span className="text-sm">{new Date(booking.checkIn).getDate()}</span>
                         <span className="text-[8px] uppercase mt-0.5">{new Date(booking.checkIn).toLocaleString('default', { month: 'short' })}</span>
                      </div>
                      <div>
                        <div className="font-black text-sm text-gray-900 dark:text-white tracking-tight">{booking.guest}</div>
                        <div className="text-[10px] font-bold uppercase text-gray-500 tracking-widest truncate max-w-[150px] mt-0.5">{booking.property}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-emerald-500 hover:text-white text-gray-400 transition-all">
                      <IconEye className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="rounded-[3rem] border border-rose-500/10 bg-rose-500/5 backdrop-blur-xl shadow-sm h-full">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">Recent Rollbacks</CardTitle>
                </div>
                <div className="h-10 w-10 bg-rose-500/20 rounded-2xl flex items-center justify-center">
                  <IconClock className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              {bookings
                .filter((booking: any) => booking.status === 'cancelled')
                .sort((a: any, b: any) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())
                .slice(0, 3)
                .map((booking: any) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-white dark:bg-gray-900 border border-rose-500/20 group hover:shadow-lg hover:shadow-rose-500/10 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                          <IconClock className="h-6 w-6 text-rose-500" />
                       </div>
                      <div>
                        <div className="font-black text-sm text-gray-900 dark:text-white tracking-tight">{booking.guest}</div>
                        <div className="text-[10px] font-bold uppercase text-gray-500 tracking-widest truncate max-w-[150px] mt-0.5">{booking.property}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-500 hover:text-white text-gray-400 transition-all">
                      <IconEye className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

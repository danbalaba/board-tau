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
  IconMail, 
  IconPhone, 
  IconClipboardCheck, 
  IconClock, 
  IconCircleCheck, 
  IconTrendingUp,
  IconDotsVertical,
  IconUser,
  IconBuildingCommunity,
  IconArrowUpRight
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import PageContainer from '@/app/admin/components/layout/page-container';

interface Booking {
  id: string;
  guest: string;
  email: string;
  phone: string;
  property: string;
  checkIn: string;
  checkOut: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  totalAmount: number;
  paymentMethod: string;
}

import { usePropertyPerformance } from '@/app/admin/hooks/use-property-performance';

const statusColors = {
  reserved: 'default',
  checked_in: 'default',
  pending: 'secondary',
  cancelled: 'destructive',
  completed: 'outline'
};

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
    { label: 'Confirmed Assets', value: stats.confirmed, icon: IconCircleCheck, color: 'text-primary', bg: 'bg-primary/10', desc: 'Active pipeline' },
    { label: 'Pending Validation', value: stats.pending, icon: IconClock, color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'Verification queue' },
    { label: 'Execution Cycle', value: stats.completed, icon: IconClipboardCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Settled assets' },
    { label: 'Aggregated Yield', value: `$${data?.totalRevenue?.toLocaleString() || '0'}`, icon: IconTrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Gross network' },
  ];

  return (
    <PageContainer>
      <div className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-3xl font-bold tracking-tight">Reservations Ledger</h2>
            <p className="text-muted-foreground text-sm mt-1">Orchestrate and monitor global property bookings and cross-platform reservations.</p>
          </motion.div>
          <Button className="h-10 gap-2 font-bold uppercase tracking-tighter shadow-lg shadow-primary/20">
            <IconCalendar className="h-4 w-4" /> Operations Calendar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsKpis.map((kpi, i) => (
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
                  <CardTitle className="text-lg font-black uppercase tracking-tight">Active Reservations Feed</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 mt-0.5">Real-time engagement telemetry</CardDescription>
                </div>
                <IconBuildingCommunity className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-border/20">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Guest / Identity</TableHead>
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
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <IconUser className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-bold text-sm tracking-tight">{booking.guest}</div>
                            <div className="text-[10px] text-muted-foreground font-medium">{booking.email}</div>
                          </div>
                        </div>
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
                          booking.status === 'reserved' || booking.status === 'confirmed' ? "bg-emerald-500/10 text-emerald-500" : 
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-border/40 bg-card/30 backdrop-blur-md shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-emerald-500">Upcoming Check-ins</CardTitle>
                  <IconClock className="h-4 w-4 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {bookings
                  .filter((booking: any) => (booking.status === 'reserved' || booking.status === 'confirmed') && new Date(booking.checkIn) >= new Date())
                  .sort((a: any, b: any) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
                  .slice(0, 3)
                  .map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 group hover:bg-emerald-500/10 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="text-[10px] font-black tabular-nums bg-emerald-500 text-white h-10 w-10 rounded-lg flex flex-col items-center justify-center p-1 leading-none">
                           <span>{new Date(booking.checkIn).getDate()}</span>
                           <span className="text-[7px] uppercase">{new Date(booking.checkIn).toLocaleString('default', { month: 'short' })}</span>
                        </div>
                        <div>
                          <div className="font-bold text-sm tracking-tight">{booking.guest}</div>
                          <div className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-tighter truncate max-w-[120px]">{booking.property}</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconEye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-border/40 bg-card/30 backdrop-blur-md shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-rose-500">Recent Rollbacks</CardTitle>
                  <IconClock className="h-4 w-4 text-rose-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {bookings
                  .filter((booking: any) => booking.status === 'cancelled')
                  .sort((a: any, b: any) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())
                  .slice(0, 3)
                  .map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 group hover:bg-rose-500/10 transition-all">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                            <IconClock className="h-5 w-5 text-rose-500" />
                         </div>
                        <div>
                          <div className="font-bold text-sm tracking-tight">{booking.guest}</div>
                          <div className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-tighter truncate max-w-[120px]">{booking.property}</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconEye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageContainer>
  );
}

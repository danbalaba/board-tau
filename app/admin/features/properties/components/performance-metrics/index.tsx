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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  IconTrendingUp,
  IconChartBar,
  IconActivity,
  IconStar,
  IconArrowUpRight,
  IconTarget,
  IconBolt,
} from '@tabler/icons-react';
import { cn } from "@/lib/utils";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/app/admin/components/ui/chart';

import { usePropertyPerformance } from '@/app/admin/hooks/use-property-performance';
import { AdminPerformanceHeader } from './admin-performance-header';

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--primary))',
  },
  bookings: {
    label: 'Bookings',
    color: 'hsl(var(--chart-2))',
  },
  occupancy: {
    label: 'Occupancy',
    color: 'hsl(var(--primary))',
  },
  price: {
    label: 'Your Price',
    color: 'hsl(var(--primary))',
  },
  competitors: {
    label: 'Competitors',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export function PerformanceMetrics() {
  const { data: apiResponse, isLoading, error } = usePropertyPerformance('30d');
  const data = apiResponse?.data;

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading performance metrics...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;

  const revenueData = data?.revenueTrends || [];
  const occupancyData = data?.occupancyByProperty || [];
  const pricingData = data?.pricingComparison || [];

  const kpis = [
    { title: "Network Reservations", value: data?.totalReservations || 0, trend: "+12.5%", icon: IconBolt, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Aggregated Occupancy", value: `${data?.occupancyRate || 0}%`, trend: "+2.1%", icon: IconActivity, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Global Revenue", value: `$${data?.totalRevenue?.toLocaleString() || 0}`, trend: "+15.2%", icon: IconTrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Institutional Rating", value: data?.averageRating || 4.8, trend: "Target Reach", icon: IconStar, color: "text-fuchsia-500", bg: "bg-fuchsia-500/10" },
  ];

  return (
    <motion.div
      className="p-6 lg:p-10 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AdminPerformanceHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi: any, i: number) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={i} variants={itemVariants}>
              <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-lg rounded-[2rem] overflow-hidden group h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{kpi.title}</CardTitle>
                  <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", kpi.bg)}>
                    <Icon className={cn("w-5 h-5", kpi.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-gray-900 dark:text-white tabular-nums tracking-tighter">{kpi.value}</div>
                  <div className="flex items-center mt-2 gap-1.5 bg-gray-50 dark:bg-gray-800/50 w-fit px-2 py-1 rounded-lg">
                    <IconArrowUpRight className={cn("w-3 h-3 text-emerald-500")} />
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{kpi.trend}</span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">vs index</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="rounded-[3rem] border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl overflow-hidden shadow-sm p-2">
            <CardHeader className="px-6 pt-6 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Revenue & Bookings</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-1">Operational trends distribution</CardDescription>
                </div>
                <div className="h-10 w-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                  <IconTrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={revenueData} margin={{ top: 20 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis yAxisId="left" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `$${v}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar yAxisId="left" dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="bookings" fill="var(--color-bookings)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="rounded-[3rem] border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl overflow-hidden shadow-sm p-2">
            <CardHeader className="px-6 pt-6 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Occupancy Rate</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-1">Institutional conversion by asset</CardDescription>
                </div>
                <div className="h-10 w-10 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                  <IconTarget className="w-5 h-5 text-blue-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={occupancyData} layout="vertical" margin={{ left: 10 }}>
                  <YAxis
                    dataKey="property"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={100}
                    tickMargin={10}
                  />
                  <XAxis type="number" hide />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="occupancy"
                    fill="var(--color-occupancy)"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card className="rounded-[3rem] border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl overflow-hidden shadow-sm p-2">
          <CardHeader className="px-6 pt-6 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Pricing Strategy</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-1">Competitive index and market analysis</CardDescription>
              </div>
              <div className="h-10 w-10 bg-fuchsia-500/10 rounded-2xl flex items-center justify-center">
                <IconChartBar className="w-5 h-5 text-fuchsia-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={pricingData} margin={{ top: 20 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="property" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="price" fill="var(--color-price)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="competitors" fill="var(--color-competitors)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

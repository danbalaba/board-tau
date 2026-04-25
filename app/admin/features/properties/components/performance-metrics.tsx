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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  IconTrendingUp,
  IconChartBar,
  IconActivity,
  IconStar,
  IconArrowUpRight,
  IconArrowDownRight,
  IconTarget,
  IconBolt,
  IconRefresh
} from '@tabler/icons-react';
import { Button } from '@/app/admin/components/ui/button';
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
    { title: "Aggregated Occupancy", value: `${data?.occupancyRate || 0}%`, trend: "+2.1%", icon: IconActivity, color: "text-primary", bg: "bg-primary/10" },
    { title: "Global Revenue", value: `$${data?.totalRevenue?.toLocaleString() || 0}`, trend: "+15.2%", icon: IconTrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Institutional Rating", value: data?.averageRating || 4.8, trend: "Target Reach", icon: IconStar, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  return (
    <motion.div
      className="space-y-8 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance Analytics</h2>
          <p className="text-muted-foreground text-sm mt-1">Detailed telemetric data across global property indices and listing clusters.</p>
        </div>
        <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm bg-card/50 backdrop-blur-sm border-border/40">
          <IconRefresh className="h-4 w-4" /> Sync Metrics
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi: any, i: number) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={i} variants={itemVariants}>
              <Card className="group relative overflow-hidden border-none bg-card/50 backdrop-blur-sm shadow-md hover:shadow-xl transition-all">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-muted-foreground">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest">{kpi.title}</CardTitle>
                  <div className={cn("p-2 rounded-lg", kpi.bg)}>
                    <Icon className={cn("h-4 w-4", kpi.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black tabular-nums tracking-tighter">{kpi.value}</div>
                  <div className="flex items-center mt-1 space-x-1">
                    <IconArrowUpRight className={cn("w-3 h-3 text-emerald-500")} />
                    <p className={cn("text-[10px] font-bold text-emerald-500 uppercase")}>{kpi.trend}</p>
                    <span className="text-[10px] text-muted-foreground ml-1">vs index</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="border-border/40 bg-card/30 backdrop-blur-md shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-black uppercase tracking-tight">Revenue & Bookings</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 mt-1">Operational trends distribution</CardDescription>
                </div>
                <IconTrendingUp className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
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
          <Card className="border-border/40 bg-card/30 backdrop-blur-md shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-black uppercase tracking-tight">Occupancy Rate</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 mt-1">Institutional conversion by asset</CardDescription>
                </div>
                <IconTarget className="w-4 h-4 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
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
        <Card className="border-border/40 bg-card/30 backdrop-blur-md shadow-xl mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black uppercase tracking-tight">Pricing Strategy</CardTitle>
                <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 mt-1">Competitive index and market analysis</CardDescription>
              </div>
              <IconChartBar className="w-4 h-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
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

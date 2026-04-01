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
  TrendingUp,
  BarChart3,
  Activity,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
} from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/app/admin/components/ui/chart';

// Sample data for performance metrics
const revenueData = [
  { month: 'Jan', revenue: 4000, bookings: 24 },
  { month: 'Feb', revenue: 3500, bookings: 21 },
  { month: 'Mar', revenue: 4500, bookings: 27 },
  { month: 'Apr', revenue: 5000, bookings: 30 },
  { month: 'May', revenue: 5500, bookings: 33 },
  { month: 'Jun', revenue: 6000, bookings: 36 },
  { month: 'Jul', revenue: 6500, bookings: 39 }
];

const occupancyData = [
  { property: 'Cozy Studio', occupancy: 85 },
  { property: 'Beach Villa', occupancy: 90 },
  { property: 'Luxury Apartment', occupancy: 88 },
  { property: 'Downtown Loft', occupancy: 82 }
];

const pricingData = [
  { property: 'Cozy Studio', price: 150, competitors: 140 },
  { property: 'Beach Villa', price: 250, competitors: 240 },
  { property: 'Luxury Apartment', price: 300, competitors: 280 },
  { property: 'Downtown Loft', price: 200, competitors: 190 }
];

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
  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Performance Analytics</h2>
          <p className="text-muted-foreground">Detailed metrics across all properties and listings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Bookings", value: "1,245", trend: "+12.5%", icon: Zap, color: "text-amber-500", trendColor: "text-emerald-500" },
          { title: "Avg Occupancy", value: "86.3%", trend: "+2.1%", icon: Activity, color: "text-primary", trendColor: "text-emerald-500" },
          { title: "Total Revenue", value: "$186,750", trend: "+15.2%", icon: TrendingUp, color: "text-emerald-500", trendColor: "text-emerald-500" },
          { title: "Avg Rating", value: "4.8", trend: "+0.1", icon: Star, color: "text-amber-500 fill-amber-500", trendColor: "text-emerald-500" },
        ].map((kpi, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <kpi.icon className="w-12 h-12" />
              </div>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <kpi.icon className={cn("w-4 h-4", kpi.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className={cn("w-3 h-3 mr-1", kpi.trendColor)} />
                  <p className={cn("text-xs font-medium", kpi.trendColor)}>{kpi.trend} from last month</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Revenue & Bookings</CardTitle>
                  <CardDescription>Performance trends over time</CardDescription>
                </div>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Occupancy Rate</CardTitle>
                  <CardDescription>Conversion by top properties</CardDescription>
                </div>
                <Target className="w-4 h-4 text-muted-foreground" />
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pricing Strategy</CardTitle>
                <CardDescription>Competitive pricing analysis</CardDescription>
              </div>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
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

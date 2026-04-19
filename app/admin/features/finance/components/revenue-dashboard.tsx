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
  DollarSign,
  CreditCard,
  Scale,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Download,
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/app/admin/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/app/admin/components/ui/chart';
import { useRevenueDashboard } from '@/app/admin/hooks/use-revenue-dashboard';

export function RevenueDashboard() {
  const { data, isLoading, error } = useRevenueDashboard('30d');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Revenue Dashboard</h2>
            <p className="text-muted-foreground">Comprehensive revenue and financial analytics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">...</div>
                <p className="text-sm text-muted-foreground">...</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Revenue Dashboard</h2>
            <p className="text-muted-foreground">Comprehensive revenue and financial analytics</p>
          </div>
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">
            Error loading revenue data: {error.message}
          </div>
        </div>
      </div>
    );
  }

  const revenueData = data?.data?.dailyRevenue || [];
  const topProperties = data?.data?.topProperties || [];

  const totalRev = data?.data?.totalRevenue || 0;
  const revenueBreakdownData = [
    { name: 'Accommodation', value: Math.floor(totalRev * 0.85), color: '#8b5cf6' },
    { name: 'Service Fees', value: Math.floor(totalRev * 0.15), color: '#10b981' },
  ];

  const expensesData = [
    { category: 'Marketing', amount: 2500 },
    { category: 'Operations', amount: 3000 },
    { category: 'Maintenance', amount: 1500 },
    { category: 'Salaries', amount: 8000 },
    { category: 'Utilities', amount: 1000 },
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
    accommodation: {
      label: 'Accommodation',
      color: 'hsl(var(--chart-1))',
    },
    cleaning: {
      label: 'Cleaning Fees',
      color: 'hsl(var(--chart-2))',
    },
    service: {
      label: 'Service Fees',
      color: 'hsl(var(--chart-3))',
    },
    other: {
      label: 'Other',
      color: 'hsl(var(--chart-4))',
    },
    amount: {
      label: 'Amount',
      color: 'hsl(var(--primary))',
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

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Overview</h2>
          <p className="text-muted-foreground">Comprehensive revenue and financial analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Report
          </Button>
          <Button size="sm">
            <CreditCard className="w-4 h-4 mr-2" />
            Payouts
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <DollarSign className="w-12 h-12" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${data?.data?.totalRevenue?.toLocaleString()}</div>
              <div className="flex items-center mt-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-500 mr-1" />
                <p className="text-xs text-emerald-500">+12.5% from last period</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Activity className="w-12 h-12" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Daily Revenue</CardTitle>
              <Activity className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${data?.data?.averageDailyRevenue?.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground mt-1">Average per day</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="w-12 h-12" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Top Performance</CardTitle>
              <TrendingUp className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${topProperties[0]?.revenue?.toLocaleString() || '0'}</div>
              <p className="text-sm text-muted-foreground mt-1 truncate max-w-full">
                {topProperties[0]?.listingTitle || 'No properties'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Receipt className="w-12 h-12" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Platform Fee</CardTitle>
              <Receipt className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15%</div>
              <p className="text-sm text-muted-foreground mt-1 text-emerald-500 font-medium">Optimized for growth</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Revenue & Bookings</CardTitle>
                  <CardDescription>Monthly revenue and booking trends</CardDescription>
                </div>
                <Activity className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
                <BarChart data={revenueData} margin={{ top: 20 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis yAxisId="left" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(v) => `$${v}`} />
                  <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar yAxisId="left" dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="bookings" fill="var(--color-bookings)" radius={[4, 4, 0, 0]} />
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
                  <CardTitle>Revenue Breakdown</CardTitle>
                  <CardDescription>Revenue sources and breakdown</CardDescription>
                </div>
                <PieChartIcon className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col">
              <ChartContainer config={chartConfig} className="h-[280px]">
                <PieChart>
                  <Pie
                    data={revenueBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {revenueBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <ChartLegend content={<ChartLegendContent className="mt-4" />} />
                </PieChart>
              </ChartContainer>
              <div className="grid grid-cols-2 gap-4 mt-4 border-t pt-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Growth Strategy</p>
                  <p className="text-sm font-medium">Aggressive Expansion</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Fiscal Health</p>
                  <p className="text-sm font-medium text-emerald-600">Strong</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Operating Expenses</CardTitle>
                <CardDescription>Breakdown of monthly operating costs</CardDescription>
              </div>
              <Scale className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={expensesData} layout="vertical" margin={{ left: 10 }}>
                <YAxis
                  dataKey="category"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <XAxis type="number" hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="amount"
                  fill="var(--color-amount)"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Gross Margin", value: "75%", desc: "Average gross margin", icon: TrendingUp },
          { title: "Net Profit Margin", value: "24.6%", desc: "Average net margin", icon: Activity },
          { title: "Revenue Growth", value: "+12.5%", desc: "Month-over-month", icon: TrendingUp },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

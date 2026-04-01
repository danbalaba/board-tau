'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/admin/components/ui/card';
import { cn } from "@/lib/utils";
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
  Users,
  Star,
  Home,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/app/admin/components/ui/chart';
import { useExecutiveOverview } from '@/app/admin/hooks/use-executive-overview';

export function ExecutiveOverview() {
  const { data, isLoading, error } = useExecutiveOverview('30d');

  if (isLoading) {
    return (
      <div className="space-y-6">
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
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">
            Error loading dashboard data: {error.message}
          </div>
        </div>
      </div>
    );
  }

  // Transform data for charts
  const metrics = data?.data?.metrics;
  const topProperties = data?.data?.topProperties || [];

  // Mock data for charts since API doesn't return them yet
  const revenueData = [
    { month: 'Jan', revenue: 4000, bookings: 24 },
    { month: 'Feb', revenue: 3000, bookings: 18 },
    { month: 'Mar', revenue: 5000, bookings: 32 },
    { month: 'Apr', revenue: 4500, bookings: 28 },
    { month: 'May', revenue: 6000, bookings: 35 },
  ];

  const propertyTypeData = [
    { name: 'Apartments', value: 400, color: '#0088FE' },
    { name: 'Houses', value: 300, color: '#00C49F' },
    { name: 'Condos', value: 200, color: '#FFBB28' },
    { name: 'Studios', value: 150, color: '#FF8042' },
  ];

  const occupancyData = [
    { day: 'Mon', occupancy: 85 },
    { day: 'Tue', occupancy: 90 },
    { day: 'Wed', occupancy: 75 },
    { day: 'Thu', occupancy: 88 },
    { day: 'Fri', occupancy: 92 },
    { day: 'Sat', occupancy: 95 },
    { day: 'Sun', occupancy: 88 },
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
    apartments: {
      label: 'Apartments',
      color: 'hsl(var(--chart-1))',
    },
    houses: {
      label: 'Houses',
      color: 'hsl(var(--chart-2))',
    },
    condos: {
      label: 'Condos',
      color: 'hsl(var(--chart-3))',
    },
    studios: {
      label: 'Studios',
      color: 'hsl(var(--chart-4))',
    },
    occupancy: {
      label: 'Occupancy',
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
      {/* KPIs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="w-12 h-12" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics?.totalRevenue?.toLocaleString()}</div>
              <div className="flex items-center mt-1">
                {metrics?.revenueGrowthPercentage && metrics.revenueGrowthPercentage > 0 ? (
                  <ArrowUpRight className="w-3 h-3 text-emerald-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-rose-500 mr-1" />
                )}
                <p className={cn(
                  "text-xs",
                  metrics?.revenueGrowthPercentage && metrics.revenueGrowthPercentage > 0 ? "text-emerald-500" : "text-rose-500"
                )}>
                  {Math.abs(metrics?.revenueGrowthPercentage || 0)}% from last month
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Calendar className="w-12 h-12" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalReservations?.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mt-1">Bookings this period</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Star className="w-12 h-12" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.averageRating}/5</div>
              <p className="text-sm text-muted-foreground mt-1">From {metrics?.totalReservations} bookings</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Building2 className="w-12 h-12" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
              <Building2 className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalListings?.toLocaleString()}</div>
              <div className="flex items-center mt-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-500 mr-1" />
                <p className="text-xs text-emerald-500">
                  {metrics?.userGrowthPercentage}% from last month
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Revenue Chart */}
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
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `$${value}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
                <Bar
                  yAxisId="right"
                  dataKey="bookings"
                  fill="var(--color-bookings)"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Property Type and Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Property Type Distribution</CardTitle>
                  <CardDescription>Platform listing breakdown</CardDescription>
                </div>
                <Home className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <PieChart>
                  <Pie
                    data={propertyTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {propertyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Occupancy Rate</CardTitle>
                  <CardDescription>Daily occupancy trends</CardDescription>
                </div>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <LineChart data={occupancyData} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="occupancy"
                    stroke="var(--color-occupancy)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-occupancy)" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform activity</CardDescription>
              </div>
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'host', title: 'New Host Application', desc: 'John Doe submitted application', time: '2 hours ago', icon: Users, color: 'bg-blue-100 text-blue-600' },
                { type: 'property', title: 'New Property Listed', desc: 'Cozy Studio in Downtown', time: '5 hours ago', icon: Home, color: 'bg-green-100 text-green-600' },
                { type: 'booking', title: 'Booking Completed', desc: 'Booking for 2 weeks at Beach Villa', time: '1 day ago', icon: Calendar, color: 'bg-amber-100 text-amber-600' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110", activity.color)}>
                      <activity.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.desc}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

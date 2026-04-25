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
  const revenueData = data?.data?.charts?.revenue || [];
  const propertyTypeData = data?.data?.charts?.propertyDistribution || [];
  const occupancyData = data?.data?.charts?.occupancy || [];
  const activities = data?.data?.activities || [];

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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'host': return Users;
      case 'property': return Home;
      case 'booking': return Calendar;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'host': return 'bg-blue-100 text-blue-600';
      case 'property': return 'bg-green-100 text-green-600';
      case 'booking': return 'bg-amber-100 text-amber-600';
      default: return 'bg-gray-100 text-gray-600';
    }
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
                <CardDescription>Trend over the selected period</CardDescription>
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
                    {propertyTypeData.map((entry: any, index: number) => (
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
                  <CardDescription>Recent occupancy trends</CardDescription>
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
              {activities.length > 0 ? activities.map((activity: any, i: number) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110", getActivityColor(activity.type))}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{activity.time}</div>
                  </div>
                );
              }) : (
                <div className="text-center py-6 text-muted-foreground">
                  No recent activity found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

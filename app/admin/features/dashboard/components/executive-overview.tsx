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
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
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

  return (
    <div className="space-y-6">
      {/* KPIs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.totalRevenue?.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">+{metrics?.revenueGrowthPercentage}% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalReservations?.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Bookings this period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.averageRating}/5</div>
            <p className="text-sm text-muted-foreground">From {metrics?.totalReservations} bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalListings?.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">+{metrics?.userGrowthPercentage}% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue & Bookings</CardTitle>
          <CardDescription>Monthly revenue and booking trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" name="Revenue ($)" fill="#1890ff" />
                <Bar yAxisId="right" dataKey="bookings" name="Bookings" fill="#52c41a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Property Type and Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Property Type Distribution</CardTitle>
            <CardDescription>Distribution of property types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {propertyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Occupancy Rate</CardTitle>
            <CardDescription>Daily occupancy trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="occupancy" name="Occupancy %" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest platform activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">H</span>
                </div>
                <div>
                  <p className="font-medium">New Host Application</p>
                  <p className="text-sm text-muted-foreground">John Doe submitted application</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">2 hours ago</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-medium">P</span>
                </div>
                <div>
                  <p className="font-medium">New Property Listed</p>
                  <p className="text-sm text-muted-foreground">Cozy Studio in Downtown</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">5 hours ago</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <span className="text-yellow-600 font-medium">B</span>
                </div>
                <div>
                  <p className="font-medium">Booking Completed</p>
                  <p className="text-sm text-muted-foreground">Booking for 2 weeks at Beach Villa</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">1 day ago</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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

  // Mock data for charts since API doesn't return them yet
  const revenueBreakdownData = [
    { name: 'Accommodation', value: 60, color: '#0088FE' },
    { name: 'Cleaning Fees', value: 15, color: '#00C49F' },
    { name: 'Service Fees', value: 15, color: '#FFBB28' },
    { name: 'Other', value: 10, color: '#FF8042' },
  ];

  const expensesData = [
    { category: 'Marketing', amount: 2500 },
    { category: 'Operations', amount: 3000 },
    { category: 'Maintenance', amount: 1500 },
    { category: 'Salaries', amount: 8000 },
    { category: 'Utilities', amount: 1000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Revenue Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive revenue and financial analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data?.data?.totalRevenue?.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">For the last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data?.data?.averageDailyRevenue?.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">Average per day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Property Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${topProperties[0]?.revenue?.toLocaleString() || '0'}</div>
            <p className="text-sm text-muted-foreground">
              {topProperties[0]?.listingTitle || 'No properties'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">30</div>
            <p className="text-sm text-muted-foreground">Analysis period</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Revenue sources and breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Expenses</CardTitle>
          <CardDescription>Breakdown of monthly operating expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expensesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" name="Amount ($)" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Gross Margin</CardTitle>
            <CardDescription>Gross margin percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">75%</div>
            <p className="text-sm text-muted-foreground">Average gross margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net Profit Margin</CardTitle>
            <CardDescription>Net profit margin percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24.6%</div>
            <p className="text-sm text-muted-foreground">Average net margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
            <CardDescription>Monthly revenue growth rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">+12.5%</div>
            <p className="text-sm text-muted-foreground">Month-over-month growth</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

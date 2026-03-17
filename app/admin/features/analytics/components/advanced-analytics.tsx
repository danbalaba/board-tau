'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/admin/components/ui/select';
import { Switch } from '@/app/admin/components/ui/switch';
import { Label } from '@/app/admin/components/ui/label';
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
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

// Sample data
const revenueData = [
  { name: 'Jan', revenue: 4000, bookings: 2400, users: 1000 },
  { name: 'Feb', revenue: 3000, bookings: 1398, users: 1100 },
  { name: 'Mar', revenue: 2000, bookings: 9800, users: 1200 },
  { name: 'Apr', revenue: 2780, bookings: 3908, users: 1300 },
  { name: 'May', revenue: 1890, bookings: 4800, users: 1400 },
  { name: 'Jun', revenue: 2390, bookings: 3800, users: 1500 },
  { name: 'Jul', revenue: 3490, bookings: 4300, users: 1600 }
];

const propertyTypeData = [
  { name: 'Studio', value: 400, color: '#0088FE' },
  { name: '1 Bedroom', value: 300, color: '#00C49F' },
  { name: '2 Bedrooms', value: 300, color: '#FFBB28' },
  { name: '3+ Bedrooms', value: 200, color: '#FF8042' }
];

const locationData = [
  { name: 'Central Region', value: 650, color: '#0088FE' },
  { name: 'North Region', value: 450, color: '#00C49F' },
  { name: 'East Region', value: 550, color: '#FFBB28' },
  { name: 'West Region', value: 350, color: '#FF8042' },
  { name: 'North-East Region', value: 400, color: '#8884d8' }
];

const performanceData = [
  { subject: 'Occupancy', value: 95, fullMark: 100 },
  { subject: 'Booking Rate', value: 85, fullMark: 100 },
  { subject: 'Revenue', value: 90, fullMark: 100 },
  { subject: 'Customer Satisfaction', value: 88, fullMark: 100 },
  { subject: 'Response Time', value: 82, fullMark: 100 },
  { subject: 'Cancellation Rate', value: 75, fullMark: 100 }
];

export function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Advanced Analytics</h2>
          <p className="text-muted-foreground">Comprehensive business intelligence and data analysis</p>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="autoRefresh" className="text-sm font-medium">
            Auto-refresh
          </Label>
          <Switch
            id="autoRefresh"
            checked={autoRefresh}
            onCheckedChange={setAutoRefresh}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="timeRange" className="text-sm font-medium">
            Time Range
          </Label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger id="timeRange" className="w-[180px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline">
          <span className="mr-2">📊</span>
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CardDescription>This period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$128,430</div>
            <p className="text-sm text-green-600 mt-2">
              <span className="mr-1">↑</span> 12% from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <CardDescription>This period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-sm text-green-600 mt-2">
              <span className="mr-1">↑</span> 8% from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CardDescription>This period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,893</div>
            <p className="text-sm text-red-600 mt-2">
              <span className="mr-1">↓</span> 3% from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Booking Value</CardTitle>
            <CardDescription>This period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$102.90</div>
            <p className="text-sm text-green-600 mt-2">
              <span className="mr-1">↑</span> 5% from previous period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue vs Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Bookings</CardTitle>
          <CardDescription>Comparison of revenue and bookings over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                <Bar yAxisId="right" dataKey="bookings" fill="#82ca9d" name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Property Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Property Type Distribution</CardTitle>
            <CardDescription>Number of properties by type</CardDescription>
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
            <CardTitle>Location Distribution</CardTitle>
            <CardDescription>Number of properties by location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={locationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {locationData.map((entry, index) => (
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

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Comprehensive performance analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={performanceData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="#8884d8"
                  strokeWidth={2}
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Top Performing Properties</CardTitle>
              <CardDescription>Properties with highest occupancy</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Luxury Studio #1', location: 'Central Business District', occupancy: 98, rating: 4.8 },
                { name: 'Cozy 1 Bedroom', location: 'Tiong Bahru', occupancy: 95, rating: 4.7 },
                { name: 'Spacious 2 Bedroom', location: 'Holland Village', occupancy: 93, rating: 4.6 },
                { name: 'Modern Studio', location: 'Bugis', occupancy: 92, rating: 4.5 }
              ].map((property, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-medium">{property.name}</p>
                    <p className="text-sm text-muted-foreground">{property.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{property.occupancy}%</p>
                    <p className="text-sm text-yellow-500">★ {property.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Popular Locations</CardTitle>
              <CardDescription>Locations with highest bookings</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Central Business District', bookings: 284, growth: 15 },
                { name: 'Tiong Bahru', bookings: 256, growth: 12 },
                { name: 'Holland Village', bookings: 237, growth: 8 },
                { name: 'Bugis', bookings: 218, growth: 5 }
              ].map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-medium">{location.name}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="text-green-600">↑ {location.growth}%</span> from previous period
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{location.bookings}</p>
                    <p className="text-sm text-muted-foreground">bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle>Report Scheduling</CardTitle>
          <CardDescription>Schedule and customize report delivery</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select defaultValue="weekly">
                <SelectTrigger id="reportType">
                  <SelectValue placeholder="Select report" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Report</SelectItem>
                  <SelectItem value="weekly">Weekly Report</SelectItem>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                  <SelectItem value="quarterly">Quarterly Report</SelectItem>
                  <SelectItem value="custom">Custom Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select defaultValue="weekly">
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select defaultValue="pdf">
                <SelectTrigger id="format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery">Delivery</Label>
              <Select defaultValue="email">
                <SelectTrigger id="delivery">
                  <SelectValue placeholder="Select delivery" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between pt-6">
            <Button variant="outline">
              <span className="mr-2">📅</span>
              Schedule Report
            </Button>
            <Button variant="outline">
              <span className="mr-2">⚙️</span>
              Report Templates
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Download, Filter, Search, Users, TrendingUp, Activity } from 'lucide-react';
import { useUserAnalytics, type UserAnalytics } from '@/app/admin/hooks/use-user-analytics';

export default function UserAnalytics() {
  const [timeRange, setTimeRange] = useState('year');
  const [filterBy, setFilterBy] = useState('all');

  const { data, isLoading, error } = useUserAnalytics(timeRange === 'month' ? '30d' : timeRange === 'quarter' ? '90d' : '365d');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">User Analytics</h1>
            <p className="text-gray-500 mt-1">
              Track user growth, engagement, and demographics
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">...</div>
                <p className="text-sm text-gray-500 mt-1">...</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>Loading...</CardTitle>
                <p className="text-sm text-gray-500">...</p>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-100 rounded-lg"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <p className="text-sm text-gray-500">...</p>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">User Analytics</h1>
            <p className="text-gray-500 mt-1">
              Track user growth, engagement, and demographics
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-red-500">Error loading user analytics: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const analyticsData = data?.data as UserAnalytics || {
    totalUsers: 0,
    newUsers: 0,
    activeUsers: 0,
    userRoles: [],
    verificationStatus: [],
    timeRange: timeRange
  };

  // Transform API data for charts
  const userGrowthData: Array<{ month: string; newUsers: number; activeUsers: number }> = []; // To be implemented based on API response
  const userTypeData: Array<{ name: string; value: number; color: string }> = analyticsData.userRoles.map((role: { role: string; count: number }) => ({
    name: role.role.charAt(0).toUpperCase() + role.role.slice(1),
    value: role.count,
    color: role.role === 'admin' ? '#ef4444' : role.role === 'host' ? '#3b82f6' : role.role === 'renter' ? '#10b981' : '#f59e0b'
  }));
  const userLocationData: Array<{ city: string; users: number }> = []; // To be implemented based on API response

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Analytics</h1>
          <p className="text-gray-500 mt-1">
            Track user growth, engagement, and demographics
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setTimeRange('month')}
          >
            Last Month
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setTimeRange('quarter')}
          >
            Last Quarter
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setTimeRange('year')}
            className={timeRange === 'year' ? 'bg-blue-100 text-blue-700' : ''}
          >
            Last Year
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-5 h-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers || 0}</div>
            <p className="text-sm text-gray-500 mt-1">
              Total registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <TrendingUp className="w-5 h-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.newUsers || 0}</div>
            <p className="text-sm text-gray-500 mt-1">
              {timeRange === 'month' ? 'Last 30 days' : timeRange === 'quarter' ? 'Last 90 days' : 'Last year'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="w-5 h-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.activeUsers || 0}</div>
            <p className="text-sm text-gray-500 mt-1">
              Logged in within last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Verified Landlords</CardTitle>
            <Activity className="w-5 h-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.verificationStatus?.find((v: { isVerifiedLandlord: boolean; count: number }) => v.isVerifiedLandlord)?.count || 0}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Verified landlord users
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <p className="text-sm text-gray-500">New users and active users over time</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userGrowthData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="newUsers" fill="#3b82f6" />
                <Bar dataKey="activeUsers" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Types</CardTitle>
            <p className="text-sm text-gray-500">Distribution of user roles</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Location</CardTitle>
          <p className="text-sm text-gray-500">Users by city</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userLocationData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="city" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="secondary">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>
    </div>
  );
}

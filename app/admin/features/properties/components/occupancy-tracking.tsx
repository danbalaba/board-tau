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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/app/admin/components/ui/table';
import { Badge } from '@/app/admin/components/ui/badge';
import { Button } from '@/app/admin/components/ui/button';
import { Eye, Calendar } from 'lucide-react';

import { usePropertyPerformance } from '@/app/admin/hooks/use-property-performance';

const statusColors = {
  reserved: 'default',
  pending: 'secondary',
  cancelled: 'destructive',
  completed: 'outline'
};

const statusLabels = {
  reserved: 'Confirmed',
  pending: 'Pending',
  cancelled: 'Cancelled',
  completed: 'Completed'
};

export function OccupancyTracking() {
  const { data: apiResponse, isLoading, error } = usePropertyPerformance('30d');
  const data = apiResponse?.data;
  const bookings = data?.recentBookings || [];
  const stats = data?.bookingStats || { confirmed: 0, pending: 0, cancelled: 0 };
  const occupancyData = data?.occupancyByProperty || [];

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading occupancy data...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;

  const highDemandCount = occupancyData.filter((p: any) => p.occupancy > 90).length;
  const goodPerfCount = occupancyData.filter((p: any) => p.occupancy >= 70 && p.occupancy <= 90).length;
  const needsAttentionCount = occupancyData.filter((p: any) => p.occupancy < 70).length;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Occupancy Tracking</h2>
          <p className="text-muted-foreground">Track and manage property bookings and occupancy</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Bookings</CardTitle>
            <CardDescription>All confirmed bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.confirmed}
            </div>
            <p className="text-sm text-muted-foreground">Confirmed bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Bookings</CardTitle>
            <CardDescription>Bookings awaiting confirmation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.pending}
            </div>
            <p className="text-sm text-muted-foreground">Pending bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cancelled Bookings</CardTitle>
            <CardDescription>Bookings that were cancelled</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.cancelled}
            </div>
            <p className="text-sm text-muted-foreground">Cancelled bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Stay</CardTitle>
            <CardDescription>Average number of nights per stay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data?.averageStay || 0} nights</div>
            <p className="text-sm text-muted-foreground">Average stay duration</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>View and manage recent bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking: any) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.guest}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{booking.property}</TableCell>
                  <TableCell>{booking.checkIn}</TableCell>
                  <TableCell>{booking.checkOut}</TableCell>
                  <TableCell>
                    <Badge variant={(statusColors as any)[booking.status] || 'default'}>
                      {(statusLabels as any)[booking.status] || booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${booking.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log('View', booking.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Occupancy Summary</CardTitle>
          <CardDescription>Property occupancy statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900">High Demand</h3>
              <p className="text-2xl font-bold text-blue-900">{highDemandCount} properties</p>
              <p className="text-sm text-blue-700">Occupancy {'>'} 90%</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900">Good Performance</h3>
              <p className="text-2xl font-bold text-green-900">{goodPerfCount} properties</p>
              <p className="text-sm text-green-700">Occupancy 70-90%</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-900">Needs Attention</h3>
              <p className="text-2xl font-bold text-yellow-900">{needsAttentionCount} properties</p>
              <p className="text-sm text-yellow-700">Occupancy {'<'} 70%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

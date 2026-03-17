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

interface Booking {
  id: string;
  guest: string;
  property: string;
  checkIn: string;
  checkOut: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  totalAmount: number;
}

const bookings: Booking[] = [
  {
    id: '1',
    guest: 'Jane Smith',
    property: 'Cozy Studio',
    checkIn: '2024-01-15',
    checkOut: '2024-01-20',
    status: 'confirmed',
    totalAmount: 750
  },
  {
    id: '2',
    guest: 'Mike Johnson',
    property: 'Beach Villa',
    checkIn: '2024-01-18',
    checkOut: '2024-01-25',
    status: 'pending',
    totalAmount: 1750
  },
  {
    id: '3',
    guest: 'Tom Brown',
    property: 'Luxury Apartment',
    checkIn: '2024-01-20',
    checkOut: '2024-01-27',
    status: 'confirmed',
    totalAmount: 2100
  },
  {
    id: '4',
    guest: 'Sarah Williams',
    property: 'Downtown Loft',
    checkIn: '2024-01-22',
    checkOut: '2024-01-24',
    status: 'cancelled',
    totalAmount: 400
  }
];

const statusColors = {
  confirmed: 'default',
  pending: 'secondary',
  cancelled: 'destructive'
};

const statusLabels = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  cancelled: 'Cancelled'
};

export function OccupancyTracking() {
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
              {bookings.filter(booking => booking.status === 'confirmed').length}
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
              {bookings.filter(booking => booking.status === 'pending').length}
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
              {bookings.filter(booking => booking.status === 'cancelled').length}
            </div>
            <p className="text-sm text-muted-foreground">Cancelled bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Stay</CardTitle>
            <CardDescription>Average number of night per stay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5 nights</div>
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
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.guest}</TableCell>
                  <TableCell>{booking.property}</TableCell>
                  <TableCell>{booking.checkIn}</TableCell>
                  <TableCell>{booking.checkOut}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[booking.status] as any}>
                      {statusLabels[booking.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>${booking.totalAmount.toFixed(2)}</TableCell>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log('Calendar', booking.id)}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Calendar
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
              <p className="text-2xl font-bold text-blue-900">3 properties</p>
              <p className="text-sm text-blue-700">Occupancy {'>'} 90%</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900">Good Performance</h3>
              <p className="text-2xl font-bold text-green-900">5 properties</p>
              <p className="text-sm text-green-700">Occupancy 70-90%</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-900">Needs Attention</h3>
              <p className="text-2xl font-bold text-yellow-900">2 properties</p>
              <p className="text-sm text-yellow-700">Occupancy {'<'} 70%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

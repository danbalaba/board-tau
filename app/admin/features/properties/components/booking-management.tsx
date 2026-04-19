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
import { Eye, Calendar, Mail, Phone } from 'lucide-react';

interface Booking {
  id: string;
  guest: string;
  email: string;
  phone: string;
  property: string;
  checkIn: string;
  checkOut: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  totalAmount: number;
  paymentMethod: string;
}

import { usePropertyPerformance } from '@/app/admin/hooks/use-property-performance';

const statusColors = {
  reserved: 'default',
  checked_in: 'default',
  pending: 'secondary',
  cancelled: 'destructive',
  completed: 'outline'
};

const statusLabels = {
  reserved: 'Confirmed',
  checked_in: 'Checked In',
  pending: 'Pending',
  cancelled: 'Cancelled',
  completed: 'Completed'
};

export function BookingManagement() {
  const { data: apiResponse, isLoading, error } = usePropertyPerformance('30d');
  const data = apiResponse?.data;
  const bookings = data?.recentBookings || [];
  const stats = data?.bookingStats || { confirmed: 0, pending: 0, completed: 0, cancelled: 0 };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading bookings...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Booking Management</h2>
          <p className="text-muted-foreground">Manage all property bookings and reservations</p>
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
            <CardTitle>Completed Bookings</CardTitle>
            <CardDescription>Check-out completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.completed}
            </div>
            <p className="text-sm text-muted-foreground">Completed bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>Sum of all bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${data?.totalRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-sm text-muted-foreground">Total revenue</p>
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
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No bookings found in this period.
                  </TableCell>
                </TableRow>
              ) : bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{booking.guest}</div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{booking.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{booking.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{booking.property}</TableCell>
                  <TableCell>{booking.checkIn}</TableCell>
                  <TableCell>{booking.checkOut}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[booking.status] || 'default'}>
                      {statusLabels[booking.status] || booking.status}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Check-ins</CardTitle>
            <CardDescription>Bookings arriving soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings
                .filter(booking => (booking.status === 'reserved' || booking.status === 'confirmed') && new Date(booking.checkIn) >= new Date())
                .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
                .slice(0, 3)
                .map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{booking.guest}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[150px]">{booking.property}</div>
                      <div className="text-xs text-muted-foreground">{booking.checkIn}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => console.log('View', booking.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                ))}
              {bookings.filter(booking => (booking.status === 'reserved' || booking.status === 'confirmed') && new Date(booking.checkIn) >= new Date()).length === 0 && (
                <p className="text-sm text-center text-muted-foreground py-4">No upcoming check-ins.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Cancelled Bookings</CardTitle>
            <CardDescription>Recently cancelled reservations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings
                .filter(booking => booking.status === 'cancelled')
                .sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())
                .slice(0, 3)
                .map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{booking.guest}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[150px]">{booking.property}</div>
                      <div className="text-xs text-muted-foreground">{booking.checkIn}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => console.log('View', booking.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                ))}
              {bookings.filter(booking => booking.status === 'cancelled').length === 0 && (
                <p className="text-sm text-center text-muted-foreground py-4">No recent cancellations.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

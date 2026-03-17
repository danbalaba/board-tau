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

const bookings: Booking[] = [
  {
    id: '1',
    guest: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 (555) 123-4567',
    property: 'Cozy Studio',
    checkIn: '2024-01-15',
    checkOut: '2024-01-20',
    status: 'confirmed',
    totalAmount: 750,
    paymentMethod: 'Credit Card'
  },
  {
    id: '2',
    guest: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    phone: '+1 (555) 234-5678',
    property: 'Beach Villa',
    checkIn: '2024-01-18',
    checkOut: '2024-01-25',
    status: 'pending',
    totalAmount: 1750,
    paymentMethod: 'PayPal'
  },
  {
    id: '3',
    guest: 'Tom Brown',
    email: 'tom.brown@example.com',
    phone: '+1 (555) 345-6789',
    property: 'Luxury Apartment',
    checkIn: '2024-01-20',
    checkOut: '2024-01-27',
    status: 'confirmed',
    totalAmount: 2100,
    paymentMethod: 'Credit Card'
  },
  {
    id: '4',
    guest: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    phone: '+1 (555) 456-7890',
    property: 'Downtown Loft',
    checkIn: '2024-01-22',
    checkOut: '2024-01-24',
    status: 'cancelled',
    totalAmount: 400,
    paymentMethod: 'Credit Card'
  },
  {
    id: '5',
    guest: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 567-8901',
    property: 'Cozy Studio',
    checkIn: '2024-01-25',
    checkOut: '2024-01-30',
    status: 'completed',
    totalAmount: 750,
    paymentMethod: 'Debit Card'
  }
];

const statusColors = {
  confirmed: 'default',
  pending: 'secondary',
  cancelled: 'destructive',
  completed: 'outline'
};

const statusLabels = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  cancelled: 'Cancelled',
  completed: 'Completed'
};

export function BookingManagement() {
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
            <CardTitle>Completed Bookings</CardTitle>
            <CardDescription>Check-out completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {bookings.filter(booking => booking.status === 'completed').length}
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
              ${bookings.reduce((sum, booking) => sum + booking.totalAmount, 0).toFixed(2)}
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
              {bookings.map((booking) => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Check-ins</CardTitle>
            <CardDescription>Bookings arriving soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings
                .filter(booking => booking.status === 'confirmed' && new Date(booking.checkIn) > new Date())
                .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
                .slice(0, 3)
                .map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{booking.guest}</div>
                      <div className="text-sm text-muted-foreground">{booking.property}</div>
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
                      <div className="text-sm text-muted-foreground">{booking.property}</div>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

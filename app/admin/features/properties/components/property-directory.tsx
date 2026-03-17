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
import { Eye, Edit, Trash2 } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  host: string;
  location: string;
  type: string;
  status: 'active' | 'inactive' | 'pending';
  price: number;
  bedrooms: number;
  bathrooms: number;
  size: number;
  createdDate: string;
  lastUpdated: string;
}

const properties: Property[] = [
  {
    id: '1',
    name: 'Cozy Studio in Downtown',
    host: 'Jane Smith',
    location: 'New York, NY',
    type: 'Studio',
    status: 'active',
    price: 150,
    bedrooms: 0,
    bathrooms: 1,
    size: 450,
    createdDate: '2023-01-15T10:30:00Z',
    lastUpdated: '2024-01-10T09:15:00Z'
  },
  {
    id: '2',
    name: 'Beach Villa with Ocean View',
    host: 'Mike Johnson',
    location: 'Miami, FL',
    type: 'Villa',
    status: 'active',
    price: 250,
    bedrooms: 3,
    bathrooms: 2,
    size: 1200,
    createdDate: '2023-02-20T14:20:00Z',
    lastUpdated: '2024-01-09T16:45:00Z'
  },
  {
    id: '3',
    name: 'Luxury Apartment in City Center',
    host: 'Tom Brown',
    location: 'Los Angeles, CA',
    type: 'Apartment',
    status: 'pending',
    price: 300,
    bedrooms: 2,
    bathrooms: 2,
    size: 850,
    createdDate: '2023-03-10T08:15:00Z',
    lastUpdated: '2024-01-08T14:20:00Z'
  },
  {
    id: '4',
    name: 'Downtown Loft',
    host: 'Sarah Williams',
    location: 'Chicago, IL',
    type: 'Loft',
    status: 'inactive',
    price: 200,
    bedrooms: 1,
    bathrooms: 1,
    size: 600,
    createdDate: '2023-04-05T13:45:00Z',
    lastUpdated: '2024-01-07T11:30:00Z'
  }
];

const statusColors = {
  active: 'default',
  inactive: 'secondary',
  pending: 'destructive'
};

const statusLabels = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending'
};

export function PropertyDirectory() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Property Directory</h2>
          <p className="text-muted-foreground">Manage all properties on the platform</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Properties</CardTitle>
            <CardDescription>All properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{properties.length}</div>
            <p className="text-sm text-muted-foreground">Total properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Properties</CardTitle>
            <CardDescription>Currently available properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {properties.filter(prop => prop.status === 'active').length}
            </div>
            <p className="text-sm text-muted-foreground">Active properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Approval</CardTitle>
            <CardDescription>Properties awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {properties.filter(prop => prop.status === 'pending').length}
            </div>
            <p className="text-sm text-muted-foreground">Pending properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Price</CardTitle>
            <CardDescription>Average nightly price</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${(properties.reduce((sum, prop) => sum + prop.price, 0) / properties.length).toFixed(0)}
            </div>
            <p className="text-sm text-muted-foreground">Average price</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Properties</CardTitle>
          <CardDescription>View and manage all properties</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">{property.name}</TableCell>
                  <TableCell>{property.host}</TableCell>
                  <TableCell>{property.location}</TableCell>
                  <TableCell>{property.type}</TableCell>
                  <TableCell>${property.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[property.status] as any}>
                      {statusLabels[property.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(property.createdDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log('View', property.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log('Edit', property.id)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => console.log('Delete', property.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

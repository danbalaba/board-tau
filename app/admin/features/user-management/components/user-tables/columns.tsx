'use client';

import { Badge } from '@/app/admin/components/ui/badge';
import { DataTableColumnHeader } from '@/app/admin/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, XCircle, User, Mail, Shield } from 'lucide-react';
import { CellAction } from './cell-action';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'host' | 'renter' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  joinedAt: string;
  lastLogin: string;
  emailVerified: boolean;
  listingsCount: number;
  bookingsCount: number;
  totalSpent: number;
}

export const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'host', label: 'Host' },
  { value: 'renter', label: 'Renter' },
  { value: 'user', label: 'User' }
];

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' }
];

export const columns: ColumnDef<User, unknown>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ cell }) => (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <div className="font-medium">{cell.getValue<User['name']>()}</div>
        </div>
      </div>
    ),
    meta: {
      label: 'Name',
      placeholder: 'Search users...',
      variant: 'text',
      icon: User
    },
    enableColumnFilter: true
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ cell }) => (
      <div className="flex items-center space-x-2">
        <Mail className="h-4 w-4 text-gray-500" />
        <div className="text-sm">{cell.getValue<User['email']>()}</div>
      </div>
    ),
    meta: {
      label: 'Email',
      placeholder: 'Search emails...',
      variant: 'text',
      icon: Mail
    },
    enableColumnFilter: true
  },
  {
    id: 'role',
    accessorKey: 'role',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ cell }) => {
      const role = cell.getValue<User['role']>();

      const roleConfig = {
        admin: { variant: 'destructive' as const, label: 'Admin', icon: Shield },
        host: { variant: 'default' as const, label: 'Host', icon: User },
        renter: { variant: 'secondary' as const, label: 'Renter', icon: User },
        user: { variant: 'default' as const, label: 'User', icon: User }
      };

      const config = roleConfig[role] || {
        variant: 'default' as const,
        label: role || 'Unknown',
        icon: User
      };

      return (
        <Badge variant={config.variant} className="capitalize">
          <config.icon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Roles',
      variant: 'multiSelect',
      options: ROLE_OPTIONS
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<User['status']>();

      const statusConfig = {
        active: { variant: 'default' as const, label: 'Active', icon: CheckCircle2 },
        inactive: { variant: 'secondary' as const, label: 'Inactive', icon: XCircle },
        suspended: { variant: 'destructive' as const, label: 'Suspended', icon: XCircle }
      };

      const config = statusConfig[status] || {
        variant: 'default' as const,
        label: status || 'Unknown',
        icon: XCircle
      };

      return (
        <Badge variant={config.variant} className="capitalize">
          <config.icon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Status',
      variant: 'multiSelect',
      options: STATUS_OPTIONS
    }
  },
  {
    id: 'joinedAt',
    accessorKey: 'joinedAt',
    header: 'Joined At',
    cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleDateString()
  },
  {
    id: 'lastLogin',
    accessorKey: 'lastLogin',
    header: 'Last Login',
    cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleDateString()
  },
  {
    id: 'listingsCount',
    accessorKey: 'listingsCount',
    header: 'Listings',
    cell: ({ cell }) => cell.getValue<number>()
  },
  {
    id: 'bookingsCount',
    accessorKey: 'bookingsCount',
    header: 'Bookings',
    cell: ({ cell }) => cell.getValue<number>()
  },
  {
    id: 'totalSpent',
    accessorKey: 'totalSpent',
    header: 'Total Spent',
    cell: ({ cell }) => `$${cell.getValue<number>().toLocaleString()}`
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

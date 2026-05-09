'use client';

import { Badge } from '@/app/admin/components/ui/badge';
import { DataTableColumnHeader } from '@/app/admin/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { IconCheck, IconX, IconUser, IconMail, IconShield } from '@tabler/icons-react';
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
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center shadow-sm">
          <IconUser className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <div className="font-black text-sm text-gray-900 dark:text-white">{cell.getValue<User['name']>()}</div>
        </div>
      </div>
    ),
    meta: {
      label: 'Name',
      placeholder: 'Search users...',
      variant: 'text',
      icon: IconUser
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
      <div className="flex items-center space-x-2.5">
        <IconMail className="h-4 w-4 text-gray-400" />
        <div className="text-xs font-bold text-gray-500">{cell.getValue<User['email']>()}</div>
      </div>
    ),
    meta: {
      label: 'Email',
      placeholder: 'Search emails...',
      variant: 'text',
      icon: IconMail
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
        admin: { color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Admin', icon: IconShield },
        host: { color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Host', icon: IconUser },
        renter: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Renter', icon: IconUser },
        user: { color: 'text-gray-500', bg: 'bg-gray-500/10', label: 'User', icon: IconUser }
      };

      const config = roleConfig[role] || {
        color: 'text-gray-500',
        bg: 'bg-gray-500/10',
        label: role || 'Unknown',
        icon: IconUser
      };

      return (
        <Badge variant="outline" className={`capitalize border-none ${config.bg} ${config.color} text-[10px] font-black tracking-widest px-2.5 py-1 rounded-lg`}>
          <config.icon className="h-3 w-3 mr-1.5" />
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
        active: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Active', icon: IconCheck },
        inactive: { color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Inactive', icon: IconX },
        suspended: { color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Suspended', icon: IconX }
      };

      const config = statusConfig[status] || {
        color: 'text-gray-500',
        bg: 'bg-gray-500/10',
        label: status || 'Unknown',
        icon: IconX
      };

      return (
        <Badge variant="outline" className={`capitalize border-none ${config.bg} ${config.color} text-[10px] font-black tracking-widest px-2.5 py-1 rounded-lg`}>
          <config.icon className="h-3 w-3 mr-1.5" />
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
    cell: ({ cell }) => <span className="text-xs font-bold text-gray-500">{new Date(cell.getValue<string>()).toLocaleDateString()}</span>
  },
  {
    id: 'lastLogin',
    accessorKey: 'lastLogin',
    header: 'Last Login',
    cell: ({ cell }) => <span className="text-xs font-bold text-gray-500">{new Date(cell.getValue<string>()).toLocaleDateString()}</span>
  },
  {
    id: 'listingsCount',
    accessorKey: 'listingsCount',
    header: 'Listings',
    cell: ({ cell }) => <span className="text-sm font-black tabular-nums">{cell.getValue<number>()}</span>
  },
  {
    id: 'bookingsCount',
    accessorKey: 'bookingsCount',
    header: 'Bookings',
    cell: ({ cell }) => <span className="text-sm font-black tabular-nums">{cell.getValue<number>()}</span>
  },
  {
    id: 'totalSpent',
    accessorKey: 'totalSpent',
    header: 'Total Spent',
    cell: ({ cell }) => <span className="text-sm font-black text-emerald-500 tabular-nums">${cell.getValue<number>().toLocaleString()}</span>
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

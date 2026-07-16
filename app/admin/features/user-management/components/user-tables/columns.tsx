'use client';

import { Badge } from '@/app/admin/components/ui/badge';
import { DataTableColumnHeader } from '@/app/admin/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { IconCheck, IconX, IconUser, IconMail, IconShield, IconBan } from '@tabler/icons-react';
import { CellAction } from './cell-action';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: 'admin' | 'host' | 'renter' | 'user';
  status: 'active' | 'inactive' | 'suspended' | 'banned';
  joinedAt: string;
  lastLogin: string;
  emailVerified: boolean;
  listingsCount: number;
  bookingsCount: number;
}

export const ROLE_OPTIONS = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'LANDLORD', label: 'Landlord' },
  { value: 'USER', label: 'User' }
];

// System admins (ADMIN role) must only see USER and LANDLORD in the filter dropdown
export const RESTRICTED_ROLE_OPTIONS = [
  { value: 'LANDLORD', label: 'Landlord' },
  { value: 'USER', label: 'User' }
];

export function getRoleOptions(callerRole?: string | null) {
  if (callerRole === 'SUPER_ADMIN') return ROLE_OPTIONS;
  return RESTRICTED_ROLE_OPTIONS;
}

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'banned', label: 'Banned' }
];

// Default columns using full role options (backwards compat for static import)
export const columns: ColumnDef<User, unknown>[] = getColumns();

export function getColumns(callerRole?: string | null): ColumnDef<User, unknown>[] {
  const roleOptions = getRoleOptions(callerRole);

  return [
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }: { column: Column<User, unknown> }) => (
        <DataTableColumnHeader column={column} title='Name' />
      ),
      cell: ({ row }) => {
        const name = row.getValue<string>('name');
        const image = row.original.image;
        return (
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden shadow-sm shrink-0">
              {image ? (
                <img
                  src={image}
                  alt={name ?? 'User avatar'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-500/10 flex items-center justify-center">
                  <IconUser className="h-5 w-5 text-blue-500" />
                </div>
              )}
            </div>
            <div className="font-black text-sm text-gray-900 dark:text-gray-100 truncate max-w-[140px]">{name}</div>
          </div>
        );
      },
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
          <IconMail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          <div className="text-xs font-bold text-gray-500 dark:text-gray-300">{cell.getValue<User['email']>()}</div>
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
        const role = cell.getValue<User['role']>() as string;

        const roleConfig: Record<string, any> = {
          SUPER_ADMIN: { color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Super Admin', icon: IconShield },
          ADMIN: { color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Admin', icon: IconShield },
          LANDLORD: { color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Landlord', icon: IconUser },
          USER: { color: 'text-gray-500', bg: 'bg-gray-500/10', label: 'User', icon: IconUser }
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
        options: roleOptions
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
          suspended: { color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Suspended', icon: IconX },
          banned: { color: 'text-red-600', bg: 'bg-red-600/10', label: 'Banned', icon: IconBan }
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
      meta: { label: 'Joined At' },
      cell: ({ cell }) => <span className="text-xs font-bold text-gray-500 dark:text-gray-300">{new Date(cell.getValue<string>()).toLocaleDateString()}</span>
    },
    {
      id: 'lastLogin',
      accessorKey: 'lastLogin',
      header: 'Last Login',
      meta: { label: 'Last Login' },
      cell: ({ cell }) => {
        const val = cell.getValue<string>();
        return <span className="text-xs font-bold text-gray-500 dark:text-gray-300">{val ? new Date(val).toLocaleDateString() : '—'}</span>;
      }
    },
    {
      id: 'listingsCount',
      accessorKey: 'listingsCount',
      header: 'Listings',
      meta: { label: 'Listings' },
      cell: ({ cell }) => <span className="text-sm font-black tabular-nums">{cell.getValue<number>()}</span>
    },
    {
      id: 'bookingsCount',
      accessorKey: 'bookingsCount',
      header: 'Bookings',
      meta: { label: 'Bookings' },
      cell: ({ cell }) => <span className="text-sm font-black tabular-nums">{cell.getValue<number>()}</span>
    },
    {
      id: 'actions',
      cell: ({ row }) => <CellAction data={row.original} />
    }
  ];
}

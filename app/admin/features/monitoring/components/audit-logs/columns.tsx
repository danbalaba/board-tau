'use client';

import { Badge } from '@/app/admin/components/ui/badge';
import { DataTableColumnHeader } from '@/app/admin/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { IconUser, IconActivity, IconShieldLock } from '@tabler/icons-react';

export interface AuditLog {
  id: string;
  admin?: { name: string; role: string };
  action: string;
  entityType: string;
  entityId: string;
  environment?: string;
  createdAt: string;
  details?: string | any;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'text-emerald-500 bg-emerald-500/10',
  PUBLISH: 'text-emerald-500 bg-emerald-500/10',
  UPDATE: 'text-blue-500 bg-blue-500/10',
  DELETE: 'text-red-500 bg-red-500/10',
  UNPUBLISH: 'text-amber-500 bg-amber-500/10',
};

export const getColumns = (onViewDetails: (log: AuditLog) => void): ColumnDef<AuditLog, unknown>[] => [
  {
    id: 'user',
    accessorFn: (row) => row.admin?.name || 'Unknown',
    header: ({ column }: { column: Column<AuditLog, unknown> }) => (
      <DataTableColumnHeader column={column} title='User' />
    ),
    cell: ({ row }) => {
      const name = row.original.admin?.name || 'Unknown Admin';
      const role = row.original.admin?.role || 'Admin';
      return (
        <div className="flex items-center space-x-3">
          <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-sm shrink-0 bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold">
            {name.charAt(0)}
          </div>
          <div>
            <div className="font-black text-sm text-gray-900 dark:text-gray-100 truncate max-w-[140px]">{name}</div>
            <div className="text-[10px] text-gray-500 capitalize">{role.toLowerCase()}</div>
          </div>
        </div>
      );
    },
    meta: {
      label: 'User',
      placeholder: 'Search user...',
      variant: 'text',
      icon: IconUser
    },
    enableColumnFilter: true
  },
  {
    id: 'entityId',
    accessorKey: 'entityId',
    header: ({ column }: { column: Column<AuditLog, unknown> }) => (
      <DataTableColumnHeader column={column} title='Entity ID' />
    ),
    cell: ({ cell }) => (
      <div className="font-mono text-xs text-gray-600 dark:text-gray-400 bg-gray-100/50 dark:bg-gray-800/50 px-2 py-1 rounded-md w-fit">
        {cell.getValue<string>() ? `${cell.getValue<string>().substring(0, 12)}...` : '-'}
      </div>
    ),
    meta: {
      label: 'Entity ID',
      placeholder: 'Search ID...',
      variant: 'text'
    },
    enableColumnFilter: true
  },
  {
    id: 'action',
    accessorKey: 'action',
    header: ({ column }: { column: Column<AuditLog, unknown> }) => (
      <DataTableColumnHeader column={column} title='Action' />
    ),
    cell: ({ cell }) => {
      const action = cell.getValue<string>()?.toUpperCase() || 'UNKNOWN';
      const colorClass = ACTION_COLORS[action] || 'text-gray-500 bg-gray-500/10';

      return (
        <Badge variant="outline" className={`capitalize border-none ${colorClass} text-[10px] font-black tracking-widest px-2.5 py-1 rounded-lg`}>
          <IconActivity className="h-3 w-3 mr-1.5" />
          {action}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Action',
      variant: 'multiSelect',
      options: [
        { value: 'CREATE', label: 'Create' },
        { value: 'UPDATE', label: 'Update' },
        { value: 'DELETE', label: 'Delete' },
        { value: 'PUBLISH', label: 'Publish' },
        { value: 'UNPUBLISH', label: 'Unpublish' }
      ]
    }
  },
  {
    id: 'entityType',
    accessorKey: 'entityType',
    header: ({ column }: { column: Column<AuditLog, unknown> }) => (
      <DataTableColumnHeader column={column} title='Type' />
    ),
    cell: ({ cell }) => (
      <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
        {cell.getValue<string>() || 'System'}
      </span>
    ),
    enableColumnFilter: true,
    meta: {
      label: 'Type',
      placeholder: 'Filter type...',
      variant: 'text'
    }
  },
  {
    id: 'environment',
    accessorKey: 'environment',
    header: 'Environment',
    meta: { label: 'Environment' },
    cell: ({ row }) => (
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {row.original.environment || 'Master'}
      </span>
    )
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: 'Timestamp',
    meta: { label: 'Timestamp' },
    cell: ({ cell }) => {
      const d = new Date(cell.getValue<string>());
      return (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-900 dark:text-gray-300">{d.toLocaleDateString()}</span>
          <span className="text-[10px] text-gray-500">{d.toLocaleTimeString()}</span>
        </div>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      // Lazy import to avoid circular dep if any, or just import top level.
      const { CellAction } = require('./cell-action');
      return <CellAction data={row.original} onViewDetails={onViewDetails} />;
    }
  }
];

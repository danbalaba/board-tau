'use client';

import { Badge } from '@/app/admin/components/ui/badge';
import { DataTableColumnHeader } from '@/app/admin/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { IconUser, IconActivity } from '@tabler/icons-react';
import { CellAction } from './cell-action';

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

// Friendly human names for technical Prisma model names
const ENTITY_TYPE_LABELS: Record<string, string> = {
  FeatureFlag: 'Feature Flag',
  CampusLandmark: 'TAU Landmark',
  PropertyType: 'Property Category',
  Listing: 'Property Listing',
  RoomTypeDefinition: 'Room Type',
  Attribute: 'Amenity & Rule',
  User: 'User Account',
  HostApplication: 'Host Application'
};

// Format human-friendly action labels dynamically across all platform entities
export const formatAuditActionLabel = (action: string, entityType?: string): string => {
  if (!action) return 'Action';
  const act = action.toUpperCase();

  // 1. System Backups & Restores
  if (act === 'AUTOMATED_SYSTEM_BACKUP') return 'Automated System Backup';
  if (act === 'PRE_RESTORE_SAFETY_SNAPSHOT') return 'Safety Snapshot';
  if (act === 'SYSTEM_RESTORE') return 'System Restore';
  if (act === 'MANUAL_SYSTEM_BACKUP' || act === 'BACKUP_CREATED') return 'Manual System Backup';

  // 2. Specific Snake Case DB actions
  if (act === 'PROPERTY_TYPE_CREATED') return 'Create Category';
  if (act === 'PROPERTY_TYPE_UPDATED') return 'Update Category';
  if (act === 'PROPERTY_TYPE_ENABLED') return 'Enable Category';
  if (act === 'PROPERTY_TYPE_DISABLED') return 'Disable Category';
  if (act === 'PROPERTY_TYPE_DELETED') return 'Delete Category';
  if (act === 'CASCADED_UNPUBLISHED_LISTINGS') return 'Unpublish Listings (Cascaded)';

  if (act === 'ROOM_TYPE_CREATED') return 'Create Room Type';
  if (act === 'ROOM_TYPE_UPDATED') return 'Update Room Type';
  if (act === 'ROOM_TYPE_ENABLED') return 'Enable Room Type';
  if (act === 'ROOM_TYPE_DISABLED') return 'Disable Room Type';
  if (act === 'ROOM_TYPE_DELETED') return 'Delete Room Type';

  // 3. Generic Action verb mappings
  if (act === 'CREATE') {
    if (entityType === 'CampusLandmark') return 'Create Landmark';
    if (entityType === 'PropertyType') return 'Create Property Category';
    if (entityType === 'FeatureFlag') return 'Create Feature Flag';
    if (entityType === 'DynamicAttribute' || entityType === 'Attribute') return 'Create Attribute';
    if (entityType === 'AttributeSubGroup') return 'Create Sub-Group';
    if (entityType === 'RoomTypeDefinition' || entityType === 'RoomType') return 'Create Room Type';
    if (entityType === 'Listing') return 'Create Listing';
    if (entityType === 'User') return 'Create User Account';
    return 'Create Item';
  }
  if (act === 'UPDATE' || act === 'PATCH') {
    if (entityType === 'CampusLandmark') return 'Update Landmark';
    if (entityType === 'PropertyType') return 'Update Property Category';
    if (entityType === 'FeatureFlag') return 'Update Feature Flag';
    if (entityType === 'DynamicAttribute' || entityType === 'Attribute') return 'Update Attribute';
    if (entityType === 'AttributeSubGroup') return 'Update Sub-Group';
    if (entityType === 'RoomTypeDefinition' || entityType === 'RoomType') return 'Update Room Type';
    if (entityType === 'Listing') return 'Update Listing';
    if (entityType === 'User') return 'Update User Account';
    return 'Update Item';
  }
  if (act === 'DELETE' || act === 'REMOVE') {
    if (entityType === 'CampusLandmark') return 'Delete Landmark';
    if (entityType === 'PropertyType') return 'Delete Category';
    if (entityType === 'FeatureFlag') return 'Delete Feature Flag';
    if (entityType === 'DynamicAttribute' || entityType === 'Attribute') return 'Delete Attribute';
    if (entityType === 'AttributeSubGroup') return 'Delete Sub-Group';
    if (entityType === 'RoomTypeDefinition' || entityType === 'RoomType') return 'Delete Room Type';
    if (entityType === 'Listing') return 'Delete Listing';
    if (entityType === 'User') return 'Delete User Account';
    return 'Delete Item';
  }
  if (act === 'PUBLISH' || act === 'PUBLISH_LISTING') {
    return entityType === 'Listing' ? 'Publish Listing' : 'Publish Item';
  }
  if (act === 'UNPUBLISH' || act === 'UNPUBLISH_LISTING') {
    return entityType === 'Listing' ? 'Unpublish Listing' : 'Unpublish Item';
  }

  return action
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

// Color-coded badges per action category (matching Property Configuration style)
const getActionStyle = (action: string) => {
  const act = action.toUpperCase();

  // Backup & Safety Snapshots -> Indigo
  if (act.includes('BACKUP') || act.includes('SNAPSHOT')) {
    return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20';
  }
  // System Restore -> Violet
  if (act.includes('RESTORE')) {
    return 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20';
  }
  // Create / Enable / Add -> Emerald Green
  if (act.includes('CREATE') || act.includes('ENABLE') || act.includes('ADD')) {
    return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
  }
  // Update / Edit / Change / Patch -> Blue
  if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('CHANGE') || act.includes('PATCH')) {
    return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';
  }
  // Approve / Publish -> Teal
  if (act.includes('APPROVE') || act.includes('PUBLISH')) {
    return 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20';
  }
  // Disable / Unpublish / Lock -> Amber
  if (act.includes('DISABLE') || act.includes('UNPUBLISH') || act.includes('LOCK')) {
    return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
  }
  // Delete / Remove / Reject -> Rose
  if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('REJECT')) {
    return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20';
  }
  return 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20';
};

export const getColumns = (onViewDetails: (log: AuditLog) => void): ColumnDef<AuditLog, unknown>[] => [
  {
    id: 'user',
    accessorFn: (row) => row.admin?.name || 'System Administrator',
    header: ({ column }: { column: Column<AuditLog, unknown> }) => (
      <DataTableColumnHeader column={column} title='User' />
    ),
    cell: ({ row }) => {
      const name = row.original.admin?.name || 'BoardTAU Super Admin';
      const role = row.original.admin?.role ? row.original.admin.role.replace('_', ' ') : 'Super Admin';
      return (
        <div className="flex items-center space-x-3">
          <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-sm shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 font-extrabold text-xs border border-slate-200 dark:border-slate-700">
            {name.charAt(0)}
          </div>
          <div>
            <div className="font-extrabold text-xs text-gray-900 dark:text-white truncate max-w-[150px]">{name}</div>
            <div className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{role}</div>
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
    id: 'action',
    accessorKey: 'action',
    header: ({ column }: { column: Column<AuditLog, unknown> }) => (
      <DataTableColumnHeader column={column} title='Action' />
    ),
    cell: ({ row, cell }) => {
      const rawAction = cell.getValue<string>() || 'UNKNOWN';
      const formattedAction = formatAuditActionLabel(rawAction, row.original.entityType);
      const styleClass = getActionStyle(rawAction);

      return (
        <Badge variant="outline" className={`border ${styleClass} text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm`}>
          <IconActivity className="h-3 w-3 shrink-0" />
          <span>{formattedAction}</span>
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
      <DataTableColumnHeader column={column} title='Target' />
    ),
    cell: ({ cell }) => {
      const rawType = cell.getValue<string>() || 'System';
      const label = ENTITY_TYPE_LABELS[rawType] || rawType.replace(/([A-Z])/g, ' $1').trim();
      return (
        <span className="text-xs font-extrabold text-gray-800 dark:text-gray-200">
          {label}
        </span>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Target',
      placeholder: 'Filter target...',
      variant: 'text'
    }
  },
  {
    id: 'entityId',
    accessorKey: 'entityId',
    header: ({ column }: { column: Column<AuditLog, unknown> }) => (
      <DataTableColumnHeader column={column} title='Record Reference' />
    ),
    cell: ({ cell }) => {
      const val = cell.getValue<string>();
      if (!val) return <span className="text-xs text-gray-400 font-bold">-</span>;
      const shortId = val.length > 8 ? `...${val.substring(val.length - 8)}` : val;
      return (
        <div className="font-mono text-[11px] font-bold text-gray-600 dark:text-gray-400 bg-gray-100/80 dark:bg-gray-800/80 px-2.5 py-1 rounded-lg w-fit border border-gray-200/50 dark:border-gray-700/50">
          {shortId}
        </div>
      );
    },
    meta: {
      label: 'Record Reference',
      placeholder: 'Search ID...',
      variant: 'text'
    },
    enableColumnFilter: true
  },
  {
    id: 'environment',
    accessorKey: 'environment',
    header: 'Environment',
    meta: { label: 'Environment' },
    cell: () => (
      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
        Production
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
          <span className="text-xs font-extrabold text-gray-900 dark:text-white">{d.toLocaleDateString()}</span>
          <span className="text-[10px] font-bold text-gray-400">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <CellAction data={row.original} onViewDetails={onViewDetails} />
    )
  }
];



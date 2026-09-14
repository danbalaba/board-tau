'use client';

import dynamic from 'next/dynamic';
import { DataTable } from '@/app/admin/components/ui/table/data-table';
import { useDataTable } from '@/app/admin/hooks/use-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { parseAsString, useQueryState } from 'nuqs';
import { User } from './columns';

const DataTableToolbar = dynamic(
  () => import('@/app/admin/components/ui/table/data-table-toolbar').then((mod) => mod.DataTableToolbar),
  { ssr: false }
);

interface UserTableParams<TData, TValue> {
  data: TData[];
  totalItems: number;
  columns: ColumnDef<TData, TValue>[];
  isLoading?: boolean;
  toolbarActions?: React.ReactNode;
}

export function UserTable<TData, TValue>({
  data,
  totalItems,
  columns,
  isLoading,
  toolbarActions
}: UserTableParams<TData, TValue>) {
  const [pageSize] = useQueryState('perPage', parseAsString.withDefault('10'));
  const pageCount = Math.max(1, Math.ceil(totalItems / parseInt(pageSize)));

  const { table } = useDataTable({
    data: data,
    columns: columns as any,
    shallow: true,
    debounceMs: 500,
    pageCount: pageCount
  });

  return (
    <DataTable table={table} isLoading={isLoading}>
      <DataTableToolbar table={table as any}>
        {toolbarActions}
      </DataTableToolbar>
    </DataTable>
  );
}

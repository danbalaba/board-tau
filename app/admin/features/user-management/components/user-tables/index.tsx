'use client';

import { DataTable } from '@/app/admin/components/ui/table/data-table';
import { DataTableToolbar } from '@/app/admin/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/app/admin/hooks/use-data-table';
import { ColumnDef } from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';
import { User } from './columns';

interface UserTableParams<TData, TValue> {
  data: TData[];
  totalItems: number;
  columns: ColumnDef<TData, TValue>[];
}

export function UserTable<TData, TValue>({
  data,
  totalItems,
  columns
}: UserTableParams<TData, TValue>) {
  console.log('Raw data:', data); // Debug log to see if we're getting data
  console.log('Total items:', totalItems); // Debug log to see total items

  const { table } = useDataTable({
    data: data,
    columns: columns as any,
    shallow: false,
    debounceMs: 500,
    pageCount: 1 // We'll use client-side pagination
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}

import { type Table as TanstackTable, flexRender } from '@tanstack/react-table';
import * as React from 'react';

import { DataTablePagination } from "./data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../table";
import { getCommonPinningStyles } from "../../../lib/data-table";
import { ScrollArea, ScrollBar } from "../scroll-area";

import { IconInbox, IconLoader2 } from '@tabler/icons-react';

interface DataTableProps<TData> extends React.ComponentProps<'div'> {
  table: TanstackTable<TData>;
  actionBar?: React.ReactNode;
  isLoading?: boolean;
}

export function DataTable<TData>({
  table,
  actionBar,
  isLoading,
  children
}: DataTableProps<TData>) {
  const columnFilters = table.getState().columnFilters;
  const pagination = table.getState().pagination;
  const [isTableStateLoading, setIsTableStateLoading] = React.useState(false);
  const prevTableStateRef = React.useRef({ columnFilters, pagination });

  React.useEffect(() => {
    const currentState = { columnFilters, pagination };
    if (JSON.stringify(prevTableStateRef.current) !== JSON.stringify(currentState)) {
      prevTableStateRef.current = currentState;
      setIsTableStateLoading(true);
      const timer = setTimeout(() => setIsTableStateLoading(false), 250);
      return () => clearTimeout(timer);
    }
  }, [columnFilters, pagination]);

  const showLoading = isLoading || isTableStateLoading;

  return (
    <div className='space-y-4'>
      {children}
      <div className='relative'>
        <div className='flex flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-xl shadow-lg'>
          <ScrollArea className='w-full'>
            <Table>
              <TableHeader className='sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80'>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-slate-200 dark:border-slate-800">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className="py-3.5 px-4 text-xs font-semibold text-slate-500 dark:text-slate-400"
                        style={{
                          ...getCommonPinningStyles({ column: header.column })
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {showLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className='h-[400px] text-center'
                    >
                      <div className="flex flex-col items-center justify-center">
                        <IconLoader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-sm font-semibold text-muted-foreground dark:text-slate-300">Loading records...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/60"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="py-3.5 px-4 text-sm font-normal text-slate-700 dark:text-slate-300"
                          style={{
                            ...getCommonPinningStyles({ column: cell.column })
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className='h-[400px] text-center'
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center">
                          <IconInbox className="h-8 w-8 text-slate-400 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No Results Found</p>
                          <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">Try adjusting your filters or search terms.</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
          
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <DataTablePagination table={table} />
          </div>
        </div>
      </div>
      {actionBar && table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className='flex flex-col gap-2.5'>
          {actionBar}
        </div>
      )}
    </div>
  );
}

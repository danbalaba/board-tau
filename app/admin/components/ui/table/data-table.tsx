import { type Table as TanstackTable, flexRender } from '@tanstack/react-table';
import type * as React from 'react';

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

  return (
    <div className='space-y-4'>
      {children}
      <div className='relative'>
        <div className='flex flex-col overflow-hidden rounded-[2rem] border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-lg'>
          <ScrollArea className='w-full'>
            <Table>
              <TableHeader className='sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800'>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-gray-100 dark:border-gray-800">
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-gray-500"
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
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className='h-[400px] text-center'
                    >
                      <div className="flex flex-col items-center justify-center">
                        <IconLoader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-sm font-bold tracking-widest uppercase text-muted-foreground dark:text-gray-300">Loading records...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className="group transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="py-5 px-6"
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
                        <div className="w-16 h-16 rounded-3xl bg-muted/50 dark:bg-white/10 flex items-center justify-center">
                          <IconInbox className="h-8 w-8 text-muted-foreground dark:text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold tracking-widest uppercase text-muted-foreground dark:text-gray-200">No Results Found</p>
                          <p className="text-xs mt-1 text-muted-foreground/60 dark:text-gray-400">Try adjusting your filters or search terms.</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
          
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40">
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

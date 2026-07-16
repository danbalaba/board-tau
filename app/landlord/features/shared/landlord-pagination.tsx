'use client';

import React from 'react';
import { IconChevronLeft, IconChevronRight, IconChevronDown } from '@tabler/icons-react';
import { cn } from '@/utils/helper';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';

interface LandlordPaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  totalItems: number;
  itemName?: string;
}

export function LandlordPagination({
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  totalItems,
  itemName = "items"
}: LandlordPaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 mt-6 border-t border-gray-100 dark:border-gray-800 sm:pr-24">
      <div className="flex items-center gap-4">
        <span className="text-[11px] font-black uppercase tracking-[0.1em] text-gray-500">
          Showing {startItem}-{endItem} of {totalItems} {itemName}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 hover:text-primary transition-all shadow-sm">
              {itemsPerPage} per page
              <IconChevronDown size={14} className="opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-32 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-[150]">
            {[10, 20, 30, 50].map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => onItemsPerPageChange(size)}
                className={cn(
                  "cursor-pointer px-3 py-2 text-xs font-bold transition-all",
                  itemsPerPage === size ? "bg-primary/10 text-primary" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                {size} per page
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <IconChevronLeft size={16} strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-2 text-gray-400">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black transition-all",
                    currentPage === page 
                      ? "bg-primary text-white shadow-md shadow-primary/20" 
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <IconChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

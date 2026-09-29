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
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 py-4 sm:py-6 mt-4 sm:mt-6 border-t border-gray-100 dark:border-gray-800 sm:pr-24 pb-6 sm:pb-0">
      
      {/* Summary Text & Per-Page Selector (Edge-to-Edge on Mobile) */}
      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3">
        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.1em] text-gray-500 truncate">
          Showing {startItem}-{endItem} of {totalItems} {itemName}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700 text-[11px] font-black text-gray-700 dark:text-gray-200 hover:text-primary transition-all shadow-xs cursor-pointer shrink-0">
              <span>{itemsPerPage} per page</span>
              <IconChevronDown size={14} className="opacity-50 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-[150]">
            {[10, 20, 30, 50].map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => onItemsPerPageChange(size)}
                className={cn(
                  "cursor-pointer px-3 py-2 text-xs font-bold transition-all",
                  itemsPerPage === size ? "bg-primary/10 text-primary font-black" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                )}
              >
                {size} per page
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile-Optimized Page Navigation Controls */}
      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-1.5 pt-3 sm:pt-0 border-t border-gray-100/60 dark:border-gray-800/60 sm:border-0">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-primary hover:border-primary/50 hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-extrabold cursor-pointer"
        >
          <IconChevronLeft size={16} strokeWidth={2.5} />
          <span className="sm:hidden text-[10px] font-black uppercase tracking-wider">Prev</span>
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-1 text-xs text-gray-400 font-bold">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black transition-all cursor-pointer",
                    currentPage === page 
                      ? "bg-primary text-white shadow-md shadow-primary/20 font-black scale-105" 
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold"
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
          className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-primary hover:border-primary/50 hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-extrabold cursor-pointer"
        >
          <span className="sm:hidden text-[10px] font-black uppercase tracking-wider">Next</span>
          <IconChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>

    </div>
  );
}

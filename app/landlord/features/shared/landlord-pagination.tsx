'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);

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

        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white dark:bg-gray-800/90 rounded-xl sm:rounded-2xl border text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all duration-300 shadow-xs cursor-pointer shrink-0 select-none",
              isOpen
                ? "border-primary bg-primary/10 text-primary shadow-sm ring-2 ring-primary/20"
                : "border-gray-200/80 dark:border-gray-700/80 text-gray-700 dark:text-gray-200 hover:border-primary/50 hover:text-primary"
            )}>
              <span>{itemsPerPage} per page</span>
              <div className={cn(
                "w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0",
                isOpen
                  ? "bg-primary/20 text-primary rotate-180"
                  : "bg-gray-100 dark:bg-gray-700/60 text-gray-400 group-hover:text-primary"
              )}>
                <ChevronDown size={13} strokeWidth={2.5} />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px] bg-white dark:bg-[#111827] border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-1.5 shadow-2xl z-[150] space-y-1">
            {[10, 20, 30, 50].map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => onItemsPerPageChange(size)}
                className={cn(
                  "cursor-pointer px-3 py-2.5 rounded-xl text-[10px] sm:text-[11px] uppercase tracking-wider font-black transition-all flex items-center justify-between select-none",
                  itemsPerPage === size 
                    ? "bg-primary/10 text-primary font-black border border-primary/20" 
                    : "text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-800/80"
                )}
              >
                <span>{size} per page</span>
                {itemsPerPage === size && (
                  <Check size={14} className="text-primary shrink-0 ml-2" strokeWidth={3} />
                )}
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
          <ChevronLeft size={16} strokeWidth={2.5} />
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
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>

    </div>
  );
}

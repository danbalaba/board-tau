'use client';

import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface PaginationProps {
  current: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  current,
  total,
  perPage,
  onPageChange,
  className = '',
}) => {
  const totalPages = Math.ceil(total / perPage);

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== current) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, 'ellipsis', totalPages);
      } else if (current >= totalPages - 2) {
        pages.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, 'ellipsis', current - 1, current, current + 1, 'ellipsis', totalPages);
      }
    }

    return pages.map((page, index) => {
      if (page === 'ellipsis') {
        return (
          <span key={index} className="px-3 py-1 text-gray-400 dark:text-gray-500">
            ...
          </span>
        );
      }

      const pageNum = page as number;

      return (
        <button
          key={index}
          onClick={() => handlePageClick(pageNum)}
          className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
            pageNum === current
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600'
          }`}
        >
          {pageNum}
        </button>
      );
    });
  };

  return (
    <div className={`flex items-center justify-between p-6 ${className}`}>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {Math.min(perPage * (current - 1) + 1, total)} to{' '}
        {Math.min(perPage * current, total)} of{' '}
        {total} entries
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePageClick(current - 1)}
          disabled={current <= 1}
          className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FaChevronLeft className="text-sm" />
          <span>Previous</span>
        </button>

        {renderPageNumbers()}

        <button
          onClick={() => handlePageClick(current + 1)}
          disabled={current >= totalPages}
          className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span>Next</span>
          <FaChevronRight className="text-sm" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

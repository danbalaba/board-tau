'use client';

import React, { useState } from 'react';
import { FaSearch, FaFilter, FaDownload, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface Column {
  key: string;
  title: string | React.ReactNode;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  onRowClick?: (row: any) => void;
  searchable?: boolean;
  filterable?: boolean;
  pagination?: {
    current: number;
    total: number;
    perPage: number;
    onPageChange: (page: number) => void;
  };
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  loading = false,
  onRowClick,
  searchable = false,
  filterable = false,
  pagination,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(row => {
    if (!searchTerm) return true;
    return Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
      {/* Table header with controls */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Table Title
          </h3>
          {filterable && (
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
              <FaFilter className="text-sm" />
              <span>Filters</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {searchable && (
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
          )}

          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
            <FaDownload className="text-sm" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-700">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="text-left py-3 px-6 text-sm font-semibold text-gray-600 dark:text-gray-400"
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 px-6 text-center text-gray-500 dark:text-gray-400"
                >
                  No data available
                </td>
              </tr>
            ) : (
              filteredData.map((row, index) => (
                <tr
                  key={index}
                  className={`border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="py-4 px-6 text-sm">
                      {column.render ? (
                        column.render(row[column.key], row)
                      ) : (
                        <span className="text-gray-800 dark:text-white">
                          {row[column.key]}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-slate-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {Math.min(pagination.perPage * (pagination.current - 1) + 1, pagination.total)} to{' '}
            {Math.min(pagination.perPage * pagination.current, pagination.total)} of{' '}
            {pagination.total} entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.current - 1)}
              disabled={pagination.current <= 1}
              className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaChevronLeft className="text-sm" />
              <span>Previous</span>
            </button>

            {Array.from({ length: Math.ceil(pagination.total / pagination.perPage) }).map((_, index) => {
              const page = index + 1;
              if (
                page === 1 ||
                page === Math.ceil(pagination.total / pagination.perPage) ||
                (page >= pagination.current - 1 && page <= pagination.current + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => pagination.onPageChange(page)}
                    className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                      page === pagination.current
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === pagination.current - 2 || page === pagination.current + 2) {
                return <span key={page} className="px-3 py-1 text-gray-400">...</span>;
              }
              return null;
            })}

            <button
              onClick={() => pagination.onPageChange(pagination.current + 1)}
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.perPage)}
              className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <FaChevronRight className="text-sm" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;

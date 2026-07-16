'use client';

import React from 'react';
import { useTransactionsLogic } from '../../hooks/use-transactions-logic';
import { AdminTransactionHeader } from './admin-transaction-header';
import { TransactionKPICards } from './transaction-kpi-cards';
import { TransactionsListView } from './transactions-list-view';
import { toast } from '@/app/admin/components/ui/sonner';

export function TransactionsManagement() {
  const {
    filteredTransactions,
    stats,
    total,
    isLoading,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    handleRefresh
  } = useTransactionsLogic();

  const handleExport = (format: 'CSV' | 'EXCEL' | 'PDF') => {
    if (filteredTransactions.length === 0) {
      toast.error('No transactions available to export.');
      return;
    }

    if (format === 'CSV') {
      const headers = ['Transaction ID', 'User', 'Email', 'Property', 'Room', 'Start Date', 'End Date', 'Price', 'Payment Status', 'Payment Method', 'Reference'];
      const rows = filteredTransactions.map(tx => [
        tx.id,
        tx.user?.name || 'Unknown',
        tx.user?.email || 'N/A',
        tx.listing?.title || 'Unknown',
        tx.room?.name || 'N/A',
        new Date(tx.startDate).toLocaleDateString(),
        new Date(tx.endDate).toLocaleDateString(),
        tx.totalPrice,
        tx.paymentStatus,
        tx.paymentMethod || 'Stripe',
        tx.paymentReference || 'N/A'
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Transactions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Transaction CSV exported successfully.');
    } else {
      toast.success(`Exporting as ${format}...`);
      // PDF and EXCEL implementations would go here using actual libraries
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminTransactionHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        handleRefresh={handleRefresh}
        isLoading={isLoading}
        onExport={handleExport}
      />

      <TransactionKPICards 
        stats={stats} 
        total={total} 
        isLoading={isLoading} 
      />

      <TransactionsListView 
        filteredTransactions={filteredTransactions}
        isLoading={isLoading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        viewMode={viewMode}
      />
    </div>
  );
}

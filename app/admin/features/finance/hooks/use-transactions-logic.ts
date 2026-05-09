import { useState, useMemo } from 'react';
import { useTransactions } from '@/app/admin/hooks/use-transactions';

export function useTransactionsLogic() {
  const { data: apiResponse, isLoading, error, refetch } = useTransactions();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const transactions = apiResponse?.data || [];
  const stats = apiResponse?.meta?.stats || { totalAmount: 0, completedCount: 0, failedCount: 0 };
  const total = apiResponse?.meta?.total || 0;

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((tx: any) => 
        tx.id.toLowerCase().includes(q) || 
        tx.user?.name?.toLowerCase().includes(q) ||
        tx.listing?.title?.toLowerCase().includes(q)
      );
    }

    result.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'amount_high':
          return b.totalPrice - a.totalPrice;
        case 'amount_low':
          return a.totalPrice - b.totalPrice;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [transactions, searchQuery, sortBy]);

  return {
    transactions,
    filteredTransactions,
    stats,
    total,
    isLoading,
    error,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    handleRefresh: refetch
  };
}

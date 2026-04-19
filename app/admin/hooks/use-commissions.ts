import { useQuery } from '@tanstack/react-query';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
  meta?: {
    total?: number;
    page?: number;
    perPage?: number;
    totalPages?: number;
    stats?: {
      totalCommissions: number;
      paidCommissions: number;
      pendingCommissions: number;
      currentRate: number;
    };
  };
}

export interface CommissionItem {
  id: string;
  host: string;
  listing: string;
  amount: number;
  commissionRate: number;
  commissionAmount: number;
  date: string;
  status: 'paid' | 'pending' | 'failed';
}

export function useCommissions(page: number = 1, perPage: number = 10) {
  return useQuery({
    queryKey: ['commissions', page, perPage],
    queryFn: async () => {
      const response = await fetch(`/api/admin/finance/commissions?page=${page}&perPage=${perPage}`);
      if (!response.ok) throw new Error('Failed to fetch commissions');
      const data: ApiResponse<CommissionItem[]> = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to fetch commissions');
      return data;
    },
    refetchInterval: 60000,
  });
}

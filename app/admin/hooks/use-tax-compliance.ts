import { useQuery } from '@tanstack/react-query';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
  meta?: {
    stats?: {
      totalTaxesPaid: number;
      pendingTaxes: number;
      complianceRate: number;
      totalRecords: number;
    };
  };
}

export interface TaxRecord {
  id: string;
  period: string;
  taxType: string;
  amount: number;
  status: 'filed' | 'pending' | 'failed';
  filingDate: string;
  dueDate: string;
}

export function useTaxCompliance() {
  return useQuery({
    queryKey: ['tax-compliance'],
    queryFn: async () => {
      const response = await fetch('/api/admin/finance/tax');
      if (!response.ok) throw new Error('Failed to fetch tax records');
      const data: ApiResponse<TaxRecord[]> = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to fetch tax records');
      return data;
    },
    refetchInterval: 60000 * 60, // Refetch every hour
  });
}

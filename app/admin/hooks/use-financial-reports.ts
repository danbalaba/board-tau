import { useQuery } from '@tanstack/react-query';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}

export interface FinancialReport {
  // Overview fields
  totalRevenue?: number;
  totalReservations?: number;
  averageOccupancy?: number;
  topProperties?: Array<{ listingId: string; listingTitle: string; revenue: number }>;
  
  // Revenue fields
  dailyRevenue?: Array<{ date: string; revenue: number }>;
  monthlyRevenue?: Array<{ month: string; revenue: number }>;

  // List fields
  reports?: Array<any>;
  stats?: {
    total: number;
    pdf: number;
    excel: number;
    csv: number;
  };
}

export function useFinancialReports(type: string = 'overview', range: string = '30d') {
  const queryString = new URLSearchParams({
    type,
    range,
  }).toString();

  return useQuery({
    queryKey: ['financialReports', type, range],
    queryFn: async () => {
      const response = await fetch(`/api/admin/finance/reports?${queryString}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch financial report');
      }

      const data: ApiResponse<FinancialReport> = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch financial report');
      }

      return data;
    },
    refetchInterval: 300000, // Refetch every 5 minutes
    retry: 3,
  });
}

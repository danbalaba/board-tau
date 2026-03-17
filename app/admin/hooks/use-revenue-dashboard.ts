import { useQuery } from '@tanstack/react-query';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}

export interface RevenueData {
  timeRange: string;
  totalRevenue: number;
  averageDailyRevenue: number;
  dailyRevenue: Array<{ date: string; revenue: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  topProperties: Array<{ listingId: string; listingTitle: string; listingOwner: string; revenue: number }>;
}

export function useRevenueDashboard(range: string = '30d') {
  return useQuery({
    queryKey: ['revenueDashboard', range],
    queryFn: async () => {
      const response = await fetch(`/api/admin/finance/revenue?range=${range}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch revenue data');
      }

      const data: ApiResponse<RevenueData> = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch revenue data');
      }

      return data;
    },
    refetchInterval: 300000, // Refetch every 5 minutes
    retry: 3,
  });
}

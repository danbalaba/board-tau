import { useQuery } from '@tanstack/react-query';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}

export interface ExecutiveOverview {
  timeRange: string;
  metrics: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    totalListings: number;
    newListings: number;
    totalRevenue: number;
    totalReservations: number;
    averageRating: number;
    userGrowthPercentage: number;
    revenueGrowthPercentage: number;
  };
  topProperties: Array<{ listingId: string; listingTitle: string; revenue: number }>;
  charts: {
    revenue: Array<{ month: string; revenue: number; bookings: number }>;
    propertyDistribution: Array<{ name: string; value: number; color: string }>;
    occupancy: Array<{ day: string; occupancy: number }>;
  };
  activities: Array<{
    id: string;
    type: 'host' | 'property' | 'booking';
    title: string;
    description: string;
    time: string;
    createdAt: string;
  }>;
  recentSales: Array<{
    id: string;
    name: string;
    email: string;
    avatar: string;
    amount: string;
    fallback: string;
  }>;
}

export function useExecutiveOverview(range: string = '30d') {
  return useQuery({
    queryKey: ['executiveOverview', range],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/overview?range=${range}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch executive overview');
      }

      const data: ApiResponse<ExecutiveOverview> = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch executive overview');
      }

      return data;
    },
    refetchInterval: 300000, // Refetch every 5 minutes
    retry: 3,
  });
}

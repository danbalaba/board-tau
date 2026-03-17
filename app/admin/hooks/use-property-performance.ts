import { useQuery } from '@tanstack/react-query';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}

export interface PropertyPerformance {
  propertyId?: string;
  timeRange: string;
  totalReservations: number;
  totalReviews: number;
  averageRating: number;
  totalRevenue: number;
  occupancyRate: number;
}

export function usePropertyPerformance(range: string = '30d', propertyId?: string) {
  const queryString = new URLSearchParams({
    range,
    ...(propertyId && { propertyId }),
  }).toString();

  return useQuery({
    queryKey: ['propertyPerformance', range, propertyId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/properties/performance?${queryString}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch property performance');
      }

      const data: ApiResponse<PropertyPerformance> = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch property performance');
      }

      return data;
    },
    refetchInterval: 300000, // Refetch every 5 minutes
    retry: 3,
  });
}

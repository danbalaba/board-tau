import { useQuery } from '@tanstack/react-query';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}

export interface UserAnalytics {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  userRoles: Array<{ role: string; count: number }>;
  verificationStatus: Array<{ isVerifiedLandlord: boolean; count: number }>;
  timeRange: string;
}

export function useUserAnalytics(range: string = '30d') {
  return useQuery<ApiResponse<UserAnalytics>>({
    queryKey: ['userAnalytics', range],
    queryFn: async () => {
      const response = await fetch(`/api/admin/analytics/users?range=${range}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user analytics');
      }

      const data: ApiResponse<UserAnalytics> = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch user analytics');
      }

      return data;
    },
    refetchInterval: 300000, // Refetch every 5 minutes
    retry: 3,
  });
}

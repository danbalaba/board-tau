import { useQuery } from '@tanstack/react-query';

interface ModeratorOverview {
  pendingListings: number;
  pendingHosts: number;
  pendingReviews: number;
  activeListings: number;
  recentLogs: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    details: string | null;
    createdAt: string;
    adminName: string;
    adminEmail: string;
  }>;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export function useModeratorStats() {
  return useQuery<ApiResponse<ModeratorOverview>>({
    queryKey: ['moderator-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/dashboard/overview');
      if (!response.ok) {
        throw new Error('Failed to fetch moderator dashboard stats');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

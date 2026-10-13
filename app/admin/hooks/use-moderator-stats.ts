import { useQuery } from '@tanstack/react-query';

export interface ModeratorOverview {
  pendingListings: number;
  pendingHosts: number;
  pendingReviews: number;
  activeListings: number;
  totalApproved?: number;
  totalRejected?: number;
  resolutionRate?: number;
  dailyActivity?: Array<{
    day: string;
    date: string;
    approved: number;
    rejected: number;
    total: number;
  }>;
  recentLogs: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    details: string | null;
    createdAt: string;
    adminName: string;
    adminEmail: string;
    adminImage?: string | null;
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
    refetchInterval: 180000, // Background sync every 3 minutes (saves serverless CPU)
    refetchOnWindowFocus: false,
  });
}

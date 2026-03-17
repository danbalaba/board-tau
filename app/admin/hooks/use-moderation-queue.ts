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
  };
}

export interface ModerationItem {
  id: string;
  entityType: string;
  title: string;
  description: string;
  user: any;
  status: string;
  createdAt: string;
}

export interface ModerationQueryParams {
  page?: number;
  perPage?: number;
  entityType?: string;
}

export function useModerationQueue(params?: ModerationQueryParams) {
  const { page = 1, perPage = 10, entityType = '' } = params || {};

  const queryString = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
    ...(entityType && { entityType }),
  }).toString();

  return useQuery({
    queryKey: ['moderationQueue', params],
    queryFn: async () => {
      const response = await fetch(`/api/admin/moderation/queue?${queryString}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch moderation queue');
      }

      const data: ApiResponse<ModerationItem[]> = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch moderation queue');
      }

      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
  });
}

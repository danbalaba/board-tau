import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
  entityType: 'listing' | 'review' | 'hostApplication';
  title: string;
  description: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
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
    queryKey: ['moderation-queue', params],
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
  });
}

export function useModerationDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      entityType,
      action,
      reason,
    }: {
      id: string;
      entityType: 'listing' | 'review' | 'hostApplication';
      action: 'approve' | 'reject';
      reason?: string;
    }) => {
      // Map entityType to the correct endpoint
      let endpoint = '';
      if (entityType === 'hostApplication') endpoint = `/api/admin/moderation/hosts/${id}`;
      else if (entityType === 'listing') endpoint = `/api/admin/moderation/listings/${id}`;
      else if (entityType === 'review') endpoint = `/api/admin/moderation/reviews/${id}`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit decision');
      }

      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
    },
  });
}

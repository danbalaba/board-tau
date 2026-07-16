import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';

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
    stats?: Record<string, any>;
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

export interface ModerationLogItem {
  id: string;
  adminId: string;
  action: string;
  entityType: string;
  entityId: string;
  entityTitle: string | null;
  notes: string | null;
  createdAt: string;
  admin: {
    name: string;
    email: string;
    image: string | null;
  };
}

export interface ModerationQueueData {
  pendingItems: ModerationItem[];
  recentLogs: ModerationLogItem[];
}

export interface ModerationQueryParams {
  page?: number;
  perPage?: number;
  entityType?: string;
  isArchived?: boolean;
}

export function useModerationQueue(params?: ModerationQueryParams) {
  const { page = 1, perPage = 10, entityType = '', isArchived } = params || {};

  const queryString = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
    ...(entityType && { entityType }),
    ...(isArchived !== undefined && { isArchived: isArchived.toString() }),
  }).toString();

  return useQuery({
    queryKey: ['moderation-queue', params],
    queryFn: async () => {
      const response = await fetch(`/api/admin/moderation/queue?${queryString}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch moderation queue');
      }

      const data: ApiResponse<ModerationQueueData> = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch moderation queue');
      }

      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    placeholderData: keepPreviousData,
  });
}

export function useHostApplications(params?: ModerationQueryParams) {
  const { page = 1, perPage = 10, entityType = '', isArchived } = params || {};

  const queryString = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
    ...(isArchived ? { isArchived: 'true' } : { status: 'pending' }),
  }).toString();

  return useQuery({
    queryKey: ['host-applications', params],
    queryFn: async () => {
      const response = await fetch(`/api/admin/moderation/hosts?${queryString}`);
      if (!response.ok) throw new Error('Failed to fetch host applications');
      const data: ApiResponse = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to fetch host applications');
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useListingsReview(params?: ModerationQueryParams) {
  const { page = 1, perPage = 10, isArchived } = params || {};

  const queryString = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
    ...(isArchived ? { isArchived: 'true' } : { status: 'pending' }),
  }).toString();

  return useQuery({
    queryKey: ['listings-review', params],
    queryFn: async () => {
      const response = await fetch(`/api/admin/moderation/listings?${queryString}`);
      if (!response.ok) throw new Error('Failed to fetch listings for review');
      const data: ApiResponse = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to fetch listings for review');
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useReviewsModeration(params?: ModerationQueryParams) {
  const { page = 1, perPage = 10, isArchived } = params || {};

  const queryString = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
    ...(isArchived ? { isArchived: 'true' } : { status: 'pending' }),
  }).toString();

  return useQuery({
    queryKey: ['reviews-moderation', params],
    queryFn: async () => {
      const response = await fetch(`/api/admin/moderation/reviews?${queryString}`);
      if (!response.ok) throw new Error('Failed to fetch reviews for moderation');
      const data: ApiResponse = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to fetch reviews for moderation');
      return data;
    },
    placeholderData: keepPreviousData,
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
      banUser,
    }: {
      id: string;
      entityType: 'listing' | 'review' | 'hostApplication';
      action: 'approve' | 'reject' | 'archive';
      reason?: string;
      banUser?: boolean;
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
        body: JSON.stringify({ action, reason, banUser }),
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
      queryClient.invalidateQueries({ queryKey: ['listings-review'] });
      queryClient.invalidateQueries({ queryKey: ['reviews-moderation'] });
      queryClient.invalidateQueries({ queryKey: ['host-applications'] });
    },
  });
}

export function useModerationDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      entityType,
    }: {
      id: string;
      entityType: 'listing' | 'review' | 'hostApplication';
    }) => {
      let endpoint = '';
      if (entityType === 'hostApplication') endpoint = `/api/admin/moderation/hosts/${id}`;
      else if (entityType === 'listing') endpoint = `/api/admin/moderation/listings/${id}`;
      else if (entityType === 'review') endpoint = `/api/admin/moderation/reviews/${id}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete item');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      queryClient.invalidateQueries({ queryKey: ['listings-review'] });
      queryClient.invalidateQueries({ queryKey: ['reviews-moderation'] });
      queryClient.invalidateQueries({ queryKey: ['host-applications'] });
    },
  });
}

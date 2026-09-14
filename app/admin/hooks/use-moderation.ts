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
  submittedBy?: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  meta?: Record<string, any>;
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
  range?: string;
}

async function safeFetchJson<T = any>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';
  
  if (!contentType.includes('application/json')) {
    if (!response.ok) {
      throw new Error(`Server error (${response.status}): ${response.statusText || 'Unable to complete request'}`);
    }
    throw new Error('Invalid response from server.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || `Error ${response.status}: Failed to process request`);
  }

  return data;
}

export function useModerationQueue(params?: ModerationQueryParams) {
  const { page = 1, perPage = 10, entityType = '', isArchived, range = '30d' } = params || {};

  const queryString = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
    range,
    ...(entityType && { entityType }),
    ...(isArchived !== undefined && { isArchived: isArchived.toString() }),
  }).toString();

  return useQuery({
    queryKey: ['moderation-queue', page, perPage, entityType, isArchived, range],
    queryFn: async () => {
      const data: ApiResponse<ModerationQueueData> = await safeFetchJson(`/api/admin/moderation/queue?${queryString}`);
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch moderation queue');
      }
      return data;
    },
    staleTime: 15000, // Keep data fresh for 15 seconds
    refetchInterval: 30000, // Background sync every 30 seconds
    placeholderData: keepPreviousData,
  });
}

export function useHostApplications(params?: ModerationQueryParams & { range?: string; status?: string }) {
  const { page = 1, perPage = 10, entityType = '', isArchived, range = '30d', status } = params || {};

  const queryString = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
    range,
    ...(isArchived ? { isArchived: 'true' } : {}),
    ...(status ? { status } : {}),
  }).toString();

  return useQuery({
    queryKey: ['host-applications', params],
    queryFn: async () => {
      const data: ApiResponse = await safeFetchJson(`/api/admin/moderation/hosts?${queryString}`);
      if (!data.success) throw new Error(data.message || 'Failed to fetch host applications');
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useListingsReview(params?: ModerationQueryParams & { range?: string; status?: string }) {
  const { page = 1, perPage = 10, isArchived, range = '30d', status } = params || {};

  const queryString = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
    range,
    ...(isArchived ? { isArchived: 'true' } : {}),
    ...(status ? { status } : {}),
  }).toString();

  return useQuery({
    queryKey: ['listings-review', params],
    queryFn: async () => {
      const data: ApiResponse = await safeFetchJson(`/api/admin/moderation/listings?${queryString}`);
      if (!data.success) throw new Error(data.message || 'Failed to fetch listings for review');
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useReviewsModeration(params?: ModerationQueryParams & { range?: string; status?: string }) {
  const { page = 1, perPage = 10, isArchived, range = '30d', status } = params || {};

  const queryString = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
    range,
    ...(isArchived ? { isArchived: 'true' } : {}),
    ...(status ? { status } : {}),
  }).toString();

  return useQuery({
    queryKey: ['reviews-moderation', params],
    queryFn: async () => {
      const data: ApiResponse = await safeFetchJson(`/api/admin/moderation/reviews?${queryString}`);
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
      action: 'approve' | 'reject' | 'archive' | 'unarchive';
      reason?: string;
      banUser?: boolean;
    }) => {
      // Map entityType to the correct endpoint
      let endpoint = '';
      if (entityType === 'hostApplication') endpoint = `/api/admin/moderation/hosts/${id}`;
      else if (entityType === 'listing') endpoint = `/api/admin/moderation/listings/${id}`;
      else if (entityType === 'review') endpoint = `/api/admin/moderation/reviews/${id}`;

      return await safeFetchJson(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, reason, banUser }),
      });
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

      return await safeFetchJson(endpoint, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-queue'] });
      queryClient.invalidateQueries({ queryKey: ['listings-review'] });
      queryClient.invalidateQueries({ queryKey: ['reviews-moderation'] });
      queryClient.invalidateQueries({ queryKey: ['host-applications'] });
    },
  });
}

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

export interface ReviewModeration {
  id: string;
  userId: string;
  listingId: string;
  rating: number;
  comment: string;
  cleanliness: number;
  accuracy: number;
  communication: number;
  location: number;
  value: number;
  status: string;
  createdAt: string;
  response: string;
  respondedAt: string;
  user: { id: string; name: string; email: string; image: string };
  listing: { id: string; title: string; description: string; imageSrc: string };
}

export interface ReviewsModerationQueryParams {
  page?: number;
  perPage?: number;
  status?: string;
}

export function useReviewsModeration(params?: ReviewsModerationQueryParams) {
  const { page = 1, perPage = 10, status = 'pending' } = params || {};

  const queryString = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
    status,
  }).toString();

  return useQuery({
    queryKey: ['reviewsModeration', params],
    queryFn: async () => {
      const response = await fetch(`/api/admin/moderation/reviews?${queryString}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch reviews to moderate');
      }

      const data: ApiResponse<ReviewModeration[]> = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch reviews to moderate');
      }

      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
  });
}

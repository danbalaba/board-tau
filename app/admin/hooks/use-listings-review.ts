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

export interface ListingReview {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  roomCount: number;
  bathroomCount: number;
  price: number;
  location: any;
  region: string;
  latitude: number;
  longitude: number;
  status: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string };
  rooms: any[];
  images: any[];
  amenities: any;
  rules: any;
  features: any;
}

export interface ListingsReviewQueryParams {
  page?: number;
  perPage?: number;
  status?: string;
}

export function useListingsReview(params?: ListingsReviewQueryParams) {
  const { page = 1, perPage = 10, status = 'pending' } = params || {};

  const queryString = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
    status,
  }).toString();

  return useQuery({
    queryKey: ['listingsReview', params],
    queryFn: async () => {
      const response = await fetch(`/api/admin/moderation/listings?${queryString}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch listings to review');
      }

      const data: ApiResponse<ListingReview[]> = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch listings to review');
      }

      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
  });
}

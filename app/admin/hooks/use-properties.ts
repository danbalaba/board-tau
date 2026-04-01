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

export interface Property {
  id: string;
  title: string;
  description: string;
  owner: { id: string; name: string; email: string };
  price: number;
  region: string;
  status: string;
  rating: number;
  reviewCount: number;
  roomsCount: number;
  bookingsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PropertiesQueryParams {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  priceRange?: string;
}

export function useProperties(params?: PropertiesQueryParams) {
  const { page = 1, perPage = 10, search = '', status = '', priceRange = '' } = params || {};

  const queryString = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
    ...(search && { search }),
    ...(status && { status }),
    ...(priceRange && { priceRange }),
  }).toString();

  return useQuery({
    queryKey: ['properties', params],
    queryFn: async () => {
      const response = await fetch(`/api/admin/properties?${queryString}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch properties');
      }

      const data: ApiResponse<Property[]> = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch properties');
      }

      return data;
    },
    refetchInterval: 60000, // Refetch every minute
    retry: 3,
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/properties/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch property');
      }

      const data: ApiResponse<Property> = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch property');
      }

      return data;
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, propertyData }: { id: string; propertyData: Partial<Property> }) => {
      const response = await fetch(`/api/admin/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update property');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property'] });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/properties/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete property');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

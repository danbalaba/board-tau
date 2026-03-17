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

export interface HostApplication {
  id: string;
  user: { id: string; name: string; email: string; image: string };
  status: string;
  businessInfo: any;
  propertyInfo: any;
  contactInfo: any;
  propertyConfig: any;
  propertyImages: any;
  documents: any;
  adminNotes: string;
  approvedBy: string;
  rejectedBy: string;
  rejectedReason: string;
  createdAt: string;
  updatedAt: string;
}

export interface HostApplicationsQueryParams {
  page?: number;
  perPage?: number;
  status?: string;
}

export function useHostApplications(params?: HostApplicationsQueryParams) {
  const { page = 1, perPage = 10, status = 'pending' } = params || {};

  const queryString = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
    status,
  }).toString();

  return useQuery({
    queryKey: ['hostApplications', params],
    queryFn: async () => {
      const response = await fetch(`/api/admin/moderation/hosts?${queryString}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch host applications');
      }

      const data: ApiResponse<HostApplication[]> = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch host applications');
      }

      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
  });
}

export function useHostApplication(id: string) {
  return useQuery({
    queryKey: ['hostApplication', id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/moderation/hosts/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch host application');
      }

      const data: ApiResponse<HostApplication> = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch host application');
      }

      return data;
    },
  });
}

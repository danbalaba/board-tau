import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  risk: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PlatformMetricSnapshot {
  id: string;
  date: string;
  totalFeatureFlags: number;
  activeFeatureFlags: number;
  inactiveFeatureFlags: number;
}

interface FeatureResponseData {
  features: FeatureFlag[];
  history: PlatformMetricSnapshot[];
}

export function useFeatureFlags() {
  return useQuery<ApiResponse<FeatureResponseData>>({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const response = await fetch('/api/admin/settings/features');
      if (!response.ok) throw new Error('Failed to fetch feature flags');
      return response.json();
    }
  });
}

export function useCreateFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (flagData: Partial<FeatureFlag>) => {
      const response = await fetch('/api/admin/settings/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flagData),
      });
      if (!response.ok) throw new Error('Failed to create flag');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feature-flags'] })
  });
}

export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string } & Partial<FeatureFlag>) => {
      const response = await fetch('/api/admin/settings/features', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update flag');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feature-flags'] })
  });
}

export function useDeleteFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/settings/features?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete flag');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feature-flags'] })
  });
}

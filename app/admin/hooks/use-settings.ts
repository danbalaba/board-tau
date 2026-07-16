import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string | null;
  address: string | null;
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  enableAnalytics: boolean;
  enableCookies: boolean;
  updatedAt: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export function useSettings() {
  return useQuery<ApiResponse<SiteSettings>>({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/settings/general');
      if (!response.ok) {
        throw new Error('Failed to fetch platform settings');
      }
      return response.json();
    }
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settingsData: Partial<SiteSettings>) => {
      const response = await fetch('/api/admin/settings/general', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update platform settings');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    }
  });
}

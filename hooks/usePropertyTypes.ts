import { useQuery } from '@tanstack/react-query';
import { getActivePropertyTypes } from '@/services/taxonomy';

export function usePropertyTypes() {
  return useQuery({
    queryKey: ['propertyTypes'],
    queryFn: async () => {
      const data = await getActivePropertyTypes();
      return data || [];
    },
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

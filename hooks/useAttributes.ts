import { useQuery } from '@tanstack/react-query';
import { getActiveAttributes } from '@/services/taxonomy';

export function useAttributes() {
  return useQuery({
    queryKey: ['attributes'],
    queryFn: async () => {
      const data = await getActiveAttributes();
      return data || [];
    },
    staleTime: 1000 * 60 * 15, // 15 minutes (attributes rarely change)
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on component remount if we have fresh data
  });
}

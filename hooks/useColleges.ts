import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect } from 'react';
import { getCachedColleges, getSyncColleges } from '@/lib/landlordTaxonomyCache';

export interface College {
  id: string;
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  logoUrl?: string;
}

export function useColleges(options?: { includeDisabled?: boolean }) {
  const queryClient = useQueryClient();
  const includeDisabled = options?.includeDisabled ?? false;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['colleges'] });
    };
    window.addEventListener('landlord_taxonomy_updated', handleUpdate);
    return () => window.removeEventListener('landlord_taxonomy_updated', handleUpdate);
  }, [queryClient]);

  return useQuery({
    queryKey: ['colleges', { includeDisabled }],
    queryFn: async () => {
      if (includeDisabled) {
        const { data } = await axios.get<College[]>(`/api/colleges?includeDisabled=true&t=${Date.now()}`);
        return data || [];
      }
      return await getCachedColleges(true);
    },
    initialData: () => {
      const sync = getSyncColleges();
      return sync && sync.length > 0 ? sync : undefined;
    },
    initialDataUpdatedAt: () => 0, // Force background refetch on mount
    staleTime: 1000 * 60, // 1 min
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

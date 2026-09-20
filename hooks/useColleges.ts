import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
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
  const includeDisabled = options?.includeDisabled ?? false;
  return useQuery({
    queryKey: ['colleges', { includeDisabled }],
    queryFn: async () => {
      if (includeDisabled) {
        const { data } = await axios.get<College[]>('/api/colleges?includeDisabled=true');
        return data || [];
      }
      return await getCachedColleges();
    },
    initialData: () => {
      const sync = getSyncColleges();
      return sync && sync.length > 0 ? sync : undefined;
    },
    staleTime: 1000 * 60 * 30, // 30 mins
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });
}

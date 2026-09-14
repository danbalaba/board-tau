import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

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
      const url = includeDisabled ? '/api/colleges?includeDisabled=true' : '/api/colleges';
      const { data } = await axios.get<College[]>(url);
      return data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 mins
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });
}

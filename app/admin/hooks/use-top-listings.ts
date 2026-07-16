import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/app/admin/components/ui/sonner';

export interface PricingRecommendation {
  id: string;
  property: string;
  currentPrice: number;
  suggestedPrice: number;
  occupancyRate: number;
  demandLevel: 'low' | 'medium' | 'high';
  competitorPrice: number;
  lastUpdated: string;
}

export interface OccupancyByProperty {
  property: string;
  occupancy: number;
}

export interface TopListingsData {
  timeRange: string;
  totalReservations: number;
  occupancyRate: number;
  averageStay: number;
  occupancyByProperty: OccupancyByProperty[];
  pricingRecommendations: PricingRecommendation[];
}

export function useTopListings() {
  const [data, setData] = useState<TopListingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [range, setRange] = useState('30d');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/properties/performance?range=${range}`);
      if (!response.ok) {
        throw new Error('Failed to fetch top listings performance data');
      }
      const json = await response.json();
      
      if (json.success) {
        setData(json.data);
      } else {
        throw new Error(json.error?.message || 'Failed to fetch data');
      }
    } catch (err: any) {
      console.error('Top listings error:', err);
      setError(err);
      toast.error('Failed to load performance data');
    } finally {
      setIsLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    range,
    setRange,
    handleRefresh: fetchData
  };
}

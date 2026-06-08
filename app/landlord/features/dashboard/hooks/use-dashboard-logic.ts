'use client';

import { useState, useEffect } from 'react';
import { getLandlordDashboardStats } from '@/services/landlord/analytics';

export function useDashboardLogic() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const data = await getLandlordDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return {
    stats,
    isLoading
  };
}

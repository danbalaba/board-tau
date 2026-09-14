'use client';

import { useState, useEffect } from 'react';
import { getLandlordDashboardOverview } from '@/services/landlord/analytics';

export function useDashboardLogic() {
  const [data, setData] = useState<{
    stats: any;
    areaChartData: any[];
    pieChartData: any[];
    lineChartData: any[];
    recentActivities: any[];
  }>({
    stats: null,
    areaChartData: [],
    pieChartData: [],
    lineChartData: [],
    recentActivities: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        setIsLoading(true);
        const overview = await getLandlordDashboardOverview();
        if (isMounted && overview) {
          setData({
            stats: overview.stats || null,
            areaChartData: overview.areaChartData || [],
            pieChartData: overview.pieChartData || [],
            lineChartData: overview.lineChartData || [],
            recentActivities: overview.recentActivities || [],
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard overview:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    stats: data.stats,
    areaChartData: data.areaChartData,
    pieChartData: data.pieChartData,
    lineChartData: data.lineChartData,
    recentActivities: data.recentActivities,
    isLoading
  };
}

export default useDashboardLogic;


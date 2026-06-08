'use client';

import React from 'react';
import { useAnalyticsLogic, AnalyticsStats } from './hooks/use-analytics-logic';
import { LandlordAnalyticsHeader } from './components/landlord-analytics-header';
import { LandlordAnalyticsStatsGrid } from './components/landlord-analytics-stats-grid';
import { LandlordAnalyticsChartsGrid } from './components/landlord-analytics-charts-grid';
import { LandlordAnalyticsInsights } from './components/landlord-analytics-insights';
import { motion, Variants } from 'framer-motion';

interface ChartData {
  dailyRevenue: Array<{ date: string; revenue: number; bookings: number }>;
  monthlyRevenue: Array<{ date: string; [key: string]: any }>;
  monthlyRevenueListings: Array<{ id: string; title: string }>;
  monthlyRevenueMap: Record<string, string>;
  growthTrend: Array<{ date: string; bookings: number; revenue: number }>;
  propertyTypes: Array<{ type: string; count: number; revenue: number }>;
  ratings: Array<{ rating: string; value: number; percentage: number }>;
  propertyPerformance: Array<{ name: string; inquiries: number; bookings: number; revenue: number }>;
}

interface LandlordAnalyticsProps {
  stats?: AnalyticsStats;
  revenue?: any;
  occupancy?: any;
  chartData?: ChartData;
  isLoading?: boolean;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function LandlordAnalytics({ 
  isLoading: externalIsLoading,
  stats: externalStats,
  chartData: externalChartData
}: LandlordAnalyticsProps = {}) {
  const {
    stats: internalStats,
    occupancy,
    chartData: internalChartData,
    isLoading: internalIsLoading,
    timePeriod,
    setTimePeriod,
    propertyPerformanceData,
    handleGenerateReport
  } = useAnalyticsLogic();

  const isLoading = externalIsLoading ?? internalIsLoading;
  const stats = externalStats ?? internalStats;
  const chartData = externalChartData ?? internalChartData;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-12"
    >
      <motion.div variants={itemVariants}>
        <LandlordAnalyticsHeader 
          timePeriod={timePeriod}
          setTimePeriod={setTimePeriod}
          handleGenerateReport={handleGenerateReport}
          isLoading={isLoading}
        />
      </motion.div>
<motion.div variants={itemVariants}>
        <LandlordAnalyticsStatsGrid 
          stats={stats || undefined}
          occupancyRate={occupancy?.occupancyRate || 0}
          isLoading={isLoading}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <LandlordAnalyticsChartsGrid 
          chartData={chartData || undefined} 
          isLoading={isLoading}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <LandlordAnalyticsInsights 
          propertyPerformanceData={propertyPerformanceData}
          stats={stats || undefined}
          occupancy={occupancy || undefined}
          isLoading={isLoading}
        />
      </motion.div>
    </motion.div>
  );
}
'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useAnalyticsLogic } from './hooks/use-analytics-logic';
import { LandlordAnalyticsHeader } from './components/landlord-analytics-header';
import { LandlordAnalyticsStatsGrid } from './components/landlord-analytics-stats-grid';
import { LandlordAnalyticsRoomGrid } from './components/landlord-analytics-room-grid';
import { LandlordAnalyticsChartsGrid } from './components/landlord-analytics-charts-grid';
import { LandlordAnalyticsInsights } from './components/landlord-analytics-insights';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

export default function LandlordAnalytics() {
  const {
    propertyList,
    selectedPropertyId,
    setSelectedPropertyId,
    stats,
    roomDetails,
    propertyLeaderboard,
    chartData,
    scope,
    isInitialLoading,
    isLoading,
    handleGenerateReport,
  } = useAnalyticsLogic();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 sm:space-y-8 pb-16"
    >
      {/* 1. Header with Universal Property Filter & Export Action */}
      <motion.div variants={itemVariants}>
        <LandlordAnalyticsHeader
          propertyList={propertyList}
          selectedPropertyId={selectedPropertyId}
          onSelectProperty={setSelectedPropertyId}
          handleGenerateReport={handleGenerateReport}
          propertyName={scope.propertyName}
          isSingleProperty={scope.isSingleProperty}
          isLoading={isInitialLoading}
        />
      </motion.div>

      {/* 2. Real Performance KPI Metrics */}
      <motion.div variants={itemVariants}>
        <LandlordAnalyticsStatsGrid
          stats={stats}
          propertyName={scope.propertyName}
          isLoading={isLoading}
        />
      </motion.div>

      {/* 3. Room & Bedspace Health (rendered when single property selected) */}
      {scope.isSingleProperty && roomDetails.length > 0 && (
        <motion.div variants={itemVariants}>
          <LandlordAnalyticsRoomGrid
            rooms={roomDetails}
            propertyName={scope.propertyName}
            isLoading={isLoading}
          />
        </motion.div>
      )}

      {/* 4. Secondary & Multi-Property Visual Intelligence Charts */}
      <motion.div variants={itemVariants}>
        <LandlordAnalyticsChartsGrid
          chartData={chartData}
          scope={scope}
          stats={stats}
          roomDetails={roomDetails}
          isLoading={isLoading}
        />
      </motion.div>

      {/* 5. Listing Performance Comparison Leaderboard */}
      <motion.div variants={itemVariants}>
        <LandlordAnalyticsInsights
          propertyLeaderboard={propertyLeaderboard}
          selectedPropertyId={selectedPropertyId}
          onSelectProperty={setSelectedPropertyId}
          isLoading={isLoading}
        />
      </motion.div>
    </motion.div>
  );
}
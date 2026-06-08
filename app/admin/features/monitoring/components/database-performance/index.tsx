'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AdminMonitoringHeader } from '../admin-monitoring-header';
import { DBKPIGrid } from './db-kpi-grid';
import { QueryLatencyChart, ConnectionLogisticsChart, CacheEfficiencyMatrix } from './db-visualization-charts';
import { DBResourceGrid } from './db-resource-grid';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function DatabasePerformance() {
  return (
    <div className="space-y-8 p-1">
      <AdminMonitoringHeader 
        title="Engine Telemetry" 
        description="Deep database diagnostics and query latency optimization ledger"
        onRefresh={() => {}}
      />

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <DBKPIGrid />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <QueryLatencyChart />
          <ConnectionLogisticsChart />
        </div>

        <CacheEfficiencyMatrix />
        <DBResourceGrid />
      </motion.div>
    </div>
  );
}

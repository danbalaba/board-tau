'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AdminMonitoringHeader } from '../admin-monitoring-header';
import { ServerKPIGrid } from './server-kpi-grid';
import { ComputeTelemetryCharts, NetworkThroughputChart } from './server-visualization-charts';
import { ResourceHealthGrid } from './resource-health-grid';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function ServerMetrics() {
  return (
    <div className="space-y-8 p-1">
      <AdminMonitoringHeader 
        title="Telemetric Performance" 
        description="Hyper-V infrastructure load and compute allocation analytics"
        onRefresh={() => {}}
      />

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <ServerKPIGrid />

        <ComputeTelemetryCharts />

        <NetworkThroughputChart />

        <ResourceHealthGrid />
      </motion.div>
    </div>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AdminMonitoringHeader } from '../admin-monitoring-header';
import { APIKPIGrid } from './api-kpi-grid';
import { TemporalThroughput, EndpointVelocity } from './temporal-throughput';
import { EndpointStatusMatrix, DiagnosticEventLog } from './endpoint-status-matrix';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

export default function ApiMonitoring() {
  return (
    <div className="space-y-8 p-1">
      <AdminMonitoringHeader 
        title="Gateway Intelligence" 
        description="Edge-level API performance and traffic volume analytics"
        onRefresh={() => {}}
      />

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <APIKPIGrid />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TemporalThroughput />
          <EndpointVelocity />
        </div>

        <EndpointStatusMatrix />
        <DiagnosticEventLog />
      </motion.div>
    </div>
  );
}

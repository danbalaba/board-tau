'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AdminMonitoringHeader } from '../admin-monitoring-header';
import { HealthKPIGrid } from './health-kpi-grid';
import { InfrastructureLedger } from './infrastructure-ledger';
import { PerformanceOverview } from './performance-overview';
import { IncidentLedger } from './incident-ledger';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function SystemHealth() {
  return (
    <div className="space-y-8 p-1">
      <AdminMonitoringHeader 
        title="System Sentinel" 
        description="Real-time infrastructure telemetry and autonomous health monitoring"
        onRefresh={() => {}}
      />

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <HealthKPIGrid />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <InfrastructureLedger />
          </div>
          <div className="space-y-8">
            <PerformanceOverview />
            <IncidentLedger />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

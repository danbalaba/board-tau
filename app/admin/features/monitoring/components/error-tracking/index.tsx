'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AdminMonitoringHeader } from '../admin-monitoring-header';
import { ErrorKPIGrid } from './error-kpi-grid';
import { ErrorAnomalyTrend, ErrorSpectrum } from './error-visualization-charts';
import { ActiveIncidentLedger } from './active-incident-ledger';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 }
};

export default function ErrorTracking() {
  return (
    <div className="space-y-8 p-1">
      <AdminMonitoringHeader 
        title="Diagnostic Tracks" 
        description="Automated anomaly detection and application-wide error tracking"
        onRefresh={() => {}}
      />

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <ErrorKPIGrid />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div variants={item}><ErrorAnomalyTrend /></motion.div>
          <motion.div variants={item}><ErrorSpectrum /></motion.div>
        </div>

        <motion.div variants={item}>
          <ActiveIncidentLedger />
        </motion.div>
      </motion.div>
    </div>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AdminMonitoringHeader } from '../admin-monitoring-header';
import { SecurityKPIGrid } from './security-kpi-grid';
import { SecurityAuditStream } from './audit-stream';
import { GeographicOriginCard, EventTaxonomyCard, VulnerabilityVectorCard } from './security-distribution-cards';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function SecurityLogs() {
  return (
    <div className="space-y-8 p-1">
      <AdminMonitoringHeader 
        title="Infra Guard Audit" 
        description="Global security audit trail and autonomous threat detection stream"
        onRefresh={() => {}}
      />

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <SecurityKPIGrid />

        <motion.div variants={item}>
          <SecurityAuditStream />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div variants={item}><GeographicOriginCard /></motion.div>
          <motion.div variants={item}><EventTaxonomyCard /></motion.div>
          <motion.div variants={item}><VulnerabilityVectorCard /></motion.div>
        </div>
      </motion.div>
    </div>
  );
}

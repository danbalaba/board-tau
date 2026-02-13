'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface DashboardCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  children,
  className = '',
  action,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 ${className}`}
    >
      {/* Background gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"></div>

      {title && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
          {action && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {action}
            </motion.div>
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
};

export default DashboardCard;

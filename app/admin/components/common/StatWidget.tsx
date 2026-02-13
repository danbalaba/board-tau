'use client';

import React from 'react';
import { IconType } from 'react-icons';
import { motion } from 'framer-motion';

interface StatWidgetProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon?: IconType;
  iconBg?: string;
  trend?: 'up' | 'down';
}

const StatWidget: React.FC<StatWidgetProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  icon: Icon,
  iconBg = 'bg-blue-600',
  trend,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-6 hover:shadow-2xl transition-all duration-300"
    >
      {/* Background gradient effect */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"></div>

      <div className="flex items-center justify-between mb-4">
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ duration: 0.2 }}
          className={`p-4 rounded-xl ${iconBg} bg-gradient-to-br ${iconBg} opacity-90`}
        >
          {Icon && <Icon className="text-white text-2xl" />}
        </motion.div>
        {trend && (
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            trend === 'up'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {trend === 'up' ? '+' : '-'}{change}
          </div>
        )}
      </div>

      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</h3>
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="text-3xl font-bold text-gray-800 dark:text-white mb-2"
      >
        {value}
      </motion.div>

      {change && !trend && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={`text-sm font-medium flex items-center gap-1 ${
            changeType === 'positive'
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}>
          <span className="text-lg">{changeType === 'positive' ? '↑' : '↓'}</span>
          {changeType === 'positive' ? '+' : '-'}{change} since last month
        </motion.div>
      )}
    </motion.div>
  );
};

export default StatWidget;

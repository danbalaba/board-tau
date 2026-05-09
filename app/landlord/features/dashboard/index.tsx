'use client';

import React from 'react';
import { IconHome } from '@tabler/icons-react';
import { LandlordDashboardStatsCards } from './components/landlord-dashboard-stats-cards';
import { LandlordDashboardQuickActions } from './components/landlord-dashboard-quick-actions';
import { LandlordDashboardRecentActivity } from './components/landlord-dashboard-recent-activity';
import { ChartAreaInteractive } from '@/app/landlord/components/charts/AreaChart';
import { ChartPieLabel } from '@/app/landlord/components/charts/PieChart';
import { ChartLineInteractive } from '@/app/landlord/components/charts/LineChart';
import { motion, Variants } from 'framer-motion';
import { useLandlordProfileStore } from '../settings-hub/hooks/use-landlord-profile-store';
import Skeleton from '@/components/common/Skeleton';

interface LandlordDashboardStats {
  totalProperties: number;
  activeListings: number;
  pendingInquiries: number;
  confirmedBookings: number;
  averageRating: number;
  totalReviews: number;
  monthlyRevenue: number;
  occupancyRate: number;
  vacantRooms: number;
  occupiedRooms: number;
  expiringLeases: number;
}

interface LandlordDashboardClientProps {
  stats?: LandlordDashboardStats;
  user?: any;
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

import { useDashboardLogic } from './hooks/use-dashboard-logic';

export default function LandlordDashboardFeature({ user, isLoading: externalLoading }: { user?: any; isLoading?: boolean }) {
  const { stats, isLoading: internalLoading } = useDashboardLogic();
  const isLoading = externalLoading ?? internalLoading;
  const openSettings = useLandlordProfileStore((state) => state.openSettings);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-20"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <div className="bg-white dark:bg-gray-950 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-2xl shadow-gray-200/50 dark:shadow-black/20">
          <div className="flex items-center gap-6">
            {isLoading ? (
              <Skeleton className="w-16 h-16 rounded-[24px]" />
            ) : (
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-[24px] flex items-center justify-center shadow-inner">
                <IconHome size={32} strokeWidth={2.5} />
              </div>
            )}
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-48 mb-2" variant="text" />
                  <Skeleton className="h-4 w-64 opacity-60" variant="text" />
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1.5 tracking-tighter">
                    Landlord Dashboard
                  </h1>
                  <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    High-level overview of your rental empire
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Feature Zone */}
      <motion.div variants={itemVariants}>
        <LandlordDashboardQuickActions 
          onViewProfile={() => openSettings('profile')} 
          isLoading={isLoading}
        />
      </motion.div>

      {/* Stats KPI Section */}
      <motion.div variants={itemVariants}>
        <LandlordDashboardStatsCards 
          stats={stats} 
          isLoading={isLoading}
        />
      </motion.div>

      {/* Analytics & Activity Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-950 p-6 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm">
            {isLoading ? (
              <div className="w-full h-[350px] flex flex-col">
                <Skeleton className="h-6 w-40 mb-6" variant="text" />
                <div className="flex-1 w-full flex items-end gap-2">
                  {[...Array(12)].map((_, i) => (
                    <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${20 + Math.random() * 60}%` }} />
                  ))}
                </div>
              </div>
            ) : <ChartAreaInteractive />}
          </div>
          <div className="bg-white dark:bg-gray-950 p-6 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm">
            {isLoading ? (
              <div className="w-full h-[350px] flex flex-col">
                <Skeleton className="h-6 w-40 mb-6" variant="text" />
                <div className="flex-1 w-full flex items-center justify-center">
                  <div className="relative w-40 h-40">
                    <Skeleton className="w-full h-full rounded-full" />
                    <div className="absolute inset-4 bg-white dark:bg-gray-950 rounded-full" />
                  </div>
                </div>
              </div>
            ) : <ChartPieLabel />}
          </div>
          <div className="bg-white dark:bg-gray-950 p-6 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm">
            {isLoading ? (
              <div className="w-full h-[350px] flex flex-col">
                <Skeleton className="h-6 w-40 mb-6" variant="text" />
                <div className="flex-1 w-full flex items-end gap-3 px-2">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${40 + Math.sin(i) * 30}%` }} />
                  ))}
                </div>
              </div>
            ) : <ChartLineInteractive />}
          </div>

          {/* Recent Activity Feature Zone */}
          <LandlordDashboardRecentActivity isLoading={isLoading} />
        </div>
      </motion.div>
    </motion.div>
  );
}

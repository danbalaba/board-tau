'use client';

import React from 'react';
import { IconHome } from '@tabler/icons-react';
import { LandlordDashboardStatsCards } from './components/landlord-dashboard-stats-cards';
import { LandlordDashboardQuickActions } from './components/landlord-dashboard-quick-actions';
import { LandlordDashboardRecentActivity } from './components/landlord-dashboard-recent-activity';
import { ChartAreaInteractive } from '@/app/landlord/components/charts/AreaChart';
import { ChartPieLabel } from '@/app/landlord/components/charts/PieChart';
import { ChartLineInteractive } from '@/app/landlord/components/charts/LineChart';
import ViewProfileModal from '../../components/modals/ViewProfileModal';
import { useState } from 'react';

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
  stats: LandlordDashboardStats;
}

export default function LandlordDashboardFeature({ stats, user }: LandlordDashboardClientProps & { user: any }) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <div className="space-y-10 pb-20">
      <ViewProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
      />
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-950 p-8 rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-2xl shadow-gray-200/50 dark:shadow-black/20">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-[24px] flex items-center justify-center shadow-inner">
            <IconHome size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1.5 tracking-tighter">
              Landlord Dashboard
            </h1>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              High-level overview of your rental empire
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions Feature Zone */}
      <LandlordDashboardQuickActions onViewProfile={() => setIsProfileModalOpen(true)} />

      {/* Stats KPI Section */}
      <LandlordDashboardStatsCards stats={stats} />

      {/* Analytics & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-950 p-5 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartAreaInteractive />
        </div>
        <div className="bg-white dark:bg-gray-950 p-5 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartPieLabel />
        </div>
        <div className="bg-white dark:bg-gray-950 p-5 rounded-[28px] border border-gray-100 dark:border-gray-800 shadow-sm">
          <ChartLineInteractive />
        </div>
        
        {/* Recent Activity Feature Zone */}
        <LandlordDashboardRecentActivity />
      </div>
    </div>
  );
}

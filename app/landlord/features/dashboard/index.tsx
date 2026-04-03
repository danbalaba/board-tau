'use client';

import React from 'react';
import { IconHome } from '@tabler/icons-react';
import LandlordDashboardStatsCards from './components/landlord-dashboard-stats-cards';
import LandlordDashboardQuickActions from './components/landlord-dashboard-quick-actions';
import LandlordDashboardRecentActivity from './components/landlord-dashboard-recent-activity';
import LandlordFormHeader from '@/app/landlord/features/shared/landlord-form-header';
import LandlordSectionContainer from '@/app/landlord/features/shared/landlord-section-container';

import { ChartAreaInteractive } from '@/app/landlord/components/charts/AreaChart';
import { ChartLineInteractive } from '@/app/landlord/components/charts/LineChart';
import { ChartPieLabel } from '@/app/landlord/components/charts/PieChart';

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

interface LandlordDashboardFeatureProps {
  stats: LandlordDashboardStats;
}

export default function LandlordDashboardFeature({ stats }: LandlordDashboardFeatureProps) {
  return (
    <div className="space-y-10 pb-20">
      {/* Page Header */}
      <LandlordFormHeader 
        title="Landlord Dashboard"
        subtitle="High-level overview of your rental empire"
        icon={IconHome}
      />

      {/* Quick Actions */}
      <LandlordDashboardQuickActions />

      {/* Stats Cards */}
      <LandlordDashboardStatsCards stats={stats} />

      {/* Charts & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LandlordSectionContainer className="p-5">
          <ChartAreaInteractive />
        </LandlordSectionContainer>
        <LandlordSectionContainer className="p-5">
          <ChartPieLabel />
        </LandlordSectionContainer>
        <LandlordSectionContainer className="p-5">
          <ChartLineInteractive />
        </LandlordSectionContainer>
        <LandlordDashboardRecentActivity />
      </div>
    </div>
  );
}

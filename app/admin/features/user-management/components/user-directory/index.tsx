'use client';

import React from 'react';
import { UserTable } from '../user-tables';
import { getColumns } from '../user-tables/columns';
import { useUsers, useUserStats } from '@/app/admin/hooks/use-users';
import { parseAsString, useQueryState } from 'nuqs';
import { ProvisionUserModal } from './provision-user-modal';
import {
  Users,
  AlertCircle,
  ShieldOff,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { AdminUserHeader } from './admin-user-header';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/admin/components/ui/tooltip';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { toast } from '@/app/admin/components/ui/sonner';
import { exportToCSV, exportToExcel } from '@/utils/export-utils';
import { useSession } from 'next-auth/react';
import { AdminDashboardError } from '@/app/admin/components/ui/admin-dashboard-error';

// ─── Trend calculation helper ────────────────────────────────────────────────
function computeTrend(current: number, previous: number, invertedLogic = false) {
  if (previous === 0 && current === 0) {
    return { label: 'No data', direction: 'stable' as const, color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Minus };
  }
  
  const diff = current - previous;

  if (previous === 0) {
    return { label: `+${diff}`, direction: 'up' as const, color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: ArrowUpRight };
  }

  const pct = (diff / previous) * 100;
  const isStable = Math.abs(pct) < 1;

  if (isStable) {
    return { label: 'Stable', direction: 'stable' as const, color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Minus };
  }

  const isUp = diff > 0;
  // For inverted metrics (suspended, pending): going UP is BAD
  const isGood = invertedLogic ? !isUp : isUp;

  // We show absolute difference instead of percentages to avoid noisy data
  const displayLabel = `${isUp ? '+' : ''}${diff}`;

  return {
    label: displayLabel,
    direction: isUp ? 'up' as const : 'down' as const,
    color: isGood ? 'text-emerald-500' : 'text-rose-500',
    bg: isGood ? 'bg-emerald-500/10' : 'bg-rose-500/10',
    icon: isUp ? ArrowUpRight : ArrowDownRight,
  };
}

export function UserDirectory() {
  const [provisioning, setProvisioning] = React.useState(false);
  const [range, setRange] = React.useState('30d');
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';

  // Compute date filter from range and memoize it to prevent infinite fetch loops
  const dateFrom = React.useMemo(() => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  }, [range]);

  const [pageSize] = useQueryState('perPage', parseAsString.withDefault('10'));
  const [page] = useQueryState('page', parseAsString.withDefault('1'));
  const [name] = useQueryState('name', parseAsString.withDefault(''));
  const [email] = useQueryState('email', parseAsString.withDefault(''));
  const [role] = useQueryState('role', parseAsString.withDefault(''));
  const [status] = useQueryState('status', parseAsString.withDefault(''));

  const { data, isLoading, isFetching, error, refetch } = useUsers({
    page: parseInt(page),
    perPage: parseInt(pageSize),
    name: name || undefined,
    email: email || undefined,
    role: role || undefined,
    status: status || undefined,
    dateFrom,
  });

  const { data: stats, isLoading: statsLoading, error: statsError } = useUserStats();

  if (error || statsError) {
    return <AdminDashboardError onRetry={() => refetch()} />;
  }

  const isAnyLoading = isLoading || isFetching || statsLoading;

  const totalUsers = data?.meta?.total || 0;

  const generateTrend = (val: number, isLoad: boolean = false) => {
    if (isLoad) {
      return [{ v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }, { v: 0 }];
    }
    return [
      { v: val * 0.8 }, { v: val * 0.85 }, { v: val * 0.82 }, 
      { v: val * 0.9 }, { v: val * 0.88 }, { v: val * 0.95 }, { v: val }
    ];
  };

  const kpis = [
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? totalUsers,
      trend: computeTrend(stats?.totalUsers ?? totalUsers, stats?.totalUsersLastWeek ?? 0),
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      chartColor: '#3b82f6',
      trendData: generateTrend(stats?.totalUsers ?? totalUsers, isAnyLoading),
      tooltip: {
        title: 'Total Users',
        description: 'The total number of registered accounts on the platform.',
        detail: `${stats?.newThisWeek ?? 0} new users joined this week.`,
      },
    },
    {
      label: 'Suspended Accounts',
      value: stats?.suspendedAccounts ?? 0,
      trend: computeTrend(stats?.suspendedAccounts ?? 0, stats?.suspendedLastWeek ?? 0, true),
      icon: ShieldOff,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      chartColor: '#f43f5e',
      trendData: generateTrend(stats?.suspendedAccounts ?? 0, isAnyLoading),
      tooltip: {
        title: 'Suspended Accounts',
        description: 'Users currently banned from accessing the platform by an admin.',
        detail: 'Suspended users retain their data but cannot log in.',
      },
    },
    {
      label: 'New Arrivals',
      value: stats?.newThisWeek ?? 0,
      trend: computeTrend(stats?.newThisWeek ?? 0, stats?.newLastWeek ?? 0),
      icon: UserPlus,
      color: 'text-fuchsia-500',
      bg: 'bg-fuchsia-500/10',
      chartColor: '#d946ef',
      trendData: generateTrend(stats?.newThisWeek ?? 0, isAnyLoading),
      tooltip: {
        title: 'New Arrivals',
        description: 'Registrations in the last 7 days compared to the previous 7-day period.',
        detail: `Previous week: ${stats?.newLastWeek ?? 0} new users.`,
      },
    },
    {
      label: 'Pending Verification',
      value: stats?.pendingVerification ?? 0,
      trend: computeTrend(stats?.pendingVerification ?? 0, stats?.pendingLastWeek ?? 0, true),
      icon: AlertCircle,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      chartColor: '#f59e0b',
      trendData: generateTrend(stats?.pendingVerification ?? 0, isAnyLoading),
      tooltip: {
        title: 'Pending Verification',
        description: 'Accounts that have registered but have not yet verified their email address.',
        detail: 'Unverified accounts have limited access to platform features.',
      },
    },
  ];

  const getRangeLabel = (r: string) => {
    switch (r) {
      case '7d': return 'last 7 days';
      case '90d': return 'last 90 days';
      case '1y': return 'past year';
      case '30d':
      default: return 'last 30 days';
    }
  };

  const handleExport = async (format: 'CSV' | 'EXCEL' | 'PDF') => {
    const users = data?.data || [];
    const rangeLabel = { '7d': 'Last 7 Days', '30d': 'Last 30 Days', '90d': 'Last 90 Days', '1y': 'Past Year' }[range] || range;
    const exportData = users.map((u: any) => ({
      'Name': u.name,
      'Email': u.email,
      'Role': u.role,
      'Status': u.status,
      'Joined': new Date(u.joinedAt).toLocaleDateString(),
      'Last Login': u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never',
      'Email Verified': u.emailVerified ? 'Yes' : 'No',
    }));
    const meta = {
      reportTitle: 'User Directory Report',
      title: 'User Directory Report',
      reportId: `BTAU-USR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      summary: [{ label: 'Period', value: rangeLabel }, { label: 'Items Exported', value: `${exportData.length}` }],
      summaryData: [{ label: 'Period', value: rangeLabel }, { label: 'Items Exported', value: `${exportData.length}` }],
      author: 'BoardTAU Admin Dashboard',
    };
    const fileName = `User_Directory_${new Date().toLocaleDateString().replace(/\//g, '-')}`;
    
    if (format === 'CSV') {
      toast.promise(Promise.resolve(exportToCSV(exportData, fileName, meta)), {
        loading: 'Preparing CSV export...',
        success: 'User Directory exported as CSV!',
        error: 'Failed to export CSV.',
      });
    } else if (format === 'EXCEL') {
      toast.promise(Promise.resolve(exportToExcel(exportData, fileName, 'Users', meta)), {
        loading: 'Preparing Excel export...',
        success: 'User Directory exported as Excel!',
        error: 'Failed to export Excel.',
      });
    } else if (format === 'PDF') {
      const { generateMultiSectionPDF } = await import('@/utils/pdfGenerator');
      const sections = [{
        title: 'User Directory',
        type: 'table' as const,
        columns: ['Name', 'Email', 'Role', 'Status', 'Joined'],
        data: exportData.map((item: any) => [
          item['Name'],
          item['Email'],
          item['Role'],
          item['Status'],
          item['Joined']
        ])
      }];
      toast.promise(generateMultiSectionPDF(fileName, sections, meta), {
        loading: 'Preparing PDF export...',
        success: 'User Directory exported as PDF!',
        error: 'Failed to export PDF.',
      });
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <ProvisionUserModal open={provisioning} onClose={() => setProvisioning(false)} />
      <AdminUserHeader
        onRefresh={() => {
          toast.promise(refetch(), {
            loading: 'Syncing user data...',
            success: 'User directory updated',
            error: 'Failed to refresh data'
          });
        }}
        onExport={handleExport}
        isFetching={isFetching}
        range={range}
        onRangeChange={setRange}
      />

      <div className="space-y-6">
        {/* KPI Strip */}
        <TooltipProvider delayDuration={200}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpis.map((stat, i) => {
              const TrendIcon = stat.trend.icon ?? Minus;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card className="cursor-default border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-lg rounded-[2rem] overflow-hidden group h-full transition-all hover:bg-white/50 dark:hover:bg-gray-900/50 hover:shadow-2xl hover:-translate-y-0.5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                            {stat.label}
                          </CardTitle>
                          <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", stat.bg)}>
                            <stat.icon className={cn("h-5 w-5", stat.color)} />
                          </div>
                        </CardHeader>
                          <CardContent>
                            <div className="text-3xl font-black tabular-nums text-gray-900 dark:text-white tracking-tighter">
                              {isAnyLoading ? (
                                <div className="h-9 w-16 bg-muted/50 dark:bg-white/10 animate-pulse rounded-xl" />
                              ) : (
                                stat.value.toLocaleString()
                              )}
                            </div>
                            <div className="flex items-center flex-wrap gap-1.5 mt-2">
                              <div className={cn(
                                "flex items-center gap-1.5 w-fit px-2 py-1 rounded-lg",
                                stat.trend.bg
                              )}>
                                <TrendIcon className={cn("w-3 h-3", stat.trend.color)} />
                                <span className={cn("text-[9px] font-bold uppercase tracking-widest", stat.trend.color)}>
                                  {stat.trend.label}
                                </span>
                              </div>
                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-lg">
                                vs {getRangeLabel(range)}
                              </span>
                            </div>
                            <div className="h-20 w-full mt-6 -mx-6 mb-[-1.5rem]">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stat.trendData}>
                                  <defs>
                                    <linearGradient id={`gradient-user-${i}`} x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor={stat.chartColor} stopOpacity={0.25} />
                                      <stop offset="100%" stopColor={stat.chartColor} stopOpacity={0} />
                                    </linearGradient>
                                  </defs>
                                  <Area
                                    type="monotone"
                                    dataKey="v"
                                    stroke={stat.chartColor}
                                    strokeWidth={3}
                                    fill={`url(#gradient-user-${i})`}
                                    isAnimationActive={true}
                                    animationDuration={1500}
                                    animationEasing="ease-out"
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="max-w-[220px] p-0 border-0 shadow-2xl rounded-2xl overflow-hidden"
                    >
                      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1.5 rounded-lg", stat.bg)}>
                            <stat.icon className={cn("h-3.5 w-3.5", stat.color)} />
                          </div>
                          <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">
                            {stat.tooltip.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                          {stat.tooltip.description}
                        </p>
                        <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
                          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500">
                            {stat.tooltip.detail}
                          </p>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </motion.div>
              );
            })}
          </div>
        </TooltipProvider>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-[2.5rem] border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 p-6 shadow-xl backdrop-blur-xl overflow-hidden"
        >
          <UserTable
            data={data?.data || []}
            totalItems={totalUsers}
            isLoading={isLoading || isFetching || false}
            columns={getColumns(session?.user?.role).filter((col: any) => {
              if (col.accessorKey === 'listingsCount' && role !== 'LANDLORD') return false;
              if (col.accessorKey === 'bookingsCount' && role !== 'USER') return false;
              return true;
            }) as any}
            toolbarActions={
              isSuperAdmin && (
                <Button
                  size="sm"
                  onClick={() => setProvisioning(true)}
                  className="h-8 px-3 gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  <UserPlus size={14} /> Add User
                </Button>
              )
            }
          />
        </motion.div>
      </div>
    </div>
  );
}

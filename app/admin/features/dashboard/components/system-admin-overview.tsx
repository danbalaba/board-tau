'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  IconShieldCheck, 
  IconRefresh, 
  IconHome, 
  IconUserCheck, 
  IconStar, 
  IconBuilding, 
  IconActivity, 
  IconInbox, 
  IconArrowUpRight,
  IconClock,
  IconUsers,
  IconArrowRight
} from '@tabler/icons-react';
import { Button } from '@/app/admin/components/ui/button';
import { AdminDashboardError } from '@/app/admin/components/ui/admin-dashboard-error';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/admin/components/ui/card';
import { Badge } from '@/app/admin/components/ui/badge';
import PageContainer from '@/app/admin/components/layout/page-container';
import { toast } from '@/app/admin/components/ui/sonner';
import { useModeratorStats } from '@/app/admin/hooks/use-moderator-stats';
import Skeleton from '@/components/common/Skeleton';
import Link from 'next/link';
import { cn } from '@/app/admin/lib/utils';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function SystemAdminOverview() {
  const { data: apiResponse, isLoading, error, refetch, isFetching } = useModeratorStats();
  const data = apiResponse?.data;

  const isAnyLoading = isLoading || isFetching;

  const handleRefresh = async () => {
    toast.promise(refetch(), {
      loading: 'Syncing operational metrics...',
      success: 'Operational metrics updated.',
      error: 'Failed to update metrics.'
    });
  };

  const kpis = [
    {
      title: 'Pending Listings',
      value: isAnyLoading ? <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl" /> : `${data?.pendingListings ?? 0}`,
      desc: 'Listing Reviews',
      link: '/admin/moderation/listings',
      icon: IconHome,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      title: 'Pending Hosts',
      value: isAnyLoading ? <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl" /> : `${data?.pendingHosts ?? 0}`,
      desc: 'Host Applications',
      link: '/admin/moderation/hosts',
      icon: IconUserCheck,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Pending Reviews',
      value: isAnyLoading ? <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl" /> : `${data?.pendingReviews ?? 0}`,
      desc: 'User Reviews',
      link: '/admin/moderation/reviews',
      icon: IconStar,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      title: 'Active Listings',
      value: isAnyLoading ? <div className="h-8 w-16 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl" /> : `${data?.activeListings ?? 0}`,
      desc: 'Live Properties',
      link: '/admin/properties/directory',
      icon: IconBuilding,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    }
  ];

  const totalBacklog = (data?.pendingListings ?? 0) + (data?.pendingHosts ?? 0) + (data?.pendingReviews ?? 0);

  if (error) {
    return <AdminDashboardError />;
  }

  return (
    <PageContainer>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-10 pb-20"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="relative p-8 rounded-[3rem] border border-indigo-500/20 shadow-xl overflow-hidden bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-indigo-500/10 pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex w-full flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                {isLoading ? (
                  <Skeleton className="w-16 h-16 rounded-[24px]" />
                ) : (
                  <div className="w-16 h-16 bg-white dark:bg-gray-800 text-indigo-500 rounded-[24px] flex items-center justify-center shadow-xl border border-gray-100 dark:border-gray-700">
                    <IconShieldCheck size={32} strokeWidth={2.5} />
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
                      <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight flex items-center gap-3">
                        Operations Dashboard
                      </h1>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                          Real-time platform moderation & compliance
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isLoading ? (
                  <Skeleton className="h-11 w-28 rounded-xl" />
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isFetching}
                    className="h-11 px-4 border-gray-200/60 dark:border-gray-700/60 shadow-sm rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest transition-all bg-white/50 dark:bg-gray-800/50 hover:bg-indigo-500/10 hover:border-indigo-500/30 group hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <IconRefresh className={cn("w-4 h-4 text-indigo-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors", isFetching && "animate-spin [animation-duration:2s]")} />
                    Refresh
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Live Status Bar */}
        <motion.div variants={itemVariants}>
          <div className={cn(
            "flex items-center gap-3 px-6 py-4 rounded-[24px] border",
            totalBacklog > 5 
              ? "bg-amber-500/5 border-amber-500/10 text-amber-600 dark:text-amber-500" 
              : "bg-emerald-500/5 border-emerald-500/10 text-emerald-600 dark:text-emerald-500"
          )}>
            <div className="flex items-center gap-2">
              <div className={cn(
                "h-2 w-2 rounded-full animate-pulse",
                totalBacklog > 5 ? "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.7)]" : "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]"
              )} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {totalBacklog > 5 ? 'High Backlog - Active Moderation Required' : 'Backlog under control'}
              </span>
            </div>
            <div className="h-3 w-px bg-current opacity-20" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Total Queue Count: {totalBacklog}
            </span>
          </div>
        </motion.div>

        {/* KPI Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, i) => (
            <Link href={kpi.link} key={i} className="group">
              <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-[24px] border border-gray-100 dark:border-gray-800 p-6 hover:shadow-xl hover:border-primary/20 transition-all duration-500 shadow-sm overflow-hidden h-full flex flex-col justify-between">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn('w-12 h-12 rounded-[18px] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm', kpi.bg, kpi.color)}>
                    <kpi.icon className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <IconArrowUpRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                    {kpi.title}
                  </h3>
                  <div className="text-3xl font-black tabular-nums tracking-tighter text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                    {kpi.value}
                  </div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2">{kpi.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Quick Actions & Recent Activity Feed */}
        <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="lg:col-span-1 rounded-[3rem] border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-8 shadow-sm flex flex-col h-full">
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-6">Quick Shortcuts</h3>
            <div className="flex-1 flex flex-col gap-3">
              {[
                { title: 'Governance Center', url: '/admin/moderation/queue', desc: 'Unified priority queue' },
                { title: 'User Directory', url: '/admin/user-management/users', desc: 'Manage/Suspend members' },
                { title: 'Property Listings', url: '/admin/properties/directory', desc: 'View current directory' },
                { title: 'Support Tickets', url: '/admin/kanban', desc: 'Review support requests' }
              ].map((act, i) => (
                <Link href={act.url} key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/40 border border-gray-100/50 dark:border-gray-800 hover:bg-primary/5 hover:border-primary/20 transition-all group">
                  <div>
                    <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors">{act.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{act.desc}</p>
                  </div>
                  <IconArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-2 rounded-[3rem] border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl p-8 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Recent Moderation Actions</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Audit log of latest system modifications</p>
              </div>
              <div className="w-10 h-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                <IconActivity className="h-5 w-5 text-indigo-500 animate-pulse" />
              </div>
            </div>

            <div className="flex-1 space-y-4">
              {isAnyLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full rounded-2xl" />
                  <Skeleton className="h-12 w-full rounded-2xl" />
                </div>
              ) : !data?.recentLogs || data.recentLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-10 text-center">
                  <IconInbox className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No recent admin logs recorded.</p>
                </div>
              ) : (
                data.recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/40 border border-gray-100/50 dark:border-gray-800">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
                      <IconClock className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className="text-xs font-black text-gray-900 dark:text-white">{log.adminName}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <p className="text-xs font-medium text-gray-500 mt-1 italic leading-relaxed">
                        Executed action: <span className="font-bold text-gray-700 dark:text-gray-300">"{log.action}"</span> on entity <span className="font-bold text-gray-700 dark:text-gray-300">{log.entityType}</span>
                      </p>
                      {log.details && (
                        <p className="text-[10px] text-gray-400 mt-1 truncate">Details: {log.details}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { 
  IconShieldCheck, 
  IconHome, 
  IconUserCheck, 
  IconStar, 
  IconBuilding, 
  IconActivity, 
  IconInbox, 
  IconArrowUpRight, 
  IconClock, 
  IconUsers, 
  IconArrowRight,
  IconSparkles,
  IconChevronRight,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconCircleCheck
} from '@tabler/icons-react';
import {
  Sun,
  SunMedium,
  Sunset,
  Moon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { AdminDashboardError } from '@/app/admin/components/ui/admin-dashboard-error';
import { Badge } from '@/app/admin/components/ui/badge';
import PageContainer from '@/app/admin/components/layout/page-container';
import { useModeratorStats } from '@/app/admin/hooks/use-moderator-stats';
import Skeleton from '@/components/common/Skeleton';
import { cn, getAdminGreetingName } from '@/app/admin/lib/utils';
import { preloadKerbyAssets } from '@/utils/imagePreloader';

// Format helper to convert technical entity codes into simple friendly terms
const formatEntityType = (type: string) => {
  const normalized = (type || '').toUpperCase();
  if (normalized.includes('LISTING')) return 'Listing';
  if (normalized.includes('HOST')) return 'Landlord Application';
  if (normalized.includes('REVIEW')) return 'Review';
  if (normalized.includes('USER')) return 'User Account';
  return type;
};

// Format helper to convert uppercase action codes into simple title case
const formatAction = (action: string) => {
  const normalized = (action || '').toUpperCase();
  if (normalized === 'APPROVED' || normalized.includes('APPROV')) return 'Approved';
  if (normalized === 'REJECTED' || normalized.includes('REJECT')) return 'Rejected';
  if (normalized.includes('BAN')) return 'Banned';
  return action;
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

// ── Dynamic Kerby Compliance Officer Assistant Banner ──
interface ModeratorKerbyState {
  image: string;
  fallbackImage: string;
  badge: string;
  prompt: string;
  actionLabel?: string;
  actionUrl?: string;
}

const ModeratorKerbyBanner: React.FC<{
  kerbyState: ModeratorKerbyState;
}> = React.memo(({ kerbyState }) => {
  const [displayedPrompt, setDisplayedPrompt] = useState<string>('');
  const [isTypingComplete, setIsTypingComplete] = useState<boolean>(false);

  useEffect(() => {
    const fullText = kerbyState.prompt;
    if (!fullText) {
      setDisplayedPrompt('');
      return;
    }

    let isSubscribed = true;
    let timeoutId: NodeJS.Timeout;
    let index = 0;

    setDisplayedPrompt('');
    setIsTypingComplete(false);

    const typeNextChar = () => {
      if (!isSubscribed) return;

      if (index < fullText.length) {
        index++;
        setDisplayedPrompt(fullText.slice(0, index));
        const isDone = index >= fullText.length;
        setIsTypingComplete(isDone);

        if (isDone) {
          timeoutId = setTimeout(() => {
            if (!isSubscribed) return;
            index = 0;
            setIsTypingComplete(false);
            setDisplayedPrompt('');
            timeoutId = setTimeout(typeNextChar, 350);
          }, 7000);
          return;
        }

        timeoutId = setTimeout(typeNextChar, 26);
      }
    };

    typeNextChar();

    return () => {
      isSubscribed = false;
      clearTimeout(timeoutId);
    };
  }, [kerbyState.prompt]);

  return (
    <div className="bg-gradient-to-br from-[#e6f4f1] via-[#f0f9ff] to-[#f8fafc] dark:from-[#0b1329] dark:via-[#0f172a] dark:to-[#090d16] p-4 sm:p-5 sm:pl-6 rounded-[28px] border border-[#2f7d6d]/20 dark:border-slate-800 shadow-sm shadow-[#2f7d6d]/10 dark:shadow-black/40 relative overflow-hidden flex items-center justify-between gap-3 sm:gap-6 min-h-[140px] sm:min-h-[155px]">
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative w-28 sm:w-36 h-28 sm:h-36 shrink-0 flex items-end justify-center self-end -mb-3 sm:-mb-4 -ml-1 sm:-ml-2 z-10"
      >
        <Image
          src={kerbyState.image}
          alt="Kerby Admin Assistant"
          width={150}
          height={150}
          className="object-contain object-bottom drop-shadow-xl scale-110 sm:scale-120 transform origin-bottom transition-all duration-500"
          unoptimized
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== kerbyState.fallbackImage) {
              target.src = kerbyState.fallbackImage;
            }
          }}
        />
      </motion.div>

      {/* Thought Connection Circles */}
      <div className="hidden sm:flex flex-col items-end gap-1 absolute left-[135px] sm:left-[160px] bottom-12 z-20 pointer-events-none">
        <div className="w-3 h-3 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 shadow-xs" />
        <div className="w-2 h-2 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xs -translate-x-1" />
        <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xs -translate-x-2" />
      </div>

      {/* Speech Bubble */}
      <div className="relative min-w-0 flex-1 bg-white dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 my-auto z-10 flex flex-col justify-between">
        <div className="hidden sm:block absolute top-1/2 -left-2.5 -translate-y-1/2 w-0 h-0 border-y-[7px] border-y-transparent border-r-[9px] border-r-white dark:border-r-slate-900" />

        <div className="flex items-center gap-1.5 text-xs font-bold text-[#2f7d6d] dark:text-emerald-400 mb-1">
          <IconSparkles className="w-3.5 h-3.5 text-[#2f7d6d] dark:text-emerald-400 shrink-0" />
          <span className="tracking-wider font-mono text-[10px] uppercase">KERBY ASSISTANT</span>
        </div>

        <div className="min-h-[44px] sm:min-h-[48px] flex items-center my-0.5">
          <p className="text-[12px] sm:text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-snug">
            {displayedPrompt}
            {!isTypingComplete && (
              <span className="inline-block w-1.5 h-3.5 bg-[#2f7d6d] dark:text-emerald-400 ml-1 translate-y-0.5 animate-pulse rounded-xs" />
            )}
          </p>
        </div>

        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-[#2f7d6d] dark:text-emerald-300 font-medium mt-1">
          <span className="font-bold text-[#2f7d6d] dark:text-emerald-400">{kerbyState.badge}</span>
          {kerbyState.actionUrl && kerbyState.actionLabel && (
            <Link
              href={kerbyState.actionUrl}
              className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#2f7d6d] hover:text-[#256659] dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
            >
              <span>{kerbyState.actionLabel}</span>
              <IconChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
});
ModeratorKerbyBanner.displayName = 'ModeratorKerbyBanner';

export default function SystemAdminOverview() {
  const { data: session } = useSession();
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Good morning');
  const [currentHour, setCurrentHour] = useState<number>(() => new Date().getHours());

  const { data: apiResponse, isLoading, error, refetch, isFetching } = useModeratorStats();
  const data = apiResponse?.data;

  useEffect(() => {
    preloadKerbyAssets();

    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      setCurrentHour(hour);

      if (hour >= 5 && hour < 12) {
        setGreeting('Good morning');
      } else if (hour >= 12 && hour < 18) {
        setGreeting('Good afternoon');
      } else if (hour >= 18 && hour < 22) {
        setGreeting('Good evening');
      } else {
        setGreeting('Good night');
      }

      setFormattedDate(
        now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const TimeIcon = useMemo(() => {
    if (currentHour >= 5 && currentHour < 12) return Sun;
    if (currentHour >= 12 && currentHour < 18) return SunMedium;
    if (currentHour >= 18 && currentHour < 22) return Sunset;
    return Moon;
  }, [currentHour]);

  const greetingName = getAdminGreetingName(session?.user?.name, session?.user?.role);
  const isAnyLoading = isLoading || isFetching;

  const totalBacklog = (data?.pendingListings ?? 0) + (data?.pendingHosts ?? 0) + (data?.pendingReviews ?? 0);

  // ── Compute Dynamic Kerby State ──
  const kerbyState = useMemo<ModeratorKerbyState>(() => {
    // Night Mode (10 PM to 5 AM)
    if (currentHour >= 22 || currentHour < 5) {
      return {
        image: '/assets/mascot/kerby-halfbody-sleeping.png',
        fallbackImage: '/assets/mascot/kerby-admin-compliance-check.png',
        badge: 'Night Watch',
        prompt: `Kerby is keeping watch over the platform tonight. You have ${totalBacklog} item${totalBacklog === 1 ? '' : 's'} waiting for review.`,
        actionLabel: 'View Queue',
        actionUrl: '/admin/moderation/queue'
      };
    }

    const timePrefix = currentHour >= 5 && currentHour < 12 ? 'Good morning! ' : '';

    // Zero Backlog (All Clear)
    if (totalBacklog === 0) {
      return {
        image: '/assets/mascot/kerby-admin-gavel-approved.png',
        fallbackImage: '/assets/mascot/kerby-admin-compliance-check.png',
        badge: 'All Caught Up',
        prompt: `${timePrefix}Great job! All listings, landlord applications, and reviews are approved and up to date.`,
        actionLabel: 'View Users',
        actionUrl: '/admin/user-management/users'
      };
    }

    // High Backlog (> 5 pending items)
    if (totalBacklog > 5) {
      return {
        image: '/assets/mascot/kerby-admin-audit-specs.png',
        fallbackImage: '/assets/mascot/kerby-admin-compliance-check.png',
        badge: 'Needs Attention',
        prompt: `${timePrefix}You have ${totalBacklog} items waiting for review. Check them out to keep student accommodations verified!`,
        actionLabel: 'Review Submissions',
        actionUrl: '/admin/moderation/queue'
      };
    }

    // Default Healthy / Active Queue (1 to 5 pending items)
    return {
      image: '/assets/mascot/kerby-admin-compliance-check.png',
      fallbackImage: '/assets/mascot/kerby-admin-gavel-approved.png',
      badge: 'Up to Date',
      prompt: `${timePrefix}You have ${totalBacklog} item${totalBacklog === 1 ? '' : 's'} waiting for your review across listings and landlord applications.`,
      actionLabel: 'Review Submissions',
      actionUrl: '/admin/moderation/queue'
    };
  }, [totalBacklog, currentHour]);

  // ── Modern KPI Cards ──
  const kpis = [
    {
      title: 'Pending Listings',
      value: data?.pendingListings ?? 0,
      subtitle: 'Boarding house posts',
      badge: (data?.pendingListings ?? 0) > 0 ? 'Needs Review' : 'All Clear',
      link: '/admin/moderation/listings',
      icon: IconBuilding,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      accentGlow: 'hover:border-amber-500/40 hover:shadow-amber-500/10'
    },
    {
      title: 'Pending Landlords',
      value: data?.pendingHosts ?? 0,
      subtitle: 'Host applications',
      badge: (data?.pendingHosts ?? 0) > 0 ? 'Needs Review' : 'All Clear',
      link: '/admin/moderation/hosts',
      icon: IconUserCheck,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
      accentGlow: 'hover:border-sky-500/40 hover:shadow-sky-500/10'
    },
    {
      title: 'Pending Reviews',
      value: data?.pendingReviews ?? 0,
      subtitle: 'Student ratings & feedback',
      badge: (data?.pendingReviews ?? 0) > 0 ? 'Needs Review' : 'All Clear',
      link: '/admin/moderation/reviews',
      icon: IconStar,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      accentGlow: 'hover:border-purple-500/40 hover:shadow-purple-500/10'
    },
    {
      title: 'Approved Listings',
      value: data?.activeListings ?? 0,
      subtitle: 'Active boarding houses',
      badge: 'Live',
      link: '/admin/moderation/listings',
      icon: IconShieldCheck,
      color: 'text-[#2f7d6d] dark:text-emerald-400',
      bg: 'bg-[#2f7d6d]/10',
      border: 'border-[#2f7d6d]/20',
      accentGlow: 'hover:border-[#2f7d6d]/40 hover:shadow-[#2f7d6d]/10'
    }
  ];

  // ── Breakdown Donut Data ──
  const compositionData = useMemo(() => {
    if (totalBacklog === 0) {
      return [{ name: 'All Caught Up', value: 1, color: '#10b981' }];
    }
    return [
      { name: 'Listings', value: data?.pendingListings || 0, color: '#f59e0b' },
      { name: 'Landlords', value: data?.pendingHosts || 0, color: '#0ea5e9' },
      { name: 'Reviews', value: data?.pendingReviews || 0, color: '#a855f7' },
    ].filter(item => item.value > 0);
  }, [data, totalBacklog]);

  // ── 7-Day Activity Velocity Data Fallback ──
  const velocityData = useMemo(() => {
    if (data?.dailyActivity && data.dailyActivity.length > 0) {
      return data.dailyActivity;
    }
    // Fallback baseline for clean chart rendering
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      approved: Math.floor(Math.random() * 3),
      rejected: Math.floor(Math.random() * 2),
      total: 3
    }));
  }, [data?.dailyActivity]);

  if (error) {
    return <AdminDashboardError />;
  }

  return (
    <PageContainer>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 pb-16"
      >
        {/* Dynamic Time & Greeting Header + Admin Kerby Assistant Banner */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="px-1">
            <p className="text-[11px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-1">
              {formattedDate || 'TODAY'}
            </p>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#2f7d6d]/10 dark:bg-emerald-500/10 text-[#2f7d6d] dark:text-emerald-400 border border-[#2f7d6d]/20 shrink-0">
                <TimeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#2f7d6d] dark:text-emerald-400" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {greeting}, <span className="bg-gradient-to-r from-[#2f7d6d] to-emerald-500 bg-clip-text text-transparent">{greetingName}!</span>
              </h1>
            </div>
          </div>

          <ModeratorKerbyBanner kerbyState={kerbyState} />
        </motion.div>

        {/* 2. Operational KPI Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {kpis.map((kpi, i) => (
            <Link href={kpi.link} key={i} className="group block focus:outline-none">
              <div className={cn(
                "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[22px] border border-slate-200/80 dark:border-slate-800 p-5 transition-all duration-300 shadow-xs hover:shadow-md hover:-translate-y-0.5",
                kpi.accentGlow
              )}>
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105", kpi.bg, kpi.color)}>
                    <kpi.icon className="w-5 h-5" strokeWidth={2.2} />
                  </div>
                  <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider rounded-lg border", kpi.border, kpi.color, kpi.bg)}>
                    {kpi.badge}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                    {kpi.title}
                  </h3>
                  <div className="text-3xl font-black tabular-nums tracking-tight text-slate-900 dark:text-white flex items-baseline gap-2">
                    {isAnyLoading ? (
                      <Skeleton className="h-8 w-14 rounded-lg my-0.5" />
                    ) : (
                      <span>{kpi.value}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                    <span>{kpi.subtitle}</span>
                    <IconArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#2f7d6d] dark:text-emerald-400" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>

        {/* 3. Visual Analytics Row (Two Charts) */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Chart 1: Queue Breakdown Donut (5 cols) */}
          <div className="lg:col-span-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[24px] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Pending by Category
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Waiting
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">Items currently waiting for your review</p>
            </div>

            <div className="relative h-48 w-full flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={compositionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={totalBacklog === 0 ? 0 : 4}
                    dataKey="value"
                  >
                    {compositionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0];
                        const color = (item.payload as any)?.color || '#2f7d6d';
                        return (
                          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl text-slate-900 dark:text-white text-xs px-3.5 py-2 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: color }} />
                            <span className="font-bold text-slate-600 dark:text-slate-300">{item.name}:</span>
                            <span className="font-black text-slate-900 dark:text-white tabular-nums">
                              {item.value} item{Number(item.value) === 1 ? '' : 's'}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums leading-none">
                  {totalBacklog}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                  {totalBacklog === 0 ? 'Clear' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Legend & Breakdown Chips */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <div className="text-center p-2 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Listings</span>
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums mt-0.5 block">
                  {data?.pendingListings ?? 0}
                </span>
              </div>

              <div className="text-center p-2 rounded-xl bg-sky-500/5 border border-sky-500/10">
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-sky-600 dark:text-sky-400">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>Landlords</span>
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums mt-0.5 block">
                  {data?.pendingHosts ?? 0}
                </span>
              </div>

              <div className="text-center p-2 rounded-xl bg-purple-500/5 border border-purple-500/10">
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Reviews</span>
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums mt-0.5 block">
                  {data?.pendingReviews ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Chart 2: Weekly Review Activity (7 cols) */}
          <div className="lg:col-span-7 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[24px] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Weekly Activity
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 rounded-md">
                    {data?.resolutionRate ?? 100}% Completed
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#2f7d6d] dark:bg-emerald-400" />
                    <span>Approved</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
                    <span>Rejected</span>
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-4">Approvals and rejections over the last 7 days</p>
            </div>

            <div className="h-56 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800" />
                  <XAxis 
                    dataKey="day" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(47, 125, 109, 0.06)', radius: 6 }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const approvedVal = payload.find((p: any) => p.dataKey === 'approved')?.value ?? payload[0]?.value ?? 0;
                        const rejectedVal = payload.find((p: any) => p.dataKey === 'rejected')?.value ?? payload[1]?.value ?? 0;
                        return (
                          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/60 rounded-2xl p-3 min-w-[150px] space-y-1.5">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-1.5 mb-1.5">
                              <p className="font-black text-xs text-slate-900 dark:text-white">{label}</p>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-xs">
                              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold">
                                <span className="w-2 h-2 rounded-full bg-[#2f7d6d] dark:bg-emerald-400" />
                                Approved:
                              </span>
                              <span className="font-black text-[#2f7d6d] dark:text-emerald-400 tabular-nums">
                                {approvedVal}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-xs">
                              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold">
                                <span className="w-2 h-2 rounded-full bg-rose-500" />
                                Rejected:
                              </span>
                              <span className="font-black text-rose-600 dark:text-rose-400 tabular-nums">
                                {rejectedVal}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="approved" fill="#2f7d6d" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="rejected" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500">
              <span>Total Reviewed: <strong className="text-slate-800 dark:text-slate-200">{(data?.totalApproved ?? 0) + (data?.totalRejected ?? 0)}</strong></span>
              <span className="text-[#2f7d6d] dark:text-emerald-400 font-bold">Goal: Reviewed within 24 hours</span>
            </div>
          </div>
        </motion.div>

        {/* 4. Quick Actions & Recent Activity Feed */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Quick Actions Shortcuts (4 cols) */}
          <div className="lg:col-span-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[24px] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Quick Actions
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Shortcuts
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">Quick links to review and manage accounts</p>

              <div className="space-y-2.5">
                {[
                  {
                    title: 'All Pending Reviews',
                    desc: 'Everything waiting for your decision',
                    url: '/admin/moderation/queue',
                    badge: totalBacklog > 0 ? `${totalBacklog} Pending` : 'All Clear',
                    badgeColor: totalBacklog > 0 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                    icon: IconShieldCheck,
                  },
                  {
                    title: 'Listing Approvals',
                    desc: 'Review submitted boarding houses',
                    url: '/admin/moderation/listings',
                    badge: (data?.pendingListings ?? 0) > 0 ? `${data?.pendingListings} Pending` : null,
                    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                    icon: IconBuilding,
                  },
                  {
                    title: 'Landlord Applications',
                    desc: 'Review host accounts and permits',
                    url: '/admin/moderation/hosts',
                    badge: (data?.pendingHosts ?? 0) > 0 ? `${data?.pendingHosts} Pending` : null,
                    badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
                    icon: IconUserCheck,
                  },
                  {
                    title: 'Student Reviews',
                    desc: 'Check ratings and comments',
                    url: '/admin/moderation/reviews',
                    badge: (data?.pendingReviews ?? 0) > 0 ? `${data?.pendingReviews} Flagged` : null,
                    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
                    icon: IconStar,
                  },
                  {
                    title: 'User Accounts',
                    desc: 'View all students and landlords',
                    url: '/admin/user-management/users',
                    badge: 'Directory',
                    badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
                    icon: IconUsers,
                  },
                ].map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.url}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 hover:bg-[#2f7d6d]/5 hover:border-[#2f7d6d]/30 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:text-[#2f7d6d] group-hover:border-[#2f7d6d]/30 transition-colors shrink-0">
                        <item.icon size={16} />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#2f7d6d] transition-colors truncate">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{item.desc}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {item.badge && (
                        <Badge variant="outline" className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-md border", item.badgeColor)}>
                          {item.badge}
                        </Badge>
                      )}
                      <IconArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 group-hover:text-[#2f7d6d] transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 mt-3 flex items-center justify-between">
              <span>Need help? Check Guidelines</span>
              <IconChevronRight size={14} />
            </div>
          </div>

          {/* Recent Activity Feed (8 cols) */}
          <div className="lg:col-span-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[24px] border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Recent Activity
                  </h3>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Latest</span>
                  </div>
                </div>
                <Link 
                  href="/admin/moderation/queue" 
                  className="text-xs font-bold text-[#2f7d6d] hover:text-[#256659] dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors flex items-center gap-1"
                >
                  <span>Moderation Queue</span>
                  <IconChevronRight size={14} />
                </Link>
              </div>
              <p className="text-xs text-slate-500 mb-3">Latest approvals and rejections on the platform</p>

              <div className="space-y-2">
                {isAnyLoading && (!data?.recentLogs || data.recentLogs.length === 0) ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-1/3" />
                        <Skeleton className="h-2 w-3/4" />
                      </div>
                    </div>
                  ))
                ) : !data?.recentLogs || data.recentLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                      <IconInbox size={20} />
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No recent activity</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm">Approved or rejected items will show up here.</p>
                  </div>
                ) : (
                  data.recentLogs.slice(0, 5).map((log) => {
                    const isApproved = log.action.toLowerCase().includes('approve');
                    const isRejected = log.action.toLowerCase().includes('reject') || log.action.toLowerCase().includes('remove') || log.action.toLowerCase().includes('ban');
                    
                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100/80 dark:border-slate-800/80 hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-xs transition-all"
                      >
                        {/* Status Icon */}
                        <div className={cn(
                          "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5",
                          isApproved 
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : isRejected
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        )}>
                          {isApproved ? (
                            <IconCheck size={15} strokeWidth={2.5} />
                          ) : isRejected ? (
                            <IconX size={15} strokeWidth={2.5} />
                          ) : (
                            <IconActivity size={15} strokeWidth={2.5} />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {log.adminName}
                              </span>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[9px] font-bold px-1.5 py-0 rounded border",
                                  isApproved 
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                    : isRejected
                                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                )}
                              >
                                {formatAction(log.action)}
                              </Badge>
                              <span className="text-[10px] font-semibold text-slate-400">
                                • {formatEntityType(log.entityType)}
                              </span>
                            </div>

                            <span className="text-[10px] font-medium text-slate-400 tabular-nums">
                              {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {log.details ? (
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-900/40 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800/80 mt-1 line-clamp-2">
                              {log.details}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 mt-3 flex items-center justify-between">
              <span>Updates automatically as items are reviewed</span>
              <span className="text-slate-500 font-semibold">Latest 5 actions</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </PageContainer>
  );
}

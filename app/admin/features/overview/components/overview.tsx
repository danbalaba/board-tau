'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import PageContainer from '../../../components/layout/page-container';
import { AdminDashboardError } from '@/app/admin/components/ui/admin-dashboard-error';
import { BarGraph } from './bar-graph';
import { AreaGraph } from './area-graph';
import { PieGraph } from './pie-graph';
import { RecentSales } from './recent-sales';
import {
  Users,
  Building2,
  CalendarCheck,
  DollarSign,
  Star,
  UserCheck,
  ShieldCheck,
  Settings,
  ShieldAlert,
  ChevronRight,
  Sun,
  SunMedium,
  Sunset,
  Moon,
  Sparkles,
} from 'lucide-react';
import { useExecutiveOverview } from '@/app/admin/hooks/use-executive-overview';
import { useSession } from 'next-auth/react';
import { preloadKerbyAssets } from '@/utils/imagePreloader';
import { getAdminGreetingName } from '@/app/admin/lib/utils';

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
    transition: { duration: 0.45, ease: "easeOut" }
  }
};

// ── Admin Kerby Mascot Assistant Banner ──
interface AdminKerbyState {
  image: string;
  fallbackImage: string;
  badge: string;
  prompt: string;
  actionLabel?: string;
  actionUrl?: string;
}

const AdminKerbyBanner: React.FC<{ kerbyState: AdminKerbyState }> = React.memo(({ kerbyState }) => {
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
          }, 6000);
          return;
        }

        timeoutId = setTimeout(typeNextChar, 28);
      }
    };

    typeNextChar();

    return () => {
      isSubscribed = false;
      clearTimeout(timeoutId);
    };
  }, [kerbyState.prompt]);

  return (
    <div className="bg-gradient-to-br from-[#e6f4f1] via-[#f0f9ff] to-[#f8fafc] dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] p-4 sm:p-5 sm:pl-6 rounded-[28px] border border-[#2f7d6d]/20 dark:border-slate-800 shadow-sm shadow-[#2f7d6d]/10 dark:shadow-black/40 relative overflow-hidden flex items-center justify-between gap-3 sm:gap-6 min-h-[140px] sm:min-h-[155px]">
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
          alt="Kerby Mascot"
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
        <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-0 h-0 border-y-[7px] border-y-transparent border-r-[9px] border-r-white dark:border-r-slate-900" />

        <div className="flex items-center gap-1.5 text-xs font-bold text-[#2f7d6d] dark:text-emerald-400 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#2f7d6d] dark:text-emerald-400 shrink-0" />
          <span className="tracking-wider font-mono text-[10px] uppercase">KERBY ADMIN ASSISTANT</span>
        </div>

        <div className="min-h-[44px] sm:min-h-[48px] flex items-center my-0.5">
          <p className="text-[12px] sm:text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-snug tracking-normal">
            {displayedPrompt}
            {!isTypingComplete && (
              <span className="inline-block w-1.5 h-3.5 bg-[#2f7d6d] dark:bg-emerald-400 ml-1 translate-y-0.5 animate-pulse rounded-xs" />
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
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
});
AdminKerbyBanner.displayName = 'AdminKerbyBanner';

export default function OverViewPage() {
  const { data: session } = useSession();
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Good morning');
  const [currentHour, setCurrentHour] = useState<number>(() => new Date().getHours());

  const { data: apiResponse, isLoading, error, refetch } = useExecutiveOverview('30d');

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

  const data = apiResponse?.data;
  const metrics = data?.metrics;

  // Dynamic Kerby Mascot Assistant State
  const kerbyState = useMemo<AdminKerbyState>(() => {
    const totalRevenue = metrics?.totalRevenue || 0;
    const growth = metrics?.revenueGrowthPercentage || 0;
    const totalListings = metrics?.totalListings || 0;
    const totalReservations = metrics?.totalReservations || 0;
    const newUsers = metrics?.newUsers || 0;
    const newLandlords = metrics?.newLandlords || 0;
    const averageRating = metrics?.averageRating || 0;

    // State 1: Night Watch
    if (currentHour >= 22 || currentHour < 5) {
      return {
        image: '/assets/mascot/kerby-halfbody-sleeping.png',
        fallbackImage: '/assets/mascot/kerby-casual-sleeping.png',
        badge: 'Night Watch',
        prompt: 'Rest well! Kerby is keeping watch over the platform servers, student reservations, and room inquiries overnight.',
        actionLabel: undefined,
        actionUrl: undefined,
      };
    }

    // State 2: Revenue / Booking Surge
    if (growth > 10) {
      return {
        image: '/assets/mascot/kerby-halfbody-celebrate-popper.png',
        fallbackImage: '/assets/mascot/kerby-halfbody-celebrate.png',
        badge: 'Growth Surge',
        prompt: `Awesome growth! Platform earnings are up by ${growth}% this period with ₱${totalRevenue.toLocaleString()} in confirmed bookings!`,
        actionLabel: 'Audit Logs',
        actionUrl: '/admin/monitoring/audit-logs',
      };
    }

    // State 3: New Community Onboarding
    if (newUsers > 0 || newLandlords > 0) {
      return {
        image: '/assets/mascot/kerby-role-boss.png',
        fallbackImage: '/assets/mascot/kerby-casual-pointing.png',
        badge: 'Community Pulse',
        prompt: `${newUsers} new students and ${newLandlords} new property owners joined BoardTAU recently. The campus housing network is growing!`,
        actionLabel: 'User Directory',
        actionUrl: '/admin/user-management/users',
      };
    }

    // State 4: High Student Satisfaction
    if (averageRating >= 4.0) {
      return {
        image: '/assets/mascot/kerby-halfbody-rating.png',
        fallbackImage: '/assets/mascot/kerby-landlord-verified.png',
        badge: 'High Satisfaction',
        prompt: `Student satisfaction is high! Tenant reviews are averaging ${averageRating.toFixed(1)}★ across confirmed campus boarding stays.`,
        actionLabel: 'Review Queue',
        actionUrl: '/admin/moderation/reviews',
      };
    }

    // State 5: Active Listings Available
    if (totalListings > 0) {
      return {
        image: '/assets/mascot/kerby-halfbody-keys.png',
        fallbackImage: '/assets/mascot/kerby-desktop-welcome.png',
        badge: 'Housing Live',
        prompt: `${totalListings} approved boarding houses, dormitories, and apartments are live and ready for student room applications.`,
        actionLabel: 'Property Config',
        actionUrl: '/admin/settings/property-configuration',
      };
    }

    // State 6: Default All Systems Go
    return {
      image: '/assets/mascot/kerby-admin-compliance-check.png',
      fallbackImage: '/assets/mascot/kerby-landlord-checklist.png',
      badge: 'All Systems Go',
      prompt: 'All platform services, student accounts, and property listings are running smoothly with zero interruptions.',
      actionLabel: 'Audit Logs',
      actionUrl: '/admin/monitoring/audit-logs',
    };
  }, [currentHour, metrics]);



  // 6 Stats KPI Cards Definition
  const statsCards = [
    {
      label: 'Total Revenue',
      value: isLoading ? '—' : `₱${metrics?.totalRevenue?.toLocaleString() || '0'}`,
      subtitle: 'Earnings from confirmed bookings',
      icon: DollarSign,
      accentColor: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      glowBg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
      badge: `${(metrics?.revenueGrowthPercentage || 0) >= 0 ? '+' : ''}${metrics?.revenueGrowthPercentage || 0}%`,
      badgeColor: (metrics?.revenueGrowthPercentage || 0) >= 0
        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    },
    {
      label: 'Confirmed Bookings',
      value: isLoading ? '—' : (metrics?.totalReservations?.toLocaleString() || '0'),
      subtitle: `${metrics?.totalReservations || 0} active tenant leases`,
      icon: CalendarCheck,
      accentColor: 'from-purple-500 to-indigo-500',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      glowBg: 'bg-purple-500/15 dark:bg-purple-500/20',
      badge: 'Active Leases',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    },
    {
      label: 'Active Listings',
      value: isLoading ? '—' : (metrics?.totalListings?.toLocaleString() || '0'),
      subtitle: `${metrics?.totalListings || 0} approved properties live`,
      icon: Building2,
      accentColor: 'from-teal-500 to-emerald-500',
      iconBg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      glowBg: 'bg-teal-500/15 dark:bg-teal-500/20',
      badge: `${metrics?.newListings || metrics?.totalListings || 0} Live`,
      badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    },
    {
      label: 'Total Users',
      value: isLoading ? '—' : (metrics?.totalUsers?.toLocaleString() || '0'),
      subtitle: `${metrics?.newUsers || 0} new registrations recently`,
      icon: Users,
      accentColor: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      glowBg: 'bg-blue-500/15 dark:bg-blue-500/20',
      badge: `${metrics?.newUsers || 0} New`,
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    },
    {
      label: 'New Landlords',
      value: isLoading ? '—' : (metrics?.newLandlords?.toLocaleString() || '0'),
      subtitle: `${metrics?.newLandlords || 0} property hosts joined`,
      icon: UserCheck,
      accentColor: 'from-sky-500 to-blue-500',
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      glowBg: 'bg-sky-500/15 dark:bg-sky-500/20',
      badge: 'Hosts',
      badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    },
    {
      label: 'Platform Rating',
      value: isLoading ? '—' : (metrics?.averageRating ? `${metrics.averageRating.toFixed(1)} ★` : '5.0 ★'),
      subtitle: `Based on verified student reviews`,
      icon: Star,
      accentColor: 'from-amber-400 to-yellow-500',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      glowBg: 'bg-amber-500/15 dark:bg-amber-500/20',
      badge: 'Top Rated',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
  ];

  // 4 Curated Admin Quick Actions
  const quickActions = [
    {
      title: 'User Directory',
      fullTitle: 'User Directory',
      href: '/admin/user-management/users',
      description: 'Manage registered students & landlords',
      icon: Users,
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500/20',
    },
    {
      title: 'Moderation Queue',
      fullTitle: 'Moderation Queue',
      href: '/admin/moderation/queue',
      description: 'Review reported listings & flags',
      icon: ShieldCheck,
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/20',
    },
    {
      title: 'Property Config',
      fullTitle: 'Property Configuration',
      href: '/admin/settings/property-configuration',
      description: 'Room types, amenities & rules',
      icon: Settings,
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20',
    },
    {
      title: 'Audit Logs',
      fullTitle: 'Audit Logs',
      href: '/admin/monitoring/audit-logs',
      description: 'Inspect platform logs & activity',
      icon: ShieldAlert,
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/20',
    },
  ];

  if (error) {
    return (
      <PageContainer>
        <AdminDashboardError onRetry={() => refetch()} message="Unable to load platform data. Please verify your connection or refresh the page." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 sm:space-y-6 md:space-y-8 pb-20"
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

          {/* Admin Kerby Mascot Banner */}
          {isLoading ? (
            <div className="h-28 sm:h-24 w-full bg-slate-200 dark:bg-slate-800/60 rounded-[28px] animate-pulse border border-slate-200/50 dark:border-slate-800/50" />
          ) : (
            <AdminKerbyBanner kerbyState={kerbyState} />
          )}
        </motion.div>

        {/* ── Quick Actions Feature Zone ── */}
        <motion.div variants={itemVariants} className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
              Quick actions
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group relative bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-3.5 sm:p-4 hover:shadow-lg hover:border-[#2f7d6d]/30 transition-all duration-300 block"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${action.badgeColor} flex items-center justify-center transition-all duration-300 shrink-0 shadow-2xs`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.3} />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-[#2f7d6d] dark:group-hover:text-emerald-400 transition-colors truncate">
                        {action.fullTitle}
                      </h3>
                      <p className="text-[10px] sm:text-xs font-medium text-slate-400 dark:text-slate-500 truncate">
                        {action.description}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-[#2f7d6d] dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 hidden lg:block" />
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* ── 6 Stats KPI Section (Modeled after Landlord Dashboard) ── */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {statsCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="group relative bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-[24px] sm:rounded-[26px] border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-xs hover:shadow-xl hover:shadow-emerald-500/5 dark:hover:shadow-black/60 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full ${stat.glowBg} blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none`} />

                  <div className="flex items-center justify-between mb-2.5 sm:mb-3 z-10">
                    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl ${stat.iconBg} border flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shrink-0 shadow-2xs`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
                    </div>

                    <span className={`text-[10px] sm:text-[11px] font-extrabold uppercase px-2 sm:px-2.5 py-0.5 rounded-full border ${stat.badgeColor} tracking-wider`}>
                      {stat.badge}
                    </span>
                  </div>

                  <div className="z-10 mt-auto">
                    <p className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 truncate">
                      {stat.label}
                    </p>
                    
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-[#2f7d6d] dark:group-hover:text-emerald-400 transition-colors truncate">
                        {stat.value}
                      </h3>
                    </div>

                    <p className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 truncate leading-snug">
                      {stat.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Analytics & Activity Grid (2x2 Grid) ── */}
        <motion.div variants={itemVariants} className="space-y-4 sm:space-y-6">
          {/* Row 1: Top Properties Bar Graph + Recent Bookings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <BarGraph data={data?.topProperties} />
            </div>
            <div>
              <RecentSales data={data?.recentSales} />
            </div>
          </div>

          {/* Row 2: Platform Growth Area Chart + Category Donut Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <AreaGraph data={data?.charts?.engagement} />
            </div>
            <div>
              <PieGraph data={data?.charts?.propertyDistribution} />
            </div>
          </div>
        </motion.div>

      </motion.div>
    </PageContainer>
  );
}

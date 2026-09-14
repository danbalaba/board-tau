'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Sun, SunMedium, Sunset, Moon, ChevronRight } from 'lucide-react';
import { LandlordDashboardStatsCards } from './components/landlord-dashboard-stats-cards';
import { LandlordDashboardQuickActions } from './components/landlord-dashboard-quick-actions';
import { LandlordDashboardRecentActivity } from './components/landlord-dashboard-recent-activity';
import { ChartAreaInteractive } from '@/app/landlord/components/charts/AreaChart';
import { ChartPieLabel } from '@/app/landlord/components/charts/PieChart';
import { ChartLineInteractive } from '@/app/landlord/components/charts/LineChart';
import { motion, Variants } from 'framer-motion';
import { preloadKerbyAssets } from '@/utils/imagePreloader';
import { useLandlordProfileStore } from '../settings-hub/hooks/use-landlord-profile-store';
import { useDashboardLogic } from './hooks/use-dashboard-logic';
import Skeleton from '@/components/common/Skeleton';

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

// Isolated Kerby Speech Banner Component to prevent parent re-renders during typewriter animation
interface KerbyBannerProps {
  kerbyState: {
    image: string;
    fallbackImage: string;
    badge: string;
    prompt: string;
    actionLabel?: string;
    actionUrl?: string;
  };
}

const KerbyBanner: React.FC<KerbyBannerProps> = React.memo(({ kerbyState }) => {
  const [displayedPrompt, setDisplayedPrompt] = React.useState<string>('');
  const [isTypingComplete, setIsTypingComplete] = React.useState<boolean>(false);

  React.useEffect(() => {
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
          // Hold full text for 5 seconds after typing finishes
          timeoutId = setTimeout(() => {
            if (!isSubscribed) return;
            index = 0;
            setIsTypingComplete(false);
            setDisplayedPrompt('');
            timeoutId = setTimeout(typeNextChar, 350);
          }, 5000);
          return;
        }

        // Smooth neutral per-letter pacing (28ms per character)
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
    <div className="bg-gradient-to-br from-[#e6f4f1] via-[#f0f9ff] to-[#f8fafc] dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a] p-4 sm:p-5 sm:pl-6 rounded-[28px] border border-[#2f7d6d]/20 dark:border-slate-800 shadow-md shadow-[#2f7d6d]/10 dark:shadow-black/40 relative overflow-hidden flex items-center justify-between gap-3 sm:gap-6 min-h-[140px] sm:min-h-[155px]">
      {/* Kerby Mascot Image Container - Balanced Proportion */}
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
          className="object-contain object-bottom drop-shadow-xl scale-115 sm:scale-125 transform origin-bottom transition-all duration-500"
          unoptimized
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== kerbyState.fallbackImage) {
              target.src = kerbyState.fallbackImage;
            }
          }}
        />
      </motion.div>

      {/* Slanted Connecting Thought Circles */}
      <div className="hidden sm:flex flex-col items-end gap-1 absolute left-[135px] sm:left-[160px] bottom-12 z-20 pointer-events-none">
        <div className="w-3 h-3 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 shadow-xs" />
        <div className="w-2 h-2 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xs -translate-x-1" />
        <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xs -translate-x-2" />
      </div>

      {/* Speech Bubble Container */}
      <div className="relative min-w-0 flex-1 bg-white dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-md border border-slate-200/80 dark:border-slate-800 my-auto z-10 flex flex-col justify-between">
        {/* Pointer Arrow Tail */}
        <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-0 h-0 border-y-[7px] border-y-transparent border-r-[9px] border-r-white dark:border-r-slate-900" />

        {/* Speech Header Accent */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#2f7d6d] dark:text-emerald-400 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#2f7d6d] dark:text-emerald-400 shrink-0" />
          <span className="tracking-wider font-mono text-[10px] uppercase">KERBY GUIDE</span>
        </div>

        {/* Fixed Height Prompt Container - Displays Full Text Without Truncation */}
        <div className="min-h-[44px] sm:min-h-[48px] flex items-center my-0.5">
          <p className="text-[11.5px] sm:text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-snug tracking-normal">
            {displayedPrompt}
            {!isTypingComplete && (
              <span className="inline-block w-1.5 h-3.5 bg-[#2f7d6d] dark:bg-emerald-400 ml-1 translate-y-0.5 animate-pulse rounded-xs" />
            )}
          </p>
        </div>

        {/* Speech Bubble Footer Bar */}
        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-[#2f7d6d] dark:text-emerald-300 font-medium mt-1">
          <span className="font-bold text-[#2f7d6d] dark:text-emerald-400">{kerbyState.badge}</span>
          {kerbyState.actionUrl && kerbyState.actionLabel ? (
            <Link
              href={kerbyState.actionUrl}
              className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#2f7d6d] hover:text-[#256659] dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
            >
              <span>{kerbyState.actionLabel}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <div className="flex items-center gap-1 text-[9px] text-[#2f7d6d]/80 dark:text-emerald-400/80 font-mono uppercase">
              <Sparkles className="w-3 h-3 text-[#2f7d6d] dark:text-emerald-400 shrink-0" />
              <span>HOST GUIDE</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default function LandlordDashboardFeature({ user, isLoading: externalLoading }: { user?: any; isLoading?: boolean }) {
  const { stats, areaChartData, pieChartData, lineChartData, recentActivities, isLoading: internalLoading } = useDashboardLogic();
  const isLoading = externalLoading ?? internalLoading;
  const openSettings = useLandlordProfileStore((state) => state.openSettings);

  const [greeting, setGreeting] = React.useState<string>('Good morning');
  const [formattedDate, setFormattedDate] = React.useState<string>('');

  React.useEffect(() => {
    // Preload all Kerby mascot assets into browser RAM cache for 0ms instant loading
    preloadKerbyAssets();

    const now = new Date();
    const hour = now.getHours();
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
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Landlord';

  // Dynamic Kerby Mascot Asset & Assistant Prompt State
  const currentHour = React.useMemo(() => new Date().getHours(), []);
  
  const TimeIcon = React.useMemo(() => {
    if (currentHour >= 5 && currentHour < 12) return Sun;
    if (currentHour >= 12 && currentHour < 18) return SunMedium;
    if (currentHour >= 18 && currentHour < 22) return Sunset;
    return Moon;
  }, [currentHour]);
  
  const kerbyState = React.useMemo(() => {
    const pendingInquiries = stats?.pendingInquiries || 0;
    const activeBookings = stats?.confirmedBookings || 0;
    const totalProperties = stats?.totalProperties || 0;
    const averageRating = stats?.averageRating || 0;
    const totalReviews = stats?.totalReviews || 0;

    // State 1: Action Needed (Pending Inquiries)
    if (pendingInquiries > 0) {
      return {
        image: '/assets/mascot/kerby-halfbody-pointing.png',
        fallbackImage: '/assets/mascot/kerby-casual-pointing.png',
        badge: 'Action Needed',
        prompt: `You have ${pendingInquiries} pending tenant ${pendingInquiries === 1 ? 'inquiry' : 'inquiries'} awaiting response. Quick replies boost your booking rate!`,
        actionLabel: 'View Inquiries',
        actionUrl: '/landlord/inquiries',
      };
    }

    // State 2: Growth Mode (0 Properties listed)
    if (totalProperties === 0) {
      return {
        image: '/assets/mascot/kerby-halfbody-blueprint.png',
        fallbackImage: '/assets/mascot/kerby-landlord-blueprint.png',
        badge: 'Expand Portfolio',
        prompt: `Ready to welcome student boarders? List your first property today to start receiving verified student applications!`,
        actionLabel: '+ Add Property',
        actionUrl: '/landlord/properties/create',
      };
    }

    // State 3: High Tenant Rating
    if (averageRating >= 4.5 && totalReviews > 0) {
      return {
        image: '/assets/mascot/kerby-halfbody-rating.png',
        fallbackImage: '/assets/mascot/kerby-landlord-verified.png',
        badge: 'Top Rated',
        prompt: `Outstanding job! Your properties maintain a high ${averageRating.toFixed(1)}★ rating across ${totalReviews} tenant reviews.`,
        actionLabel: 'View Reviews',
        actionUrl: '/landlord/reviews',
      };
    }

    // State 4: Active Bookings & Revenue
    if (activeBookings > 0) {
      return {
        image: '/assets/mascot/kerby-halfbody-revenue.png',
        fallbackImage: '/assets/mascot/kerby-halfbody-keys.png',
        badge: 'Revenue Peak',
        prompt: `Awesome job! You have ${activeBookings} active tenant ${activeBookings === 1 ? 'booking' : 'bookings'} generating rental revenue this month.`,
        actionLabel: 'View Bookings',
        actionUrl: '/landlord/bookings',
      };
    }

    // State 5: Night Watch (Late Night Mode)
    if (currentHour >= 22 || currentHour < 5) {
      return {
        image: '/assets/mascot/kerby-halfbody-sleeping.png',
        fallbackImage: '/assets/mascot/kerby-casual-sleeping.png',
        badge: 'Night Watch',
        prompt: `Rest well! Kerby is keeping watch over your property listings overnight.`,
        actionLabel: undefined,
        actionUrl: undefined,
      };
    }

    // Default State: Operations Running / All Clear
    return {
      image: '/assets/mascot/kerby-halfbody-keys.png',
      fallbackImage: '/assets/mascot/kerby-landlord-checklist.png',
      badge: 'All Systems Go',
      prompt: `All ${totalProperties} property ${totalProperties === 1 ? 'listing is' : 'listings are'} live. Keep room availability & pricing updated for top search placement.`,
      actionLabel: 'Manage Properties',
      actionUrl: '/landlord/properties',
    };
  }, [currentHour, stats]);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 sm:space-y-6 md:space-y-8 pb-20"
    >
      {/* Dynamic Time & Greeting Header + Modern Kerby Assistant Banner */}
      <motion.div variants={itemVariants} className="space-y-4">
        {/* Date & Dynamic Time Greeting */}
        <div className="px-1">
          <p className="text-[11px] font-black tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-1">
            {formattedDate || 'TODAY'}
          </p>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#2f7d6d]/10 dark:bg-emerald-500/10 text-[#2f7d6d] dark:text-emerald-400 border border-[#2f7d6d]/20 shrink-0">
              <TimeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#2f7d6d] dark:text-emerald-400" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {greeting}, <span className="bg-gradient-to-r from-[#2f7d6d] to-emerald-500 bg-clip-text text-transparent">{firstName}!</span>
            </h1>
          </div>
        </div>

        {/* Kerby Assistant Speech Banner Card */}
        {!isLoading && <KerbyBanner kerbyState={kerbyState} />}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl p-4 sm:p-6 rounded-[22px] sm:rounded-[26px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-lg transition-all duration-300">
            {isLoading ? (
              <div className="w-full h-[350px] flex flex-col">
                <Skeleton className="h-6 w-40 mb-6" variant="text" />
                <div className="flex-1 w-full flex items-end gap-2">
                  {[...Array(12)].map((_, i) => (
                    <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${20 + Math.random() * 60}%` }} />
                  ))}
                </div>
              </div>
            ) : <ChartAreaInteractive data={areaChartData} />}
          </div>
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl p-4 sm:p-6 rounded-[22px] sm:rounded-[26px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-lg transition-all duration-300">
            {isLoading ? (
              <div className="w-full h-[350px] flex flex-col">
                <Skeleton className="h-6 w-40 mb-6" variant="text" />
                <div className="flex-1 w-full flex items-center justify-center">
                  <div className="relative w-40 h-40">
                    <Skeleton className="w-full h-full rounded-full" />
                    <div className="absolute inset-4 bg-white dark:bg-slate-900 rounded-full" />
                  </div>
                </div>
              </div>
            ) : <ChartPieLabel data={pieChartData} />}
          </div>
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl p-4 sm:p-6 rounded-[22px] sm:rounded-[26px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-lg transition-all duration-300">
            {isLoading ? (
              <div className="w-full h-[350px] flex flex-col">
                <Skeleton className="h-6 w-40 mb-6" variant="text" />
                <div className="flex-1 w-full flex items-end gap-3 px-2">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${40 + Math.sin(i) * 30}%` }} />
                  ))}
                </div>
              </div>
            ) : <ChartLineInteractive data={lineChartData} />}
          </div>

          {/* Recent Activity Feature Zone */}
          <LandlordDashboardRecentActivity activities={recentActivities} isLoading={isLoading} />
        </div>
      </motion.div>
    </motion.div>
  );
}


'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  CalendarCheck,
  Star,
  CreditCard,
  Activity,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Skeleton from '@/components/common/Skeleton';

interface ActivityItem {
  id: string | number;
  type: 'INQUIRY' | 'BOOKING' | 'REVIEW' | 'PAYMENT' | string;
  title: string;
  description: string;
  time: string;
  status: string;
  color: 'amber' | 'emerald' | 'blue' | 'purple' | string;
  href: string;
}

const defaultActivities: ActivityItem[] = [
  {
    id: 1,
    type: 'INQUIRY',
    title: 'New Inquiry Received',
    description: 'Tenant room application submitted',
    time: 'Just now',
    status: 'Pending',
    color: 'amber',
    href: '/landlord/inquiries'
  },
  {
    id: 2,
    type: 'BOOKING',
    title: 'Booking Confirmed',
    description: 'Tenant room reservation approved',
    time: 'Today',
    status: 'Confirmed',
    color: 'emerald',
    href: '/landlord/bookings'
  }
];

const iconMap: Record<string, any> = {
  INQUIRY: Mail,
  BOOKING: CalendarCheck,
  REVIEW: Star,
  PAYMENT: CreditCard,
};

const accentColor: Record<string, string> = {
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
};

function ActivityCard({ activity }: { activity: ActivityItem }) {
  const Icon = iconMap[activity.type] || Activity;
  const colorClass = accentColor[activity.color] || accentColor.emerald;

  return (
    <Link
      href={activity.href || '/landlord/dashboard'}
      className="group flex items-center gap-3.5 p-3.5 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 hover:border-[#2f7d6d]/40 dark:hover:border-emerald-500/40 hover:bg-white dark:hover:bg-slate-900 shadow-2xs hover:shadow-md transition-all duration-300"
    >
      <div className={cn("shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-105 shadow-2xs", colorClass)}>
        <Icon className="w-4 h-4" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#2f7d6d] dark:group-hover:text-emerald-400 transition-colors tracking-tight truncate">
            {activity.title}
          </p>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">{activity.time}</span>
        </div>
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
          {activity.description}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-[#2f7d6d] dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
    </Link>
  );
}

function EmptyActivityState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 px-4 min-h-[210px]">
      <div className="w-12 h-12 rounded-2xl bg-[#2f7d6d]/10 dark:bg-emerald-500/10 text-[#2f7d6d] dark:text-emerald-400 flex items-center justify-center mb-3 border border-[#2f7d6d]/20 dark:border-emerald-500/20 shadow-2xs">
        <Activity className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">
        No Recent Activity Yet
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[290px] leading-relaxed mb-4 font-medium">
        When students send inquiries, book rooms, make payments, or leave reviews, your activity feed will update here in real-time.
      </p>
      <Link
        href="/landlord/properties"
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2f7d6d]/10 hover:bg-[#2f7d6d]/20 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 text-[#2f7d6d] dark:text-emerald-300 text-xs font-extrabold transition-all"
      >
        <span>View Properties</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

export function LandlordDashboardRecentActivity({ 
  activities, 
  isLoading 
}: { 
  activities?: ActivityItem[]; 
  isLoading?: boolean;
}) {
  const [showModal, setShowModal] = useState(false);

  const displayList = activities || [];
  const hasActivities = displayList.length > 0;

  if (isLoading) {
    return (
      <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl p-5 sm:p-6 rounded-[26px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        <div className="flex flex-row items-center justify-between mb-6 gap-4">
          <Skeleton className="h-6 w-32" variant="text" />
          <Skeleton className="h-3 w-16" variant="text" />
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3.5 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-24" variant="text" />
                  <Skeleton className="h-2 w-12" variant="text" />
                </div>
                <Skeleton className="h-2 w-32 opacity-60" variant="text" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl p-5 sm:p-6 rounded-[26px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="flex flex-row items-center justify-between mb-5 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
           <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#2f7d6d]/10 text-[#2f7d6d] dark:bg-emerald-500/10 dark:text-emerald-400">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Recent Activity
              </h3>
           </div>
           {hasActivities && (
             <button 
               onClick={() => setShowModal(true)}
               className="text-[10px] font-extrabold text-[#2f7d6d] hover:text-[#256659] dark:text-emerald-400 dark:hover:text-emerald-300 uppercase tracking-widest transition-colors cursor-pointer"
             >
               View All
             </button>
           )}
        </div>
        
        {hasActivities ? (
          <div className="space-y-3">
            {displayList.slice(0, 4).map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <EmptyActivityState />
        )}
      </div>

      {showModal && hasActivities && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={() => setShowModal(false)}>
          <div 
            className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#2f7d6d]/10 text-[#2f7d6d] dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Activity className="w-4.5 h-4.5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  All Recent Activity
                </h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 sm:p-6 space-y-3 overflow-y-auto max-h-[60vh] scrollbar-none">
              {displayList.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}


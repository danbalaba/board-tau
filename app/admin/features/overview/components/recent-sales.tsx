'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../../components/ui/card';
import { useExecutiveOverview } from '@/app/admin/hooks/use-executive-overview';
import { CalendarCheck, ChevronRight, CheckCircle2 } from 'lucide-react';

export function RecentSales({ data: propData }: { data?: any[] }) {
  const { data: apiResponse } = useExecutiveOverview('30d');
  const data = propData || apiResponse?.data?.recentSales || [];

  const totalRecentAmount = React.useMemo(() => {
    if (!data || data.length === 0) return 0;
    return data.slice(0, 5).reduce((acc: number, curr: any) => {
      const cleanNum = Number(String(curr.amount || '0').replace(/[^0-9.-]+/g, '')) || 0;
      return acc + cleanNum;
    }, 0);
  }, [data]);

  return (
    <Card className="flex flex-col border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-xs hover:shadow-lg rounded-[24px] sm:rounded-[26px] overflow-hidden h-full transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-4 px-6 pt-6 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#2f7d6d]/10 text-[#2f7d6d] dark:bg-emerald-500/10 dark:text-emerald-400">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Recent Bookings</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Latest confirmed student room reservations
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Feed</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 px-6 pb-6 flex-1 flex flex-col justify-center">
        <div className="space-y-2.5">
          {data && data.length > 0 ? data.slice(0, 5).map((sale: any, index: number) => (
            <div
              key={sale.id || index}
              className="group flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/80 hover:border-[#2f7d6d]/40 dark:hover:border-emerald-500/40 hover:bg-white dark:hover:bg-slate-900 shadow-2xs hover:shadow-md transition-all duration-300"
            >
              <Avatar className="h-10 w-10 rounded-xl border border-slate-200/60 dark:border-slate-700 shadow-2xs">
                <AvatarImage src={sale.avatar} alt="Avatar" className="object-cover" />
                <AvatarFallback className="text-xs font-black bg-gradient-to-br from-[#2f7d6d]/20 to-emerald-500/20 text-[#2f7d6d] dark:text-emerald-400">
                  {sale.fallback || 'TN'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#2f7d6d] dark:group-hover:text-emerald-400 transition-colors truncate">
                    {sale.name}
                  </p>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-extrabold">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Paid
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {sale.email}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  +{sale.amount}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-[#2f7d6d] dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CalendarCheck className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No Recent Bookings</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Confirmed student reservations will appear here.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { useExecutiveOverview } from '@/app/admin/hooks/use-executive-overview';
import { IconCurrencyDollar, IconArrowUpRight } from '@tabler/icons-react';

export function RecentSales({ data: propData }: { data?: any[] }) {
  const { data: apiResponse } = useExecutiveOverview('30d');
  const data = propData || apiResponse?.data?.recentSales || [];

  return (
    <Card className="h-full border-none bg-card/30 backdrop-blur-md shadow-xl">
      <CardHeader className="pb-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-black tracking-tight">Recent Transactions</CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold tracking-widest mt-1">
              Latest successful bookings
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-none font-black uppercase text-[9px] h-5 px-2">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {data && data.length > 0 ? data.map((sale: any, index: number) => (
            <div
              key={index}
              className="group flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 transition-all hover:bg-white/10"
            >
              <Avatar className="h-9 w-9 ring-2 ring-white/10">
                <AvatarImage src={sale.avatar} alt="Avatar" />
                <AvatarFallback className="text-xs font-black bg-primary/10 text-primary">
                  {sale.fallback}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black tracking-tight truncate">{sale.name}</p>
                <p className="text-[10px] text-muted-foreground/50 font-bold truncate">{sale.email}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <IconArrowUpRight className="w-3 h-3 text-emerald-500" />
                <span className="text-sm font-black tabular-nums text-emerald-500">{sale.amount}</span>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="p-3 rounded-2xl bg-muted/20">
                <IconCurrencyDollar className="w-6 h-6 text-muted-foreground/30" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                No transactions recorded
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

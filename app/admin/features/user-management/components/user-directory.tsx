'use client';

import React from 'react';
import { UserTable } from './user-tables';
import { columns } from './user-tables/columns';
import { useUsers } from '@/app/admin/hooks/use-users';
import { parseAsString, useQueryState } from 'nuqs';
import {
  IconUsers,
  IconUserPlus,
  IconRefresh,
  IconAlertCircle,
  IconShieldLock,
  IconChartBar,
  IconArrowUpRight
} from '@tabler/icons-react';
import PageContainer from '@/app/admin/components/layout/page-container';
import { Button } from '@/app/admin/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

export function UserDirectory() {
  const [pageSize] = useQueryState('perPage', parseAsString.withDefault('10'));
  const [page] = useQueryState('page', parseAsString.withDefault('1'));
  const [name] = useQueryState('name', parseAsString.withDefault(''));
  const [email] = useQueryState('email', parseAsString.withDefault(''));
  const [role] = useQueryState('role', parseAsString.withDefault(''));
  const [status] = useQueryState('status', parseAsString.withDefault(''));

  const { data, isLoading, error, refetch } = useUsers({
    page: parseInt(page),
    perPage: parseInt(pageSize),
    name: name || undefined,
    email: email || undefined,
    role: role || undefined,
    status: status || undefined,
  });

  const totalUsers = data?.meta?.total || 0;

  const kpis = [
    { label: 'Total Identities', value: totalUsers, trend: '+4.2%', icon: IconUsers, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Active Admins', value: '12', trend: 'Stable', icon: IconShieldLock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'New This Week', value: '+42', trend: '+12%', icon: IconChartBar, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Pending Verification', value: '8', trend: 'Priority', icon: IconAlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' }
  ];

  return (
    <PageContainer
      pageTitle="Identity Management"
      pageDescription="Orchestrate user accounts, access levels and security profiles globally"
      pageHeaderAction={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2 hover:bg-white/5 border-border/40 font-black uppercase text-[10px] tracking-widest" onClick={() => refetch()}>
            <IconRefresh className="h-4 w-4" />
            Sync
          </Button>
          <Button size="sm" className="h-9 gap-2 shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest">
            <IconUserPlus className="h-4 w-4" />
            Provision User
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="group relative overflow-hidden border-none bg-card/30 backdrop-blur-md shadow-xl transition-all hover:bg-card/40">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 text-muted-foreground">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest">{stat.label}</CardTitle>
                  <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110", stat.bg)}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black tabular-nums">{stat.value}</div>
                  <div className="flex items-center mt-1 space-x-1">
                    <IconArrowUpRight className={cn("w-3 h-3 text-emerald-500", stat.trend === 'Stable' && 'text-blue-500')} />
                    <span className={cn("text-[10px] font-medium", stat.trend.includes('+') ? 'text-emerald-500' : 'text-blue-500')}>
                      {stat.trend}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50 ml-1">vs target</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-2xl border border-border/40 bg-card/30 p-2 shadow-xl backdrop-blur-md overflow-hidden"
        >
          <UserTable
            data={data?.data || []}
            totalItems={totalUsers}
            columns={columns as any}
          />
        </motion.div>
      </div>
    </PageContainer>
  );
}

'use client';

import React from 'react';
import { UserTable } from '../user-tables';
import { columns } from '../user-tables/columns';
import { useUsers } from '@/app/admin/hooks/use-users';
import { parseAsString, useQueryState } from 'nuqs';
import {
  IconUsers,
  IconAlertCircle,
  IconShieldLock,
  IconChartBar,
  IconArrowUpRight
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/admin/components/ui/card';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { AdminUserHeader } from './admin-user-header';

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
    { label: 'Total Identities', value: totalUsers, trend: '+4.2%', icon: IconUsers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Admins', value: '12', trend: 'Stable', icon: IconShieldLock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'New This Week', value: '+42', trend: '+12%', icon: IconChartBar, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10' },
    { label: 'Pending Verification', value: '8', trend: 'Priority', icon: IconAlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' }
  ];

  return (
    <div className="p-6 lg:p-10 space-y-6">
      <AdminUserHeader 
        onSync={() => refetch()} 
        onProvision={() => console.log('Provision User')} 
      />

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
              <Card className="border-none bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-lg rounded-[2rem] overflow-hidden group h-full transition-all hover:bg-white/50 dark:hover:bg-gray-900/50 hover:shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    {stat.label}
                  </CardTitle>
                  <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", stat.bg)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black tabular-nums text-gray-900 dark:text-white tracking-tighter">
                    {stat.value}
                  </div>
                  <div className="flex items-center mt-2 gap-1.5 bg-gray-50 dark:bg-gray-800/50 w-fit px-2 py-1 rounded-lg">
                    <IconArrowUpRight className={cn("w-3 h-3 text-emerald-500", stat.trend === 'Stable' && 'text-blue-500')} />
                    <span className={cn("text-[9px] font-bold uppercase tracking-widest", stat.trend.includes('+') ? 'text-emerald-500' : 'text-blue-500')}>
                      {stat.trend}
                    </span>
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
          className="rounded-[2.5rem] border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 p-6 shadow-xl backdrop-blur-xl overflow-hidden"
        >
          <UserTable
            data={data?.data || []}
            totalItems={totalUsers}
            columns={columns as any}
          />
        </motion.div>
      </div>
    </div>
  );
}

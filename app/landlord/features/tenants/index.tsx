'use client';

import React, { useState, useMemo } from 'react';
import { 
  IconUsers, 
  IconFilter, 
  IconCheck, 
  IconInbox, 
  IconLayoutGrid, 
  IconList, 
  IconSortAscending, 
  IconSortDescending, 
  IconHistory, 
  IconCalendarEvent
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

import LandlordTenantCard from './components/tenants-card';

interface Tenant {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  };
  listing: {
    id: string;
    title: string;
    imageSrc?: string;
  };
  status: string;
  startDate: Date | string;
  endDate: Date | string;
  createdAt: Date | string;
}

interface LandlordTenantsFeatureProps {
  tenants: {
    tenants: Tenant[];
    nextCursor: string | null;
  };
}

export default function LandlordTenantsFeature({ tenants }: LandlordTenantsFeatureProps) {
  const { tenants: tenantsList, nextCursor } = tenants;
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    past: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  };

  const filteredTenants = useMemo(() => {
    let result = [...tenantsList];
    if (selectedStatus !== 'all') {
      result = result.filter(t => t.status.toLowerCase() === selectedStatus.toLowerCase());
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return result;
  }, [selectedStatus, tenantsList, sortBy]);

  return (
    <div className="space-y-10 pb-20 p-2">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-[32px] border border-primary/10 shadow-sm"
      >
        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-[24px] flex items-center justify-center text-primary shadow-xl shadow-primary/10">
              <IconUsers size={32} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                Tenants Management
              </h1>
              <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1 opacity-70">
                Oversee your property residents and their records
              </p>
            </div>
          </div>

          <div className="flex flex-wrap lg:flex-row items-center gap-4 w-full xl:w-auto mt-4 lg:mt-0">
            {/* Sorting */}
            <div className="flex flex-wrap items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
              {[
                { value: 'newest', label: 'Newest', icon: IconHistory },
                { value: 'oldest', label: 'Oldest', icon: IconCalendarEvent },
              ].map((option) => {
                const Icon = option.icon;
                const isSelected = sortBy === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                      isSelected
                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-gray-700"
                    )}
                  >
                    <Icon size={12} />
                    <span className="hidden sm:inline">{option.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Optimized Filters Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all backdrop-blur-sm">
                  <IconFilter size={14} />
                  Filters {selectedStatus !== 'all' && <span className="w-2 h-2 rounded-full bg-primary" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl">
                <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400">Status</div>
                <DropdownMenuGroup>
                  {[
                    { value: 'all', label: 'All Tenants', icon: IconInbox },
                    { value: 'active', label: 'Active', icon: IconCheck },
                    { value: 'pending', label: 'Pending', icon: IconHistory },
                    { value: 'past', label: 'Past', icon: IconCalendarEvent },
                  ].map((option: any) => {
                    const Icon = option.icon;
                    return (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setSelectedStatus(option.value)}
                        className={cn(
                          "cursor-pointer flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-bold transition-all",
                          selectedStatus === option.value ? "bg-primary/10 text-primary" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        )}
                      >
                        <Icon size={14} />
                        {option.label}
                        {selectedStatus === option.value && <IconCheck size={14} className="ml-auto" />}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {filteredTenants.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-24 bg-white dark:bg-gray-900 rounded-[40px] border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center shadow-sm"
          >
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-[32px] flex items-center justify-center text-gray-300 mb-8 border border-gray-100 dark:border-gray-800">
              <IconUsers size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Box is Empty</h3>
            <p className="text-sm font-medium text-gray-400 max-w-sm mx-auto leading-relaxed">
              No tenants currently match your filter criteria.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {filteredTenants.map((tenant) => (
              <LandlordTenantCard 
                key={tenant.id} 
                tenant={tenant} 
                statusColors={statusColors}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load More Container */}
      {nextCursor && (
        <div className="flex justify-center pt-8">
          <button
            className="flex items-center gap-2 px-10 py-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all backdrop-blur-sm shadow-sm active:scale-95"
            onClick={() => console.log('Load more tenants')}
          >
            <span className="flex items-center gap-2 uppercase font-black tracking-[0.2em] text-[10px]">
              Load More Residents
              <IconHistory className="animate-spin-slow" size={12} strokeWidth={3} />
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

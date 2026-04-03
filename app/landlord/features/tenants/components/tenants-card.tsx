'use client';

import React from 'react';
import Link from 'next/link';
import { 
  IconUser, 
  IconMail, 
  IconBuilding, 
  IconCalendar, 
  IconEye, 
  IconFile, 
  IconHistory 
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import Button from "@/components/common/Button";

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

interface LandlordTenantCardProps {
  tenant: Tenant;
  statusColors: Record<string, string>;
}

export default function LandlordTenantCard({
  tenant,
  statusColors,
}: LandlordTenantCardProps) {
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-gray-800 p-6 hover:border-primary/20 transition-all duration-500 hover:shadow-2xl shadow-sm overflow-hidden">
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Tenant Avatar */}
        <div className="relative w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-[24px] overflow-hidden flex-shrink-0 border-2 border-white dark:border-gray-800 shadow-lg group-hover:scale-105 transition-transform duration-500">
          {tenant.user.image ? (
            <img
              src={tenant.user.image}
              alt={tenant.user.name || 'Tenant'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary/30">
              <IconUser size={32} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight truncate">
              {tenant.user.name || 'Anonymous Tenant'}
            </h3>
            <span className={cn(
              "px-2.5 py-1 rounded-xl text-[9px] uppercase font-black tracking-widest shadow-sm border",
              statusColors[tenant.status.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200"
            )}>
              {formatStatus(tenant.status)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-1.5">
              <IconMail size={14} className="text-primary" />
              <span className="truncate">{tenant.user.email}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <IconBuilding size={14} className="text-primary" />
              <span className="truncate">{tenant.listing.title}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Lease Period</p>
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-700 dark:text-gray-300">
                <IconCalendar size={12} className="text-primary" />
                {new Date(tenant.startDate).toLocaleDateString()} - {new Date(tenant.endDate).toLocaleDateString()}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Tenant Since</p>
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-700 dark:text-gray-300">
                <IconCalendar size={12} className="text-primary" />
                {new Date(tenant.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-6 mt-2 border-t border-gray-100 dark:border-gray-800">
        <Link href={`/landlord/tenants/${tenant.id}`} className="flex-1 md:flex-none">
          <Button
            outline
            className="rounded-xl py-2 px-4 text-[10px] font-black uppercase tracking-widest border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="flex items-center gap-2">
              <IconEye size={14} />
              Details
            </span>
          </Button>
        </Link>
        <Link href={`/landlord/tenants/${tenant.id}?action=documents`} className="flex-1 md:flex-none">
          <Button
            outline
            className="rounded-xl py-2 px-4 text-[10px] font-black uppercase tracking-widest border-emerald-100 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/30"
          >
            <span className="flex items-center gap-2">
              <IconFile size={14} />
              Documents
            </span>
          </Button>
        </Link>
        <Link href={`/landlord/tenants/${tenant.id}?action=history`} className="flex-1 md:flex-none">
          <Button
            outline
            className="rounded-xl py-2 px-4 text-[10px] font-black uppercase tracking-widest border-purple-100 text-purple-600 hover:bg-purple-50 dark:border-purple-900/30"
          >
            <span className="flex items-center gap-2">
              <IconHistory size={14} />
              History
            </span>
          </Button>
        </Link>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[32px]" />
    </div>
  );
}

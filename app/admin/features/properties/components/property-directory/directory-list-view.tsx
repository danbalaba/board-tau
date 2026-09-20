'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '@/app/admin/components/ui/card';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Badge } from '@/app/admin/components/ui/badge';
import {
  IconSearch,
  IconMapPin,
  IconCircleCheckFilled,
  IconUser,
  IconBuilding,
  IconBed,
  IconCalendar,
  IconInbox
} from '@tabler/icons-react';
import SafeImage from '@/components/common/SafeImage';
import Skeleton from '@/components/common/Skeleton';
import Link from 'next/link';

export interface PropertyListing {
  id: string;
  title: string;
  description?: string;
  image?: string;
  location?: string;
  owner?: { id: string; name?: string; email?: string };
  propertyTypeName?: string;
  price?: number;
  status?: string;
  rating?: number;
  reviewCount?: number;
  roomsCount?: number;
  bookingsCount?: number;
  createdAt?: string;
}

const getStatusBadge = (status?: string) => {
  const s = (status || 'PENDING').toUpperCase();
  if (s === 'ACTIVE' || s === 'APPROVED') {
    return { label: 'Active', style: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' };
  }
  if (s === 'PENDING') {
    return { label: 'Pending Review', style: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' };
  }
  if (s === 'REJECTED' || s === 'ARCHIVED') {
    return { label: 'Inactive', style: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20' };
  }
  return { label: s, style: 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20' };
};

interface DirectoryListViewProps {
  properties: PropertyListing[];
  viewMode: 'grid' | 'list';
  isLoading?: boolean;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export function DirectoryListView({
  properties,
  viewMode,
  isLoading,
  searchQuery = '',
  onSearchChange
}: DirectoryListViewProps) {
  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <IconSearch className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search boarding houses by name, location, or owner..." 
            className="h-11 pl-11 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-200/80 dark:border-gray-800 shadow-xs focus-visible:ring-primary/20 text-xs font-semibold text-gray-900 dark:text-white"
          />
        </div>
      </motion.div>

      {/* Grid or List View Container */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4" : "flex flex-col gap-4"}>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 rounded-[2rem] border border-gray-100 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 space-y-3">
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-5 w-3/4 rounded-lg" />
              <Skeleton className="h-3 w-1/2 rounded-md" />
            </Card>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="py-16 px-6 text-center rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <IconInbox size={24} />
          </div>
          <h3 className="text-base font-black text-gray-900 dark:text-white">No Property Listings Found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
            {searchQuery ? `No boarding houses matched "${searchQuery}". Try a different search term.` : 'No property listings registered in the database yet.'}
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4" : "flex flex-col gap-4"}>
          <AnimatePresence mode="popLayout">
            {properties.map((property, idx) => {
              const statusBadge = getStatusBadge(property.status);
              const formattedPrice = property.price ? `₱${property.price.toLocaleString()}` : 'Price set per room';

              return (
                <motion.div
                  key={property.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <Card className={cn(
                    "group relative overflow-hidden border border-gray-100 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 rounded-[2rem]",
                    viewMode === 'list' && 'flex flex-col sm:flex-row sm:items-center p-3 gap-4'
                  )}>
                    <div className={cn(
                      "relative overflow-hidden shrink-0",
                      viewMode === 'grid' ? 'aspect-[4/3] w-full' : 'h-36 w-full sm:w-48 rounded-2xl'
                    )}>
                      <SafeImage 
                        src={property.image || '/images/placeholder.jpg'} 
                        alt={property.title} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <Badge className={cn(
                        "absolute left-3 top-3 border font-extrabold uppercase tracking-wider text-[9px] px-2.5 py-0.5 rounded-full backdrop-blur-md shadow-sm",
                        statusBadge.style
                      )}>
                        {statusBadge.label}
                      </Badge>
                    </div>
                    
                    <div className={cn("flex-1 flex flex-col justify-between", viewMode === 'grid' ? 'p-5' : 'p-2 sm:p-0')}>
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1 mb-1">
                              <IconBuilding size={12} /> {property.propertyTypeName || 'Boarding House'}
                            </span>
                            <h3 className="font-black text-base text-gray-900 dark:text-white tracking-tight leading-tight truncate" title={property.title}>
                              {property.title}
                            </h3>
                          </div>
                        </div>

                        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 font-bold truncate">
                          <IconMapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" /> 
                          <span>{property.location || 'Camiling, Tarlac (Near TAU)'}</span>
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate">
                          <IconUser className="h-3.5 w-3.5 text-gray-400 shrink-0" /> 
                          <span>Owner: <strong className="text-gray-700 dark:text-gray-300">{property.owner?.name || 'Landlord'}</strong></span>
                        </p>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-extrabold uppercase text-gray-400 tracking-wider">Monthly Rent</p>
                          <p className="text-sm font-black text-gray-900 dark:text-white tabular-nums">
                            {formattedPrice} <span className="text-[10px] font-normal text-gray-400">/mo</span>
                          </p>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <IconBed size={14} className="text-primary" /> {property.roomsCount || 0} Rooms
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

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
  IconFilter,
  IconMapPin,
  IconCircleCheckFilled,
  IconChartBar,
  IconDotsVertical
} from '@tabler/icons-react';
import SafeImage from '@/components/common/SafeImage';

export interface Property {
  id: string;
  name: string;
  location: string;
  type: string;
  status: 'available' | 'occupied' | 'maintenance';
  price: number;
  rating: number;
  occupancy: number;
  image: string;
}

const statusStyles = {
  available: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  occupied: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  maintenance: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
};

interface DirectoryListViewProps {
  properties: Property[];
  viewMode: 'grid' | 'list';
}

export function DirectoryListView({ properties, viewMode }: DirectoryListViewProps) {
  return (
    <div className="space-y-6">
      {/* Search & Filtering */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <IconSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search by name, location or asset ID..." 
            className="h-14 pl-12 rounded-[1.5rem] bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all focus-visible:ring-blue-500/20 text-sm font-bold"
          />
        </div>
        <Button variant="outline" className="h-14 px-6 gap-2 rounded-[1.5rem] shadow-sm font-black uppercase tracking-widest text-[10px] border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl">
          <IconFilter className="h-4 w-4 text-blue-500" /> Advanced Filters
        </Button>
      </motion.div>

      {/* Property Grid/List */}
      <div className={viewMode === 'grid' ? "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4" : "flex flex-col gap-4"}>
        <AnimatePresence mode="popLayout">
          {properties.map((property, idx) => (
            <motion.div
              key={property.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={cn(
                "group relative overflow-hidden border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2rem]",
                viewMode === 'list' && 'flex flex-row items-center p-3'
              )}>
                <div className={cn(
                  "relative overflow-hidden",
                  viewMode === 'grid' ? 'aspect-[4/3]' : 'h-32 w-48 rounded-xl shrink-0'
                )}>
                  <SafeImage 
                    src={property.image} 
                    alt={property.name} 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent flex flex-col justify-end p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Button size="sm" className="w-full gap-2 font-black uppercase tracking-widest text-[9px] h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 hover:bg-white/30 text-white transition-all shadow-xl">
                      <IconChartBar className="h-4 w-4" /> Management Portal
                    </Button>
                  </div>
                  <Badge className={cn(
                    "absolute left-4 top-4 border-none shadow-xl uppercase font-black tracking-widest text-[8px] px-3 py-1 rounded-lg backdrop-blur-md",
                    statusStyles[property.status]
                  )}>
                    {property.status}
                  </Badge>
                </div>
                
                <div className={cn("flex-1", viewMode === 'grid' ? 'p-6' : 'px-8')}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="font-black text-lg text-gray-900 dark:text-white tracking-tight leading-tight truncate">{property.name}</h3>
                        {property.rating >= 4.9 && <IconCircleCheckFilled className="h-4 w-4 text-blue-500 shrink-0 drop-shadow-sm" />}
                      </div>
                      <p className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-500 uppercase font-bold tracking-widest truncate">
                        <IconMapPin className="h-3 w-3" /> {property.location}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-800">
                      <IconDotsVertical className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                  
                  <div className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800 pt-5">
                    <div>
                      <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Base Rate</p>
                      <div className="flex items-baseline gap-0.5 mt-1">
                        <span className="text-sm font-black text-gray-900 dark:text-white">$</span>
                        <span className="text-xl font-black tabular-nums text-gray-900 dark:text-white">{property.price.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-gray-400 ml-1">/mo</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Occupancy</p>
                      <div className="flex items-center justify-end gap-2 mt-1.5">
                        <div className="h-1.5 w-16 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden hidden sm:block">
                          <div 
                            className={cn("h-full rounded-full transition-all duration-1000", property.occupancy > 90 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]')} 
                            style={{ width: `${property.occupancy}%` }} 
                          />
                        </div>
                        <p className="text-xl font-black tabular-nums leading-none text-gray-900 dark:text-white">{property.occupancy}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

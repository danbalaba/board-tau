'use client';

import React from 'react';
import Link from 'next/link';
import { 
  IconBuilding, 
  IconEdit, 
  IconTrash, 
  IconEye, 
  IconBath, 
  IconMapPin, 
  IconDots, 
  IconCalendarFilled,
  IconChevronRight
} from '@tabler/icons-react';
import { motion, type Variants } from 'framer-motion';
import { cn } from '@/utils/helper';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import { Button } from '@/app/admin/components/ui/button';
import { Property } from '../hooks/use-property-logic';

interface LandlordPropertyCardProps {
  property: Property;
  idx: number;
  viewMode: 'grid' | 'list';
  onView: (p: Property) => void;
  onDelete: (p: Property) => void;
  statusColors: Record<string, string>;
  formatStatus: (status: string) => string;
}

export function LandlordPropertyCard({
  property,
  idx,
  viewMode,
  onView,
  onDelete,
  statusColors,
  formatStatus
}: LandlordPropertyCardProps) {
  const isGrid = viewMode === 'grid';

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: idx * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  if (isGrid) {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="group relative bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 p-4 rounded-[32px] hover:shadow-2xl transition-all duration-500 shadow-sm flex flex-col h-full hover:border-primary/20"
      >
        {/* Top Image Section */}
        <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden mb-5 border border-gray-100/50 dark:border-gray-800/50 shadow-inner">
          {property.imageSrc ? (
            <img 
              src={property.imageSrc} 
              className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110" 
              alt={property.title} 
            />
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300">
              <IconBuilding size={32} />
            </div>
          )}
          
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={cn(
              "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border backdrop-blur-md shadow-xl", 
              statusColors[property.status] || "bg-gray-500/10 text-gray-500 border-gray-500/20"
            )}>
              {formatStatus(property.status)}
            </span>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Content Section */}
        <div className="flex-1 px-1 flex flex-col">
          <div className="mb-4">
             <div className="flex items-center gap-2 mb-1.5">
               <span className="text-[10px] font-black text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-100 dark:border-rose-500/20 uppercase tracking-tighter">Premium</span>
               <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
                 <IconMapPin size={10} className="text-gray-300 dark:text-gray-600" />
                 {property.region}
               </div>
             </div>
             <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-1 tracking-tight">
               {property.title}
             </h3>
          </div>

          <div className="flex items-center gap-4 mb-6 text-gray-500 dark:text-gray-400">
             <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50/50 dark:bg-blue-500/5 rounded-lg border border-blue-100/50 dark:border-blue-500/10">
                <IconBuilding size={14} className="text-blue-500 dark:text-blue-400" />
                <span className="text-xs font-black text-gray-700 dark:text-gray-300">{property.roomCount} <span className="text-[10px] text-gray-400 font-bold uppercase ml-0.5">Rooms</span></span>
             </div>
             <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-50/50 dark:bg-purple-500/5 rounded-lg border border-purple-100/50 dark:border-purple-500/10">
                <IconBath size={14} className="text-purple-500 dark:text-purple-400" />
                <span className="text-xs font-black text-gray-700 dark:text-gray-300">{property.bathroomCount} <span className="text-[10px] text-gray-400 font-bold uppercase ml-0.5">Baths</span></span>
             </div>
          </div>

          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex flex-col">
              <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">₱{property.price.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">per month</span>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/landlord/properties/${property.id}/edit`}>
                <Button size="sm" className="rounded-xl h-9 px-4 font-black text-[10px] uppercase tracking-widest bg-primary hover:bg-primary/90 text-white hover:scale-105 transition-all shadow-xl shadow-primary/20 border-b-4 border-primary/20 active:border-b-0">
                  Edit Property
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl text-gray-400 hover:text-primary hover:border-primary/40 transition-all group/dots">
                    <IconDots size={16} className="group-hover/dots:rotate-90 transition-transform duration-300" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-100 dark:border-gray-800 rounded-2xl p-1.5 shadow-2xl">
                  <DropdownMenuGroup>
                    <DropdownMenuItem 
                      onClick={() => onView(property)} 
                      className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-500/10 text-xs font-bold transition-all group/item"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                        <IconEye size={14} />
                      </div>
                      <span>Quick Preview</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
                  <DropdownMenuItem 
                    onClick={() => onDelete(property)} 
                    className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 text-xs font-bold transition-all group/item"
                  >
                    <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                      <IconTrash size={14} />
                    </div>
                    <span>Delete Listing</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  /* List UI Mode */
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="group relative bg-white dark:bg-gray-950 rounded-[28px] border border-gray-100 dark:border-gray-800 p-4 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Left: Image */}
        <div className="relative w-full sm:w-48 h-36 rounded-[20px] overflow-hidden shadow-lg flex-shrink-0">
          <img 
            src={property.imageSrc} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" 
            alt={property.title} 
          />
          <div className="absolute top-2.5 left-2.5">
             <span className={cn(
               "px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border backdrop-blur-md shadow-lg", 
               statusColors[property.status] || "bg-gray-500/10 text-gray-500"
             )}>
               {formatStatus(property.status)}
             </span>
          </div>
        </div>

        {/* Middle: Content */}
        <div className="flex-1 w-full min-w-0 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1">
                  <IconMapPin size={10} /> {property.region}
                </span>
                <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                  <IconCalendarFilled size={10} /> Listing Active
                </span>
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 tracking-tight">
                {property.title}
              </h3>
            </div>
            <div className="flex flex-col sm:items-end">
              <span className="text-3xl font-black text-primary tracking-tighter leading-none">₱{property.price.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">per month</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest mb-4">
             <div className="flex items-center gap-2 px-3 py-2 bg-blue-50/50 dark:bg-blue-500/10 rounded-xl border border-blue-100/50 dark:border-blue-500/20 shadow-sm">
               <IconBuilding size={16} className="text-blue-500" /> 
               <span>{property.roomCount} Rooms</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-2 bg-purple-50/50 dark:bg-purple-500/10 rounded-xl border border-purple-100/50 dark:border-purple-500/20 shadow-sm">
               <IconBath size={16} className="text-purple-500" /> 
               <span>{property.bathroomCount} Baths</span>
             </div>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium line-clamp-1 italic max-w-2xl">
            "{property.description}"
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex sm:flex-col gap-3 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 sm:border-l border-gray-100 dark:border-gray-800 sm:pl-6">
          <Link href={`/landlord/properties/${property.id}/edit`}>
            <Button className="w-full sm:w-32 rounded-xl h-9 bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 border-b-4 border-primary/20 active:border-b-0 transition-all">
              Edit Property
            </Button>
          </Link>
          <div className="flex gap-2 flex-1 sm:flex-initial">
            <button 
              onClick={() => onView(property)} 
              className="flex-1 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center group/btn shadow-sm"
            >
              <IconEye size={18} className="group-hover/btn:scale-110 transition-transform" />
            </button>
            <button 
              onClick={() => onDelete(property)} 
              className="flex-1 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center group/btn shadow-sm"
            >
              <IconTrash size={18} className="group-hover/btn:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

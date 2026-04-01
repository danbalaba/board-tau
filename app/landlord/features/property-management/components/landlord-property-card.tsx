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

  // Legacy pattern: Staggered entry animations for newly mounted items
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: idx * 0.05, duration: 0.4, ease: "easeOut" }
    }
  };

  if (isGrid) {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="group relative bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 p-4 rounded-3xl hover:shadow-2xl transition-all duration-500 shadow-sm flex flex-col h-full"
      >
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 border border-gray-100 dark:border-gray-800">
          {property.imageSrc ? (
            <img src={property.imageSrc} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={property.title} />
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300"><IconBuilding size={32} /></div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border backdrop-blur-md shadow-lg", statusColors[property.status] || "bg-gray-500/10 text-gray-500")}>
              {formatStatus(property.status)}
            </span>
          </div>
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md rounded-xl border border-white/20 shadow-xl text-gray-600 hover:text-primary transition-colors">
                  <IconDots size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 rounded-2xl p-2 shadow-2xl">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => onView(property)} className="flex items-center gap-2 p-2.5 rounded-xl cursor-pointer hover:bg-primary/5 text-xs font-bold transition-colors">
                    <IconEye size={14} className="text-blue-500" />
                    <span>Quick Preview</span>
                  </DropdownMenuItem>
                  <Link href={`/landlord/properties/${property.id}/edit`}>
                    <DropdownMenuItem className="flex items-center gap-2 p-2.5 rounded-xl cursor-pointer hover:bg-primary/5 text-xs font-bold transition-colors">
                      <IconEdit size={14} className="text-amber-500" />
                      <span>Advanced Editor</span>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(property)} className="flex items-center gap-2 p-2.5 rounded-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 text-xs font-bold transition-colors">
                  <IconTrash size={14} />
                  <span>Delete Listing</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex-1 px-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-base font-black text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-1 truncate">{property.title}</h3>
            <span className="text-sm font-black text-primary shrink-0">₱{property.price.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 mb-4">
             <IconMapPin size={12} className="text-gray-300" />
             <span className="text-[10px] font-bold uppercase tracking-wider truncate">{property.region}, {property.country}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800 mt-auto">
             <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <IconBuilding size={14} className="text-blue-500" />
                <span className="text-xs font-black">{property.roomCount} <span className="text-[10px] text-gray-400 font-bold uppercase ml-0.5">Rooms</span></span>
             </div>
             <div className="w-px h-3 bg-gray-200 dark:bg-gray-700" />
             <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <IconBath size={14} className="text-purple-500" />
                <span className="text-xs font-black">{property.bathroomCount} <span className="text-[10px] text-gray-400 font-bold uppercase ml-0.5">Baths</span></span>
             </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // List UI branch matches the legacy structure's clean single-purpose layout
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="group relative bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:shadow-xl hover:border-primary/20 transition-all duration-300 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-full sm:w-40 h-28 rounded-xl overflow-hidden shadow-md flex-shrink-0">
          <img src={property.imageSrc} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={property.title} />
          <div className="absolute top-2 left-2">
             <span className={cn("px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border backdrop-blur-md", statusColors[property.status] || "bg-gray-500/10 text-gray-500")}>
               {formatStatus(property.status)}
             </span>
          </div>
        </div>
        <div className="flex-1 w-full min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">{property.title}</h3>
            <span className="text-lg font-black text-primary">₱{property.price.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
             <div className="flex items-center gap-1"><IconMapPin size={12} /> {property.region}</div>
             <div className="flex items-center gap-1"><IconBuilding size={12} /> {property.roomCount} Rooms</div>
             <div className="flex items-center gap-1"><IconBath size={12} /> {property.bathroomCount} Baths</div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium line-clamp-1 italic">"{property.description}"</p>
        </div>
        <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 sm:border-l border-gray-100 dark:border-gray-800 sm:pl-4">
          <button onClick={() => onView(property)} className="flex-1 sm:flex-none p-2.5 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all">
            <IconEye size={18} className="mx-auto" />
          </button>
          <Link href={`/landlord/properties/${property.id}/edit`} className="flex-1 sm:flex-none p-2.5 rounded-xl bg-amber-500/5 text-amber-500 hover:bg-amber-500 hover:text-white transition-all text-center">
            <IconEdit size={18} className="mx-auto" />
          </Link>
          <button onClick={() => onDelete(property)} className="flex-1 sm:flex-none p-2.5 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all">
            <IconTrash size={18} className="mx-auto" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

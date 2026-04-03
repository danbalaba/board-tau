'use client';

import React from 'react';
import Link from 'next/link';
import {
  IconBuilding,
  IconEdit,
  IconTrash,
  IconEye,
  IconDots,
  IconBath,
  IconCalendarFilled,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Button from '@/components/common/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import { Property } from '../types';

interface LandlordPropertyCardProps {
  property: Property;
  idx: number;
  viewMode: 'grid' | 'list';
  statusColors: Record<string, string>;
  formatStatus: (status: string) => string;
  onViewDetails: (property: Property) => void;
  onDelete: (property: Property) => void;
}

export default function LandlordPropertyCard({
  property,
  idx,
  viewMode,
  statusColors,
  formatStatus,
  onViewDetails,
  onDelete,
}: LandlordPropertyCardProps) {
  if (viewMode === 'grid') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none hover:shadow-2xl transition-all duration-500"
      >
        {/* Property Image */}
        <div className="relative h-52 overflow-hidden">
          {property.imageSrc ? (
            <img
              src={property.imageSrc}
              alt={property.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <IconBuilding size={32} className="text-gray-300" />
            </div>
          )}
          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <div className={cn(
              "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg border border-white/50 dark:border-gray-800 flex items-center gap-1.5",
              statusColors[property.status]?.split(' ')[1]
            )}>
              <div className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                statusColors[property.status]?.split(' ')[0].replace('bg-', 'bg-').replace('/10', '')
              )} />
              {formatStatus(property.status)}
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="p-6">
          <div className="flex justify-between items-start gap-4 mb-3">
            <div className="min-w-0">
              <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors leading-tight mb-1 truncate">
                {property.title}
              </h3>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">{property.roomCount} Rooms • {property.bathroomCount} Baths</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mb-6">
            <span className="text-2xl font-black text-gray-900 dark:text-white">₱{property.price.toLocaleString()}</span>
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">/ Mo</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <Link href={`/landlord/properties/${property.id}/edit`} className="flex-1">
              <Button className="rounded-xl w-full py-2.5 text-[10px] font-black uppercase tracking-widest shadow-md shadow-primary/10 group/btn">
                <span className="flex items-center justify-center gap-2">
                  <IconEdit className="group-hover/btn:rotate-12 transition-transform duration-300" size={11} />
                  Edit
                </span>
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary/40 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-300 group/dots">
                  <IconDots size={12} className="text-gray-400 group-hover/dots:text-primary transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-48 p-1.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl shadow-gray-200/50 dark:shadow-black/40"
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="flex items-center gap-3 px-3 py-2.5 text-[12px] font-bold text-gray-700 dark:text-gray-200 rounded-lg cursor-pointer hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10 transition-colors"
                    onClick={() => onViewDetails(property)}
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                      <IconEye size={11} className="text-blue-500" />
                    </div>
                    View Details
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="my-1 bg-gray-100 dark:bg-gray-700" />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="flex items-center gap-3 px-3 py-2.5 text-[12px] font-bold text-red-500 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    onClick={() => onDelete(property)}
                  >
                    <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                      <IconTrash size={11} className="text-red-500" />
                    </div>
                    Delete Property
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>
    );
  }

  /* List View Mode */
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-primary/20 p-4 transition-all duration-300 shadow-sm hover:shadow-md"
    >
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Property Image */}
        <div className="relative w-full sm:w-32 h-40 sm:h-32 rounded-xl overflow-hidden flex-shrink-0">
          {property.imageSrc ? (
            <img
              src={property.imageSrc}
              alt={property.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <IconBuilding size={20} className="text-gray-300" />
            </div>
          )}
        </div>

        {/* Property Content */}
        <div className="flex-1 min-w-0 w-full sm:w-auto">
          <div className="flex items-center justify-between sm:justify-start gap-3 mb-2">
            <h3 className="text-xl font-black text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
              {property.title}
            </h3>
            <div className={cn(
              "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border",
              statusColors[property.status]
            )}>
              {formatStatus(property.status)}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-400 mb-2">
             <span className="text-xs font-bold flex items-center gap-1.5">
               <IconBuilding size={14} className="text-primary" />
               {property.roomCount} Rooms
             </span>
             <span className="text-xs font-bold flex items-center gap-1.5">
               <IconBath size={14} className="text-blue-500" />
               {property.bathroomCount} Baths
             </span>
             <span className="text-xs font-bold flex items-center gap-1.5">
               <IconCalendarFilled size={14} className="text-orange-500" />
               {new Date(property.createdAt).toLocaleDateString()}
             </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-gray-900 dark:text-white">₱{property.price.toLocaleString()}</span>
            <span className="text-[10px] items-center font-bold uppercase tracking-widest text-gray-400">/ month</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 sm:pl-6 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800">
          <Link href={`/landlord/properties/${property.id}/edit`} className="flex-1 sm:flex-none">
            <button className="w-full sm:w-auto p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center">
              <IconEdit size={16} />
              <span className="sm:hidden ml-2 text-[10px] font-black uppercase tracking-widest">Edit</span>
            </button>
          </Link>
          <button 
            onClick={() => onViewDetails(property)}
            className="flex-1 sm:flex-none p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all flex items-center justify-center"
          >
            <IconEye size={16} />
            <span className="sm:hidden ml-2 text-[10px] font-black uppercase tracking-widest">View</span>
          </button>
          <button 
            onClick={() => onDelete(property)}
            className="flex-1 sm:flex-none p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex items-center justify-center"
          >
            <IconTrash size={16} />
            <span className="sm:hidden ml-2 text-[10px] font-black uppercase tracking-widest">Delete</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

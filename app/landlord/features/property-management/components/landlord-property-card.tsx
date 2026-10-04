'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Pencil, 
  Trash2, 
  Eye, 
  Bath, 
  MapPin, 
  MoreVertical, 
  Calendar,
  ChevronRight,
  Sparkles,
  Archive,
  RotateCcw
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { cn, formatCleanTitle } from '@/utils/helper';
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
import SafeImage from '@/components/common/SafeImage';
import { useLoading } from '@/components/loading/LoadingContext';

interface LandlordPropertyCardProps {
  property: Property;
  idx: number;
  viewMode: 'grid' | 'list';
  onView: (p: Property) => void;
  onDelete: (p: Property) => void;
  onArchive: (p: Property) => void;
  statusColors: Record<string, string>;
  formatStatus: (status: string) => string;
}

export function LandlordPropertyCard({
  property,
  idx,
  viewMode,
  onView,
  onDelete,
  onArchive,
  statusColors,
  formatStatus
}: LandlordPropertyCardProps) {
  const { startLoading } = useLoading();
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
        onClick={() => onView(property)}
        className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-2.5 sm:p-6 rounded-2xl sm:rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm flex flex-col h-full cursor-pointer"
      >
        {/* Top Image Section */}
        <div className="relative h-28 sm:h-48 w-full rounded-xl sm:rounded-2xl overflow-hidden mb-2.5 sm:mb-6 bg-gray-100 dark:bg-gray-800 z-10 flex-shrink-0">
          {property.imageSrc ? (
            <SafeImage 
              src={property.imageSrc} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              alt={property.title} 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Building2 size={24} className="sm:w-8 sm:h-8" strokeWidth={1.5} />
            </div>
          )}
          
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 scale-90 sm:scale-100 origin-top-left">
            <span className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] uppercase font-black tracking-wider shadow-lg backdrop-blur-md border", 
              property.status === 'PENDING'
                ? "bg-amber-500/90 text-white border-amber-400/50 shadow-amber-500/20"
                : property.status === 'REJECTED'
                ? "bg-rose-500/90 text-white border-rose-400/50"
                : statusColors[property.status] || "bg-primary/90 text-white border-primary/40"
            )}>
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {formatStatus(property.status)}
            </span>
          </div>

          <ArchiveButton 
            property={property} 
            onArchive={onArchive} 
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col z-10">
          <div className="mb-2 sm:mb-4">
             <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
               {property.status === 'ACTIVE' ? (
                 <span className="text-[7px] sm:text-[8px] font-black text-primary bg-primary/10 dark:bg-primary/20 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg border border-primary/20 uppercase tracking-widest flex items-center gap-1">
                   <Sparkles size={10} /> Verified
                 </span>
               ) : property.status === 'PENDING' ? (
                 <span className="text-[7px] sm:text-[8px] font-black text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg border border-amber-100 dark:border-amber-500/20 uppercase tracking-widest flex items-center gap-1">
                   <Building2 size={10} /> Pending
                 </span>
               ) : (
                 <span className="text-[7px] sm:text-[8px] font-black text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg border border-rose-100 dark:border-rose-500/20 uppercase tracking-widest flex items-center gap-1">
                   Revision
                 </span>
               )}

               <div className="flex items-center gap-1 text-[8px] sm:text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest truncate">
                 <MapPin size={9} className="text-gray-300 dark:text-gray-600 shrink-0" />
                 <span className="truncate">{(property as any).address || (property as any).city || property.region || 'Camiling, Tarlac'}</span>
               </div>
             </div>
              <h3 className="text-xs sm:text-xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-1 tracking-tight mb-1.5 sm:mb-4">
                {formatCleanTitle(property.title)}
              </h3>
          </div>

          {/* Stats Box */}
          {(() => {
            const totalAvailable = property.rooms?.reduce((acc: number, r: any) => acc + (r.availableSlots || 0), 0) || 0;
            return (
              <div className="flex items-center gap-1.5 sm:gap-3 mb-2.5 sm:mb-5 bg-gray-50 dark:bg-gray-800/50 p-1.5 sm:p-3 rounded-lg sm:rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex-1 flex items-center gap-1 sm:gap-3 border-r border-gray-200 dark:border-gray-700 pr-1 sm:pr-3">
                   <div className="p-1 sm:p-1.5 bg-blue-100/50 dark:bg-blue-500/20 rounded-md sm:rounded-lg text-blue-600 shrink-0"><Building2 size={12} className="sm:w-3.5 sm:h-3.5" /></div>
                   <div className="min-w-0">
                      <p className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5 sm:mb-1">Units</p>
                      <p className="text-[10px] sm:text-xs font-black text-gray-900 dark:text-white leading-none">{property.rooms?.length || property.roomCount || 1}</p>
                   </div>
                </div>
                <div className="flex-1 flex items-center gap-1 sm:gap-3 min-w-0">
                   <div className="p-1 sm:p-1.5 bg-primary/10 dark:bg-primary/20 rounded-md sm:rounded-lg text-primary shrink-0">
                      <Sparkles size={12} className="sm:w-3.5 sm:h-3.5" />
                   </div>
                   <div className="min-w-0">
                      <p className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5 sm:mb-1">Avail.</p>
                      <p className="text-[10px] sm:text-xs font-black text-gray-900 dark:text-white leading-none truncate">{totalAvailable} Slots</p>
                   </div>
                </div>
              </div>
            );
          })()}

          {/* Price Row */}
          <div className="flex items-center justify-between mb-2.5 sm:mb-6 px-0.5">
             <div>
               <p className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Rent Starts</p>
               <div className="flex items-baseline gap-0.5 sm:gap-1">
                 <span className="text-xs sm:text-lg font-black text-primary tracking-tighter leading-none">₱{property.price.toLocaleString()}</span>
                 <span className="text-[7px] sm:text-[9px] font-bold text-gray-500 uppercase">/mo</span>
               </div>
             </div>
             <div className="text-right min-w-0">
               <p className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Type</p>
               <p className="text-[8px] sm:text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tight truncate max-w-[65px] sm:max-w-[110px]">
                 {(property as any).propertyType?.name || (property as any).category || (property as any).categories?.[0]?.category?.label || 'Boarding House'}
               </p>
             </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 pt-2.5 sm:pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto w-full">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onView(property);
              }}
              className="flex-1 h-10 rounded-xl px-2 text-[10px] sm:text-xs font-black uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200/60 dark:border-gray-700/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Eye size={14} />
              <span>Preview</span>
            </Button>

            {!(property as any).isArchived && (
              <Link 
                href={`/landlord/properties/${property.id}/edit`} 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  if (startLoading) startLoading();
                }}
              >
                 <Button
                   className={cn(
                     "w-full h-10 rounded-xl px-2 text-[10px] sm:text-xs font-black uppercase tracking-wider text-white shadow-md transition-all group/btn cursor-pointer flex items-center justify-center gap-1.5",
                     property.status === 'REJECTED'
                       ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20"
                       : "bg-primary hover:bg-primary/90 shadow-primary/20"
                   )}
                 >
                   <Pencil size={14} className="group-hover:scale-110 transition-transform" />
                   <span>{property.status === 'REJECTED' ? 'Resubmit' : 'Edit'}</span>
                 </Button>
              </Link>
            )}
            {(property as any).isArchived && (
              <Button
               onClick={(e) => {
                 e.stopPropagation();
                 onDelete(property);
               }}
               className="flex-1 h-10 rounded-xl px-2 border border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white dark:border-rose-900/40 dark:hover:bg-rose-900 transition-all group/btn flex items-center justify-center gap-1.5 cursor-pointer text-[10px] sm:text-xs font-black uppercase tracking-wider"
              >
                <Trash2 size={14} className="group-hover:rotate-12 transition-transform" />
                <span>Delete</span>
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  /* List UI Mode - Sleek Shrunk Horizontal Row on Mobile & Desktop */
  const totalAvailable = property.rooms?.reduce((acc: number, r: any) => acc + (r.availableSlots || 0), 0) || 0;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onClick={() => onView(property)}
      className="group relative bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[2rem] border border-gray-100 dark:border-gray-800 p-3 sm:p-6 hover:shadow-xl transition-all duration-300 shadow-sm cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6">
        {/* Left Row on Mobile: Image + Main Details */}
        <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
          {/* Thumbnail */}
          <div className="relative w-20 h-20 sm:w-56 sm:h-36 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm flex-shrink-0 bg-gray-100 dark:bg-gray-800">
            <SafeImage 
              src={property.imageSrc} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
              alt={property.title} 
            />
            <div className="absolute top-1 left-1 sm:top-2.5 sm:left-2.5">
               <span className={cn(
                 "flex items-center gap-1 px-1.5 py-0.5 sm:px-2 rounded-md sm:rounded-lg text-[7px] sm:text-[8px] uppercase font-black tracking-wider shadow-lg backdrop-blur-md border", 
                 property.status === 'PENDING'
                   ? "bg-amber-500/90 text-white border-amber-400/50"
                   : property.status === 'REJECTED'
                   ? "bg-rose-500/90 text-white border-rose-400/50"
                   : statusColors[property.status] || "bg-primary/90 text-white border-primary/40"
               )}>
                 <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-current animate-pulse" />
                 {formatStatus(property.status)}
               </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-3">
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                <span className="text-[8px] sm:text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1 truncate max-w-[130px] sm:max-w-none">
                  <MapPin size={10} className="text-primary shrink-0" /> {(property as any).address || (property as any).city || property.region || 'Camiling, Tarlac'}
                </span>
                <span className="hidden sm:inline-block w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <span className="hidden sm:inline-block text-[9px] font-black text-primary uppercase tracking-widest">
                  {(property as any).propertyType?.name || (property as any).category || 'Boarding House'}
                </span>
              </div>
              <h3 className="text-sm sm:text-xl font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate tracking-tight">
                {formatCleanTitle(property.title)}
              </h3>
            </div>

            {/* Price & Units Row */}
            <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-sm sm:text-2xl font-black text-primary tracking-tighter">₱{property.price.toLocaleString()}<span className="text-[8px] sm:text-xs font-bold text-gray-500 uppercase">/mo</span></span>
              <span className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-wider">
                • {property.rooms?.length || property.roomCount || 1} Units ({totalAvailable} slots)
              </span>
            </div>

            {/* Desktop Specs Pills */}
            <div className="hidden sm:flex flex-wrap items-center gap-2 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50/60 dark:bg-blue-500/10 rounded-xl border border-blue-100/60 dark:border-blue-500/20 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase">
                <Building2 size={12} /> 
                <span>{property.rooms?.length || property.roomCount || 1} Units</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 dark:bg-primary/20 rounded-xl border border-primary/20 text-[9px] font-black text-primary dark:text-primary-400 uppercase">
                <Sparkles size={12} /> 
                <span>{totalAvailable} Available Slots</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50/60 dark:bg-purple-500/10 rounded-xl border border-purple-100/60 dark:border-purple-500/20 text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase">
                <Bath size={12} /> 
                <span>{property.bathroomCount || 1} Baths</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right / Actions Row */}
        <div className="flex sm:flex-col items-center gap-1.5 sm:gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800 pt-2.5 sm:pt-0 sm:pl-6">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onView(property);
            }} 
            className="flex-1 sm:w-full rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-primary transition-all flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest cursor-pointer"
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>

          {!(property as any).isArchived && (
            <Link 
              href={`/landlord/properties/${property.id}/edit`} 
              className="flex-1 sm:w-full"
              onClick={(e) => {
                e.stopPropagation();
                if (startLoading) startLoading();
              }}
            >
              <Button className="w-full rounded-xl px-3 sm:px-5 py-2 sm:py-2.5 bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest shadow-md group/btn transition-all cursor-pointer">
                 <span className="flex items-center justify-center gap-1.5">
                   <Pencil size={13} />
                   Edit
                 </span>
              </Button>
            </Link>
          )}
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onArchive(property);
            }}
            className={cn(
              "flex-1 sm:w-full rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer border shadow-xs",
              (property as any).isArchived
                ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                : "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20"
            )}
            title={(property as any).isArchived ? "Restore Property" : "Archive Property"}
          >
            {(property as any).isArchived ? (
              <>
                <RotateCcw size={13} />
                <span>Restore</span>
              </>
            ) : (
              <>
                <Archive size={13} />
                <span>Archive</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ArchiveButton({ 
  property, 
  onArchive
}: { 
  property: Property, 
  onArchive: (p: Property) => void
}) {
  return (
    <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onArchive(property);
        }}
        className={cn(
          "p-2 rounded-xl backdrop-blur-md transition-all duration-300 shadow-lg border",
          (property as any).isArchived 
            ? "bg-primary/90 text-white border-primary/40 hover:bg-primary" 
            : "bg-white/80 dark:bg-gray-900/80 text-gray-500 hover:text-amber-500 border-gray-100 dark:border-gray-800 hover:border-amber-100"
        )}
        title={(property as any).isArchived ? "Restore Property" : "Archive Property"}
      >
        {(property as any).isArchived ? (
          <RotateCcw size={14} strokeWidth={2.5} />
        ) : (
          <Archive size={14} strokeWidth={2.5} />
        )}
      </button>

    </div>
  );
}

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
        className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 sm:p-6 rounded-[22px] sm:rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm flex flex-col h-full"
      >
        {/* Top Image Section */}
        <div className="relative h-40 sm:h-48 w-full rounded-[16px] sm:rounded-2xl overflow-hidden mb-4 sm:mb-6 bg-gray-100 dark:bg-gray-800 z-10 flex-shrink-0">
          {property.imageSrc ? (
            <SafeImage 
              src={property.imageSrc} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              alt={property.title} 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Building2 size={32} strokeWidth={1.5} />
            </div>
          )}
          
          <div className="absolute top-3 left-3 z-20">
            <span className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] uppercase font-black tracking-wider shadow-lg backdrop-blur-md border", 
              property.status === 'PENDING'
                ? "bg-amber-500/90 text-white border-amber-400/50 shadow-amber-500/20"
                : property.status === 'REJECTED'
                ? "bg-rose-500/90 text-white border-rose-400/50"
                : statusColors[property.status] || "bg-emerald-500/90 text-white border-emerald-400/50"
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
          <div className="mb-3 sm:mb-4">
             <div className="flex items-center gap-2 mb-2 flex-wrap">
               {property.status === 'ACTIVE' ? (
                 <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20 uppercase tracking-widest flex items-center gap-1">
                   <Sparkles size={10} /> Verified Listing
                 </span>
               ) : property.status === 'PENDING' ? (
                 <span className="text-[8px] font-black text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-100 dark:border-amber-500/20 uppercase tracking-widest flex items-center gap-1">
                   <Building2 size={10} /> Pending Verification
                 </span>
               ) : (
                 <span className="text-[8px] font-black text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-100 dark:border-rose-500/20 uppercase tracking-widest flex items-center gap-1">
                   Needs Revision
                 </span>
               )}

               <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
                 <MapPin size={10} className="text-gray-300 dark:text-gray-600" />
                 {(property as any).address || (property as any).city || property.region || 'Camiling, Tarlac'}
               </div>
             </div>
             <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-1 tracking-tight mb-2.5 sm:mb-4">
               {property.title}
             </h3>
          </div>

          {/* Stats Box - Mirrored from Inquiry Card style with Tenant-side terminology */}
          {(() => {
            const totalAvailable = property.rooms?.reduce((acc: number, r: any) => acc + (r.availableSlots || 0), 0) || 0;
            return (
              <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 bg-gray-50 dark:bg-gray-800/50 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex-1 flex items-center gap-2.5 sm:gap-3 border-r border-gray-200 dark:border-gray-700 pr-2.5 sm:pr-3">
                   <div className="p-1.5 bg-blue-100/50 dark:bg-blue-500/20 rounded-lg text-blue-600"><Building2 size={14} /></div>
                   <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Units</p>
                      <p className="text-xs font-black text-gray-900 dark:text-white leading-none">{property.rooms?.length || property.roomCount || 1}</p>
                   </div>
                </div>
                <div className="flex-1 flex items-center gap-2.5 sm:gap-3">
                   <div className="p-1.5 bg-emerald-100/50 dark:bg-emerald-500/20 rounded-lg text-emerald-600">
                      <Sparkles size={14} />
                   </div>
                   <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Avail.</p>
                      <p className="text-xs font-black text-gray-900 dark:text-white leading-none">{totalAvailable} Slots</p>
                   </div>
                </div>
              </div>
            );
          })()}

          {/* Price Row */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
             <div>
               <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Rent Starts At</p>
               <div className="flex items-baseline gap-1">
                 <span className="text-base sm:text-lg font-black text-primary tracking-tighter leading-none">₱{property.price.toLocaleString()}</span>
                 <span className="text-[9px] font-bold text-gray-500 uppercase">/ month</span>
               </div>
             </div>
             <div className="text-right">
               <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Property Type</p>
               <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tight truncate max-w-[110px]">
                 {(property as any).propertyType?.name || (property as any).category || (property as any).categories?.[0]?.category?.label || 'Boarding House'}
               </p>
             </div>
          </div>

          {/* Footer Actions - Single Row Layout on Mobile & Desktop */}
          <div className="flex items-center gap-2 pt-4 sm:pt-6 border-t border-gray-100 dark:border-gray-800 mt-auto">
            <Button
              outline
              onClick={() => onView(property)}
              className="flex-1 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 dark:hover:text-primary border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer"
            >
              <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                <Eye size={14} />
                Preview
              </span>
            </Button>

            {!(property as any).isArchived && (
              <Link 
                href={`/landlord/properties/${property.id}/edit`} 
                className="flex-1"
                onClick={() => { if (startLoading) startLoading(); }}
              >
                 <Button
                   className={cn(
                     "w-full rounded-xl sm:rounded-2xl py-2.5 sm:py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-xl group/btn cursor-pointer",
                     property.status === 'REJECTED'
                       ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20"
                       : "bg-primary hover:bg-primary/90 shadow-primary/20"
                   )}
                 >
                   <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                     <Pencil size={14} className="group-hover:scale-110 transition-transform" />
                     {property.status === 'REJECTED' ? 'Resubmit' : 'Edit'}
                   </span>
                 </Button>
              </Link>
            )}
            {(property as any).isArchived && (
              <Button
               outline
               onClick={() => onDelete(property)}
               className="flex-1 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white dark:border-rose-900/30 dark:hover:bg-rose-900 transition-all group/btn flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer"
              >
                <Trash2 size={14} className="group-hover:rotate-12 transition-transform" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Delete</span>
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
      className="group relative bg-white dark:bg-gray-900 rounded-2xl sm:rounded-[2rem] border border-gray-100 dark:border-gray-800 p-3 sm:p-6 hover:shadow-xl transition-all duration-300 shadow-sm"
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
                   : statusColors[property.status] || "bg-emerald-500/90 text-white border-emerald-400/50"
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
                {property.title}
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
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50/60 dark:bg-emerald-500/10 rounded-xl border border-emerald-100/60 dark:border-emerald-500/20 text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase">
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
            onClick={() => onView(property)} 
            className="flex-1 sm:w-full rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-primary transition-all flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest cursor-pointer"
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>

          {!(property as any).isArchived && (
            <Link 
              href={`/landlord/properties/${property.id}/edit`} 
              className="flex-1 sm:w-full"
              onClick={() => { if (startLoading) startLoading(); }}
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
            onClick={() => onArchive(property)}
            className={cn(
              "flex-1 sm:w-full rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer border shadow-xs",
              (property as any).isArchived
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
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
            ? "bg-emerald-500/80 text-white border-emerald-400/50 hover:bg-emerald-600" 
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

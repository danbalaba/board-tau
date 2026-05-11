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
        className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm flex flex-col h-full"
      >
        {/* Top Image Section */}
        <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-6 bg-gray-100 dark:bg-gray-800 z-10 flex-shrink-0">
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
              "flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[8px] uppercase font-black tracking-widest shadow-lg backdrop-blur-md", 
              statusColors[property.status] || "bg-white text-gray-800 border-gray-200"
            )}>
              <Building2 size={10} strokeWidth={3} />
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
          <div className="mb-4">
             <div className="flex items-center gap-2 mb-2">
               <span className="text-[8px] font-black text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-100 dark:border-rose-500/20 uppercase tracking-widest">Verified Listing</span>
               <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
                 <MapPin size={10} className="text-gray-300 dark:text-gray-600" />
                 {property.region}
               </div>
             </div>
             <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-1 tracking-tight mb-4">
               {property.title}
             </h3>
          </div>

          {/* Stats Box - Mirrored from Inquiry Card style with Tenant-side terminology */}
          {(() => {
            const totalAvailable = property.rooms?.reduce((acc: number, r: any) => acc + (r.availableSlots || 0), 0) || 0;
            return (
              <div className="flex items-center gap-3 mb-5 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex-1 flex items-center gap-3 border-r border-gray-200 dark:border-gray-700 pr-3">
                   <div className="p-1.5 bg-blue-100/50 dark:bg-blue-500/20 rounded-lg text-blue-600"><Building2 size={14} /></div>
                   <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Units</p>
                      <p className="text-xs font-black text-gray-900 dark:text-white leading-none">{property.rooms?.length || property.roomCount}</p>
                   </div>
                </div>
                <div className="flex-1 flex items-center gap-3">
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
          <div className="flex items-center justify-between mb-6 px-1">
             <div>
               <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Rent Starts At</p>
               <div className="flex items-baseline gap-1">
                 <span className="text-lg font-black text-primary tracking-tighter leading-none">₱{property.price.toLocaleString()}</span>
                 <span className="text-[9px] font-bold text-gray-500 uppercase">/ month</span>
               </div>
             </div>
             <div className="text-right">
               <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Category</p>
               <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tight truncate max-w-[100px]">
                 {property.categories?.[0]?.category.label || 'N/A'}
               </p>
             </div>
          </div>

          {/* Footer Actions - Mirrored from Inquiry Card */}
          <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-100 dark:border-gray-800 mt-auto">
            <Button
              outline
              onClick={() => onView(property)}
              className="flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-[0.2em] bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 dark:hover:text-primary border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <span className="flex items-center justify-center gap-2">
                <Eye size={14} />
                Preview
              </span>
            </Button>

            <div className="flex gap-2 basis-[100%] sm:basis-auto flex-1">
               {!(property as any).isArchived && (
                 <Link href={`/landlord/properties/${property.id}/edit`} className="flex-1">
                    <Button
                      className="w-full rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 group/btn"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Pencil size={14} className="group-hover:scale-110 transition-transform" />
                        Edit
                      </span>
                    </Button>
                 </Link>
               )}
               {(property as any).isArchived && (
                 <Button
                  outline
                  onClick={() => onDelete(property)}
                  className="flex-1 rounded-2xl py-3 border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white dark:border-rose-900/30 dark:hover:bg-rose-900 transition-all group/btn flex items-center justify-center gap-2"
                 >
                   <Trash2 size={14} className="group-hover:rotate-12 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Delete Permanent</span>
                 </Button>
               )}
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
      className="group relative bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 hover:shadow-xl transition-all duration-300 shadow-sm"
    >
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Left: Image */}
        <div className="relative w-full lg:w-64 h-48 rounded-[2rem] overflow-hidden shadow-lg flex-shrink-0 bg-gray-100 dark:bg-gray-800">
          <SafeImage 
            src={property.imageSrc} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
            alt={property.title} 
          />
          <div className="absolute top-4 left-4">
             <span className={cn(
               "flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] uppercase font-black tracking-widest shadow-lg backdrop-blur-md border", 
               statusColors[property.status] || "bg-white text-gray-800 border-gray-200"
             )}>
               <Building2 size={12} strokeWidth={3} />
               {formatStatus(property.status)}
             </span>
          </div>
        </div>

        {/* Middle: Content */}
        <div className="flex-1 w-full min-w-0 py-2">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <MapPin size={14} className="text-primary" /> {property.region}
                </span>
                <span className="w-1.5 h-1.5 bg-primary/20 rounded-full" />
                <span className="text-[10px] font-black text-emerald-500 flex items-center gap-2 uppercase tracking-[0.2em]">
                  <Calendar size={14} /> Active Portfolio
                </span>
              </div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 tracking-tight">
                {property.title}
              </h3>
            </div>
            <div className="flex flex-col xl:items-end shrink-0">
              <span className="text-4xl font-black text-primary tracking-tighter leading-none">₱{property.price.toLocaleString()}</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Starting Rate</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-6">
             <div className="flex items-center gap-3 px-5 py-2.5 bg-blue-50/50 dark:bg-blue-500/10 rounded-2xl border border-blue-100/50 dark:border-blue-500/20 shadow-sm">
               <Building2 size={18} className="text-blue-500" /> 
               <span className="text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">{property.roomCount} Rooms</span>
             </div>
             <div className="flex items-center gap-3 px-5 py-2.5 bg-purple-50/50 dark:bg-purple-500/10 rounded-2xl border border-purple-100/50 dark:border-purple-500/20 shadow-sm">
               <Bath size={18} className="text-purple-500" /> 
               <span className="text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">{property.bathroomCount} Baths</span>
             </div>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium line-clamp-2 italic max-w-3xl opacity-70 leading-relaxed">
            {property.description || "No description provided."}
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex sm:flex-col gap-4 w-full lg:w-44 mt-6 lg:mt-0 pt-8 lg:pt-0 lg:border-l border-gray-100 dark:border-gray-800 lg:pl-8 shrink-0">
          {!(property as any).isArchived && (
            <Link href={`/landlord/properties/${property.id}/edit`} className="w-full">
              <Button className="w-full rounded-2xl h-14 bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 group/btn transition-all border-b-4 border-primary/30 active:border-b-0">
                 <span className="flex items-center justify-center gap-3">
                   <Pencil size={16} className="group-hover:scale-110 transition-transform" />
                   Edit Listing
                 </span>
              </Button>
            </Link>
          )}
          
          <div className="flex gap-2 w-full h-12">
            <button 
              onClick={() => onView(property)} 
              className="flex-1 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center group/btn shadow-sm border border-blue-100 dark:border-blue-900/30"
              title="Quick View"
            >
              <Eye size={20} className="group-hover/btn:scale-110 transition-transform" />
            </button>
            
            <button 
              onClick={() => onArchive(property)}
              className={cn(
                "flex-1 rounded-2xl transition-all flex items-center justify-center group/btn shadow-sm border",
                (property as any).isArchived 
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white" 
                  : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-100 hover:bg-amber-600 hover:text-white"
              )}
              title={(property as any).isArchived ? "Restore Property" : "Archive Property"}
            >
              {(property as any).isArchived ? (
                <RotateCcw size={20} className="group-hover/btn:-rotate-45 transition-transform" />
              ) : (
                <Archive size={20} className="group-hover/btn:scale-110 transition-transform" />
              )}
            </button>

            {(property as any).isArchived && (
              <button 
                onClick={() => onDelete(property)} 
                className="flex-1 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center group/btn shadow-sm border border-rose-100 dark:border-rose-900/30"
                title="Delete Permanently"
              >
                <Trash2 size={20} className="group-hover/btn:rotate-12 transition-transform" />
              </button>
            )}
          </div>
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

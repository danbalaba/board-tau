'use client';

import React from 'react';
import Link from 'next/link';
import { 
  DoorOpen, 
  Pencil, 
  Trash2, 
  Eye,
  Users, 
  Layers, 
  Building2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Archive,
  RotateCcw
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { cn } from '@/utils/helper';
import SafeImage from '@/components/common/SafeImage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/admin/components/ui/dropdown-menu';
import { Button } from '@/app/admin/components/ui/button';
import { Room } from '../hooks/use-room-logic';

interface LandlordRoomCardProps {
  room: Room;
  idx: number;
  viewMode: 'grid' | 'list';
  onView: (r: Room) => void;
  onEdit?: (r: Room) => void;
  onDelete: (r: Room) => void;
  onArchive: (r: Room) => void;
  statusColors: Record<string, string>;
  formatStatus: (status: string) => string;
}

export function LandlordRoomCard({
  room,
  idx,
  viewMode,
  onView,
  onEdit,
  onDelete,
  onArchive,
  statusColors,
  formatStatus
}: LandlordRoomCardProps) {
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
        <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-6 bg-gray-100 dark:bg-gray-800 z-10 flex-shrink-0">
          <div className="absolute inset-0 bg-gray-900/5 animate-pulse" />
          {room.images && room.images.length > 0 ? (
            <SafeImage 
              src={room.images[0]} 
              alt={room.name} 
              priority={idx < 6}
            />
          ) : room.imageSrc ? (
            <SafeImage 
              src={room.imageSrc} 
              alt={room.name} 
              priority={idx < 6}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
              <DoorOpen size={48} className="text-gray-300 dark:text-gray-700 mb-2" />
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">No Photos</p>
            </div>
          )}
          
          {/* Status badge — top left */}
          <div className="absolute top-3 left-3 z-20">
            <span className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[8px] uppercase font-black tracking-widest shadow-lg backdrop-blur-md border", 
              statusColors[room.status] || "bg-white text-gray-800 border-gray-200"
            )}>
              <DoorOpen size={10} strokeWidth={3} />
              {formatStatus(room.status)}
            </span>
          </div>

          {/* Archive button — top right, inside image for correct stacking */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onArchive(room);
            }}
            className={cn(
              "absolute top-3 right-3 z-20 p-2 rounded-xl backdrop-blur-md transition-all duration-300 shadow-lg border",
              room.isArchived
                ? "bg-emerald-500/80 text-white border-emerald-400/50 hover:bg-emerald-600"
                : "bg-white/80 dark:bg-gray-900/80 text-gray-500 hover:text-rose-500 border-gray-100 dark:border-gray-800 hover:border-rose-100"
            )}
            title={room.isArchived ? "Restore Room" : "Archive Room"}
          >
            {room.isArchived ? (
              <RotateCcw size={14} strokeWidth={2.5} className="group-hover:-rotate-45 transition-transform" />
            ) : (
              <Archive size={14} strokeWidth={2.5} className="hover:scale-110 transition-transform" />
            )}
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col z-10">
          <div className="mb-4">
             <div className="flex items-center gap-2 mb-2">
               <span className="text-[8px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10 uppercase tracking-widest flex items-center gap-1">
                 <Building2 size={10} /> {room.propertyTitle}
               </span>
             </div>
             <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-1 tracking-tight mb-4">
               {room.name}
             </h3>
          </div>

          {/* Stats Box */}
          <div className="flex items-center gap-3 mb-5 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex-1 flex items-center gap-3 border-r border-gray-200 dark:border-gray-700 pr-3">
               <div className="p-1.5 bg-blue-100/50 dark:bg-blue-500/20 rounded-lg text-blue-600"><Layers size={14} /></div>
               <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Type</p>
                  <p className="text-xs font-black text-gray-900 dark:text-white leading-none">{room.roomType}</p>
               </div>
            </div>
            <div className="flex-1 flex items-center gap-3">
               <div className="p-1.5 bg-emerald-100/50 dark:bg-emerald-500/20 rounded-lg text-emerald-600">
                  <Users size={14} />
               </div>
               <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Slots</p>
                  <p className="text-xs font-black text-gray-900 dark:text-white leading-none">{room.availableSlots}/{room.capacity}</p>
               </div>
            </div>
          </div>

          {/* Price Row */}
          <div className="flex items-center justify-between mb-6 px-1">
             <div>
               <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Rate</p>
               <div className="flex items-baseline gap-1">
                 <span className="text-lg font-black text-primary tracking-tighter leading-none">₱{room.price.toLocaleString()}</span>
                 <span className="text-[9px] font-bold text-gray-500 uppercase">/ mo</span>
               </div>
             </div>
             <div className="text-right">
               <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Safety</p>
               <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase">
                 <ShieldCheck size={12} />
                 <span>Secure</span>
               </div>
             </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-100 dark:border-gray-800 mt-auto">
            <Button
              outline
              onClick={() => onView(room)}
              className="flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
            >
              <span className="flex items-center justify-center gap-2">
                <Eye size={14} />
                Manage
              </span>
            </Button>

            <div className="flex gap-2 basis-[100%] sm:basis-auto flex-1">
                <Button
                  onClick={() => onEdit && onEdit(room)}
                  className="flex-1 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 group/btn"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Pencil size={14} />
                    Edit
                  </span>
                </Button>
               {(room as any).isArchived && (
                 <Button
                  outline
                  onClick={() => onDelete(room)}
                  className="rounded-2xl px-3 py-3 border-rose-100 text-rose-500 hover:bg-rose-50 dark:border-rose-900/30 group/btn"
                 >
                   <Trash2 size={14} />
                 </Button>
               )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }  /* List View */
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
          {room.images && room.images.length > 0 ? (
            <SafeImage
              src={room.images[0]}
              alt={room.name}
            />
          ) : room.imageSrc ? (
            <SafeImage
              src={room.imageSrc}
              alt={room.name}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
              <DoorOpen size={40} strokeWidth={1.5} />
            </div>
          )}
          <div className="absolute top-4 left-4">
            <span className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] uppercase font-black tracking-widest shadow-lg backdrop-blur-md border",
              statusColors[room.status] || "bg-white text-gray-800 border-gray-200"
            )}>
              <DoorOpen size={12} strokeWidth={3} />
              {formatStatus(room.status)}
            </span>
          </div>
        </div>

        {/* Middle: Content */}
        <div className="flex-1 w-full min-w-0 py-2">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-black text-primary bg-primary/5 px-3 py-1 rounded-xl border border-primary/10 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Building2 size={12} /> {room.propertyTitle}
                </span>
              </div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1 tracking-tight">
                {room.name}
              </h3>
            </div>
            <div className="flex flex-col xl:items-end shrink-0">
              <span className="text-4xl font-black text-primary tracking-tighter leading-none">₱{room.price.toLocaleString()}</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">Monthly Rate</span>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap mb-2">
            <div className="flex items-center gap-3 px-5 py-2.5 bg-blue-50/50 dark:bg-blue-500/10 rounded-2xl border border-blue-100/50 dark:border-blue-500/20 shadow-sm">
              <Layers size={18} className="text-blue-500" />
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">{room.roomType}</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50/50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/20 shadow-sm">
              <Users size={18} className="text-emerald-500" />
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">{room.availableSlots}/{room.capacity} Slots Available</span>
            </div>
            <div className="flex items-center gap-3 px-5 py-2.5 bg-purple-50/50 dark:bg-purple-500/10 rounded-2xl border border-purple-100/50 dark:border-purple-500/20 shadow-sm">
              <ShieldCheck size={18} className="text-purple-500" />
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">Tenant Ready</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex sm:flex-col gap-4 w-full lg:w-44 mt-6 lg:mt-0 pt-8 lg:pt-0 lg:border-l border-gray-100 dark:border-gray-800 lg:pl-8 shrink-0">
          <Button
            className="w-full rounded-2xl h-14 bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 group/btn transition-all border-b-4 border-primary/30 active:border-b-0"
            onClick={() => onView(room)}
          >
            <span className="flex items-center justify-center gap-3">
              <Eye size={16} className="group-hover/btn:scale-110 transition-transform" />
              Manage Unit
            </span>
          </Button>
          <div className="flex gap-2 w-full h-12">
            <button
              onClick={() => onEdit && onEdit(room)}
              className="flex-1 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center group/btn shadow-sm border border-blue-100 dark:border-blue-900/30"
              title="Edit Details"
            >
              <Pencil size={18} className="group-hover/btn:scale-110 transition-transform" />
            </button>
            
            <button 
              onClick={() => onArchive(room)}
              className={cn(
                "flex-1 rounded-2xl transition-all flex items-center justify-center group/btn shadow-sm border",
                (room as any).isArchived 
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white" 
                  : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-100 hover:bg-amber-600 hover:text-white"
              )}
              title={(room as any).isArchived ? "Restore Room" : "Archive Room"}
            >
              {(room as any).isArchived ? (
                <RotateCcw size={18} className="group-hover/btn:-rotate-45 transition-transform" />
              ) : (
                <Archive size={18} className="group-hover/btn:scale-110 transition-transform" />
              )}
            </button>

            {(room as any).isArchived && (
              <button
                onClick={() => onDelete(room)}
                className="flex-1 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center group/btn shadow-sm border border-rose-100 dark:border-rose-900/30"
                title="Delete Permanently"
              >
                <Trash2 size={18} className="group-hover/btn:rotate-12 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ArchiveButton({ room, onArchive }: { room: Room, onArchive: (r: Room) => void }) {
  return (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onArchive(room);
      }}
      className={cn(
        "absolute top-4 right-4 z-[60] p-2 rounded-xl backdrop-blur-md transition-all duration-300 shadow-lg border",
        (room as any).isArchived 
          ? "bg-emerald-500/80 text-white border-emerald-400/50 hover:bg-emerald-600" 
          : "bg-white/80 dark:bg-gray-900/80 text-gray-500 hover:text-rose-500 border-gray-100 dark:border-gray-800 hover:border-rose-100"
      )}
      title={(room as any).isArchived ? "Restore Room" : "Archive Room"}
    >
      {(room as any).isArchived ? (
        <RotateCcw size={16} strokeWidth={2.5} />
      ) : (
        <Archive size={16} strokeWidth={2.5} />
      )}
    </button>
  );
}

'use client';

import React, { useMemo } from 'react';
import { 
  DoorOpen, 
  Pencil, 
  Trash2, 
  Eye,
  Users, 
  Layers, 
  Building2,
  Sparkles,
  Archive,
  RotateCcw
} from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { cn } from '@/utils/helper';
import SafeImage from '@/components/common/SafeImage';
import { Button } from '@/app/admin/components/ui/button';
import { Room } from '../hooks/use-room-logic';
import { getSyncRoomTypes, getCachedRoomTypes } from '@/lib/landlordTaxonomyCache';
import { getDynamicIcon } from '@/lib/iconResolver';

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
  const [roomTypesList, setRoomTypesList] = React.useState<any[]>(() => getSyncRoomTypes() || []);

  React.useEffect(() => {
    if (roomTypesList.length === 0) {
      getCachedRoomTypes().then((rts: any[]) => {
        if (rts && rts.length > 0) setRoomTypesList(rts);
      });
    }
  }, [roomTypesList.length]);

  const matchedRoomType = useMemo(() => {
    if (!room.roomType) return null;
    const target = String(room.roomType).trim();
    return roomTypesList.find((rt: any) =>
      rt.id === target ||
      rt.code === target ||
      rt.name === target ||
      rt.name?.toLowerCase() === target.toLowerCase() ||
      rt.code?.toLowerCase() === target.toLowerCase()
    );
  }, [room.roomType, roomTypesList]);

  const roomTypeLabel = useMemo(() => {
    if ((room as any).roomTypeDefinition?.name) return (room as any).roomTypeDefinition.name;
    if ((room as any).roomTypeName) return (room as any).roomTypeName;
    if (matchedRoomType?.name) return matchedRoomType.name;
    if (room.roomType && !/^[a-f0-9]{24}$/i.test(room.roomType)) return room.roomType;
    return 'Standard Room';
  }, [matchedRoomType, room]);

  const RoomTypeIcon = matchedRoomType?.icon ? getDynamicIcon(matchedRoomType.icon, Layers) : Layers;

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: idx * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const getRoomImage = () => {
    const firstImg = room.images?.[0];
    if (!firstImg) return room.imageSrc || '';
    if (typeof firstImg === 'string') return firstImg;
    return (firstImg as any).url || '';
  };

  if (isGrid) {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-2.5 sm:p-6 rounded-2xl sm:rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-sm flex flex-col h-full"
      >
        {/* Top Image Section */}
        <div className="relative h-28 sm:h-48 w-full rounded-xl sm:rounded-2xl overflow-hidden mb-2.5 sm:mb-6 bg-gray-100 dark:bg-gray-800 z-10 flex-shrink-0">
          {getRoomImage() ? (
            <SafeImage 
              src={getRoomImage()} 
              alt={room.name} 
              priority={idx < 6}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-700">
              <DoorOpen size={24} className="sm:w-9 sm:h-9 mb-1" />
              <p className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-gray-400">No Photos</p>
            </div>
          )}
          
          {/* Status badge — top left */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 scale-90 sm:scale-100 origin-top-left">
            <span className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl text-[8px] sm:text-[9px] uppercase font-black tracking-wider shadow-lg backdrop-blur-md border", 
              statusColors[room.status] || "bg-primary/90 text-white border-primary/40"
            )}>
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {formatStatus(room.status)}
            </span>
          </div>

          {/* Archive button — top right */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onArchive(room);
            }}
            className={cn(
              "absolute top-2 right-2 sm:top-3 sm:right-3 z-20 p-1.5 sm:p-2 rounded-lg sm:rounded-xl backdrop-blur-md transition-all duration-300 shadow-lg border scale-90 sm:scale-100 origin-top-right",
              room.isArchived
                ? "bg-primary/90 text-white border-primary/50 hover:bg-primary"
                : "bg-white/80 dark:bg-gray-900/80 text-gray-500 hover:text-amber-500 border-gray-100 dark:border-gray-800 hover:border-amber-100"
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
          <div className="mb-2 sm:mb-4">
             <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2 flex-wrap">
               <span className="text-[7px] sm:text-[8px] font-black text-primary bg-primary/10 dark:bg-primary/20 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg border border-primary/20 uppercase tracking-widest flex items-center gap-1 truncate max-w-full">
                 <Building2 size={10} className="shrink-0" /> <span className="truncate">{room.propertyTitle || 'Property Unit'}</span>
               </span>
             </div>
             <h3 className="text-xs sm:text-xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors line-clamp-1 tracking-tight mb-1.5 sm:mb-4">
               {room.name}
             </h3>
          </div>

          {/* Stats Box */}
          <div className="flex items-center gap-1.5 sm:gap-3 mb-2.5 sm:mb-5 bg-gray-50 dark:bg-gray-800/50 p-1.5 sm:p-3 rounded-lg sm:rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex-1 flex items-center gap-1 sm:gap-3 border-r border-gray-200 dark:border-gray-700 pr-1 sm:pr-3 min-w-0">
               <div className="p-1 sm:p-1.5 bg-blue-100/50 dark:bg-blue-500/20 rounded-md sm:rounded-lg text-blue-600 shrink-0"><RoomTypeIcon size={12} className="sm:w-3.5 sm:h-3.5" /></div>
               <div className="min-w-0">
                  <p className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5 sm:mb-1">Type</p>
                  <p className="text-[10px] sm:text-xs font-black text-gray-900 dark:text-white leading-none truncate">{roomTypeLabel}</p>
               </div>
            </div>
            <div className="flex-1 flex items-center gap-1 sm:gap-3 min-w-0">
               <div className="p-1 sm:p-1.5 bg-primary/10 dark:bg-primary/20 rounded-md sm:rounded-lg text-primary shrink-0"><Users size={12} className="sm:w-3.5 sm:h-3.5" /></div>
               <div className="min-w-0">
                  <p className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5 sm:mb-1">Slots</p>
                  <p className="text-[10px] sm:text-xs font-black text-gray-900 dark:text-white leading-none">{room.availableSlots}/{room.capacity}</p>
               </div>
            </div>
          </div>

          {/* Price Row */}
          <div className="flex items-center justify-between mb-2.5 sm:mb-6 px-0.5">
             <div>
               <p className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Rate</p>
               <div className="flex items-baseline gap-0.5 sm:gap-1">
                 <span className="text-xs sm:text-lg font-black text-primary tracking-tighter leading-none">₱{room.price.toLocaleString()}</span>
                 <span className="text-[7px] sm:text-[9px] font-bold text-gray-500 uppercase">/mo</span>
               </div>
             </div>
             <div className="text-right min-w-0">
               <p className="text-[7px] sm:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Capacity</p>
               <p className="text-[8px] sm:text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-tight truncate max-w-[65px] sm:max-w-[110px]">
                 {room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}
               </p>
             </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 pt-2.5 sm:pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto w-full">
            <Button
              onClick={() => onView(room)}
              className="flex-1 h-10 rounded-xl px-2 text-[10px] sm:text-xs font-black uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200/60 dark:border-gray-700/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Eye size={14} />
              <span>Details</span>
            </Button>

            {!room.isArchived && (
              <Button
                onClick={() => onEdit && onEdit(room)}
                className="flex-1 h-10 rounded-xl px-2 text-[10px] sm:text-xs font-black uppercase tracking-wider bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 group/btn transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Pencil size={14} className="group-hover:scale-110 transition-transform" />
                <span>Edit</span>
              </Button>
            )}
            {room.isArchived && (
              <Button
                onClick={() => onDelete(room)}
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
            {getRoomImage() ? (
              <SafeImage
                src={getRoomImage()}
                alt={room.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                <DoorOpen size={28} strokeWidth={1.5} />
              </div>
            )}
            <div className="absolute top-1 left-1 sm:top-2.5 sm:left-2.5 z-20">
              <span className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 sm:px-2 rounded-md sm:rounded-lg text-[7px] sm:text-[8px] uppercase font-black tracking-wider shadow-lg backdrop-blur-md border",
                statusColors[room.status] || "bg-primary/90 text-white border-primary/40"
              )}>
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-current animate-pulse" />
                {formatStatus(room.status)}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-3">
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                <span className="text-[8px] sm:text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1 truncate max-w-[130px] sm:max-w-none">
                  <Building2 size={10} className="shrink-0" /> {room.propertyTitle || 'Property Unit'}
                </span>
                <span className="hidden sm:inline-block w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <span className="hidden sm:inline-block text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  {roomTypeLabel}
                </span>
              </div>
              <h3 className="text-sm sm:text-xl font-black text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate tracking-tight">
                {room.name}
              </h3>
            </div>

            {/* Price & Slots Row */}
            <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-sm sm:text-2xl font-black text-primary tracking-tighter">
                ₱{room.price.toLocaleString()}
                <span className="text-[8px] sm:text-xs font-bold text-gray-500 uppercase">/mo</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-wider">
                • {room.availableSlots}/{room.capacity} Slots Available
              </span>
            </div>

            {/* Desktop Specs Pills */}
            <div className="hidden sm:flex flex-wrap items-center gap-2 pt-1">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50/60 dark:bg-blue-500/10 rounded-xl border border-blue-100/60 dark:border-blue-500/20 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase">
                <RoomTypeIcon size={12} />
                <span>{roomTypeLabel}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 dark:bg-primary/20 rounded-xl border border-primary/20 text-[9px] font-black text-primary dark:text-primary-400 uppercase">
                <Users size={12} />
                <span>{room.availableSlots}/{room.capacity} Slots Available</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50/60 dark:bg-purple-500/10 rounded-xl border border-purple-100/60 dark:border-purple-500/20 text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase">
                <Sparkles size={12} />
                <span>{formatStatus(room.status)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right / Actions Row */}
        <div className="flex sm:flex-col items-center gap-1.5 sm:gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800 pt-2.5 sm:pt-0 sm:pl-6">
          <button 
            onClick={() => onView(room)} 
            className="flex-1 sm:w-full rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-primary transition-all flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest cursor-pointer"
          >
            <Eye size={13} />
            <span>Details</span>
          </button>

          {!room.isArchived && (
            <Button 
              onClick={() => onEdit && onEdit(room)}
              className="flex-1 sm:w-full rounded-xl px-3 sm:px-5 py-2 sm:py-2.5 bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest shadow-md group/btn transition-all cursor-pointer"
            >
              <span className="flex items-center justify-center gap-1.5">
                <Pencil size={13} />
                Edit
              </span>
            </Button>
          )}
          
          <button 
            onClick={() => onArchive(room)}
            className={cn(
              "flex-1 sm:w-full rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer border shadow-xs",
              room.isArchived
                ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                : "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20"
            )}
            title={room.isArchived ? "Restore Room" : "Archive Room"}
          >
            {room.isArchived ? (
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

          {room.isArchived && (
            <button
              onClick={() => onDelete(room)}
              className="flex-1 sm:w-full rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest cursor-pointer border border-rose-100 dark:border-rose-900/30"
              title="Delete Permanently"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default LandlordRoomCard;

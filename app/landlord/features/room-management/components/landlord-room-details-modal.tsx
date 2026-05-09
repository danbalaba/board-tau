'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  DoorOpen, 
  Building2, 
  Users, 
  Layers, 
  Banknote,
  Maximize,
  Sparkles,
  Check,
  ShieldCheck,
  Zap,
  ChevronRight,
  WrenchIcon,
  Loader2,
  ChevronLeft as ChevronLeftIcon,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/helper';
import { Room } from '../hooks/use-room-logic';
import { roomAmenities, BATHROOM_ARRANGEMENT_LABELS } from '@/data/roomAmenities';
import SafeImage from '@/components/common/SafeImage';

interface LandlordRoomDetailsModalProps {
  room: Room;
  onClose: () => void;
  statusColors: Record<string, string>;
  formatStatus: (status: string) => string;
}

export function LandlordRoomDetailsModal({
  room,
  onClose,
  statusColors,
  formatStatus
}: LandlordRoomDetailsModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState(room.status);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = room.images && room.images.length > 0 ? room.images : (room.imageSrc ? [room.imageSrc] : []);

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleStatusUpdate = async (newStatus: 'AVAILABLE' | 'FULL' | 'MAINTENANCE') => {
    if (newStatus === currentStatus) return;
    setUpdatingStatus(newStatus);
    try {
      const res = await fetch(`/api/landlord/rooms/${room.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setCurrentStatus(newStatus);
      }
    } catch (err) {
      console.error('Failed to update room status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const statusActions = [
    {
      status: 'AVAILABLE' as const,
      label: 'Mark as Available',
      icon: Check,
      iconBg: 'bg-emerald-100/50 dark:bg-emerald-500/10 text-emerald-600',
      hoverBorder: 'hover:border-emerald-500/30',
      hoverChevron: 'group-hover:text-emerald-500',
    },
    {
      status: 'FULL' as const,
      label: 'Mark as Full',
      icon: Maximize,
      iconBg: 'bg-rose-100/50 dark:bg-rose-500/10 text-rose-600',
      hoverBorder: 'hover:border-rose-500/30',
      hoverChevron: 'group-hover:text-rose-500',
    },
    {
      status: 'MAINTENANCE' as const,
      label: 'Mark as Maintenance',
      icon: WrenchIcon,
      iconBg: 'bg-orange-100/50 dark:bg-orange-500/10 text-orange-600',
      hoverBorder: 'hover:border-orange-500/30',
      hoverChevron: 'group-hover:text-orange-500',
    },
  ];

  const roomDetails = [
    { label: 'Room Type', value: room.roomType || 'N/A', icon: Layers },
    { label: 'Bed Types', value: `${room.bedType || 'N/A'} (${room.bedCount} ${room.bedCount === 1 ? 'Unit' : 'Units'})`, icon: Users },
    { label: 'Bathroom', value: BATHROOM_ARRANGEMENT_LABELS[(room as any).bathroomArrangement] || (room as any).bathroomArrangement || 'N/A', icon: Sparkles },
    { label: 'Room Size', value: room.size ? `${room.size} SQM` : 'N/A', icon: Maximize },
    { label: 'Reservation Fee', value: room.reservationFee ? `₱${room.reservationFee.toLocaleString()}` : 'None', icon: Banknote },
  ];

  const stats = [
    { label: 'Monthly Rate', value: `₱${room.price.toLocaleString()}`, icon: Banknote, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/10' },
    { label: 'Capacity', value: `${room.capacity} Guests`, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-500/10' },
    { label: 'Available', value: `${room.availableSlots} Guests`, icon: Check, color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' },
    { label: 'Secured', value: 'Verified', icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-500/5', border: 'border-purple-500/10' },
  ];

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-10 bg-gray-900/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#111827] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header — Fixed Geometry */}
        <div className="absolute top-0 left-0 right-0 h-[90px] bg-white/90 dark:bg-[#111827]/90 backdrop-blur-2xl border-b border-gray-100 dark:border-white/5 z-50 flex items-center justify-between px-8 md:px-10 rounded-t-[2.5rem]">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
              <DoorOpen size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">Room Preview</p>
              <h2 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">{room.name}</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hidden sm:flex">
              <Building2 size={10} className="text-primary" />
              {room.propertyTitle}
            </div>
            <span className={cn(
              "hidden sm:flex px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border", 
              statusColors[currentStatus]
            )}>
              {formatStatus(currentStatus)}
            </span>
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all border border-gray-100 dark:border-white/5"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto pt-[90px] custom-scrollbar">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[60vh] flex flex-col items-center justify-center gap-6"
              >
                <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-xl shadow-primary/10" />
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse">Loading Room Data</p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Hero Gallery Slider */}
                <div className="relative h-64 md:h-80 w-full overflow-hidden bg-gray-100 dark:bg-gray-900 flex-shrink-0 group">
                  <AnimatePresence mode="wait">
                    {images.length > 0 ? (
                      <SafeImage
                        key={currentImageIndex}
                        src={images[currentImageIndex]}
                        alt={`${room.name} - ${currentImageIndex + 1}`}
                        priority={true}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                        <DoorOpen size={64} className="opacity-20 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">No Photos Available</p>
                      </div>
                    )}
                  </AnimatePresence>

                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 dark:from-gray-900/80 via-transparent to-transparent" />
                  
                  {images.length > 1 && (
                    <>
                      <button 
                        onClick={handlePrevImage}
                        className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-black/20 backdrop-blur-xl border border-white/10 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-black/40 hover:scale-110"
                      >
                        <ChevronLeftIcon size={20} />
                      </button>
                      <button 
                        onClick={handleNextImage}
                        className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-black/20 backdrop-blur-xl border border-white/10 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-black/40 hover:scale-110"
                      >
                        <ChevronRight size={20} />
                      </button>

                      {/* Dots Indicator */}
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-2 bg-black/20 backdrop-blur-md rounded-full border border-white/5">
                        {images.map((_, idx) => (
                          <div 
                            key={idx} 
                            className={cn(
                              "h-1 transition-all duration-500 rounded-full",
                              currentImageIndex === idx ? "w-6 bg-primary" : "w-1.5 bg-white/30"
                            )}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  <div className="absolute top-6 left-6">
                    <div className={cn(
                      "inline-flex items-center px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-xl shadow-2xl",
                      statusColors[currentStatus]?.replace('/10', '/90') || "bg-gray-900/90 text-white border-white/20"
                    )}>
                      <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse mr-2" />
                      {formatStatus(currentStatus)}
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-10">
                  {/* Core Stats — identical styling to property modal */}
                  <section className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
                    {stats.map((stat, i) => (
                      <div key={i} className={cn("p-5 rounded-[2rem] border hover:scale-[1.02] transition-transform shadow-sm flex flex-col", stat.bg, stat.border)}>
                        <div className={cn("w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center mb-3 shadow-sm border border-gray-100 dark:border-gray-700", stat.color)}>
                          <stat.icon size={18} />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{stat.value}</p>
                      </div>
                    ))}
                  </section>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left: Details */}
                    <div className="lg:col-span-7 space-y-12">
                      {/* Room Details */}
                      <section>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-5 flex items-center gap-2">
                          <div className="w-4 h-0.5 bg-primary rounded-full" /> Room Details
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          {roomDetails.map((detail, i) => (
                            <div key={i} className="p-5 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 shadow-sm flex flex-col group hover:border-primary/20 transition-all">
                               <div className="flex items-center gap-2 mb-3">
                                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                                     <detail.icon size={14} />
                                  </div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{detail.label}</p>
                               </div>
                               <p className="text-sm font-black text-gray-900 dark:text-white uppercase px-1">{detail.value}</p>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Description */}
                      {(room as any).description && (
                        <section>
                          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center gap-2">
                            <div className="w-4 h-0.5 bg-primary rounded-full" /> About This Room
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium italic">
                            {(room as any).description}
                          </p>
                        </section>
                      )}

                      {/* Amenities */}
                      {(room as any).amenities && (room as any).amenities.length > 0 && (
                        <section>
                          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-5 flex items-center gap-2">
                            <div className="w-4 h-0.5 bg-primary rounded-full" /> Room Amenities
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {(room as any).amenities.map((a: any, i: number) => {
                              const rawAmenity = a.amenityType?.name || a;
                              let displayLabel = rawAmenity;
                              let customIconName = null;
                              
                              if (typeof rawAmenity === 'string' && rawAmenity.includes('|')) {
                                const parts = rawAmenity.split('|');
                                displayLabel = parts[0].trim();
                                customIconName = parts[1].trim();
                              }

                              const matchedAmenity = roomAmenities.find(
                                ra => ra.value === displayLabel || ra.label === displayLabel
                              );
                              
                              const DynamicIcon = customIconName ? (LucideIcons as any)[customIconName] : null;
                              const AmenityIcon = DynamicIcon || matchedAmenity?.icon || Check;

                              return (
                                <span key={i} className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                                  <AmenityIcon size={13} />
                                  {displayLabel}
                                </span>
                              );
                            })}
                          </div>
                        </section>
                      )}
                    </div>

                    {/* Right: Quick Management */}
                    <div className="lg:col-span-5">
                      <div className="bg-gray-50 dark:bg-white/5 rounded-[2rem] p-8 border border-gray-100 dark:border-white/5">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                          <Sparkles size={13} /> Quick Management
                        </h4>
                        
                        <div className="space-y-3">
                          {statusActions.map((action) => {
                            const isCurrentStatus = currentStatus === action.status;
                            const isUpdating = updatingStatus === action.status;
                            const Icon = action.icon;
                            return (
                              <button
                                key={action.status}
                                disabled={isCurrentStatus || !!updatingStatus}
                                onClick={() => handleStatusUpdate(action.status)}
                                className={cn(
                                  "w-full p-4 bg-white dark:bg-[#111827] rounded-2xl border flex items-center justify-between group transition-all shadow-sm",
                                  isCurrentStatus
                                    ? "border-primary/30 bg-primary/5 cursor-default"
                                    : cn("border-gray-100 dark:border-white/5", action.hoverBorder),
                                  !!updatingStatus && !isUpdating && "opacity-50 cursor-not-allowed"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", action.iconBg)}>
                                    {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                                    {action.label}
                                  </span>
                                </div>
                                {isCurrentStatus ? (
                                  <span className="text-[9px] font-black uppercase tracking-widest text-primary">Active</span>
                                ) : (
                                  <ChevronRight size={14} className={cn("text-gray-600 transition-colors", action.hoverChevron)} />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Room ID</span>
                            <span className="text-[10px] font-mono font-bold text-gray-500 truncate max-w-[120px]">{room.id}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Occupancy</span>
                            <span className="text-[10px] font-black text-primary flex items-center gap-1">
                              <Zap size={10} /> {room.availableSlots}/{room.capacity} Available
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer — matches property modal footer */}
                <div className="flex-shrink-0 px-8 py-5 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Last Updated</span>
                    <span className="text-[10px] font-black text-gray-600 dark:text-gray-300">
                      {new Date((room as any).updatedAt || (room as any).createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </span>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-2xl px-8 py-3 border border-gray-200 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

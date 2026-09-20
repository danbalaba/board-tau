'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronLeft, ChevronRight, Building2, Pencil, 
  DoorOpen, Users, Bed, ShowerHead, Utensils, Maximize2, 
  Clock, CheckCircle2, AlertCircle, Ban, Wrench, Sparkles,
  Layers, Zap, FileText, Camera, Loader2
} from 'lucide-react';
import { cn } from '@/utils/helper';
import SafeImage from '@/components/common/SafeImage';
import { getDynamicIcon } from "@/lib/iconResolver";
import { getRoomDetails } from '@/services/landlord/properties';
import { toast } from 'sonner';
import { getCachedAttributes, getCachedRoomTypes, getSyncAttributes, getSyncRoomTypes } from "@/lib/landlordTaxonomyCache";
import { Room } from '../hooks/use-room-logic';
import MediaPreviewOverlay from '@/components/common/MediaPreviewOverlay';

const CLEAN_BATHROOM_LABELS: Record<string, string> = {
  PRIVATE_CR: "Private Bathroom",
  PRIVATE: "Private Bathroom",
  SHARED_CR: "Shared Common CR",
  COMMON_CR: "Shared Common CR",
  COMMON: "Shared Common CR",
  SHARED: "Shared Common CR",
};

const CLEAN_KITCHEN_LABELS: Record<string, string> = {
  IN_UNIT: "Private In-Unit Kitchen",
  PRIVATE: "Private In-Unit Kitchen",
  PRIVATE_KITCHEN: "Private In-Unit Kitchen",
  SHARED: "Shared Compound Kitchen",
  SHARED_KITCHEN: "Shared Compound Kitchen",
  COMMUNAL: "Shared Compound Kitchen",
  COMMON: "Shared Compound Kitchen",
};

interface LandlordRoomDetailsModalProps {
  isOpen?: boolean;
  onClose: () => void;
  room: Room | null;
  rooms?: Room[];
  onEdit?: (room: Room) => void;
  onStatusChange?: (roomId: string, newStatus: string) => Promise<void>;
  onNavigateRoom?: (direction: 'prev' | 'next') => void;
  statusColors?: Record<string, string>;
  formatStatus?: (status: string) => string;
}

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-primary/90 text-white border-primary/40 shadow-lg shadow-primary/20",
  FULL: "bg-rose-500/90 text-white border-rose-400/50 shadow-lg shadow-rose-500/20",
  MAINTENANCE: "bg-amber-500/90 text-white border-amber-400/50 shadow-lg shadow-amber-500/20",
};

// Module-level in-memory cache for room details
const roomDetailsCache = new Map<string, any>();

export function clearRoomDetailsCache(roomId?: string) {
  if (roomId) {
    roomDetailsCache.delete(roomId);
  } else {
    roomDetailsCache.clear();
  }
}

export function LandlordRoomDetailsModal({
  isOpen = true,
  onClose,
  room: initialRoom,
  rooms = [],
  onEdit,
  onStatusChange,
  onNavigateRoom,
}: LandlordRoomDetailsModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(initialRoom);
  const [currentStatus, setCurrentStatus] = useState(initialRoom?.status || 'AVAILABLE');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SPECS' | 'AMENITIES' | 'PHOTOS'>('OVERVIEW');
  const [activeAmenitySubGroup, setActiveAmenitySubGroup] = useState<string>('ALL');
  const [mediaPreviewState, setMediaPreviewState] = useState<{ isOpen: boolean; index: number }>({ isOpen: false, index: 0 });

  const [attributesList, setAttributesList] = useState<any[]>(() => getSyncAttributes() || []);
  const [roomTypesList, setRoomTypesList] = useState<any[]>(() => getSyncRoomTypes() || []);

  const currentIndex = useMemo(() => {
    if (!room || !rooms.length) return -1;
    return rooms.findIndex((r) => r.id === room.id);
  }, [room, rooms]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < rooms.length - 1;

  useEffect(() => {
    if (initialRoom) {
      setRoom(initialRoom);
      setCurrentStatus(initialRoom.status);
    }
  }, [initialRoom]);

  useEffect(() => {
    if (!isOpen || !initialRoom?.id) {
      setMediaPreviewState({ isOpen: false, index: 0 });
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setCurrentImageIndex(0);
    setActiveTab('OVERVIEW');
    setActiveAmenitySubGroup('ALL');
    setMediaPreviewState({ isOpen: false, index: 0 });

    getCachedAttributes().then(attrs => { if (attrs && isMounted) setAttributesList(attrs); });
    getCachedRoomTypes().then(rts => { if (rts && isMounted) setRoomTypesList(rts); });

    const roomId = initialRoom.id;
    const cachedData = roomDetailsCache.get(roomId);

    if (cachedData) {
      setRoom(cachedData);
      setCurrentStatus(cachedData.status);

      // Fast loader transition for cache hit (100ms)
      const timer = setTimeout(() => {
        if (isMounted) setIsLoading(false);
      }, 100);

      // Silent background revalidation
      getRoomDetails(roomId)
        .then((fullRoomData: any) => {
          if (isMounted && fullRoomData) {
            roomDetailsCache.set(roomId, fullRoomData);
            setRoom(fullRoomData);
            setCurrentStatus(fullRoomData.status);
          }
        })
        .catch((err) => console.error("Silent room detail refresh failed:", err));

      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    } else {
      if (initialRoom) {
        setRoom(initialRoom);
        setCurrentStatus(initialRoom.status);
      }

      getRoomDetails(roomId)
        .then((fullRoomData: any) => {
          if (isMounted && fullRoomData) {
            roomDetailsCache.set(roomId, fullRoomData);
            setRoom(fullRoomData);
            setCurrentStatus(fullRoomData.status);
          }
        })
        .catch((err: any) => {
          console.error("Failed to load detailed room info:", err);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, initialRoom?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || mediaPreviewState.isOpen) return;
      if (e.key === 'Escape') {
        setMediaPreviewState({ isOpen: false, index: 0 });
        onClose();
      }
      if (e.key === 'ArrowLeft' && hasPrev) handlePrev();
      if (e.key === 'ArrowRight' && hasNext) handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, mediaPreviewState.isOpen, hasPrev, hasNext]);

  useEffect(() => {
    if (!isOpen) return;

    const body = document.body;
    const rootNode = document.documentElement;

    const originalOverflow = body.style.overflow;
    const originalPaddingRight = body.style.paddingRight;
    const originalTop = body.style.top;
    
    const wasFixed = body.classList.contains("fixed");
    const scrollTop = window.pageYOffset || rootNode.scrollTop || body.scrollTop;

    if (!wasFixed) {
      body.style.overflow = 'hidden';
      body.style.paddingRight = '17px';
      body.style.top = `-${scrollTop}px`;
      body.classList.add("fixed", "w-full");
    }

    return () => {
      if (!wasFixed) {
        body.style.overflow = originalOverflow;
        body.style.paddingRight = originalPaddingRight;
        body.style.top = originalTop;
        body.classList.remove("fixed", "w-full");
        if (scrollTop) {
          window.scrollTo(0, scrollTop);
        }
      }
    };
  }, [isOpen]);

  const handlePrev = () => {
    if (hasPrev && onNavigateRoom) onNavigateRoom('prev');
  };

  const handleNext = () => {
    if (hasNext && onNavigateRoom) onNavigateRoom('next');
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const imgs = room?.images || [];
    setCurrentImageIndex((prev) => (prev === 0 ? imgs.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const imgs = room?.images || [];
    setCurrentImageIndex((prev) => (prev === imgs.length - 1 ? 0 : prev + 1));
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!room || updatingStatus || newStatus === currentStatus) return;

    setUpdatingStatus(newStatus);
    try {
      if (onStatusChange) {
        await onStatusChange(room.id, newStatus);
      } else {
        const res = await fetch(`/api/landlord/rooms/${room.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) throw new Error('Failed to update room status');
      }
      setCurrentStatus(newStatus);
      setRoom((prev) => {
        if (!prev) return null;
        const updated = { ...prev, status: newStatus };
        if (prev.id) roomDetailsCache.set(prev.id, updated);
        return updated;
      });
      toast.success(`Unit status updated to ${newStatus === 'MAINTENANCE' ? 'Maintenance Mode' : newStatus}`);
    } catch (error) {
      toast.error("Failed to update status. Please try again.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const matchedRoomType = useMemo(() => {
    if (!room?.roomType) return null;
    const target = String(room.roomType).trim();
    return roomTypesList.find((rt: any) =>
      rt.id === target ||
      rt.code === target ||
      rt.name === target ||
      rt.name?.toLowerCase() === target.toLowerCase() ||
      rt.code?.toLowerCase() === target.toLowerCase() ||
      rt.id?.toLowerCase() === target.toLowerCase()
    );
  }, [room?.roomType, roomTypesList]);

  const roomTypeLabel = useMemo(() => {
    if (matchedRoomType?.name) return matchedRoomType.name;
    if (room?.roomType === 'SOLO') return 'Private Solo Room';
    if (room?.roomType === 'BEDSPACE') return 'Shared Bedspace';
    return room?.roomType || 'Standard Room';
  }, [matchedRoomType, room?.roomType]);

  const RoomTypeIcon = matchedRoomType?.icon ? getDynamicIcon(matchedRoomType.icon, Layers) : Layers;

  const resolveAmenityInfo = (amenityItem: any) => {
    let rawValue = typeof amenityItem === 'string'
      ? amenityItem
      : (amenityItem?.name || amenityItem?.attribute?.name || amenityItem?.label || amenityItem?.value || "Amenity");
    let customIconName: string | null = null;
    let attrId: string | null = typeof amenityItem === 'object'
      ? (amenityItem?.id || amenityItem?.attributeId || amenityItem?.attribute?.id)
      : null;

    if (typeof rawValue === 'string') {
      if (rawValue.includes('||')) {
        const parts = rawValue.split('||');
        rawValue = parts[0].trim();
        customIconName = parts[1].trim();
      } else if (rawValue.includes('|')) {
        const parts = rawValue.split('|');
        rawValue = parts[0].trim();
        customIconName = parts[1].trim();
      }
    }

    const cleanId = attrId ? (attrId.includes('|') ? attrId.split('|')[0] : attrId) : '';
    let cleanName = String(rawValue || '').trim();
    if (cleanName.toLowerCase() === 'undefined') cleanName = '';

    const matched = attributesList.find((a: any) =>
      (cleanId && (a.id === cleanId || a.value === cleanId || a._id === cleanId || a.code === cleanId || cleanId.startsWith(a.id + '|'))) ||
      (cleanName && (a.name === cleanName || a.name?.toLowerCase() === cleanName.toLowerCase() || a.id === cleanName || a.code === cleanName || a.value === cleanName))
    );

    const label = matched?.name || (cleanName && cleanName !== 'undefined' ? cleanName : "Amenity");
    const iconName = customIconName || matched?.icon || cleanName;
    const Icon = getDynamicIcon(iconName, CheckCircle2);

    return { label, Icon, matched };
  };

  const groupedAmenities = useMemo(() => {
    if (!room?.amenities || room.amenities.length === 0) return [];

    const SUBGROUP_METADATA: Record<string, { label: string; icon: string }> = {
      COOLING: { label: "Cooling & AC", icon: "Wind" },
      FURNITURE: { label: "Furniture & Storage", icon: "Sofa" },
      BATHROOM_FIX: { label: "Bathroom Features", icon: "ShowerHead" },
      KITCHEN_APP: { label: "Kitchen & Dining", icon: "Utensils" },
      UTILITIES: { label: "Utilities & Tech", icon: "Zap" },
      SAFETY: { label: "Safety & Security", icon: "Shield" },
      STORES: { label: "Room Comforts", icon: "Sparkles" },
    };

    const groupsMap: Record<string, { key: string; label: string; iconName: string; items: { label: string; Icon: React.ComponentType<any> }[] }> = {};

    room.amenities.forEach((a: any) => {
      const info = resolveAmenityInfo(a);
      if (!info.label || info.label.toLowerCase() === 'undefined') return;

      const matchedAttr = info.matched;
      const subKey = matchedAttr?.subGroupKey || matchedAttr?.subGroup || 'STORES';
      const meta = SUBGROUP_METADATA[subKey] || { label: "Room Comforts", icon: "Sparkles" };

      if (!groupsMap[subKey]) {
        groupsMap[subKey] = {
          key: subKey,
          label: meta.label,
          iconName: meta.icon,
          items: []
        };
      }
      if (!groupsMap[subKey].items.some(item => item.label === info.label)) {
        groupsMap[subKey].items.push({ label: info.label, Icon: info.Icon });
      }
    });

    return Object.values(groupsMap);
  }, [room?.amenities, attributesList]);

  const allAmenityItems = useMemo(() => {
    return groupedAmenities.flatMap(g => g.items);
  }, [groupedAmenities]);

  const formatBedSetup = (bedType?: string, bedCount?: number) => {
    if (!bedType) return 'Not Specified';
    const count = bedCount && bedCount > 0 ? bedCount : 1;
    let typeLabel = bedType;
    switch (bedType.toUpperCase()) {
      case 'SINGLE': typeLabel = 'Single Bed'; break;
      case 'DOUBLE': typeLabel = 'Double Bed'; break;
      case 'QUEEN': typeLabel = 'Queen Bed'; break;
      case 'BUNK': typeLabel = 'Bunk Bed'; break;
      default: typeLabel = bedType;
    }
    return `${count} ${typeLabel}${count > 1 ? 's' : ''}`;
  };

  if (!isOpen || !room) return null;

  const images = (room.images && room.images.length > 0) ? room.images : [];

  const formatStatus = (s: string) => {
    switch (s) {
      case 'AVAILABLE': return 'Available';
      case 'FULL': return 'Occupied (Full)';
      case 'MAINTENANCE': return 'Under Maintenance';
      default: return s;
    }
  };

  const statusActions = [
    { status: 'AVAILABLE', label: 'Set Available', icon: CheckCircle2, iconBg: 'bg-emerald-500/10 text-emerald-500', hoverBorder: 'hover:border-emerald-500/40', hoverChevron: 'group-hover:text-emerald-500' },
    { status: 'FULL', label: 'Mark as Full', icon: Ban, iconBg: 'bg-amber-500/10 text-amber-500', hoverBorder: 'hover:border-amber-500/40', hoverChevron: 'group-hover:text-amber-500' },
    { status: 'MAINTENANCE', label: 'Set Maintenance', icon: Wrench, iconBg: 'bg-rose-500/10 text-rose-500', hoverBorder: 'hover:border-rose-500/40', hoverChevron: 'group-hover:text-rose-500' },
  ];

  const stats = [
    { label: "Monthly Rate", value: `₱${room.price.toLocaleString()}`, icon: Clock, bg: "bg-primary/5 dark:bg-primary/10", border: "border-primary/20", color: "text-primary" },
    { label: "Total Capacity", value: `${room.capacity} ${room.capacity === 1 ? 'Guest' : 'Guests'}`, icon: Users, bg: "bg-blue-50/50 dark:bg-blue-500/5", border: "border-blue-100 dark:border-blue-500/20", color: "text-blue-600 dark:text-blue-400" },
    { label: "Available Slots", value: `${room.availableSlots} / ${room.capacity}`, icon: DoorOpen, bg: "bg-purple-50/50 dark:bg-purple-500/5", border: "border-purple-100 dark:border-purple-500/20", color: "text-purple-600 dark:text-purple-400" },
    { label: "Reservation Fee", value: room.reservationFee ? `₱${room.reservationFee.toLocaleString()}` : "None", icon: Sparkles, bg: "bg-amber-50/50 dark:bg-amber-500/5", border: "border-amber-100 dark:border-amber-500/20", color: "text-amber-600 dark:text-amber-400" },
  ];

  const kitchenSetupLabel = useMemo(() => {
    const rawSetup = (room as any)?.kitchenSetup || (room as any)?.kitchenType || (room as any)?.property?.kitchenSetup || (room as any)?.property?.kitchenType || (room as any)?.propertyConfig?.kitchenSetup || '';
    if (rawSetup === 'NONE' || rawSetup === 'NO_KITCHEN') return 'No Kitchen Facility';
    if (rawSetup) {
      return CLEAN_KITCHEN_LABELS[rawSetup] || (rawSetup.includes('IN_UNIT') || rawSetup.includes('PRIVATE') ? 'Private In-Unit Kitchen' : 'Shared Compound Kitchen');
    }
    if (room?.amenities && Array.isArray(room.amenities)) {
      const hasInUnitItem = room.amenities.some((a: any) => {
        const name = typeof a === 'string' ? a.toLowerCase() : (a?.name || a?.attribute?.name || '').toLowerCase();
        return name.includes('induction') || name.includes('kitchenette') || name.includes('private kitchen') || name.includes('in-unit kitchen') || name.includes('cooktop');
      });
      if (hasInUnitItem) return 'Private In-Unit Kitchen';
    }
    const propType = String((room as any)?.propertyType || (room as any)?.property?.propertyType || '').toUpperCase();
    if (propType.includes('APARTMENT') || propType.includes('FLAT') || propType.includes('CONDO')) {
      return 'Private In-Unit Kitchen';
    }
    return 'Shared Compound Kitchen';
  }, [room]);

  const roomDetails = [
    { label: "Unit Category", value: roomTypeLabel, icon: RoomTypeIcon },
    { label: "Bed Configuration", value: formatBedSetup(room.bedType, room.bedCount), icon: Bed },
    { label: "Bathroom Setup", value: CLEAN_BATHROOM_LABELS[room.bathroomArrangement || ''] || (room.bathroomArrangement?.includes('PRIVATE') ? 'Private Bathroom' : 'Shared Common CR'), icon: ShowerHead },
    ...(kitchenSetupLabel ? [{ label: "Kitchen Setup", value: kitchenSetupLabel, icon: Utensils }] : []),
    { label: "Floor Area Size", value: room.size ? `${room.size} sq.m.` : 'Not Specified', icon: Maximize2 },
  ];

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex items-center justify-center p-0 sm:p-6 bg-gray-900/40 dark:bg-gray-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-5xl h-full sm:h-[88vh] bg-white dark:bg-[#111827] rounded-none sm:rounded-[2.5rem] border-0 sm:border border-gray-100 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrollable Container */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {isLoading && !room ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-h-[75vh] flex flex-col items-center justify-center gap-6 p-8 text-center my-auto"
              >
                <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-xl shadow-primary/10" />
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse">Syncing Room Details...</p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Hero Gallery Banner */}
                <div 
                  className="relative h-52 sm:h-72 w-full overflow-hidden bg-gray-100 dark:bg-gray-900 group cursor-pointer"
                  onClick={() => {
                    if (images.length > 0) {
                      setMediaPreviewState({ isOpen: true, index: currentImageIndex });
                    }
                  }}
                >
                  {images.length > 0 ? (
                    <SafeImage
                      key={currentImageIndex}
                      src={typeof images[currentImageIndex] === 'string' ? (images[currentImageIndex] as string) : (images[currentImageIndex] as any)?.url}
                      alt={room.name}
                      priority={true}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                      <DoorOpen size={64} className="opacity-20 mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">No Photos Available</p>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent dark:from-gray-950 dark:via-gray-950/30" />
                  
                  {images.length > 1 && (
                    <>
                      <button 
                        onClick={handlePrevImage}
                        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/40 backdrop-blur-xl border border-white/10 text-white rounded-xl sm:rounded-2xl opacity-70 sm:opacity-40 group-hover:opacity-100 transition-all hover:bg-black/60 hover:scale-110 pointer-events-auto z-40"
                      >
                        <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                      </button>
                      <button 
                        onClick={handleNextImage}
                        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/40 backdrop-blur-xl border border-white/10 text-white rounded-xl sm:rounded-2xl opacity-70 sm:opacity-40 group-hover:opacity-100 transition-all hover:bg-black/60 hover:scale-110 pointer-events-auto z-40"
                      >
                        <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                      </button>
                    </>
                  )}

                  {/* Banner Content Overlay */}
                  <div className="absolute inset-0 p-4 sm:p-10 flex flex-col justify-between z-30">
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] uppercase font-black tracking-wider shadow-lg backdrop-blur-md border", 
                        statusColors[currentStatus] || statusColors.AVAILABLE
                      )}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        <span>{formatStatus(currentStatus)}</span>
                      </div>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setMediaPreviewState({ isOpen: false, index: 0 });
                          onClose();
                        }} 
                        className="p-2.5 sm:p-3 bg-black/30 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-all border border-white/20 z-50 shadow-2xl cursor-pointer"
                      >
                        <X size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <h3 className="text-2xl sm:text-4xl font-black text-white leading-tight drop-shadow-2xl tracking-tighter line-clamp-1">{room.name}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md w-fit px-3 py-1 rounded-xl border border-white/10 text-white/90 font-bold text-[10px] sm:text-xs">
                          <Building2 size={12} className="text-primary shrink-0" />
                          <span className="truncate">{room.propertyTitle}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-primary/80 backdrop-blur-md w-fit px-3 py-1 rounded-xl border border-primary/30 text-white font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-sm">
                          <RoomTypeIcon size={12} className="shrink-0" />
                          <span>{roomTypeLabel}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-Step Navigation Pills Bar */}
                <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-3 sm:px-10 py-2 sm:py-3 flex items-center gap-1.5 sm:gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shadow-sm">
                  {[
                    { id: 'OVERVIEW', label: '1. Overview', icon: Building2 },
                    { id: 'SPECS', label: '2. Specifications', icon: FileText },
                    { id: 'AMENITIES', label: `3. Amenities (${allAmenityItems.length})`, icon: Sparkles },
                    { id: 'PHOTOS', label: `4. Photos (${images.length})`, icon: Camera },
                  ].map(tab => {
                    const TabIcon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                          "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer select-none shrink-0",
                          isActive
                            ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]"
                            : "bg-gray-100/90 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/60 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/80 dark:hover:bg-gray-700"
                        )}
                      >
                        <TabIcon size={13} className="sm:w-3.5 sm:h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content Body */}
                <div className="p-4 sm:p-6 space-y-5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-6"
                    >
                      {/* TAB 1: OVERVIEW */}
                      {activeTab === 'OVERVIEW' && (
                        <div className="space-y-6">
                          {/* Key Metric Stats Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {stats.map((stat, i) => (
                              <div key={i} className={cn("p-5 rounded-[2rem] border hover:scale-[1.02] transition-transform shadow-sm flex flex-col justify-between", stat.bg, stat.border)}>
                                <div className={cn("w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center mb-3 shadow-sm border border-gray-100 dark:border-gray-700", stat.color)}>
                                  <stat.icon size={18} />
                                </div>
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                                  <p className="text-sm font-black text-gray-900 dark:text-white">{stat.value}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Quick Status Management Card */}
                          <div className="bg-gray-50/70 dark:bg-gray-800/40 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 flex items-center gap-2">
                                <Zap size={14} className="text-primary" />
                                Unit Availability & Maintenance
                              </h4>
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                Real-time slots: {room.availableSlots} / {room.capacity}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                              {/* Auto Status Badge Info */}
                              <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                                    currentStatus === 'AVAILABLE' ? "bg-primary/10 text-primary" :
                                    currentStatus === 'FULL' ? "bg-rose-500/10 text-rose-500" :
                                    "bg-amber-500/10 text-amber-500"
                                  )}>
                                    {currentStatus === 'MAINTENANCE' ? <Wrench size={16} /> : currentStatus === 'FULL' ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Current Unit State</p>
                                    <p className="text-xs font-black uppercase text-gray-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                                      <span>{formatStatus(currentStatus)}</span>
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Maintenance Mode Action Button */}
                              {currentStatus === 'MAINTENANCE' ? (
                                <button
                                  disabled={!!updatingStatus}
                                  onClick={() => {
                                    const restoredStatus = (room.availableSlots && room.availableSlots > 0) ? 'AVAILABLE' : 'FULL';
                                    handleStatusUpdate(restoredStatus);
                                  }}
                                  className="p-3.5 rounded-2xl border border-primary/30 dark:border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                                >
                                  {updatingStatus ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                                  <span>Resume Availability</span>
                                </button>
                              ) : (
                                <button
                                  disabled={!!updatingStatus}
                                  onClick={() => handleStatusUpdate('MAINTENANCE')}
                                  className="p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                                >
                                  {updatingStatus ? <Loader2 size={15} className="animate-spin" /> : <Wrench size={15} />}
                                  <span>Set Under Maintenance</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Description Section */}
                          {(room as any).description ? (
                            <div className="space-y-3">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 flex items-center gap-2">
                                <div className="w-3 h-0.5 bg-primary rounded-full" />
                                About This Unit
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium bg-gray-50 dark:bg-gray-800/40 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
                                {(room as any).description}
                              </p>
                            </div>
                          ) : (
                            <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800 text-gray-400">
                              <p className="text-xs font-bold uppercase tracking-wider">No custom unit description provided.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB 2: SPECIFICATIONS */}
                      {activeTab === 'SPECS' && (
                        <div className="space-y-6">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-primary rounded-full" />
                            Unit Specifications
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {roomDetails.map((detail, i) => (
                              <div key={i} className="p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 shadow-sm flex flex-col group hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-9 h-9 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                                    <detail.icon size={16} />
                                  </div>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{detail.label}</p>
                                </div>
                                <p className="text-sm font-black text-gray-900 dark:text-white uppercase leading-tight">{detail.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TAB 3: AMENITIES */}
                      {activeTab === 'AMENITIES' && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 flex items-center gap-2">
                              <div className="w-3 h-0.5 bg-primary rounded-full" />
                              Included Features & Amenities
                            </h4>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                              {allAmenityItems.length} Features
                            </span>
                          </div>

                          {groupedAmenities.length > 0 ? (
                            <div className="space-y-6">
                              {/* Sub-group category filter pills */}
                              {groupedAmenities.length > 1 && (
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                                  <button
                                    type="button"
                                    onClick={() => setActiveAmenitySubGroup("ALL")}
                                    className={cn(
                                      "px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 border",
                                      activeAmenitySubGroup === "ALL"
                                        ? "bg-primary text-white border-primary shadow-sm"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white border-transparent"
                                    )}
                                  >
                                    All ({allAmenityItems.length})
                                  </button>
                                  {groupedAmenities.map(group => {
                                    const isActive = activeAmenitySubGroup === group.key;
                                    const SubIcon = getDynamicIcon(group.iconName, Sparkles);
                                    return (
                                      <button
                                        key={group.key}
                                        type="button"
                                        onClick={() => setActiveAmenitySubGroup(group.key)}
                                        className={cn(
                                          "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 border",
                                          isActive
                                            ? "bg-primary text-white border-primary shadow-sm"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white border-transparent"
                                        )}
                                      >
                                        <SubIcon size={12} />
                                        <span>{group.label}</span>
                                        <span className={cn("px-1.5 py-0.2 rounded-md text-[9px]", isActive ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300")}>
                                          {group.items.length}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Categorized amenity sections */}
                              <div className="space-y-6">
                                {groupedAmenities
                                  .filter(group => activeAmenitySubGroup === "ALL" || activeAmenitySubGroup === group.key)
                                  .map(group => {
                                    const SubGroupIcon = getDynamicIcon(group.iconName, Sparkles);
                                    return (
                                      <div key={group.key} className="space-y-3">
                                        {groupedAmenities.length > 1 && activeAmenitySubGroup === "ALL" && (
                                          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                                            <SubGroupIcon size={14} className="text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                                              {group.label}
                                            </span>
                                          </div>
                                        )}
                                        <div className="flex flex-wrap gap-2.5">
                                          {group.items.map((item, i) => {
                                            const Icon = item.Icon;
                                            return (
                                              <div
                                                key={i}
                                                className="flex items-center gap-2.5 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary/40 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-800 dark:text-gray-200 shadow-sm"
                                              >
                                                <Icon size={14} className="text-primary shrink-0" />
                                                <span>{item.label}</span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          ) : (
                            <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800 text-gray-400">
                              <p className="text-xs font-bold uppercase tracking-wider">No specific amenities configured for this unit.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB 4: PHOTOS */}
                      {activeTab === 'PHOTOS' && (
                        <div className="space-y-6">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-primary rounded-full" />
                            Unit Photos ({images.length})
                          </h4>
                          {images.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                              {images.map((img: any, idx: number) => {
                                const url = typeof img === 'string' ? img : img.url;
                                return (
                                  <div
                                    key={idx}
                                    onClick={() => {
                                      setCurrentImageIndex(idx);
                                      setMediaPreviewState({ isOpen: true, index: idx });
                                    }}
                                    className={cn(
                                      "relative aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 group",
                                      currentImageIndex === idx ? "border-primary scale-105 shadow-xl shadow-primary/20" : "border-gray-100 dark:border-gray-800 hover:border-primary/50"
                                    )}
                                  >
                                    <SafeImage src={url} alt={`Photo ${idx + 1}`} />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="text-[9px] font-black uppercase text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">View</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="p-10 text-center bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800 text-gray-400">
                              <Camera size={36} className="mx-auto mb-2 opacity-30" />
                              <p className="text-xs font-bold uppercase tracking-wider">No photos available for this unit.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fixed Bottom Action Bar */}
        {Boolean(room) && (
          <div className="relative flex-shrink-0 px-6 sm:px-10 py-4 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-4 z-50">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">LAST SYNCHRONIZED:</span>
              <span className="text-[10px] font-black text-gray-700 dark:text-gray-300">
                {new Date((room as any).updatedAt || (room as any).createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </span>
            </div>

            {/* Pagination Controls embedded in exact footer center */}
            {rooms.length > 1 && (
              <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-auto">
                <button
                  onClick={handlePrev}
                  disabled={!hasPrev}
                  className={cn(
                    "p-2.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 text-gray-700 dark:text-gray-300 shadow-sm transition-all cursor-pointer",
                    !hasPrev ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/10 hover:text-primary hover:border-primary/30 active:scale-95"
                  )}
                  title="Previous Unit"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="px-4 py-2 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 dark:text-gray-300 shadow-sm">
                  {currentIndex + 1} / {rooms.length}
                </div>
                <button
                  onClick={handleNext}
                  disabled={!hasNext}
                  className={cn(
                    "p-2.5 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 text-gray-700 dark:text-gray-300 shadow-sm transition-all cursor-pointer",
                    !hasNext ? "opacity-30 cursor-not-allowed" : "hover:bg-primary/10 hover:text-primary hover:border-primary/30 active:scale-95"
                  )}
                  title="Next Unit"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              {!room.isArchived && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEdit) onEdit(room);
                  }}
                  className="rounded-2xl px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-primary/20"
                >
                  <Pencil size={14} />
                  <span>EDIT UNIT DETAILS</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Full-Screen Image Preview Overlay */}
        {mediaPreviewState.isOpen && (
          <MediaPreviewOverlay
            isOpen={mediaPreviewState.isOpen}
            onClose={() => setMediaPreviewState(prev => ({ ...prev, isOpen: false }))}
            images={images.map((img: any) => typeof img === 'string' ? img : img.url)}
            currentIndex={mediaPreviewState.index}
            onNavigate={(idx) => setMediaPreviewState(prev => ({ ...prev, index: idx }))}
            title={`${room.name} Photos`}
          />
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
}

export default LandlordRoomDetailsModal;

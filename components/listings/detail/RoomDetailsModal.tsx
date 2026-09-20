'use client';

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X, ChevronLeft, ChevronRight, MessageSquare, Ban, Wrench,
  CheckCircle2, Users, Maximize2, Layers,
  DoorOpen, Clock, Bed, ShowerHead, Utensils, Star, Sparkles,
  ArrowRight, Shield, Zap, Camera, Building2, FileText
} from "lucide-react";
import { getDynamicIcon } from "@/lib/iconResolver";
import { formatCleanTitle } from "@/lib/utils";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { cn } from "@/utils/helper";
import SafeImage from "@/components/common/SafeImage";
import MediaPreviewOverlay from "@/components/common/MediaPreviewOverlay";
import {
  getCachedAttributes,
  getCachedRoomTypes,
  getSyncAttributes,
  getSyncRoomTypes
} from "@/lib/landlordTaxonomyCache";

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
  NONE: "No Kitchen Facility",
  NO_KITCHEN: "No Kitchen Facility",
};

interface Room {
  id: string;
  name: string;
  price: number;
  capacity: number;
  availableSlots: number;
  images: {
    id: string;
    url: string;
    caption?: string;
    order?: number;
  }[];
  roomType: string;
  status: string;
  description?: string;
  size?: number;
  bedType?: string;
  bedCount?: number;
  bathroomArrangement?: string;
  kitchenSetup?: string;
  kitchenType?: string;
  amenities?: string[];
  reservationFee: number;
  imageSrc?: string;
  listing?: any;
  property?: any;
  propertyConfig?: any;
  propertyType?: any;
}

interface RoomDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  listingName: string;
  onInquire?: () => void;
  user?: any;
}

// ── Animation Variants ───────────────────────────────────────
const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.2 } },
  exit:   { opacity: 0, transition: { duration: 0.15 } },
};

const panelVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 15 },
  show:   { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.2, ease: "easeOut" } },
  exit:   { opacity: 0, scale: 0.98, y: 15, transition: { duration: 0.15 } },
};

// ── Attribute item type ──────────────────────────────────────
interface AttributeItem {
  label: string;
  value: string;
  icon: React.ComponentType<any>;
}

// ── Component ────────────────────────────────────────────────
const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({
  isOpen, onClose, room, listingName, onInquire, user,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AMENITIES' | 'PHOTOS'>('OVERVIEW');
  const [activeAmenityCategory, setActiveAmenityCategory] = useState<string>("ALL");
  const [mediaPreviewState, setMediaPreviewState] = useState<{ isOpen: boolean; index: number }>({ isOpen: false, index: 0 });

  const [attributesList, setAttributesList] = useState<any[]>(() => getSyncAttributes() || []);
  const [roomTypesList, setRoomTypesList] = useState<any[]>(() => getSyncRoomTypes() || []);

  const images = (room.images && room.images.length > 0) ? room.images : (room.imageSrc ? [{ id: 'seed', url: room.imageSrc }] : []);
  const isAvailable = room.status === "AVAILABLE";

  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  useEffect(() => {
    if (!isOpen) {
      setMediaPreviewState({ isOpen: false, index: 0 });
      return;
    }
    getCachedAttributes().then(attrs => { if (attrs) setAttributesList(attrs); });
    getCachedRoomTypes().then(rts => { if (rts) setRoomTypesList(rts); });
    setActiveTab("OVERVIEW");
    setActiveAmenityCategory("ALL");
    setMediaPreviewState({ isOpen: false, index: 0 });

    return () => {
      setMediaPreviewState({ isOpen: false, index: 0 });
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || mediaPreviewState.isOpen) return;
      if (e.key === 'Escape') {
        setMediaPreviewState({ isOpen: false, index: 0 });
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, mediaPreviewState.isOpen, onClose]);

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

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(p => (p === 0 ? images.length - 1 : p - 1));
  };
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(p => (p === images.length - 1 ? 0 : p + 1));
  };

  // Dynamic Room Type resolution
  const matchedRoomType = useMemo(() => {
    if (!room.roomType) return null;
    const target = String(room.roomType).trim();
    return roomTypesList.find((rt: any) =>
      rt.id === target ||
      rt.code === target ||
      rt.name === target ||
      rt.name?.toLowerCase() === target.toLowerCase() ||
      rt.code?.toLowerCase() === target.toLowerCase() ||
      rt.id?.toLowerCase() === target.toLowerCase()
    );
  }, [room.roomType, roomTypesList]);

  const roomTypeLabel = useMemo(() => {
    if (matchedRoomType?.name) return matchedRoomType.name;
    if (room.roomType === 'SOLO') return 'Private Solo Room';
    if (room.roomType === 'BEDSPACE') return 'Shared Bedspace';
    return room.roomType;
  }, [matchedRoomType, room.roomType]);

  const RoomTypeIcon = matchedRoomType?.icon ? getDynamicIcon(matchedRoomType.icon, Layers) : Layers;

  // Dynamic Amenity resolution helper
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
    if (cleanName.toLowerCase() === 'undefined') {
      cleanName = '';
    }

    const matched = attributesList.find((a: any) =>
      (cleanId && (a.id === cleanId || a.value === cleanId || a._id === cleanId || a.code === cleanId || cleanId.startsWith(a.id + '|'))) ||
      (cleanName && (a.name === cleanName || a.name?.toLowerCase() === cleanName.toLowerCase() || a.id === cleanName || a.code === cleanName || a.value === cleanName))
    );

    const label = matched?.name || (cleanName && cleanName !== 'undefined' ? cleanName : "Amenity");
    const iconName = customIconName || matched?.icon || cleanName;
    const Icon = getDynamicIcon(iconName, CheckCircle2);

    return { label, Icon, matched };
  };

  // Group room amenities dynamically by sub-group category
  const groupedAmenities = useMemo(() => {
    if (!room.amenities || room.amenities.length === 0) return [];

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
  }, [room.amenities, attributesList]);

  // All amenities flattened for the "ALL" tab
  const allAmenityItems = useMemo(() => {
    return groupedAmenities.flatMap(g => g.items);
  }, [groupedAmenities]);

  // Bed setup label helper
  const formatBedSetup = (bedType?: string, bedCount?: number) => {
    if (!bedType) return undefined;
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

  const kitchenSetupLabel = useMemo(() => {
    const rawSetup = (room as any)?.kitchenSetup || (room as any)?.kitchenType || (room as any)?.listing?.kitchenSetup || (room as any)?.listing?.kitchenType || (room as any)?.listing?.businessInfo?.kitchenSetup || (room as any)?.property?.kitchenSetup || (room as any)?.property?.kitchenType || (room as any)?.propertyConfig?.kitchenSetup || '';
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
    const propType = String((room as any)?.propertyType || (room as any)?.property?.propertyType || (room as any)?.listing?.propertyType || '').toUpperCase();
    if (propType.includes('APARTMENT') || propType.includes('FLAT') || propType.includes('CONDO')) {
      return 'Private In-Unit Kitchen';
    }
    return 'Shared Compound Kitchen';
  }, [room]);

  const bathroomLabel = useMemo(() => {
    const rawArrangement = (room as any)?.bathroomArrangement || (room as any)?.bathroomSetup || (room as any)?.listing?.bathroomSetup || (room as any)?.property?.bathroomSetup || '';
    if (rawArrangement) {
      return CLEAN_BATHROOM_LABELS[rawArrangement] || (rawArrangement.includes('PRIVATE') ? 'Private Bathroom' : 'Shared Common CR');
    }
    return 'Shared Common CR';
  }, [room]);

  const cardAttributes: AttributeItem[] = [
    { label: "Capacity",   value: `${room.capacity} ${room.capacity === 1 ? 'Guest' : 'Guests'}`,   icon: Users },
    { label: "Open Slots", value: `${room.availableSlots} / ${room.capacity}`, icon: DoorOpen },
    { label: "Room Size",  value: room.size ? `${room.size} sq.m.` : "Standard Size", icon: Maximize2 },
    { label: "Bed Setup",  value: formatBedSetup(room.bedType, room.bedCount) || `${room.bedType || 'Standard Bed'}`, icon: Bed },
    { label: "Bathroom",   value: bathroomLabel,             icon: ShowerHead },
    { label: "Kitchen",    value: kitchenSetupLabel,          icon: Utensils },
  ];

  if (!mounted || !isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="room-modal-backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          className="fixed inset-0 z-[10500] flex items-center justify-center p-4 md:p-8 bg-gray-900/40 dark:bg-gray-950/80 backdrop-blur-md"
          onClick={onClose}
        >
          {/* Ambient glow orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

          <motion.div
            key="room-modal-panel"
            variants={panelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* ── HERO IMAGE GALLERY ─────────────────── */}
            <div 
              className="relative h-64 sm:h-80 flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-900 group cursor-pointer"
              onClick={() => {
                if (images.length > 0) {
                  setMediaPreviewState({ isOpen: true, index: currentImageIndex });
                }
              }}
            >
              <AnimatePresence mode="wait">
                {images.length > 0 ? (
                  <SafeImage
                    key={currentImageIndex}
                    src={images[currentImageIndex]?.url}
                    alt={room.name}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                    <DoorOpen size={64} className="opacity-20 mb-3" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">No Photos Available</p>
                  </div>
                )}
              </AnimatePresence>

              {/* Gradient overlays adaptive to theme */}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-gray-900" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-white/40 dark:from-gray-900/40 dark:to-gray-900/40" />

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={handlePrev} className="absolute left-5 top-1/2 -translate-y-1/2 p-3 bg-white/50 dark:bg-black/30 hover:bg-white dark:hover:bg-black/60 backdrop-blur-md text-gray-900 dark:text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 duration-300 shadow-xl">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={handleNext} className="absolute right-5 top-1/2 -translate-y-1/2 p-3 bg-white/50 dark:bg-black/30 hover:bg-white dark:hover:bg-black/60 backdrop-blur-md text-gray-900 dark:text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 duration-300 shadow-xl">
                    <ChevronRight size={18} />
                  </button>
                  {/* Navigation dots + Counter merged at bottom center */}
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-white/50 dark:bg-black/25 backdrop-blur-md rounded-full shadow-md z-10 border border-white/10">
                    <div className="flex gap-1.5">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={e => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                          className={cn("h-1 rounded-full transition-all duration-500", idx === currentImageIndex ? "w-6 bg-primary" : "w-1.5 bg-gray-400 dark:bg-white/30 hover:bg-gray-600 dark:hover:bg-white/50")}
                        />
                      ))}
                    </div>
                    <div className="w-px h-3 bg-gray-400/30 dark:bg-white/20" />
                    <span className="text-[9px] font-black text-gray-800 dark:text-white/70 tracking-widest whitespace-nowrap">
                      {currentImageIndex + 1} / {images.length}
                    </span>
                  </div>
                </>
              )}

              {/* Status badge */}
              <div className="absolute top-5 left-5">
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-xl shadow-xl border",
                  isAvailable
                    ? "bg-[#2f7d6d] text-white border-white/30"
                    : room.status === "MAINTENANCE"
                    ? "bg-amber-600 text-white border-white/30"
                    : "bg-rose-600 text-white border-white/30"
                )}>
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {isAvailable ? "Available" : room.status === "FULL" ? "Full" : "Under Maintenance"}
                </div>
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 flex gap-2 px-5 pb-4 pt-10 overflow-x-auto scrollbar-hide bg-gradient-to-t from-white dark:from-gray-900 to-transparent">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      onClick={e => {
                        e.stopPropagation();
                        setCurrentImageIndex(idx);
                        setMediaPreviewState({ isOpen: true, index: idx });
                      }}
                      className={cn(
                        "flex-shrink-0 w-14 h-10 rounded-xl overflow-hidden border-2 transition-all duration-300",
                        idx === currentImageIndex ? "border-primary scale-110 shadow-lg shadow-primary/30" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <SafeImage src={img.url} alt="" />
                    </button>
                  ))}
                </div>
              )}

              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMediaPreviewState({ isOpen: false, index: 0 });
                  onClose();
                }}
                className="absolute top-5 right-5 p-3 bg-white/90 dark:bg-black/60 hover:bg-rose-500 hover:text-white backdrop-blur-xl text-gray-900 dark:text-white rounded-full transition-all duration-300 hover:scale-110 shadow-xl z-20 border border-white/10 cursor-pointer"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* ── SCROLLABLE BODY ───────────────────── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                
                {/* LEFT — Main Content */}
                <div className="lg:col-span-2 p-6 sm:p-8 space-y-6 border-r border-gray-100 dark:border-gray-800">

                  {/* Room Title + Price Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.25em] flex items-center gap-2">
                        <Sparkles size={10} className="opacity-70" />
                        {formatCleanTitle(listingName)}
                      </p>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-wider">
                        <RoomTypeIcon size={13} />
                        <span>{roomTypeLabel}</span>
                      </div>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                      {formatCleanTitle(room.name)}
                    </h2>

                    <div className="flex items-center gap-3 pt-1 flex-wrap">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-gray-900 dark:text-white">₱{room.price.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">/mo</span>
                      </div>
                      {room.reservationFee > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[9px] font-black uppercase tracking-widest">
                          <Clock size={10} />
                          ₱{room.reservationFee.toLocaleString()} reservation
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sub-Navigation Tabs Bar */}
                  <div className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {[
                      { id: 'OVERVIEW', label: 'Overview', icon: Building2 },
                      { id: 'AMENITIES', label: `Included Features (${allAmenityItems.length})`, icon: Sparkles },
                      { id: 'PHOTOS', label: `Photo Gallery (${images.length})`, icon: Camera },
                    ].map(tab => {
                      const TabIcon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id as any)}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 border select-none",
                            isActive
                              ? "bg-primary text-white border-primary shadow-md shadow-primary/20 scale-[1.02]"
                              : "bg-gray-100/80 dark:bg-gray-800/80 border-gray-200/60 dark:border-gray-700/60 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/80 dark:hover:bg-gray-700"
                          )}
                        >
                          <TabIcon size={14} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Body Section */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="space-y-6"
                    >
                      {/* TAB 1: OVERVIEW */}
                      {activeTab === 'OVERVIEW' && (
                        <div className="space-y-6">
                          {/* Attribute Cards Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {cardAttributes.map((attr, i) => (
                              <div
                                key={i}
                                className="p-4 rounded-3xl bg-gray-50 dark:bg-gray-800/50 flex flex-col gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 border border-transparent"
                              >
                                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-primary shadow-sm">
                                  <attr.icon size={18} />
                                </div>
                                <div>
                                  <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">{attr.label}</p>
                                  <p className="text-xs font-black uppercase leading-tight text-gray-900 dark:text-white">{attr.value}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Description Section */}
                          {room.description && (
                            <div className="space-y-3 pt-2">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 flex items-center gap-2">
                                <div className="w-3 h-0.5 bg-primary rounded-full" />
                                About This Room
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium bg-gray-50 dark:bg-gray-800/40 p-5 rounded-3xl border border-gray-100 dark:border-gray-800">
                                {room.description}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB 2: INCLUDED FEATURES (AMENITIES) */}
                      {activeTab === 'AMENITIES' && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 flex items-center gap-2">
                              <div className="w-3 h-0.5 bg-primary rounded-full" />
                              What's Included in This Room
                            </h4>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                              {allAmenityItems.length} {allAmenityItems.length === 1 ? 'Feature' : 'Features'}
                            </span>
                          </div>

                          {groupedAmenities.length > 0 ? (
                            <div className="space-y-6">
                              {/* Category Filter Pills */}
                              {groupedAmenities.length > 1 && (
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                                  <button
                                    type="button"
                                    onClick={() => setActiveAmenityCategory("ALL")}
                                    className={cn(
                                      "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 border",
                                      activeAmenityCategory === "ALL"
                                        ? "bg-primary text-white border-primary shadow-sm"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white border-transparent"
                                    )}
                                  >
                                    All ({allAmenityItems.length})
                                  </button>
                                  {groupedAmenities.map(group => {
                                    const isActive = activeAmenityCategory === group.key;
                                    const SubIcon = getDynamicIcon(group.iconName, Sparkles);
                                    return (
                                      <button
                                        key={group.key}
                                        type="button"
                                        onClick={() => setActiveAmenityCategory(group.key)}
                                        className={cn(
                                          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 border",
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

                              {/* Categorized Feature Cards */}
                              <div className="space-y-5">
                                {groupedAmenities
                                  .filter(group => activeAmenityCategory === "ALL" || activeAmenityCategory === group.key)
                                  .map(group => {
                                    const SubGroupIcon = getDynamicIcon(group.iconName, Sparkles);
                                    return (
                                      <div key={group.key} className="space-y-2.5">
                                        {groupedAmenities.length > 1 && activeAmenityCategory === "ALL" && (
                                          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-1.5">
                                            <SubGroupIcon size={13} className="text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                                              {group.label}
                                            </span>
                                          </div>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                          {group.items.map((item, i) => {
                                            const Icon = item.Icon;
                                            return (
                                              <div
                                                key={i}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-primary/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-200 hover:text-primary transition-all duration-300 cursor-default shadow-sm"
                                              >
                                                <Icon size={13} className="text-primary shrink-0" />
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
                              <p className="text-xs font-bold uppercase tracking-wider">No specific features listed for this room.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB 3: PHOTO GALLERY */}
                      {activeTab === 'PHOTOS' && (
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-primary rounded-full" />
                            All Room Photos ({images.length})
                          </h4>
                          {images.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {images.map((img: any, idx: number) => {
                                const url = typeof img === 'string' ? img : img.url;
                                return (
                                  <div
                                    key={idx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCurrentImageIndex(idx);
                                      setMediaPreviewState({ isOpen: true, index: idx });
                                    }}
                                    className={cn(
                                      "relative aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 group",
                                      currentImageIndex === idx ? "border-primary scale-105 shadow-xl shadow-primary/20" : "border-gray-100 dark:border-gray-800 hover:border-primary/50"
                                    )}
                                  >
                                    <SafeImage src={url} alt={`Room Photo ${idx + 1}`} />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="text-[9px] font-black uppercase text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">View Photo</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="p-10 text-center bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-800 text-gray-400">
                              <Camera size={36} className="mx-auto mb-2 opacity-30" />
                              <p className="text-xs font-bold uppercase tracking-wider">No photo gallery available.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* RIGHT — Sticky Action Panel */}
                <div className="lg:col-span-1 p-6 sm:p-8 flex flex-col gap-6">
                  {/* Price recap card */}
                  <div className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Monthly Rate</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white mb-4">₱{room.price.toLocaleString()}</p>
                    <div className="h-px bg-gray-200 dark:bg-gray-700 mb-4" />
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                      <span className="text-gray-500">Slots open</span>
                      <span className={cn("font-black", isAvailable ? "text-primary" : "text-rose-500")}>
                        {room.availableSlots}/{room.capacity}
                      </span>
                    </div>
                    {room.reservationFee > 0 && (
                      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest mt-3">
                        <span className="text-gray-500">Reservation</span>
                        <span className="text-primary font-black">₱{room.reservationFee.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Trust badges */}
                  <div className="space-y-2.5">
                    {[
                      { icon: Shield, label: "Verified Listing", desc: "Reviewed by BoardTAU" },
                      { icon: Zap,    label: "Quick Response",   desc: "Landlord is active"   },
                      { icon: Star,   label: "Trusted Space",    desc: "Community rated"       },
                    ].map((badge, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm"
                      >
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <badge.icon size={14} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-900 dark:text-white uppercase tracking-widest">{badge.label}</p>
                          <p className="text-[8px] text-gray-500 font-bold">{badge.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3 mt-auto pt-4">
                    {room.status === "MAINTENANCE" ? (
                      <button
                        disabled
                        className="w-full py-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed border border-amber-200/60 dark:border-amber-500/20"
                      >
                        <Wrench size={16} />
                        Under Maintenance
                      </button>
                    ) : user && isAvailable ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onInquire}
                        className="w-full py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-2 border-b-4 border-primary/30 active:border-b-0 transition-all group cursor-pointer"
                      >
                        <MessageSquare size={16} />
                        Send Inquiry
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </motion.button>
                    ) : !isAvailable ? (
                      <button
                        disabled
                        className="w-full py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-400 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        <Ban size={16} />
                        No Vacancy
                      </button>
                    ) : (
                      <button
                        onClick={onInquire}
                        className="w-full py-4 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-center px-4 border border-primary/20 cursor-pointer"
                      >
                        <Shield size={14} />
                        Sign in to Inquire
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMediaPreviewState({ isOpen: false, index: 0 });
                        onClose();
                      }}
                      className="w-full py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <X size={13} /> Close
                    </button>
                  </div>
                </div>
              </div>
            </div>

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
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default RoomDetailsModal;

'use client';

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X, ChevronLeft, ChevronRight, MessageSquare, Ban,
  CheckCircle2, Users, Maximize2, Layers,
  DoorOpen, Clock, Bed, ShowerHead, Star, Sparkles,
  ArrowRight, Shield, Zap
} from "lucide-react";
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { roomAmenities, BATHROOM_ARRANGEMENT_LABELS } from "@/data/roomAmenities";
import { cn } from "@/utils/helper";
import SafeImage from "@/components/common/SafeImage";

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
  amenities?: string[];
  reservationFee: number;
  imageSrc?: string;
}

interface RoomDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  listingName: string;
  onInquire?: () => void;
  user?: any;
}

// ── Easing helper ────────────────────────────────────────────
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ── Animation Variants ───────────────────────────────────────
const backdropVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.3 } },
  exit:   { opacity: 0, transition: { duration: 0.25 } },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 30 },
  show:   { opacity: 1, scale: 1,    y: 0,  transition: { type: "spring" as const, stiffness: 280, damping: 28, delay: 0.05 } },
  exit:   { opacity: 0, scale: 0.97, y: 20, transition: { duration: 0.2 } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.4 } },
};

const chipVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  show:   { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 400, damping: 22 } },
};

// ── Attribute item type ──────────────────────────────────────
interface AttributeItem {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

// ── Component ────────────────────────────────────────────────
const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({
  isOpen, onClose, room, listingName, onInquire, user,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const images = (room.images && room.images.length > 0) ? room.images : (room.imageSrc ? [{ id: 'seed', url: room.imageSrc }] : []);
  const isAvailable = room.status === "AVAILABLE";

  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);
  useEffect(() => {
    if (!isOpen) return;

    const body = document.body;
    const rootNode = document.documentElement;

    // Save current inline styles to restore them later
    const originalOverflow = body.style.overflow;
    const originalPaddingRight = body.style.paddingRight;
    const originalTop = body.style.top;
    
    // Check if the body is already fixed (e.g. by another modal)
    const wasFixed = body.classList.contains("fixed");
    const scrollTop = window.pageYOffset || rootNode.scrollTop || body.scrollTop;

    if (!wasFixed) {
      body.style.overflow = 'hidden';
      body.style.paddingRight = '17px'; // Compensate for scrollbar
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

  const attributes: AttributeItem[] = [
    { label: "Capacity",   value: `${room.capacity} Pax`,   icon: Users },
    { label: "Room Type",  value: room.roomType,             icon: Layers },
    { label: "Open Slots", value: `${room.availableSlots} / ${room.capacity}`, icon: DoorOpen },
    ...(room.size            ? [{ label: "Room Size", value: `${room.size} sq.m.`, icon: Maximize2 }] : []),
    ...(room.bedType         ? [{ label: "Bed Setup", value: `${room.bedType}${room.bedCount ? ` × ${room.bedCount}` : ""}`, icon: Bed }] : []),
    ...(room.bathroomArrangement ? [{ label: "Bathroom", value: BATHROOM_ARRANGEMENT_LABELS[room.bathroomArrangement] || room.bathroomArrangement, icon: ShowerHead }] : []),
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
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-8 bg-gray-900/40 dark:bg-gray-950/80 backdrop-blur-md"
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
            <div className="relative h-64 sm:h-80 flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-900 group">
              <AnimatePresence mode="wait">
                {images.length > 0 ? (
                  <SafeImage
                    key={currentImageIndex}
                    src={images[currentImageIndex]?.url}
                    alt={room.name}
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600"
                  >
                    <DoorOpen size={64} className="opacity-20 mb-3" />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">No Photos Available</p>
                  </motion.div>
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
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 25 }}
                className="absolute top-5 left-5"
              >
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-xl shadow-xl",
                  isAvailable
                    ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                    : "bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300"
                )}>
                  <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isAvailable ? "bg-emerald-500 dark:bg-emerald-400" : "bg-rose-500 dark:bg-rose-400")} />
                  {isAvailable ? "Available" : room.status === "FULL" ? "Full" : "Maintenance"}
                </div>
              </motion.div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="absolute bottom-0 left-0 right-0 flex gap-2 px-5 pb-4 pt-10 overflow-x-auto scrollbar-hide bg-gradient-to-t from-white dark:from-gray-900 to-transparent">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      onClick={e => { e.stopPropagation(); setCurrentImageIndex(idx); }}
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

              {/* Close button — positioned at top-right now that counter is moved */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-3 bg-white/90 dark:bg-black/60 hover:bg-rose-500 hover:text-white backdrop-blur-xl text-gray-900 dark:text-white rounded-full transition-all duration-300 hover:scale-110 shadow-xl z-20 border border-white/10"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* ── SCROLLABLE BODY ───────────────────── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 lg:grid-cols-3 gap-0"
              >
                {/* LEFT — Main Content */}
                <div className="lg:col-span-2 p-7 sm:p-10 space-y-10 border-r border-gray-100 dark:border-gray-800">

                  {/* Room Title + Price */}
                  <motion.div variants={fadeUp} className="space-y-2">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.25em] flex items-center gap-2">
                      <Sparkles size={10} className="opacity-70" />
                      {listingName}
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                      {room.name}
                    </h2>
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-black text-gray-900 dark:text-white">₱{room.price.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">/mo</span>
                      </div>
                      {room.reservationFee > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest">
                          <Clock size={10} />
                          ₱{room.reservationFee.toLocaleString()} reservation
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Attribute Cards (No borders) */}
                  <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {attributes.map((attr, i) => (
                      <motion.div
                        key={i}
                        variants={fadeUp}
                        whileHover={{ scale: 1.03, y: -2 }}
                        className="p-4 rounded-3xl bg-gray-50 dark:bg-gray-800/50 flex flex-col gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-primary shadow-sm">
                          <attr.icon size={18} />
                        </div>
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">{attr.label}</p>
                          <p className="text-xs font-black uppercase leading-tight text-gray-900 dark:text-white">{attr.value}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Description */}
                  {room.description && (
                    <motion.div variants={fadeUp} className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 flex items-center gap-2">
                        <div className="w-3 h-0.5 bg-primary rounded-full" />
                        About This Room
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                        {room.description}
                      </p>
                    </motion.div>
                  )}

                  {/* Amenities */}
                  {room.amenities && room.amenities.length > 0 && (
                    <motion.div variants={fadeUp} className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 flex items-center gap-2">
                        <div className="w-3 h-0.5 bg-primary rounded-full" />
                        What's Included
                      </h4>
                      <motion.div variants={stagger} className="flex flex-wrap gap-2">
                        {room.amenities.map((a: any, i) => {
                          const amenityValue = typeof a === 'string' ? a : (a.amenityType?.name || "Amenity");
                          
                          // Parse the "Label|Icon" format
                          let displayLabel = amenityValue;
                          let customIconName = null;
                          if (typeof amenityValue === 'string' && amenityValue.includes('|')) {
                             const parts = amenityValue.split('|');
                             displayLabel = parts[0].trim();
                             customIconName = parts[1].trim();
                          }

                          const matched = roomAmenities.find(ra => ra.value === displayLabel || ra.label === displayLabel);
                          
                          // Priority: 1. Custom Icon from pipe, 2. Matched static icon, 3. Fallback
                          const DynamicIcon = customIconName ? (LucideIcons as any)[customIconName] : null;
                          const AmenityIcon = DynamicIcon || matched?.icon || CheckCircle2;
                          
                          return (
                            <motion.div
                              key={i}
                              variants={chipVariants}
                              whileHover={{ scale: 1.05, y: -1 }}
                              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-primary/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:text-primary transition-all duration-300 cursor-default shadow-sm"
                            >
                              <AmenityIcon size={13} className="text-primary" />
                              {displayLabel}
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </motion.div>
                  )}
                </div>

                {/* RIGHT — Sticky Action Panel */}
                <motion.div
                  variants={fadeIn}
                  className="lg:col-span-1 p-7 sm:p-8 flex flex-col gap-6"
                >
                  {/* Price recap */}
                  <div className="p-6 rounded-3xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Monthly Rate</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white mb-4">₱{room.price.toLocaleString()}</p>
                    <div className="h-px bg-gray-200 dark:bg-gray-700 mb-4" />
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                      <span className="text-gray-500">Slots open</span>
                      <span className={cn("font-black", isAvailable ? "text-emerald-500" : "text-rose-500")}>
                        {room.availableSlots}/{room.capacity}
                      </span>
                    </div>
                    {room.reservationFee > 0 && (
                      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest mt-3">
                        <span className="text-gray-500">Reservation</span>
                        <span className="text-primary">₱{room.reservationFee.toLocaleString()}</span>
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
                      <motion.div
                        key={i}
                        variants={fadeUp}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm"
                      >
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <badge.icon size={14} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-900 dark:text-white uppercase tracking-widest">{badge.label}</p>
                          <p className="text-[8px] text-gray-500 font-bold">{badge.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3 mt-auto pt-4">
                    {user && isAvailable ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onInquire}
                        className="w-full py-4 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-2 border-b-4 border-primary/30 active:border-b-0 transition-all group"
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
                      <div className="py-4 rounded-2xl bg-primary/10 text-primary font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 text-center px-4">
                        <Shield size={14} />
                        Sign in to Inquire
                      </div>
                    )}

                    <button
                      onClick={onClose}
                      className="w-full py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <X size={13} /> Close
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default RoomDetailsModal;

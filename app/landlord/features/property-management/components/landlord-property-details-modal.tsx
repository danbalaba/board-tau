'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useIsClient } from '@/hooks/useIsClient';
import { 
  Building2, 
  Pencil, 
  Eye, 
  Bath, 
  X, 
  MapPin, 
  Banknote, 
  LayoutGrid,
  Bed,
  Users,
  Tag,
  Check,
  Maximize,
  Receipt,
  Award,
  UserRound,
  PawPrint,
  Cigarette,
  ShieldCheck,
  Cctv,
  Flame,
  Bus,
  Book,
  Calendar,
  Sparkles,
  Camera,
  DoorOpen,
  Wifi,
  Wind,
  Utensils,
  Shirt,
  Car,
  Dumbbell,
  Tv,
  Waves,
  BookOpen,
  Landmark,
  Droplets,
  Zap,
  Shield,
  Focus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/utils/helper';
import Button from '@/components/common/Button';
import { Property } from '../hooks/use-property-logic';
import SafeImage from '@/components/common/SafeImage';

interface PropertyDetailsModalProps {
  property: Property;
  onClose: () => void;
  statusColors: Record<string, string>;
  formatStatus: (status: string) => string;
  properties?: Property[];
  onNavigate?: (property: Property) => void;
}

const AMENITY_ICONS: Record<string, any> = {
  'WiFi': Wifi,
  'Air Conditioning': Wind,
  'Kitchen': Utensils,
  'LaundryArea': Shirt,
  'Parking': Car,
  'Security': ShieldCheck,
  'Gym': Dumbbell,
  'TV': Tv,
  'Pool': Waves,
  'Study Area': BookOpen,
  'Balcony': Landmark,
  'Water': Droplets,
  'Electricity': Zap,
  'Cleaning': Sparkles,
};

export function LandlordPropertyDetailsModal({
  property,
  onClose,
  statusColors,
  formatStatus,
  properties = [],
  onNavigate
}: PropertyDetailsModalProps) {
  const isClient = useIsClient();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  
  // Group images by category
  const categorizedImages = property.images?.reduce((acc: Record<string, string[]>, img: any) => {
    const cat = img.roomType || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(img.url);
    return acc;
  }, {}) || {};

  const { scrollY } = useScroll({ 
    container: container ? { current: container } : undefined 
  });
  const [isLoading, setIsLoading] = useState(true);
  // Gallery lightbox state: tracks the full image list, current index, and category label
  const [galleryPreview, setGalleryPreview] = useState<{ images: string[]; index: number; category: string } | null>(null);
  const [currentBannerImageIndex, setCurrentBannerImageIndex] = useState(0);

  // Collect all unique images for the banner gallery
  const bannerImages = Array.from(new Set([
    ...(property.imageSrc ? [property.imageSrc] : []),
    ...(property.images?.map((img: any) => img.url) || [])
  ]));

  const handleNextBannerImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentBannerImageIndex((prev) => (prev + 1) % bannerImages.length);
  };

  const handlePrevBannerImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentBannerImageIndex((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

  useEffect(() => {
    setCurrentBannerImageIndex(0);
  }, [property.id]);

  // Lightbox navigation helpers
  const openGallery = (images: string[], index: number, category: string) => {
    setGalleryPreview({ images, index, category });
  };

  const closeGallery = () => setGalleryPreview(null);

  const galleryNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setGalleryPreview(prev => prev ? { ...prev, index: (prev.index + 1) % prev.images.length } : null);
  };

  const galleryPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setGalleryPreview(prev => prev ? { ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length } : null);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && container) {
      container.scrollTop = 0;
    }
  }, [isLoading, container]);

  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalStyle || ''; };
  }, []);

  const currentIndex = properties.findIndex(p => p.id === property.id);
  const hasNext = currentIndex !== -1 && currentIndex < properties.length - 1;
  const hasPrev = currentIndex > 0;

  const handleNext = () => {
    if (hasNext && onNavigate) {
      onNavigate(properties[currentIndex + 1]);
      if (container) container.scrollTop = 0;
    }
  };

  const handlePrev = () => {
    if (hasPrev && onNavigate) {
      onNavigate(properties[currentIndex - 1]);
      if (container) container.scrollTop = 0;
    }
  };

  // Use a ref to store navigation functions for the keyboard effect to keep its dependency array stable
  const navigationRef = useRef({ handleNext, handlePrev, onClose });

  // Update the ref on every render to ensure it has the latest closures
  useEffect(() => {
    navigationRef.current = { handleNext, handlePrev, onClose };
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (galleryPreview) {
        if (e.key === 'Escape') closeGallery();
        if (e.key === 'ArrowRight') galleryNext();
        if (e.key === 'ArrowLeft') galleryPrev();
        return;
      }
      
      if (e.key === 'Escape') navigationRef.current.onClose();
      if (e.key === 'ArrowRight') navigationRef.current.handleNext();
      if (e.key === 'ArrowLeft') navigationRef.current.handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryPreview]); // Dependency array size remains 1

  // Simplified animations that don't cause layout shifts
  const headerContentOpacity = useTransform(scrollY, [0, 100], [1, 0]);
  const compactHeaderOpacity = useTransform(scrollY, [100, 150], [0, 1]);
  const bannerTranslateY = useTransform(scrollY, [0, 200], [0, -40]);
  const bannerScale = useTransform(scrollY, [0, 200], [1, 1.05]);

  const renderAmenity = (ca: string) => {
    const [label, iconName] = ca.includes('|') ? ca.split('|') : [ca, 'Tag'];
    const Icon = AMENITY_ICONS[label.replace(/\s/g, '')] || (LucideIcons as any)[iconName] || Tag;
    return (
      <span key={ca} className="px-3 py-1.5 rounded-xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100/50 dark:border-blue-500/10 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2 transition-all hover:bg-blue-100 dark:hover:bg-blue-500/10 shadow-sm">
        <Icon size={12} className="opacity-70" />
        {label}
      </span>
    );
  };

  const renderCustomTag = (ct: string, colorClass: string, fallbackIcon: any) => {
    const [label, iconName] = ct.includes('|') ? ct.split('|') : [ct, ''];
    const Icon = (LucideIcons as any)[iconName] || fallbackIcon;
    return (
      <div key={ct} className={cn("flex items-center justify-between p-3.5 rounded-2xl border transition-all bg-white dark:bg-gray-900 shadow-sm", colorClass)}>
        <div className="flex items-center gap-3">
          <Icon size={16} className="opacity-70" />
          <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </div>
        <Check size={14} className="text-emerald-500" />
      </div>
    );
  };

  if (!isClient) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-gray-900/40 dark:bg-gray-950/80 backdrop-blur-sm" 
      />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 40 }} className="relative bg-white dark:bg-[#111827] rounded-[2.5rem] border border-gray-100 dark:border-white/10 max-w-6xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] antialiased">
        <div ref={setContainer} className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar scroll-smooth">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[60vh] flex flex-col items-center justify-center gap-6"
            >
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-xl shadow-primary/10" />
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">Syncing Environment</p>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
              {/* STABLE STICKY ANCHOR - Fixed at compact height to prevent layout jumps */}
              <div className="sticky top-0 w-full h-[110px] z-[40] pointer-events-none">
                
                {/* Full Banner - Absolute but visible beyond parent bounds initially */}
                <motion.div 
                  style={{ opacity: headerContentOpacity, height: 280, scale: bannerScale, y: bannerTranslateY }} 
                  className="absolute top-0 left-0 w-full overflow-hidden origin-top group pointer-events-auto"
                >
                  <AnimatePresence mode="wait">
                    {bannerImages.length > 0 ? (
                      <SafeImage 
                        key={currentBannerImageIndex}
                        src={bannerImages[currentBannerImageIndex]} 
                        alt={property.title} 
                        priority={true} 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                        <Building2 size={64} className="text-gray-300 dark:text-gray-700" />
                      </div>
                    )}
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent dark:from-gray-950 dark:via-gray-950/20" />
                  
                  {bannerImages.length > 1 && (
                    <>
                      <button 
                        onClick={handlePrevBannerImage}
                        className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-black/40 backdrop-blur-xl border border-white/10 text-white rounded-2xl opacity-40 group-hover:opacity-100 transition-all hover:bg-black/60 hover:scale-110 pointer-events-auto z-50"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button 
                        onClick={handleNextBannerImage}
                        className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-black/40 backdrop-blur-xl border border-white/10 text-white rounded-2xl opacity-40 group-hover:opacity-100 transition-all hover:bg-black/60 hover:scale-110 pointer-events-auto z-50"
                      >
                        <ChevronRight size={20} />
                      </button>

                      {/* Dots Indicator */}
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-2 bg-black/20 backdrop-blur-md rounded-full border border-white/5 z-50">
                        {bannerImages.map((_, idx) => (
                          <div 
                            key={idx} 
                            className={cn(
                              "h-1 transition-all duration-500 rounded-full",
                              currentBannerImageIndex === idx ? "w-6 bg-primary" : "w-1.5 bg-white/30"
                            )}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  
                  {/* Full Header Content */}
                  <div className="absolute inset-0 p-10 flex flex-col justify-between z-40">
                    <div className="flex items-start justify-between">
                      <div className={cn(
                        "inline-flex items-center px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-xl shadow-2xl", 
                        statusColors[property.status]?.replace('/10', '/90') || "bg-gray-900/90 text-white border-white/20"
                      )}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse mr-2" />
                        {formatStatus(property.status)}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-2xl tracking-tighter">{property.title}</h3>
                      <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md w-fit px-3 py-1.5 rounded-xl border border-white/10 text-white/90 font-bold text-sm">
                        <MapPin size={16} className="text-primary" /><span>{property.region}, {property.country}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Compact Header Overlay - Fades in as banner fades out */}
                <motion.div 
                  style={{ opacity: compactHeaderOpacity }} 
                  className="absolute inset-0 bg-white/90 dark:bg-gray-900/95 backdrop-blur-2xl border-b border-gray-100 dark:border-gray-800 flex items-center px-10"
                >
                  <div className="flex items-center gap-4">
                    {bannerImages[currentBannerImageIndex] ? (
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xl">
                        <SafeImage src={bannerImages[currentBannerImageIndex]} alt={property.title} />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 border-2 border-white shadow-xl"><Building2 size={20} /></div>
                    )}
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">Property Preview</p>
                       <p className="text-lg font-black text-gray-900 dark:text-white truncate max-w-md">{property.title}</p>
                    </div>
                  </div>
                </motion.div>
                
                <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-black/20 hover:bg-black/50 backdrop-blur-md rounded-full text-white transition-all border border-white/20 z-50 shadow-2xl pointer-events-auto"><X size={20} /></button>
              </div>

              {/* Spacer to push content down below the 280px initial banner height */}
              <div className="h-[170px] w-full flex-shrink-0" />

              <div className="p-8 md:p-10 z-10">
                {/* Highlights Row - Full Width with Tenant Consistency */}
                {(() => {
                  const totalAvailable = property.rooms?.reduce((acc: number, r: any) => acc + (r.availableSlots || 0), 0) || 0;
                  return (
                    <section className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-12">
                      {[
                        { 
                          label: 'Rent Starts At', 
                          value: (
                            <div className="flex items-baseline gap-1">
                              <span>₱{(property.price || 0).toLocaleString()}</span>
                              <span className="text-[10px] font-bold text-gray-400">/ mo</span>
                            </div>
                          ), 
                          icon: Banknote, 
                          color: 'text-primary', 
                          bg: 'bg-primary/5' 
                        },
                        { label: 'Total Units', value: property.rooms?.length || property.roomCount, icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/5' },
                        { label: 'Avail. Slots', value: `${totalAvailable} Guests`, icon: DoorOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
                        { label: 'Bathrooms', value: property.bathroomCount, icon: Bath, color: 'text-purple-500', bg: 'bg-purple-500/5' },
                      ].map((item, i) => (
                        <div key={i} className={cn("p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 hover:scale-[1.02] transition-transform shadow-sm flex flex-col", item.bg)}>
                          <div className={cn("w-10 h-10 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center mb-3 shadow-sm border border-gray-100 dark:border-gray-700", item.color)}><item.icon size={18} /></div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{item.label}</p>
                          <div className="text-sm font-black text-gray-900 dark:text-white truncate">{item.value}</div>
                        </div>
                      ))}
                    </section>
                  );
                })()}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-7 space-y-12">
                    <section>
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-5 flex items-center gap-2"><div className="w-4 h-0.5 bg-primary rounded-full" />About this property</h4>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base font-medium break-words whitespace-pre-wrap">{property.description || "No description provided."}</p>
                    </section>

                    {/* SHARED AMENITIES */}
                    {(property as any).amenities_list?.length > 0 && (
                      <section>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-5 flex items-center gap-2"><div className="w-4 h-0.5 bg-primary rounded-full" />Shared Amenities</h4>
                        <div className="flex flex-wrap gap-2.5">
                           {(property as any).amenities_list.map((a: string) => renderAmenity(a))}
                        </div>
                      </section>
                    )}

                    {/* PROPERTY GALLERY */}
                    {Object.keys(categorizedImages).length > 0 && (
                      <section>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2"><div className="w-4 h-0.5 bg-primary rounded-full" />Property Gallery</h4>
                        <div className="space-y-10 mb-12">
                          {Object.entries(categorizedImages).map(([category, images]) => (
                            <div key={category} className="space-y-4">
                              <div className="flex items-center justify-between px-1">
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                  <LayoutGrid size={12} className="text-primary" />
                                  {category}
                                </h5>
                                <span className="text-[9px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 px-3 py-1 rounded-full uppercase tracking-tighter">{images.length} Photos</span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {(images as string[]).map((url, idx) => (
                                  <div 
                                    key={idx} 
                                    onClick={() => openGallery(images as string[], idx, category)}
                                    className="group relative aspect-video rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all cursor-pointer"
                                  >
                                    <SafeImage src={url} alt={`${category} ${idx + 1}`} />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                                      <Eye size={24} className="text-white" />
                                      {(images as string[]).length > 1 && (
                                        <span className="absolute bottom-2 right-2 text-[9px] font-black text-white/80 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                          {idx + 1} / {(images as string[]).length}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    <section>
                      <div className="flex items-center justify-between mb-8">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2"><div className="w-4 h-0.5 bg-primary rounded-full" />Room Details</h4>
                        <span className="text-[10px] font-black bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-500 uppercase tracking-widest">{property.rooms?.length || 0} Units</span>
                      </div>
                      <div className="grid grid-cols-1 gap-5">
                        {property.rooms?.map((room) => (
                          <Link 
                            key={room.id} 
                            href={`/landlord/rooms?roomId=${room.id}`}
                            className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 hover:border-primary/30 transition-all shadow-sm hover:shadow-md cursor-pointer"
                          >
                            <div 
                              className={cn("w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 relative", room.images?.[0]?.url ? "cursor-pointer" : "")}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const roomImgs = room.images?.map((i: any) => i.url).filter(Boolean) || [];
                                if (roomImgs.length > 0) openGallery(roomImgs, 0, room.name || 'Room');
                              }}
                            >
                              {room.images?.[0]?.url ? (<SafeImage src={room.images?.[0].url} alt={room.name} />) : (<div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-300"><Bed size={24} /></div>)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-4 mb-2">
                                <h5 className="font-black text-gray-900 dark:text-white text-sm truncate uppercase tracking-wide">{room.name || 'Unnamed Unit'}</h5>
                                <span className="text-primary font-black text-sm">₱{(room.price || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 mb-3">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400"><Users size={12} className="text-blue-500" /><span>Capacity: {room.capacity} Slots</span></div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400"><Check size={12} className="text-green-500" /><span>Available: {room.availableSlots}</span></div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400"><Bed size={12} className="text-purple-500" /><span>{room.bedType} Bed</span></div>
                                {room.size && (<div className="flex items-center gap-1 text-[10px] font-bold text-gray-400"><Maximize size={12} className="text-orange-500" /><span>{room.size} sqm</span></div>)}
                                <div className="flex items-center gap-1 text-[10px] font-bold text-teal-500 uppercase tracking-widest bg-teal-50 dark:bg-teal-500/10 px-2 py-0.5 rounded-lg border border-teal-100 dark:border-teal-500/20">{room.roomType}</div>
                              </div>
                              {/* UNIT AMENITIES */}
                              {room.amenities?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {room.amenities.map((amenity: any, idx: number) => {
                                        const rawLabel = typeof amenity === 'string' ? amenity : (amenity.amenityType?.name || "Amenity");
                                        let label = rawLabel;
                                        let customIconName = null;

                                        if (rawLabel.includes('|')) {
                                          const parts = rawLabel.split('|');
                                          label = parts[0].trim();
                                          customIconName = parts[1].trim();
                                        }

                                        const Icon = AMENITY_ICONS[label.replace(/\s/g, '')] || (customIconName ? (LucideIcons as any)[customIconName] : null) || Tag;
                                        return (
                                          <div key={idx} className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/5 dark:bg-white/5 border border-blue-500/10 dark:border-white/5 rounded-lg text-[8px] font-black text-blue-600 dark:text-gray-400 uppercase tracking-widest">
                                            <Icon size={10} className="text-primary/70" />
                                            {label}
                                          </div>
                                        );
                                    })}
                                </div>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="lg:col-span-5 space-y-10">
                    <section className="bg-gray-50/80 dark:bg-gray-800/80 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800/50 shadow-sm">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2"><Award size={14} />Rules & Preferences</h4>
                      <div className="space-y-3">
                        {[
                          { key: 'femaleOnly', label: 'Female Only', icon: UserRound, active: property.rules?.femaleOnly },
                          { key: 'maleOnly', label: 'Male Only', icon: UserRound, active: property.rules?.maleOnly },
                          { key: 'visitorsAllowed', label: 'Visitors Allowed', icon: Users, active: property.rules?.visitorsAllowed },
                          { key: 'petsAllowed', label: 'Pets Allowed', icon: PawPrint, active: property.rules?.petsAllowed },
                          { key: 'smokingAllowed', label: 'Smoking Allowed', icon: Cigarette, active: property.rules?.smokingAllowed },
                          { key: 'noCurfew', label: 'No Curfew Enforced', icon: Calendar, active: property.rules?.noCurfew },
                        ].map((rule) => (
                          <div key={rule.key} className={cn("flex items-center justify-between p-3.5 rounded-2xl border transition-all", rule.active ? "bg-white dark:bg-gray-900 border-rose-100/50 dark:border-rose-500/20 text-gray-900 dark:text-white shadow-sm" : "bg-transparent border-gray-200/50 dark:border-gray-700/50 text-gray-400 opacity-50")}>
                            <div className="flex items-center gap-3"><rule.icon size={16} className={rule.active ? "text-rose-500" : "text-gray-400"} /><span className="text-[10px] font-black uppercase tracking-widest">{rule.label}</span></div>
                            {rule.active ? (<Check size={14} className="text-emerald-500" />) : (<X size={14} className="text-gray-300" />)}
                          </div>
                        ))}
                        {/* CUSTOM RULES */}
                        {property.rules?.customRules?.map((r: string) => renderCustomTag(r, "border-rose-100/50 dark:border-rose-500/20 text-rose-600 dark:text-rose-400", ShieldCheck))}
                      </div>
                    </section>

                    <section className="bg-gray-50/80 dark:bg-gray-800/80 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-800/50 shadow-sm">
                       <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2"><Sparkles size={14} />Security & Features</h4>
                       <div className="grid grid-cols-1 gap-3">
                         {[
                           { label: '24/7 Security', icon: ShieldCheck, active: property.features?.security24h },
                           { label: 'CCTV Cameras', icon: Camera, active: property.features?.cctv },
                           { label: 'Fire Safety', icon: Flame, active: property.features?.fireSafety },
                           { label: 'Near Transport', icon: Bus, active: property.features?.nearTransport },
                           { label: 'Flood-Free Area', icon: Waves, active: property.features?.floodFree },
                           { label: 'Backup Power', icon: Zap, active: property.features?.backupPower },
                         ].map((feat) => feat.active && (
                           <div key={feat.label} className="flex items-center justify-between p-3.5 bg-white dark:bg-gray-900 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/20 shadow-sm">
                             <div className="flex items-center gap-3">
                               <feat.icon size={16} className="text-emerald-500" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">{feat.label}</span>
                             </div>
                             <Check size={14} className="text-emerald-500" />
                           </div>
                         ))}
                         {/* CUSTOM FEATURES */}
                         {property.features?.customFeatures?.map((f: string) => renderCustomTag(f, "border-amber-100/50 dark:border-amber-500/20 text-amber-600 dark:text-amber-400", Sparkles))}
                       </div>
                    </section>
                  </div>
                </div>
              </div>
            </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fixed Footer */}
        {!isLoading && (
          <div className="flex-shrink-0 px-8 py-5 bg-white dark:bg-gray-900/50 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 z-50">
             <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Last Updated</span>
              <span className="text-[10px] font-black text-gray-500 dark:text-gray-300">{new Date(property.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
            </div>
            <div className="flex items-center gap-3">
              {!(property as any).isArchived && (
                <Link href={`/landlord/properties/${property.id}/edit`}>
                  <button className="rounded-2xl px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-primary/20">
                    <Pencil size={14} />
                    Full Property Editor
                  </button>
                </Link>
              )}
              <button
                onClick={onClose}
                className="rounded-2xl px-8 py-3 border border-gray-200 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Image Lightbox Overlay */}
      <AnimatePresence>
        {galleryPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-gray-900/40 dark:bg-gray-950/80 backdrop-blur-sm p-4 sm:p-8"
            onClick={closeGallery}
          >
            {/* Close button */}
            <button
              onClick={(e) => { e.stopPropagation(); closeGallery(); }}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all border border-white/20 shadow-2xl z-50"
            >
              <X size={24} />
            </button>

            {/* Category label + counter */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
              <span className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest text-white">
                {galleryPreview.category}
              </span>
              <span className="px-3 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black text-white/70">
                {galleryPreview.index + 1} / {galleryPreview.images.length}
              </span>
            </div>

            {/* Prev button */}
            {galleryPreview.images.length > 1 && (
              <button
                onClick={galleryPrev}
                className={cn(
                  "absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 transition-all shadow-2xl z-50 group",
                  galleryPreview.index === 0 && "opacity-30 cursor-not-allowed"
                )}
                disabled={galleryPreview.index === 0}
              >
                <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
              </button>
            )}

            {/* Image */}
            <motion.div
              key={galleryPreview.index}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-gray-900"
              onClick={(e) => e.stopPropagation()}
            >
              <SafeImage src={galleryPreview.images[galleryPreview.index]} alt="Preview" fill={true} />
            </motion.div>

            {/* Next button */}
            {galleryPreview.images.length > 1 && (
              <button
                onClick={galleryNext}
                className={cn(
                  "absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 transition-all shadow-2xl z-50 group",
                  galleryPreview.index === galleryPreview.images.length - 1 && "opacity-30 cursor-not-allowed"
                )}
                disabled={galleryPreview.index === galleryPreview.images.length - 1}
              >
                <ChevronRight size={28} className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {/* Dot indicators */}
            {galleryPreview.images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-50">
                {galleryPreview.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setGalleryPreview(prev => prev ? { ...prev, index: i } : null); }}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === galleryPreview.index ? "w-8 bg-primary" : "w-2 bg-white/30 hover:bg-white/60"
                    )}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      {!isLoading && properties.length > 1 && (
        <>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-[100] hidden xl:block">
            <button
              onClick={handlePrev}
              disabled={!hasPrev}
              className={cn(
                "p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 transition-all shadow-2xl group",
                !hasPrev && "opacity-0 pointer-events-none"
              )}
            >
              <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[100] hidden xl:block">
            <button
              onClick={handleNext}
              disabled={!hasNext}
              className={cn(
                "p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 transition-all shadow-2xl group",
                !hasNext && "opacity-0 pointer-events-none"
              )}
            >
              <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          {/* Mobile Navigation Bar */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 xl:hidden">
            <button
              onClick={handlePrev}
              disabled={!hasPrev}
              className={cn(
                "p-3 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-100 dark:border-white/10 shadow-2xl transition-all",
                !hasPrev ? "opacity-30 cursor-not-allowed" : "active:scale-90"
              )}
            >
              <ChevronLeft size={20} className="text-gray-900 dark:text-white" />
            </button>
            <div className="px-4 py-2 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-100 dark:border-white/10 shadow-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              {currentIndex + 1} / {properties.length}
            </div>
            <button
              onClick={handleNext}
              disabled={!hasNext}
              className={cn(
                "p-3 rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-100 dark:border-white/10 shadow-2xl transition-all",
                !hasNext ? "opacity-30 cursor-not-allowed" : "active:scale-90"
              )}
            >
              <ChevronRight size={20} className="text-gray-900 dark:text-white" />
            </button>
          </div>
        </>
      )}
    </div>,
    document.body
  );
}

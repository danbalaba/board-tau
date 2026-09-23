"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getDynamicIcon } from "@/lib/iconResolver";
import { 
  ArrowLeft, 
  CheckCircle2, 
  MapPin, 
  DoorOpen, 
  Star, 
  ShieldCheck, 
  FileText, 
  Sparkles, 
  User as UserIcon, 
  UserCheck,
  BadgeCheck, 
  AlertTriangle, 
  Wifi, 
  Car, 
  Waves, 
  Dumbbell, 
  Wind, 
  WashingMachine, 
  Utensils, 
  Refrigerator, 
  Microwave, 
  Droplets, 
  Zap, 
  Clock, 
  Users, 
  Flame, 
  PawPrint, 
  Camera, 
  BookOpen, 
  Square, 
  Blinds, 
  ChevronLeft, 
  ChevronRight,
  ListChecks,
  Shield,
  Layers,
  Lock,
  Ban,
  Wine,
  Maximize2,
  Building2
} from "lucide-react";
import SafeImage from "../common/SafeImage";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/navigation';
// @ts-ignore
import 'swiper/css/pagination';
import Link from "next/link";
import { formatPrice, calculateAverageRating } from "@/utils/helper";
import Avatar from "@/components/common/Avatar";
import { SharedAmenitiesModal } from "@/components/common/SharedAmenitiesModal";
import {
  getCachedPropertyTypes,
  getCachedAttributes,
  getCachedSubGroups,
  getSyncPropertyTypes,
  getSyncAttributes,
  getSyncSubGroups
} from "@/lib/landlordTaxonomyCache";

interface SidebarDetailViewProps {
  listing: any;
  onBack: () => void;
}

export default function SidebarDetailView({ listing, onBack }: SidebarDetailViewProps) {
  const price = listing.price || 0;

  // Taxonomy Cache State
  const [propertyTypes, setPropertyTypes] = useState<any[]>(() => getSyncPropertyTypes() || []);
  const [attributes, setAttributes] = useState<any[]>(() => getSyncAttributes() || []);
  const [dbSubGroups, setDbSubGroups] = useState<any[]>(() => getSyncSubGroups() || []);

  const [amenitiesModalConfig, setAmenitiesModalConfig] = useState<{
    isOpen: boolean;
    initialCategory: 'ALL' | 'AMENITIES' | 'RULES' | 'SECURITY';
  }>({
    isOpen: false,
    initialCategory: 'ALL'
  });

  useEffect(() => {
    getCachedPropertyTypes().then(pts => { if (pts) setPropertyTypes(pts); });
    getCachedAttributes().then(attrs => { if (attrs) setAttributes(attrs); });
    getCachedSubGroups().then(sgs => { if (sgs) setDbSubGroups(sgs); });
  }, []);

  const resolvePropertyTypeName = useCallback((typeInput: any) => {
    if (!typeInput) return 'Boarding House';
    if (typeof typeInput === 'object' && typeInput !== null) {
      if (typeInput.name) return typeInput.name;
      if (typeInput.label) return typeInput.label;
      if (typeInput.title) return typeInput.title;
    }
    const typeId = typeof typeInput === 'string' ? typeInput : (typeInput?.id || typeInput?.code || '');
    if (!typeId) return 'Boarding House';

    const matched = propertyTypes.find(t => 
      t.id === typeId || 
      t.value === typeId || 
      t._id === typeId || 
      t.code === typeId ||
      t.name?.toLowerCase() === typeId?.toLowerCase()
    );
    if (matched) return matched.name || matched.label || matched.title;
    if (!/^[a-f0-9]{24}$/i.test(typeId)) return typeId.replace(/_/g, ' ').replace(/-/g, ' ');
    return 'Boarding House';
  }, [propertyTypes]);

  const categoryVal = useMemo(() => {
    return resolvePropertyTypeName(
      listing.propertyType || 
      listing.propertyTypeId || 
      listing.category || 
      listing.categories?.[0]?.category
    );
  }, [listing, resolvePropertyTypeName]);

  const resolveAmenityName = useCallback((attrId: string) => {
    if (!attrId) return '';
    const cleanId = attrId.includes('|') ? attrId.split('|')[0] : attrId;
    const matched = attributes.find(a => 
      a.id === cleanId || 
      a.value === cleanId || 
      a._id === cleanId || 
      a.code === cleanId || 
      cleanId.startsWith(a.id + '|')
    );
    if (matched) return matched.name || matched.label || matched.title;
    if (!/^[a-f0-9]{24}$/i.test(cleanId)) return cleanId.replace(/_/g, ' ').replace(/-/g, ' ');
    return cleanId;
  }, [attributes]);

  const getItemIcon = useCallback((name: string, attrId?: string, explicitIcon?: string) => {
    const inputStr = (explicitIcon && explicitIcon !== 'Sparkles' && explicitIcon !== 'Sparkle')
      ? `${name}|${explicitIcon}`
      : name;

    return getDynamicIcon(inputStr, Sparkles);
  }, []);

  const getImageUrl = (img: any) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    if (typeof img.url === 'string') return img.url;
    if (typeof img.imageUrl === 'string') return img.imageUrl;
    if (typeof img.getUrl === 'function') return img.getUrl();
    if (typeof img.imageSrc === 'string') return img.imageSrc;
    if (typeof img.src === 'string') return img.src;
    return null;
  };

  const allImages = useMemo(() => {
    let images: string[] = [];
    if (listing.imageSrc) images.push(getImageUrl(listing.imageSrc));
    
    const galleryImages = listing.images || [];
    if (galleryImages.length > 0) {
      const gUrls = galleryImages.map(getImageUrl).filter(Boolean);
      images = [...images, ...gUrls];
    }
    
    return Array.from(new Set(images));
  }, [listing]);

  // Dynamic Subgroup Categorization of Shared Amenities
  const groupedAmenitiesBySubGroup = useMemo(() => {
    const rawAmenities: string[] = [
      ...(Array.isArray(listing.amenities_list) ? listing.amenities_list : []),
      ...(Array.isArray(listing.amenities) ? listing.amenities : []),
      ...(Array.isArray(listing.listingLinks) ? listing.listingLinks.map((l: any) => l.attribute?.id || l.attributeId).filter(Boolean) : []),
    ];

    const RULE_SUBGROUPS = new Set(['GENDER_POLICY', 'CURFEW', 'VISITOR_POLICY', 'PET_POLICY', 'SMOKING_POLICY', 'ALCOHOL_POLICY', 'SMOKE_ALCOHOL', 'HOUSE_RULES', 'POLICY']);
    const SECURITY_SUBGROUPS = new Set(['SECURITY', 'DISASTER_SAFETY', 'DISASTER_PREP', 'SAFETY', 'FIRE_SAFETY']);

    const subGroupMap: Record<string, { key: string; label: string; items: { id: string; name: string }[] }> = {};

    rawAmenities.forEach(attrId => {
      if (!attrId) return;
      const name = resolveAmenityName(attrId);
      if (!name || /^[a-f0-9]{24}$/i.test(name)) return;

      const matchedAttr = attributes.find(a => 
        a.id === attrId || 
        a.name === attrId || 
        a.name?.toLowerCase() === String(attrId)?.toLowerCase() || 
        a.value === attrId || 
        a._id === attrId || 
        a.code === attrId || 
        (typeof attrId === 'string' && attrId.startsWith(a.id + '|'))
      );

      const type = matchedAttr?.type;
      const subGroupKey = matchedAttr?.subGroupKey || matchedAttr?.subGroup || 'OTHER';
      const lowerName = name.toLowerCase();

      const isSecurity = type === 'FEATURE' || SECURITY_SUBGROUPS.has(subGroupKey) ||
        (lowerName.includes('smoke detector') || lowerName.includes('fire extinguisher') || lowerName.includes('first aid') || lowerName.includes('emergency hallway') || lowerName.includes('flood-free') || lowerName.includes('security') || lowerName.includes('cctv') || lowerName.includes('keycard') || lowerName.includes('biometric'));

      const isRule = !isSecurity && (type === 'RULE' || RULE_SUBGROUPS.has(subGroupKey) ||
        lowerName.includes('curfew') || lowerName.includes('guest') || lowerName.includes('visitor') ||
        lowerName.includes('pet policy') || (lowerName.includes('smoke') && !lowerName.includes('detector')) || lowerName.includes('alcohol') ||
        lowerName.includes('gender') || lowerName.includes('male & female') || lowerName.includes('female only') || lowerName.includes('male only'));

      if (isSecurity || isRule) return;

      const matchedSubGroup = dbSubGroups.find(sg => sg.key === subGroupKey);
      const label = matchedSubGroup?.tabLabel || matchedSubGroup?.title || matchedAttr?.category || 'Shared Features';

      if (!subGroupMap[subGroupKey]) {
        subGroupMap[subGroupKey] = { key: subGroupKey, label, items: [] };
      }
      if (!subGroupMap[subGroupKey].items.some(item => item.name === name)) {
        subGroupMap[subGroupKey].items.push({ id: attrId, name });
      }
    });

    return Object.values(subGroupMap);
  }, [listing, attributes, dbSubGroups, resolveAmenityName]);

  const totalAmenityCount = useMemo(() => {
    return groupedAmenitiesBySubGroup.reduce((sum, g) => sum + g.items.length, 0);
  }, [groupedAmenitiesBySubGroup]);

  // Dynamic Resolution of Safety Features
  const resolvedFeatures = useMemo(() => {
    const rawFeatures: string[] = [
      ...(Array.isArray(listing.features?.customFeatures) ? listing.features.customFeatures : []),
      ...(Array.isArray(listing.customFeatures) ? listing.customFeatures : []),
      ...(Array.isArray(listing.securityFeatures) ? listing.securityFeatures : []),
      ...(Array.isArray(listing.amenities_list) ? listing.amenities_list : []),
    ];

    const SECURITY_SUBGROUPS = new Set(['SECURITY', 'DISASTER_SAFETY', 'DISASTER_PREP', 'SAFETY', 'FIRE_SAFETY']);
    const list: { id: string; name: string; icon?: string }[] = [];

    rawFeatures.forEach(attrId => {
      if (!attrId) return;
      const name = resolveAmenityName(attrId);
      if (!name || /^[a-f0-9]{24}$/i.test(name)) return;

      const matchedAttr = attributes.find(a => a.id === attrId || a.value === attrId || a.code === attrId || (typeof attrId === 'string' && attrId.startsWith(a.id + '|')));
      const key = matchedAttr?.subGroupKey || matchedAttr?.subGroup || '';
      const type = matchedAttr?.type;
      const lower = name.toLowerCase();

      const isSecurity = type === 'FEATURE' || SECURITY_SUBGROUPS.has(key) ||
        (lower.includes('smoke detector') || lower.includes('fire extinguisher') || lower.includes('first aid') || lower.includes('emergency hallway') || lower.includes('flood-free') || lower.includes('security') || lower.includes('cctv') || lower.includes('keycard') || lower.includes('biometric'));

      if (isSecurity && !list.some(item => item.name === name)) {
        list.push({ id: attrId, name, icon: matchedAttr?.icon });
      }
    });

    if (listing.features?.security24h && !list.some(i => i.name === '24/7 Security Guard')) {
      list.push({ id: 'security24h', name: '24/7 Security Guard', icon: 'ShieldCheck' });
    }
    if (listing.features?.cctv && !list.some(i => i.name === 'CCTV Cameras')) {
      list.push({ id: 'cctv', name: 'CCTV Cameras', icon: 'Camera' });
    }
    if (listing.features?.fireSafety && !list.some(i => i.name === 'Fire Safety Extinguishers')) {
      list.push({ id: 'fireSafety', name: 'Fire Safety Extinguishers', icon: 'Flame' });
    }

    return list;
  }, [listing, attributes, resolveAmenityName]);

  const rulesObject = listing.rules || {};
  const reviews = listing.reviews || [];
  const reviewCount = listing.reviewCount || reviews.length || 0;
  const avgRatingRaw = calculateAverageRating(reviews, reviewCount > 0 ? listing.rating : null);
  const avgRating = (reviewCount > 0 && avgRatingRaw) ? Number(avgRatingRaw).toFixed(1) : null;
  const host = listing.user;

  const availableRoomsCount = useMemo(() => {
    if (!listing.rooms || !Array.isArray(listing.rooms) || listing.rooms.length === 0) {
      return 0;
    }
    const avail = listing.rooms.filter((r: any) => {
      if (!r.status) return true;
      const s = String(r.status).toUpperCase();
      return s === "AVAILABLE" || s === "VACANT" || s === "ACTIVE";
    });
    return avail.length > 0 ? avail.length : listing.rooms.length;
  }, [listing.rooms]);

  const propType = listing.propertyType;
  const PropertyIcon = getDynamicIcon(propType?.icon, Building2);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
      
      {/* Header Image Area */}
      <div className="h-[220px] md:h-[260px] relative bg-slate-100 dark:bg-slate-800 shrink-0 group/swiper">
        {allImages.length > 1 ? (
          <Swiper
            modules={[Navigation, Pagination]}
            navigation={{
              prevEl: `.swiper-prev-detail-${listing.id}`,
              nextEl: `.swiper-next-detail-${listing.id}`,
            }}
            pagination={{ clickable: true }}
            className="w-full h-full pb-0"
          >
            {allImages.map((imgUrl, idx) => (
              <SwiperSlide key={idx} className="h-full w-full">
                <SafeImage src={imgUrl} alt={`${listing.title} - Image ${idx + 1}`} />
              </SwiperSlide>
            ))}
            
            {/* Custom Nav Buttons */}
            <div 
              className={`swiper-prev-detail-${listing.id} absolute left-2 top-1/2 -translate-y-1/2 z-[60] w-8 h-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-slate-700/50 rounded-full flex items-center justify-center shadow-md cursor-pointer opacity-0 group-hover/swiper:opacity-100 transition-all hover:scale-110 hover:bg-white dark:hover:bg-slate-700`}
            >
              <ChevronLeft size={18} className="text-slate-800 dark:text-slate-100 -ml-0.5" />
            </div>
            <div 
              className={`swiper-next-detail-${listing.id} absolute right-2 top-1/2 -translate-y-1/2 z-[60] w-8 h-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-slate-700/50 rounded-full flex items-center justify-center shadow-md cursor-pointer opacity-0 group-hover/swiper:opacity-100 transition-all hover:scale-110 hover:bg-white dark:hover:bg-slate-700`}
            >
              <ChevronRight size={18} className="text-slate-800 dark:text-slate-100 -mr-0.5" />
            </div>
          </Swiper>
        ) : (
          <SafeImage src={allImages[0] || listing.imageSrc} alt={listing.title} />
        )}
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10"></div>
         
         {/* Top Nav Back Button */}
         <div className="absolute top-4 left-4 z-20">
           <button 
             onClick={onBack}
             className="p-2.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-800 dark:text-slate-200 rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-colors border border-white/20 cursor-pointer"
           >
             <ArrowLeft size={18} />
           </button>
         </div>

         {/* Price Badge */}
         <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-2xl flex items-center gap-1 font-black text-sm">
           <span className="text-primary">₱</span>
           <span>{formatPrice(price)}</span>
           <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">/mo</span>
         </div>

         {/* Bottom Image Info Overlay */}
         <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1.5 z-20 pointer-events-none">
           <div className="w-fit bg-blue-500/90 backdrop-blur-md text-white px-3 py-1 rounded-full font-black shadow-lg flex items-center gap-1.5 text-[10px] uppercase tracking-wider border border-white/20">
             <PropertyIcon size={12} /> <span>{categoryVal}</span>
           </div>
           <h3 className="font-black text-white text-2xl leading-tight line-clamp-2 drop-shadow-md">{listing.title}</h3>
            <div className="flex items-center gap-1 text-sm text-slate-200 font-medium">
              <MapPin size={14} className="shrink-0 text-primary" /> 
              <span className="truncate">
                {listing.region 
                  ? `${listing.region}${listing.country ? `, ${listing.country}` : ''}` 
                  : listing.address || 'Tarlac, Philippines'}
              </span>
            </div>
         </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 custom-scrollbar">
        
        {/* Rating & Host Info */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar src={host?.image} />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Hosted by</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{host?.name || 'BoardTAU Host'}</span>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1 font-black text-slate-800 dark:text-white text-lg">
              <Star size={16} className="text-yellow-400 fill-yellow-400" />
              <span>{avgRating ? avgRating : 'New'}</span>
            </div>
            {reviews.length > 0 ? (
              <span className="text-xs text-slate-500 underline">{reviews.length} reviews</span>
            ) : (
              <span className="text-xs text-slate-500">No reviews</span>
            )}
          </div>
        </div>

        <div className="h-px w-full bg-slate-100 dark:bg-slate-800"></div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-indigo-500/10 dark:bg-indigo-500/15 border border-indigo-500/20 dark:border-indigo-500/30 rounded-2xl p-3 flex flex-col justify-between gap-2 shadow-sm transition-all hover:border-indigo-500/40">
             <div className="flex items-center justify-between">
               <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                 <DoorOpen size={18} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                 Rooms
               </span>
             </div>
             <div>
               <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Available Rooms</span>
               <div className="flex items-baseline gap-1 mt-0.5">
                 <span className="font-black text-indigo-600 dark:text-indigo-300 text-2xl leading-none">{availableRoomsCount}</span>
                 {listing.rooms && listing.rooms.length > 0 && (
                   <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">/ {listing.rooms.length} total</span>
                 )}
               </div>
             </div>
          </div>

          <div className="bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl p-3 flex flex-col justify-between gap-2 shadow-sm transition-all hover:border-emerald-500/40">
             <div className="flex items-center justify-between">
               <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                 <BadgeCheck size={18} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                 Trust
               </span>
             </div>
             <div>
               <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Property Status</span>
               <span className="font-black text-emerald-600 dark:text-emerald-300 text-base leading-none block mt-1">Verified</span>
             </div>
          </div>
        </div>

        {/* 1. Shared Property Amenities */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-[0.15em] text-blue-500 flex items-center gap-2">
              <ListChecks size={16} /> Shared Property Amenities ({totalAmenityCount})
            </h4>
            
            <button
              type="button"
              onClick={() => setAmenitiesModalConfig({ isOpen: true, initialCategory: 'AMENITIES' })}
              className="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all shadow-sm cursor-pointer shrink-0"
            >
              <Maximize2 size={11} /> Expand All
            </button>
          </div>

          {groupedAmenitiesBySubGroup.length > 0 ? (
            <div className="flex flex-col gap-3.5">
              {groupedAmenitiesBySubGroup.slice(0, 4).map((group) => (
                <div key={group.key} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-wider text-blue-500 block">{group.label}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => {
                      const ItemIcon = getItemIcon(item.name, item.id);
                      return (
                        <span key={item.id} className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-blue-200/60 dark:border-blue-500/30 text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                          <ItemIcon size={13} className="text-blue-500 shrink-0" />
                          <span>{item.name}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}

              {groupedAmenitiesBySubGroup.length > 4 && (
                <button
                  type="button"
                  onClick={() => setAmenitiesModalConfig({ isOpen: true, initialCategory: 'AMENITIES' })}
                  className="text-xs font-bold text-blue-500 hover:text-blue-600 cursor-pointer text-left transition-colors pt-1"
                >
                  +{totalAmenityCount - groupedAmenitiesBySubGroup.slice(0, 4).reduce((sum, g) => sum + g.items.length, 0)} more amenities in full breakdown
                </button>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No shared amenities specified</span>
          )}
        </div>

        {/* 2. House Rules & Tenant Policies */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-[0.15em] text-purple-500 flex items-center gap-2">
              <Shield size={16} /> House Rules & Tenant Policies
            </h4>

            <button
              type="button"
              onClick={() => setAmenitiesModalConfig({ isOpen: true, initialCategory: 'RULES' })}
              className="px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all shadow-sm cursor-pointer shrink-0"
            >
              <Maximize2 size={11} /> View All
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-purple-200/40 dark:border-purple-500/20">
              <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-500"><Users size={15} /></div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gender Policy</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{rulesObject?.femaleOnly ? "Strictly Female Only" : rulesObject?.maleOnly ? "Strictly Male Only" : "Mixed (Male & Female)"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-purple-200/40 dark:border-purple-500/20">
              <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-500"><Clock size={15} /></div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Curfew Rule</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{rulesObject?.noCurfew ? "24/7 Open Gate (No Curfew)" : "Standard Curfew applies"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-purple-200/40 dark:border-purple-500/20">
              <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-500"><UserCheck size={15} /></div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Visitor Policy</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{rulesObject?.visitorsAllowed ? "Visitors Allowed" : "No Visitors Allowed"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-purple-200/40 dark:border-purple-500/20">
              <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-500"><PawPrint size={15} /></div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pet Policy</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{rulesObject?.petsAllowed ? "Pets Allowed" : "Pets Not Allowed"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Security & Safety Features */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-[0.15em] text-amber-500 flex items-center gap-2">
              <Star size={16} /> Security & Safety Features ({resolvedFeatures.length})
            </h4>

            <button
              type="button"
              onClick={() => setAmenitiesModalConfig({ isOpen: true, initialCategory: 'SECURITY' })}
              className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all shadow-sm cursor-pointer shrink-0"
            >
              <Maximize2 size={11} /> View All
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {resolvedFeatures.map((feat, i) => {
              const ItemIcon = getItemIcon(feat.name, feat.id, feat.icon);
              return (
                <span key={i} className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-amber-500/30 text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <ItemIcon size={13} className="text-amber-500 shrink-0" />
                  <span>{feat.name}</span>
                </span>
              );
            })}
            {resolvedFeatures.length === 0 && (
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <AlertTriangle size={15} className="text-amber-500/70 shrink-0" />
                <span>Standard safety & security measures</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Sticky Action Button */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <Link 
          href={`/listings/${listing.id}`} 
          className="w-full flex items-center justify-center gap-2 bg-primary dark:bg-primary text-white py-3.5 rounded-xl font-bold text-sm hover:scale-[1.02] transition shadow-lg hover:bg-primary/90 no-underline cursor-pointer"
        >
          View Details & Reserve
        </Link>
      </div>

      {/* Full-Screen Shared Amenities Breakdown Modal */}
      <SharedAmenitiesModal
        isOpen={amenitiesModalConfig.isOpen}
        onClose={() => setAmenitiesModalConfig(prev => ({ ...prev, isOpen: false }))}
        propertyTitle={listing.title}
        initialCategory={amenitiesModalConfig.initialCategory}
        amenities={listing.amenities_list || listing.amenities}
        customRules={listing.rules?.customRules || listing.customRules}
        customFeatures={listing.features?.customFeatures || listing.customFeatures}
        rulesObj={listing.rules}
      />

    </div>
  );
}

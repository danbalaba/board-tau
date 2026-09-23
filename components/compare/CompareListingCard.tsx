"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  DoorOpen,
  Star,
  ShieldCheck,
  FileText,
  Sparkles,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from "lucide-react";
import { getDynamicIcon } from "@/lib/iconResolver";
import SafeImage from "../common/SafeImage";
import Link from "next/link";
import { formatPrice, calculateAverageRating } from "@/utils/helper";
import Avatar from "@/components/common/Avatar";
import { computeStudentBadges } from "./compare-utils";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/navigation';
// @ts-ignore
import 'swiper/css/pagination';

interface CompareListingCardProps {
  listing: any;
  listings: any[];
  attributes: any[];
  resolveAmenityName: (attrId: string) => string;
  getItemIcon: (name: string, attrId?: string, explicitIcon?: string) => any;
  setAmenitiesModalConfig: (config: any) => void;
  onClose: () => void;
  clearListings: () => void;
}

export const CompareListingCard: React.FC<CompareListingCardProps> = ({
  listing,
  listings,
  attributes,
  resolveAmenityName,
  getItemIcon,
  setAmenitiesModalConfig,
  onClose,
  clearListings
}) => {
  const price = listing.price;
  const features = listing.features || {};
  const rulesObject = listing.rules || {};

  const RULE_SUBGROUPS = new Set(['GENDER_POLICY', 'CURFEW', 'VISITOR_POLICY', 'PET_POLICY', 'SMOKING_POLICY', 'ALCOHOL_POLICY', 'SMOKE_ALCOHOL', 'HOUSE_RULES', 'POLICY']);
  const SECURITY_SUBGROUPS = new Set(['SECURITY', 'DISASTER_SAFETY', 'DISASTER_PREP', 'SAFETY', 'FIRE_SAFETY']);

  // 1. Shared Property Amenities (Blue Theme)
  const rawAmenities: (string | any)[] = [
    ...(Array.isArray(listing.amenities_list) ? listing.amenities_list : []),
    ...(Array.isArray(listing.amenities) ? listing.amenities : []),
    ...(Array.isArray(listing.listingLinks) ? listing.listingLinks.map((l: any) => l.attribute?.id || l.attributeId || l.attribute?.name).filter(Boolean) : []),
  ];

  const standardAmenitiesList: { name: string; attrId?: string; icon?: string }[] = [];

  rawAmenities.forEach(attrId => {
    if (!attrId) return;
    const rawStr = typeof attrId === 'string' ? attrId : (attrId.name || attrId.id || '');
    const name = resolveAmenityName(rawStr);
    if (!name || /^[a-f0-9]{24}$/i.test(name)) return;

    const matchedAttr = attributes.find(a =>
      a.id === rawStr ||
      a.name === rawStr ||
      a.name?.toLowerCase() === String(name)?.toLowerCase() ||
      a.value === rawStr ||
      a._id === rawStr ||
      a.code === rawStr ||
      (typeof rawStr === 'string' && rawStr.startsWith(a.id + '|'))
    );

    const type = matchedAttr?.type;
    const subGroupKey = matchedAttr?.subGroupKey || matchedAttr?.subGroup || '';
    const lowerName = name.toLowerCase();

    const isSecurity = type === 'FEATURE' || SECURITY_SUBGROUPS.has(subGroupKey) ||
      (lowerName.includes('smoke detector') || lowerName.includes('fire extinguisher') || lowerName.includes('first aid') || lowerName.includes('emergency hallway') || lowerName.includes('flood-free') || lowerName.includes('security') || lowerName.includes('cctv') || lowerName.includes('keycard') || lowerName.includes('biometric'));

    const isRule = !isSecurity && (type === 'RULE' || RULE_SUBGROUPS.has(subGroupKey) ||
      lowerName.includes('curfew') || lowerName.includes('guest') || lowerName.includes('visitor') ||
      lowerName.includes('pet policy') || (lowerName.includes('smoke') && !lowerName.includes('detector')) || lowerName.includes('alcohol') ||
      lowerName.includes('gender') || lowerName.includes('male & female') || lowerName.includes('female only') || lowerName.includes('male only'));

    if (isSecurity || isRule) return;

    if (!standardAmenitiesList.some(item => item.name === name)) {
      standardAmenitiesList.push({ name, attrId: matchedAttr?.id, icon: matchedAttr?.icon });
    }
  });

  // 2. Safety & Security Features (Amber Theme)
  const safetyFeaturesList: { name: string; attrId?: string; icon?: string }[] = [];
  const rawFeatures = [
    ...(Array.isArray(features?.customFeatures) ? features.customFeatures : []),
    ...(Array.isArray(listing.customFeatures) ? listing.customFeatures : []),
    ...(Array.isArray(listing.securityFeatures) ? listing.securityFeatures : []),
    ...(Array.isArray(listing.amenities_list) ? listing.amenities_list : []),
    ...(Array.isArray(listing.listingLinks) ? listing.listingLinks.filter((l: any) => l.attribute?.type === 'FEATURE' || SECURITY_SUBGROUPS.has(l.attribute?.subGroupKey)).map((l: any) => l.attribute?.id || l.attribute?.name) : []),
  ];

  rawFeatures.forEach(attrId => {
    if (!attrId) return;
    const rawStr = typeof attrId === 'string' ? attrId : (attrId.name || attrId.id || '');
    const name = resolveAmenityName(rawStr);
    if (!name || /^[a-f0-9]{24}$/i.test(name)) return;

    const matchedAttr = attributes.find(a =>
      a.id === rawStr ||
      a.name === rawStr ||
      a.name?.toLowerCase() === String(name)?.toLowerCase() ||
      a.value === rawStr ||
      a._id === rawStr ||
      a.code === rawStr ||
      (typeof rawStr === 'string' && rawStr.startsWith(a.id + '|'))
    );

    const key = matchedAttr?.subGroupKey || matchedAttr?.subGroup || '';
    const type = matchedAttr?.type;
    const lower = name.toLowerCase();

    const isSecurity = type === 'FEATURE' || SECURITY_SUBGROUPS.has(key) ||
      (lower.includes('smoke detector') || lower.includes('fire extinguisher') || lower.includes('first aid') || lower.includes('emergency hallway') || lower.includes('flood-free') || lower.includes('security') || lower.includes('cctv') || lower.includes('keycard') || lower.includes('biometric'));

    if (isSecurity && !safetyFeaturesList.some(item => item.name === name)) {
      safetyFeaturesList.push({ name, attrId: matchedAttr?.id, icon: matchedAttr?.icon });
    }
  });

  if (features?.security24h && !safetyFeaturesList.some(i => i.name === '24/7 Security Guard')) {
    safetyFeaturesList.push({ name: '24/7 Security Guard', icon: 'ShieldCheck' });
  }
  if (features?.cctv && !safetyFeaturesList.some(i => i.name === 'CCTV Cameras')) {
    safetyFeaturesList.push({ name: 'CCTV Cameras', icon: 'Camera' });
  }
  if (features?.fireSafety && !safetyFeaturesList.some(i => i.name === 'Fire Safety Extinguishers')) {
    safetyFeaturesList.push({ name: 'Fire Safety Extinguishers', icon: 'Flame' });
  }

  // 3. Policies & Rules (Purple Theme)
  const rulesList: { title: string; category: string; iconName: string; attrId?: string }[] = [];
              
  if (rulesObject?.femaleOnly) {
    rulesList.push({ title: "Strictly Female Only", category: "Gender Policy", iconName: "UserX" });
  } else if (rulesObject?.maleOnly) {
    rulesList.push({ title: "Strictly Male Only", category: "Gender Policy", iconName: "UserX" });
  } else {
    rulesList.push({ title: "Co-living Allowed", category: "Gender Policy", iconName: "Users" });
  }

  if (rulesObject?.noCurfew) {
    rulesList.push({ title: "24/7 Access (No Curfew)", category: "Curfew Policy", iconName: "Clock" });
  } else {
    rulesList.push({ title: "Standard Curfew applies", category: "Curfew Policy", iconName: "Clock" });
  }

  if (rulesObject?.visitorsAllowed) {
    rulesList.push({ title: "Visitors Allowed", category: "Visitor Policy", iconName: "UserCheck" });
  } else {
    rulesList.push({ title: "No Visitors Allowed", category: "Visitor Policy", iconName: "Ban" });
  }

  if (rulesObject?.petsAllowed) {
    rulesList.push({ title: "Pets Allowed", category: "Pet Policy", iconName: "PawPrint" });
  } else {
    rulesList.push({ title: "Strictly No Pets", category: "Pet Policy", iconName: "PawPrint" });
  }

  if (rulesObject?.customRules && Array.isArray(rulesObject.customRules)) {
    rulesObject.customRules.forEach((ruleStr: string) => {
      const name = resolveAmenityName(ruleStr);
      if (name && !/^[a-f0-9]{24}$/i.test(name) && !rulesList.some(r => r.title.toLowerCase() === name.toLowerCase())) {
        const matchedAttr = attributes.find(a => a.id === ruleStr || a.name?.toLowerCase() === name.toLowerCase());
        rulesList.push({ title: name, category: "Property Guideline", iconName: matchedAttr?.icon || "FileText", attrId: matchedAttr?.id });
      }
    });
  }
  
  const reviews = listing.reviews || [];
  const reviewCount = listing.reviewCount || reviews.length || 0;
  const avgRatingRaw = calculateAverageRating(reviews, reviewCount > 0 ? listing.rating : null);
  const avgRating = (reviewCount > 0 && avgRatingRaw) ? Number(avgRatingRaw).toFixed(1) : null;
  const host = listing.user;
  
  const categoryData = Array.isArray(listing.category) 
    ? listing.category 
    : (typeof listing.category === 'string' ? [listing.category] : []);
  const displayCategories = categoryData.slice(0, 2);

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

  let images: string[] = [];
  if (listing.imageSrc) images.push(getImageUrl(listing.imageSrc));
  
  const galleryImages = listing.images || [];
  if (galleryImages.length > 0) {
    const gUrls = galleryImages.map(getImageUrl).filter(Boolean);
    images = [...images, ...gUrls];
  }
  
  const allImages = Array.from(new Set(images));

  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 50, scale: 0.95 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 25 } }
      }}
      key={listing.id} 
      className="snap-start w-[85vw] max-w-[340px] sm:w-[350px] md:w-[370px] lg:w-[380px] shrink-0 h-full flex flex-col border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[24px] shadow-sm overflow-hidden group"
    >
      {/* Header Image Area */}
      <div className="h-[220px] relative bg-slate-100 dark:bg-slate-800 shrink-0 group/swiper">
         {allImages.length > 1 ? (
           <Swiper
             modules={[Navigation, Pagination]}
             navigation={{
               prevEl: `.swiper-prev-compare-${listing.id}`,
               nextEl: `.swiper-next-compare-${listing.id}`,
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
               className={`swiper-prev-compare-${listing.id} absolute left-2 top-1/2 -translate-y-1/2 z-[60] w-8 h-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 text-slate-800 dark:text-slate-100 rounded-full flex items-center justify-center shadow-md cursor-pointer opacity-0 group-hover/swiper:opacity-100 transition-all hover:scale-110 hover:bg-white dark:hover:bg-slate-700`}
             >
               <ChevronLeft size={18} className="text-slate-800 dark:text-slate-100 -ml-0.5" />
             </div>
             <div 
               className={`swiper-next-compare-${listing.id} absolute right-2 top-1/2 -translate-y-1/2 z-[60] w-8 h-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 text-slate-800 dark:text-slate-100 rounded-full flex items-center justify-center shadow-md cursor-pointer opacity-0 group-hover/swiper:opacity-100 transition-all hover:scale-110 hover:bg-white dark:hover:bg-slate-700`}
             >
               <ChevronRight size={18} className="text-slate-800 dark:text-slate-100 -mr-0.5" />
             </div>
           </Swiper>
         ) : (
           <SafeImage src={allImages[0] || listing.imageSrc} alt={listing.title} />
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none z-10"></div>
         
         {/* Price Badge */}
         <div className="absolute top-4 right-4 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-2xl flex items-center gap-1 font-black text-sm">
           <span className="text-primary">₱</span>
           <span>{formatPrice(price)}</span>
           <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">/mo</span>
         </div>

         <div className="absolute top-4 left-4 z-20 flex gap-2 flex-wrap max-w-[60%]">
           {displayCategories.map((cat: string, idx: number) => (
             <div key={idx} className="bg-white/90 backdrop-blur-md text-primary px-3 py-1.5 rounded-full font-bold shadow-lg flex items-center gap-1.5 text-xs border border-white/20">
               {cat}
             </div>
           ))}
         </div>

         {/* Bottom Image Info */}
         <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
           <h3 className="font-black text-white text-xl leading-tight line-clamp-2 drop-shadow-md">{listing.title}</h3>
           <div className="flex items-center gap-1 text-sm text-slate-200 mt-1.5 font-medium">
             <MapPin size={14} className="shrink-0 text-primary" /> <span className="truncate">{listing.region}</span>
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

        {/* Student Promotional Badges Bar */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {computeStudentBadges(listing, listings).map((badge, bIdx) => {
            const BadgeIcon = badge.icon;
            return (
              <div
                key={bIdx}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border shadow-2xs ${badge.bg} ${badge.color} ${badge.border}`}
              >
                <BadgeIcon size={12} className="shrink-0" />
                <span>{badge.label}</span>
              </div>
            );
          })}
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
                 <span className="font-black text-indigo-600 dark:text-indigo-300 text-2xl leading-none">{listing.rooms?.length || 0}</span>
                 {listing.rooms && listing.rooms.length > 0 && (
                   <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">total</span>
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

        {/* What this place offers (Blue Theme) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400 flex items-center gap-2 uppercase tracking-wider">
              <Sparkles size={16} className="text-blue-500 shrink-0" /> Shared Property Amenities
            </h4>
            <button
              type="button"
              onClick={() => setAmenitiesModalConfig({ isOpen: true, initialCategory: 'AMENITIES', listing })}
              className="px-2 py-0.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all shadow-sm cursor-pointer shrink-0"
            >
              <Maximize2 size={11} /> Expand
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            {standardAmenitiesList.slice(0, 6).map((item, i) => {
              const AmenityIcon = getItemIcon(item.name, item.attrId, item.icon);
              return (
                <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500 shrink-0">
                    <AmenityIcon size={14} className="text-blue-500 shrink-0" />
                  </div>
                  <span className="line-clamp-1 font-semibold">{item.name}</span>
                </div>
              );
            })}
            {standardAmenitiesList.length > 6 && (
              <button
                type="button"
                onClick={() => setAmenitiesModalConfig({ isOpen: true, initialCategory: 'AMENITIES', listing })}
                className="text-xs font-bold text-blue-500 hover:underline pt-0.5 flex items-center gap-1 text-left cursor-pointer"
              >
                <span>+{standardAmenitiesList.length - 6} more amenities</span>
                <Maximize2 size={11} />
              </button>
            )}
            {standardAmenitiesList.length === 0 && <span className="text-xs text-slate-400 italic">No amenities specified</span>}
          </div>
        </div>

        {/* Safety & Reassurance (Amber Theme) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-black text-amber-600 dark:text-amber-400 flex items-center gap-2 uppercase tracking-wider">
              <ShieldCheck size={16} className="text-amber-500 shrink-0" /> Security & Safety Features
            </h4>
            <button
              type="button"
              onClick={() => setAmenitiesModalConfig({ isOpen: true, initialCategory: 'SECURITY', listing })}
              className="px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all shadow-sm cursor-pointer shrink-0"
            >
              <Maximize2 size={11} /> View All
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            {safetyFeaturesList.slice(0, 5).map((f, i) => {
              const FeatureIcon = getItemIcon(f.name, f.attrId, f.icon);
              return (
                <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                  <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500 shrink-0">
                    <FeatureIcon size={14} className="text-amber-500 shrink-0" />
                  </div>
                  <span className="line-clamp-1 font-semibold">{f.name}</span>
                </div>
              );
            })}
            {safetyFeaturesList.length === 0 && (
              <div className="flex items-center gap-2.5 text-xs text-slate-500">
                <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-500 shrink-0">
                  <ShieldCheck size={14} className="text-amber-500 shrink-0" />
                </div>
                <span>Standard safety & security measures</span>
              </div>
            )}
          </div>
        </div>

        {/* Policies & Rules (Purple Theme) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-black text-purple-600 dark:text-purple-400 flex items-center gap-2 uppercase tracking-wider">
              <FileText size={16} className="text-purple-500 shrink-0" /> House Rules & Policies
            </h4>
            <button
              type="button"
              onClick={() => setAmenitiesModalConfig({ isOpen: true, initialCategory: 'RULES', listing })}
              className="px-2 py-0.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all shadow-sm cursor-pointer shrink-0"
            >
              <Maximize2 size={11} /> View All
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {rulesList.map((r, i) => {
              const RuleIcon = getItemIcon(r.title, r.attrId, r.iconName);
              return (
                <div key={i} className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-200">
                  <div className="p-2 bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400 shrink-0">
                    <RuleIcon size={16} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-purple-600/70 dark:text-purple-400/70 uppercase tracking-widest">{r.category}</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{r.title}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Sticky Action Button */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <Link 
          href={`/listings/${listing.id}`} 
          onClick={() => {
            onClose();
            clearListings();
          }}
          className="w-full flex items-center justify-center gap-2 bg-primary dark:bg-primary text-white py-3.5 rounded-xl font-bold text-sm hover:scale-[1.02] transition shadow-lg hover:bg-primary/90 no-underline"
        >
          View Details & Reserve
        </Link>
      </div>

    </motion.div>
  );
};

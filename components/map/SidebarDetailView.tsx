"use client";

import React from "react";
import * as LucideIcons from "lucide-react";
import { ArrowLeft, CheckCircle2, MapPin, DoorOpen, Star, ShieldCheck, FileText, Sparkles, User as UserIcon, BadgeCheck, AlertTriangle, Wifi, Car, Waves, Dumbbell, Wind, WashingMachine, Utensils, Refrigerator, Microwave, Droplets, Zap, Clock, Users, Flame, PawPrint, Camera, BookOpen, Square, Blinds, ChevronLeft, ChevronRight } from "lucide-react";
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
import { categories } from "@/utils/constants";

const parseCustomItem = (item: string) => {
  if (!item || typeof item !== 'string') return { label: "", icon: null };
  if (item.includes("|")) {
    const [label, icon] = item.split("|");
    return { label: label.trim(), icon: icon.trim() };
  }
  return { label: item, icon: null };
};

const CustomIcon = ({ name, fallback: Fallback, className, size = 24 }: { name: string | null, fallback: any, className?: string, size?: number }) => {
  const DynamicIcon = name ? (LucideIcons as any)[name] : null;
  const IconComponent = DynamicIcon || Fallback;
  return <IconComponent className={className} size={size} />;
};

const getAmenityIcon = (amenityName: string) => {
  const { label, icon } = parseCustomItem(amenityName);
  if (icon) return <CustomIcon name={icon} fallback={CheckCircle2} size={16} className="text-primary/70 shrink-0" />;
  const name = label.toLowerCase();
  if (name.includes('wifi')) return <Wifi size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('parking')) return <Car size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('pool')) return <Waves size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('gym')) return <Dumbbell size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('air conditioning')) return <Wind size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('laundry')) return <WashingMachine size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('kitchen') || name.includes('cooking')) return <Utensils size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('refrigerator')) return <Refrigerator size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('microwave')) return <Microwave size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('water')) return <Droplets size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('electricity')) return <Zap size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('curfew')) return <Clock size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('visitors')) return <Users size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('smoke') || name.includes('fire')) return <Flame size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('cctv') || name.includes('security')) return <Camera size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('pets')) return <PawPrint size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('desk') || name.includes('study friendly')) return <BookOpen size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('balcony')) return <Square size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('closet')) return <Blinds size={16} className="text-primary/70 shrink-0" />;
  if (name.includes('quiet')) return <Wind size={16} className="text-primary/70 shrink-0" />;
  return <CheckCircle2 size={16} className="text-primary/70 shrink-0" />;
};

interface SidebarDetailViewProps {
  listing: any;
  onBack: () => void;
}

export default function SidebarDetailView({ listing, onBack }: SidebarDetailViewProps) {
  const price = listing.price || 0;
  
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

  const allImages = React.useMemo(() => {
    let images: string[] = [];
    if (listing.imageSrc) images.push(getImageUrl(listing.imageSrc));
    
    const galleryImages = listing.images || [];
    if (galleryImages.length > 0) {
      const gUrls = galleryImages.map(getImageUrl).filter(Boolean);
      images = [...images, ...gUrls];
    }
    
    return Array.from(new Set(images));
  }, [listing]);

  const amenities = listing.amenities_list || [];
  const amenitiesObj = listing.amenities || {};
  
  const safetyKeywords = ['cctv', 'security', 'fire safety', 'transport', 'flexible lease', 'flood', 'backup power'];
  const ruleKeywords = ['female', 'male', 'visitor', 'pet', 'smoking', 'curfew'];

  const baseAmenities = Array.isArray(amenities) ? amenities : [];
  const legacyAmenities: string[] = [];
  if (amenitiesObj) {
    if (amenitiesObj.wifi) legacyAmenities.push("WiFi");
    if (amenitiesObj.parking) legacyAmenities.push("Parking");
    if (amenitiesObj.pool) legacyAmenities.push("Pool");
    if (amenitiesObj.gym) legacyAmenities.push("Gym");
    if (amenitiesObj.airConditioning) legacyAmenities.push("Air conditioning");
    if (amenitiesObj.laundry) legacyAmenities.push("Laundry area");
  }
  const combined = [...baseAmenities, ...legacyAmenities];
  const standardAmenities = combined.filter(a => {
    const lower = a.toLowerCase();
    return !safetyKeywords.some(kw => lower.includes(kw)) && !ruleKeywords.some(kw => lower.includes(kw));
  });

  const features = listing.features || {};
  const rulesObject = listing.rules || {};
  
  const reviews = listing.reviews || [];
  const avgRatingRaw = calculateAverageRating(reviews);
  const avgRating = avgRatingRaw ? Number(avgRatingRaw).toFixed(1) : null;
  const host = listing.user;
  
  const categoryName = listing.categories?.[0]?.category?.name || (Array.isArray(listing.category) ? listing.category[0] : listing.category);
  const categoryObj = categories.find(c => c.value === categoryName || c.label === categoryName);
  const categoryVal = categoryObj?.label || categoryName || "Listing";
  const CategoryIcon = categoryObj?.icon;

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
              className={`swiper-prev-detail-${listing.id} absolute left-2 top-1/2 -translate-y-1/2 z-[60] w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md cursor-pointer opacity-0 group-hover/swiper:opacity-100 transition-opacity hover:scale-110`}
            >
              <ChevronLeft size={18} className="text-slate-800 -ml-0.5" />
            </div>
            <div 
              className={`swiper-next-detail-${listing.id} absolute right-2 top-1/2 -translate-y-1/2 z-[60] w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md cursor-pointer opacity-0 group-hover/swiper:opacity-100 transition-opacity hover:scale-110`}
            >
              <ChevronRight size={18} className="text-slate-800 -mr-0.5" />
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
             className="p-2.5 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-800 dark:text-slate-200 rounded-full shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-colors border border-white/20"
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

         {/* Bottom Image Info */}
         <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1.5 z-20 pointer-events-none">
           {CategoryIcon && (
             <div className="w-fit bg-white/90 backdrop-blur-md text-primary px-3 py-1 rounded-full font-bold shadow-lg flex items-center gap-1.5 text-[10px] uppercase tracking-wider border border-white/20">
               <CategoryIcon size={12} /> {categoryVal}
             </div>
           )}
           <h3 className="font-black text-white text-2xl leading-tight line-clamp-2 drop-shadow-md">{listing.title}</h3>
           <div className="flex items-center gap-1 text-sm text-slate-200 font-medium">
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

        <div className="h-px w-full bg-slate-100 dark:bg-slate-800"></div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex flex-col gap-1">
             <DoorOpen size={18} className="text-primary" />
             <span className="text-xs text-slate-500 font-medium">Available Rooms</span>
             <span className="font-black text-primary text-lg">{listing.rooms?.length || 0}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl p-3 flex flex-col gap-1">
             <BadgeCheck size={18} className="text-blue-500" />
             <span className="text-xs text-slate-500 font-medium">Status</span>
             <span className="font-bold text-slate-700 dark:text-slate-300">Verified</span>
          </div>
        </div>

        {/* What this place offers */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-primary" /> What this place offers
          </h4>
          <div className="flex flex-col gap-3.5">
            {standardAmenities.slice(0, 5).map((amenity: string, i: number) => {
              const { label } = parseCustomItem(amenity);
              return (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  {getAmenityIcon(amenity)}
                  <span className="line-clamp-1">{label}</span>
                </div>
              );
            })}
            {standardAmenities.length > 5 && (
              <span className="text-xs font-bold text-primary cursor-pointer hover:underline">+{standardAmenities.length - 5} more amenities</span>
            )}
            {standardAmenities.length === 0 && <span className="text-sm text-slate-400 italic">Not specified</span>}
          </div>
        </div>

        {/* Safety & Reassurance */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <ShieldCheck size={16} className="text-primary" /> Safety & Reassurance
          </h4>
          <div className="flex flex-col gap-3.5">
            {features?.cctv && (
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Camera className="text-primary shrink-0" size={16} />
                <span className="line-clamp-1 font-bold">CCTV Monitoring</span>
              </div>
            )}
            {features?.security24h && (
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <ShieldCheck className="text-primary shrink-0" size={16} />
                <span className="line-clamp-1 font-bold">On-site Security</span>
              </div>
            )}
            {features?.fireSafety && (
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Flame className="text-primary shrink-0" size={16} />
                <span className="line-clamp-1 font-bold">Fire Safety Ready</span>
              </div>
            )}
            {features?.customFeatures?.map((f: string, i: number) => {
              const { label, icon } = parseCustomItem(f);
              return (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <CustomIcon name={icon} fallback={CheckCircle2} className="text-primary shrink-0" size={16} />
                  <span className="line-clamp-1 font-bold">{label}</span>
                </div>
              );
            })}
            {(!features?.cctv && !features?.security24h && !features?.fireSafety && (!features?.customFeatures || features.customFeatures.length === 0)) && (
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <AlertTriangle size={16} className="text-amber-500/70 shrink-0" />
                <span>Standard security measures</span>
              </div>
            )}
          </div>
        </div>

        {/* Policies & Rules */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <FileText size={16} className="text-purple-500" /> Policies & Rules
          </h4>
          <div className="grid grid-cols-1 gap-5">
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-primary"><Users size={16} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</p>
                <p className="font-bold">{rulesObject?.femaleOnly ? "Strictly Female Only" : rulesObject?.maleOnly ? "Strictly Male Only" : "Co-living Allowed"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-primary"><Clock size={16} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Curfew</p>
                <p className="font-bold">{rulesObject?.noCurfew ? "No Curfew (24/7 Access)" : "Standard Curfew applies"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-primary"><Users size={16} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visitors</p>
                <p className="font-bold">{rulesObject?.visitorsAllowed ? "Visitors are welcome" : "No visitors allowed"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-primary"><PawPrint size={16} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pets</p>
                <p className="font-bold">{rulesObject?.petsAllowed ? "Pets are allowed" : "Strictly no pets"}</p>
              </div>
            </div>
            {rulesObject?.customRules?.slice(0, 2).map((rule: string, i: number) => {
              const { label, icon } = parseCustomItem(rule);
              return (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-primary">
                    {icon ? <CustomIcon name={icon} fallback={CheckCircle2} size={16} /> : <div className="w-1.5 h-1.5 bg-primary rounded-full m-1" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rule</p>
                    <p className="font-bold line-clamp-1">{label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Sticky Action Button */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <Link 
          href={`/listings/${listing.id}`} 
          className="w-full flex items-center justify-center gap-2 bg-primary dark:bg-primary text-white py-3.5 rounded-xl font-bold text-sm hover:scale-[1.02] transition shadow-lg hover:bg-primary/90 no-underline"
        >
          View Details & Reserve
        </Link>
      </div>

    </div>
  );
}

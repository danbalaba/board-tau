"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Listing } from "@prisma/client";
import { Star, MapPin, DoorOpen, Sparkles, CheckCircle, Flame } from "lucide-react";

import HeartButton from "../favorites/HeartButton";
import SafeImage from "../common/SafeImage";
import { formatPrice, calculateAverageRating } from "@/utils/helper";
import ListingMenu from "./ListingMenu";
import { usePathname } from "next/navigation";
import { useCompareStore } from "@/hooks/use-compare-store";
import { CheckSquare, Square, ChevronLeft, ChevronRight } from "lucide-react";
import { useResponsiveToast } from "@/components/common/ResponsiveToast";
import HelpTooltip from "@/components/common/HelpTooltip";

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/navigation';
// @ts-ignore
import 'swiper/css/pagination';

let lastToastTime = 0;

interface ListingCardProps {
  data: Listing;
  reservation?: {
    id: string;
    startDate: Date;
    endDate: Date;
    totalPrice: number;
  };
  hasFavorited: boolean;
  matchScore?: number; // New: optional AI match score
  aiHighlight?: string; // New: optional AI reasoning text
  isHighlighted?: boolean; // New: for visual focus/notifications
  onClickOverride?: (e: React.MouseEvent) => void; // New: override default Link behavior
}

const ListingCard: React.FC<ListingCardProps> = ({
  data,
  reservation,
  hasFavorited,
  matchScore,
  aiHighlight,
  isHighlighted,
  onClickOverride
}) => {
  const pathname = usePathname();
  const { selectedListingIds, addListing, removeListing } = useCompareStore();
  const toast = useResponsiveToast();
  
  const price = reservation ? reservation.totalPrice : data?.price;

  let reservationDate: string | undefined;
  if (reservation) {
    const start = new Date(reservation.startDate);
    const end = new Date(reservation.endDate);
    reservationDate = `${format(start, "PP")} - ${format(end, "PP")}`;
  }

  // Rating calculation (Shared utility)
  const reviewsArray: any[] = (data as any).reviews || [];
  const rating = calculateAverageRating(reviewsArray, (data as any).rating);
  const hasRating = reviewsArray.length > 0 || (rating && rating > 0);
  const reviewCount = reviewsArray.length || (data as any).reviewCount || 0;

  // Available rooms computation
  const rooms: any[] = (data as any).rooms || [];
  const availableRooms = rooms.filter(
    (r) => r.status === "AVAILABLE" && r.availableSlots > 0
  ).length;
  const totalRooms = rooms.length;
  const hasRooms = totalRooms > 0;

  // Category label
  const categoryData = Array.isArray(data.category) 
    ? data.category 
    : (typeof data.category === 'string' ? [data.category] : []);
  const displayCategories = categoryData.slice(0, 2); // Max 2 categories on card

  // Smart Badges Logic
  const isNew =
    data.createdAt &&
    (Date.now() - new Date(data.createdAt).getTime()) / (1000 * 60 * 60 * 24) < 7;

  const isTopRated = hasRating && Number(rating) >= 4.8;
  const isVerified = (data as any).user?.isVerifiedLandlord;
  const isPopular = reviewCount >= 10;

  const displayScore = matchScore || (Math.floor(Math.random() * (98 - 85 + 1)) + 85);
  
  // Smart image selection helper
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

  // Find the best available image source
  const displayImage = React.useMemo(() => {
    // 1. Try primary imageSrc
    if (data.imageSrc) return getImageUrl(data.imageSrc);
    
    // 2. Try gallery images
    const galleryImages = (data as any).images || [];
    if (galleryImages.length > 0) return getImageUrl(galleryImages[0]);
    
    // 3. Try room images
    if (rooms.length > 0 && rooms[0].images?.length > 0) {
      return getImageUrl(rooms[0].images[0]);
    }

    return null;
  }, [data, rooms]);

  const allImages = React.useMemo(() => {
    let images: string[] = [];
    if (data.imageSrc) images.push(getImageUrl(data.imageSrc));
    
    const galleryImages = (data as any).images || [];
    if (galleryImages.length > 0) {
      const gUrls = galleryImages.map(getImageUrl).filter(Boolean);
      images = [...images, ...gUrls];
    }
    
    // Deduplicate
    return Array.from(new Set(images));
  }, [data]);

  const isCompareMode = pathname === "/favorites";
  const isSelectedForCompare = selectedListingIds.includes(data.id);

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSelectedForCompare) {
      removeListing(data.id);
    } else {
      if (selectedListingIds.length >= 3) {
        const now = Date.now();
        if (now - lastToastTime > 3000) {
          lastToastTime = now;
          toast.info(
            { title: "Comparison Updated", description: "The oldest listing was removed to make room for this one." },
            { id: "compare-update" }
          );
        }
      }
      addListing(data.id);
    }
  };

  const CardWrapper = onClickOverride ? 'div' : Link;
  const wrapperProps = onClickOverride 
    ? { onClick: onClickOverride, className: "block h-full cursor-pointer" }
    : { href: `/listings/${data.id}`, className: "block h-full cursor-pointer" };

  return (
    <div className="relative group/card h-full z-10 hover:z-30">
      <CardWrapper {...wrapperProps as any}>
        <motion.div
          className="flex flex-col gap-0 w-full h-full p-2 md:p-2.5 bg-white dark:bg-slate-800/40 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-[1.5rem] md:rounded-[2rem] group-hover/card:bg-primary/5 dark:group-hover/card:bg-slate-800/60 group-hover/card:border-primary/30 group-hover/card:shadow-2xl group-hover/card:shadow-primary/5"
          initial={{ opacity: 0, y: 15 }}
          animate={isHighlighted ? { 
            opacity: 1, 
            y: 0,
            scale: [1, 1.03, 1],
            boxShadow: [
              "0 0 0 rgba(var(--primary), 0)",
              "0 15px 35px rgba(var(--primary), 0.25)",
              "0 0 0 rgba(var(--primary), 0)"
            ]
          } : { opacity: 1, y: 0 }}
          whileHover={{ y: -8 }}
          transition={{ 
            opacity: { duration: 0.3 },
            y: { duration: 0.3, type: "spring", stiffness: 300, damping: 20 },
            scale: { 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut",
              repeatDelay: 1
            },
            boxShadow: { 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut",
              repeatDelay: 1
            }
          }}
        >
          {/* ── Image Container (Screenshot Layout) ── */}
          <div className="relative overflow-hidden rounded-[1.5rem] aspect-[5/4] bg-slate-100 dark:bg-slate-900 shadow-inner group/swiper">
            {allImages.length > 1 ? (
              <Swiper
                modules={[Navigation, Pagination]}
                navigation={{
                  prevEl: `.swiper-prev-${data.id}`,
                  nextEl: `.swiper-next-${data.id}`,
                }}
                pagination={{ clickable: true, dynamicBullets: true }}
                className="w-full h-full pb-0 custom-card-swiper"
              >
                {allImages.map((imgUrl, idx) => (
                  <SwiperSlide key={idx} className="h-full w-full">
                    <SafeImage src={imgUrl} alt={`${data.title} - Image ${idx + 1}`} />
                  </SwiperSlide>
                ))}
                
                {/* Custom Nav Buttons */}
                <div 
                  className={`swiper-prev-${data.id} absolute left-2 top-1/2 -translate-y-1/2 z-[60] w-7 h-7 bg-white/90 dark:bg-slate-900/90 rounded-full flex items-center justify-center shadow-md cursor-pointer opacity-0 group-hover/swiper:opacity-100 transition-opacity hover:scale-110`}
                  onClick={(e: any) => { e.preventDefault(); e.stopPropagation(); }}
                >
                  <ChevronLeft size={16} className="text-slate-800 dark:text-primary -ml-0.5" />
                </div>
                <div 
                  className={`swiper-next-${data.id} absolute right-2 top-1/2 -translate-y-1/2 z-[60] w-7 h-7 bg-white/90 dark:bg-slate-900/90 rounded-full flex items-center justify-center shadow-md cursor-pointer opacity-0 group-hover/swiper:opacity-100 transition-opacity hover:scale-110`}
                  onClick={(e: any) => { e.preventDefault(); e.stopPropagation(); }}
                >
                  <ChevronRight size={16} className="text-slate-800 dark:text-primary -mr-0.5" />
                </div>
              </Swiper>
            ) : (
              <SafeImage
                src={displayImage}
                alt={data.title}
              />
            )}

            <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
              {isNew && (
                <div className="bg-primary/90 backdrop-blur-md text-white px-2 py-0.5 rounded-md shadow-lg text-[8px] font-black uppercase tracking-wider w-fit flex items-center gap-1 border border-white/20">
                  <Sparkles size={8} />
                  NEW
                </div>
              )}
              {isTopRated && (
                <div className="bg-amber-500/90 backdrop-blur-md text-white px-2 py-0.5 rounded-md shadow-lg text-[8px] font-black uppercase tracking-wider w-fit flex items-center gap-1 border border-white/20">
                  <Star size={8} className="fill-white" />
                  TOP RATED
                </div>
              )}
              {isVerified && (
                <div className="bg-blue-500/90 backdrop-blur-md text-white px-2 py-0.5 rounded-md shadow-lg text-[8px] font-black uppercase tracking-wider w-fit flex items-center gap-1 border border-white/20">
                  <CheckCircle size={8} />
                  VERIFIED
                </div>
              )}
              {isPopular && (
                <div className="bg-rose-500/90 backdrop-blur-md text-white px-2 py-0.5 rounded-md shadow-lg text-[8px] font-black uppercase tracking-wider w-fit flex items-center gap-1 border border-white/20">
                  <Flame size={8} />
                  POPULAR
                </div>
              )}
            </div>

            {/* Top Right Actions */}
            <div className="absolute top-3 right-3 z-30 flex flex-col gap-2 items-end">
              <HeartButton
                listingId={data.id}
                hasFavorited={hasFavorited}
              />
              
              {/* Compare Button */}
              {isCompareMode && (
                <button 
                  type="button"
                  onClick={handleCompareClick}
                  className={`p-1.5 rounded-full backdrop-blur-md transition flex items-center justify-center ${
                    isSelectedForCompare 
                      ? "bg-primary text-white shadow-lg border border-primary/50" 
                      : "bg-white/80 dark:bg-slate-800/80 hover:bg-white text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700"
                  }`}
                  title={isSelectedForCompare ? "Remove from compare" : "Add to compare"}
                >
                  {isSelectedForCompare ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
              )}
            </div>

            {/* Bottom Controls Overlay (Badges + Price) */}
            <div className="absolute bottom-6 md:bottom-3 left-3 right-3 z-10 flex items-end justify-between gap-2 pointer-events-none">
              {/* Left Side: Category */}
              <div className="flex items-center gap-1.5 flex-wrap max-w-[50%]">
                {displayCategories.map((cat: string, idx: number) => (
                  <div key={idx} className="bg-slate-900/80 dark:bg-slate-900/80 backdrop-blur-md text-white border border-white/10 dark:border-slate-700 px-2 py-1 md:px-2.5 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-wider truncate max-w-full">
                    {cat}
                  </div>
                ))}
              </div>

              {/* Right Side: Price Pill */}
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-2xl flex items-center gap-1 font-black text-[10px] md:text-xs shrink-0 pointer-events-auto">
                <span className="text-primary">₱</span>
                <span>{formatPrice(price)}</span>
                {!reservation && <span className="text-[7px] md:text-[8px] text-slate-500 dark:text-slate-400 font-normal">/mo</span>}
              </div>
            </div>
          </div>

          {/* ── Info Section (Screenshot Style) ── */}
          <div className="pt-4 pb-1 px-2 flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-[12px] md:text-[14px] text-slate-900 dark:text-slate-50 uppercase tracking-wide line-clamp-1">
                {data?.title}
              </h3>
              {hasRating && (
                <div className="flex items-center gap-1 shrink-0 bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-600/50">
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {Number(rating).toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Location & Availability */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-1 text-[9px] md:text-[11px] text-slate-500 dark:text-slate-400">
                <MapPin size={10} className="text-slate-400 md:w-[11px] md:h-[11px]" />
                <span className="truncate">{data?.region}</span>
              </div>
              <div className="flex items-center gap-1 text-[9px] md:text-[11px] font-bold shrink-0">
                <DoorOpen size={10} className={availableRooms > 0 ? "text-primary md:w-[11px] md:h-[11px]" : "text-slate-500 md:w-[11px] md:h-[11px]"} />
                <span className={availableRooms > 0 ? "text-primary dark:text-primary" : "text-slate-500"}>
                  {availableRooms > 0 ? `${availableRooms} Units` : "No Units"}
                </span>
              </div>
            </div>

            {/* AI Reasoning (Subtle & Themed) */}
            {aiHighlight ? (
              <HelpTooltip text={aiHighlight}>
                <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1 italic text-left w-full cursor-help">
                  ✨ "{aiHighlight}"
                </p>
              </HelpTooltip>
            ) : (
              <HelpTooltip text={data.description || "Premium choice in " + data.region}>
                <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 italic text-left w-full cursor-help">
                  {data.description || "Premium choice in " + data.region}
                </p>
              </HelpTooltip>
            )}
          </div>
        </motion.div>
      </CardWrapper>
    </div>


  );
};


export default ListingCard;

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export function ListingSkeleton() {
  return (
    <div className="col-span-1 group/card p-1 sm:p-2 sm:hover:bg-slate-50 sm:dark:hover:bg-slate-800/50 rounded-[2rem] transition-colors relative z-10 hover:z-30">
      <div className="flex flex-col gap-0 w-full animate-pulse-slow">
        <div className="aspect-[5/4] rounded-[1.25rem] overflow-hidden mb-4">
          <Skeleton height="100%" width="100%" containerClassName="block h-full" borderRadius="1.25rem" />
        </div>
        <div className="px-2 flex flex-col gap-2">
          <Skeleton height={20} width="70%" />
          <Skeleton height={12} width="40%" />
          <Skeleton height={40} width="100%" borderRadius="0.5rem" />
        </div>
      </div>
    </div>
  );
}

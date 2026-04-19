"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Listing } from "@prisma/client";
import { Star, MapPin, DoorOpen, Sparkles } from "lucide-react";

import HeartButton from "../favorites/HeartButton";
import Image from "../common/Image";
import { formatPrice } from "@/utils/helper";
import ListingMenu from "./ListingMenu";

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
}

const ListingCard: React.FC<ListingCardProps> = ({
  data,
  reservation,
  hasFavorited,
  matchScore,
  aiHighlight
}) => {
  const price = reservation ? reservation.totalPrice : data?.price;

  let reservationDate: string | undefined;
  if (reservation) {
    const start = new Date(reservation.startDate);
    const end = new Date(reservation.endDate);
    reservationDate = `${format(start, "PP")} - ${format(end, "PP")}`;
  }

  // Rating
  const rating = (data as any).rating;
  const hasRating = rating && rating > 0;

  // Available rooms computation
  const rooms: any[] = (data as any).rooms || [];
  const availableRooms = rooms.filter(
    (r) => r.status === "AVAILABLE" && r.availableSlots > 0
  ).length;
  const totalRooms = rooms.length;
  const hasRooms = totalRooms > 0;

  // Category label
  const categories: any[] = (data as any).categories || [];
  const categoryLabel =
    categories?.[0]?.category?.label ||
    categories?.[0]?.label ||
    categories?.[0]?.name ||
    null;

  // "New" badge 
  const isNew =
    data.createdAt &&
    (Date.now() - new Date(data.createdAt).getTime()) / (1000 * 60 * 60 * 24) < 14;

  const displayScore = matchScore || (Math.floor(Math.random() * (98 - 85 + 1)) + 85);

  return (
    <div className="relative group/card h-full">
      <Link href={`/listings/${data.id}`} className="block h-full cursor-pointer">
        <motion.div
          className="flex flex-col gap-0 w-full h-full p-2.5 bg-white dark:bg-slate-800/40 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 rounded-[2rem] transition-all duration-300 group-hover/card:bg-emerald-50/50 dark:group-hover/card:bg-slate-800/60 group-hover/card:border-emerald-500/30 group-hover/card:shadow-2xl group-hover/card:shadow-emerald-900/5"
          whileHover={{ y: -8 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* ── Image Container (Screenshot Layout) ── */}
          <div className="relative overflow-hidden rounded-[1.5rem] aspect-[5/4] bg-slate-100 dark:bg-slate-900 shadow-inner">
            <Image
              imageSrc={data.imageSrc}
              fill
              alt={data.title}
              effect="zoom"
              className="object-cover group-hover/card:scale-[1.08] transition-transform duration-1000 ease-in-out"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />

            {/* Top-Left Badges (NEW or AI SUGGESTION) */}
            <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
              {isNew && (
                <div className="bg-emerald-500 text-white px-2.5 py-1 rounded-lg shadow-lg text-[9px] font-black uppercase tracking-wider w-fit animate-in fade-in zoom-in duration-500">
                  NEW
                </div>
              )}
              {(matchScore || aiHighlight) && (
                <div className="bg-blue-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-lg shadow-lg text-[9px] font-black tracking-tight uppercase flex items-center gap-1 w-fit animate-in fade-in slide-in-from-left duration-700">
                  <Sparkles size={10} className="fill-white" />
                  <span>AI SUGGESTION</span>
                </div>
              )}
            </div>

            {/* Favorites Button */}
            <div className="absolute top-3 right-3 z-20">
              <HeartButton
                listingId={data.id}
                hasFavorited={hasFavorited}
              />
            </div>

            {/* Bottom Controls Overlay (Badges + Price) */}
            <div className="absolute bottom-3 left-3 right-3 z-10 flex items-end justify-between gap-2">
              {/* Left Side: Category */}
              <div className="flex items-center gap-1.5 ">
                {categoryLabel && (
                  <div className="bg-slate-900/80 dark:bg-slate-900/80 backdrop-blur-md text-white border border-white/10 dark:border-slate-700 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">
                    {categoryLabel}
                  </div>
                )}
              </div>

              {/* Right Side: Price Pill */}
              <div className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/10 dark:border-slate-700/50 shadow-2xl flex items-center gap-1 font-black text-xs">
                <span className="text-emerald-500">₱</span>
                <span>{formatPrice(price)}</span>
                {!reservation && <span className="text-[8px] text-slate-400 font-normal">/mo</span>}
              </div>
            </div>
          </div>

          {/* ── Info Section (Screenshot Style) ── */}
          <div className="pt-4 pb-1 px-2 flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-[14px] text-slate-900 dark:text-slate-50 uppercase tracking-wide line-clamp-1">
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
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <MapPin size={11} className="text-slate-400" />
                <span>{data?.region}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <DoorOpen size={11} className={availableRooms > 0 ? "text-emerald-500" : "text-slate-500"} />
                <span className={availableRooms > 0 ? "text-emerald-600 dark:text-emerald-500" : "text-slate-500"}>
                  {availableRooms > 0 ? `${availableRooms} Units Left` : "No Units"}
                </span>
              </div>
            </div>

            {/* AI Reasoning (Subtle & Themed) */}
            {aiHighlight ? (
              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1 italic">
                ✨ "{aiHighlight}"
              </p>
            ) : (
              <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 italic">
                {data.description || "Premium choice in " + data.region}
              </p>
            )}
          </div>
        </motion.div>
      </Link>
    </div>


  );
};


export default ListingCard;

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export function ListingSkeleton() {
  return (
    <div className="col-span-1 p-2 border border-transparent dark:border-neutral-800 rounded-3xl">
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

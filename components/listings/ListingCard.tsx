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
}

const ListingCard: React.FC<ListingCardProps> = ({
  data,
  reservation,
  hasFavorited,
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

  // "New" badge — listings created within last 14 days
  const isNew =
    data.createdAt &&
    (Date.now() - new Date(data.createdAt).getTime()) / (1000 * 60 * 60 * 24) <
      14;

  return (
    <div className="relative group">
      <Link href={`/listings/${data.id}`} className="block cursor-pointer">
        <motion.div
          className="flex flex-col gap-0 w-full"
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
        >
          {/* ── Image Container ── */}
          <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-gray-100 dark:bg-gray-800 shadow-sm group-hover:shadow-md transition-shadow duration-300">
            <Image
              imageSrc={data.imageSrc}
              fill
              alt={data.title}
              effect="zoom"
              className="object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />

            {/* Gradient overlay — bottom of image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none rounded-2xl" />

            {/* Top-left: ListingMenu */}
            <div className="absolute top-2.5 left-2.5 z-10">
              <ListingMenu id={reservation?.id || data.id} />
            </div>

            {/* Top-right: HeartButton */}
            <div className="absolute top-2.5 right-2.5 z-10">
              <HeartButton
                listingId={data.id}
                key={data.id}
                hasFavorited={hasFavorited}
              />
            </div>

            {/* Bottom-left: Category badge + New badge */}
            <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5">
              {categoryLabel && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/30 px-2 py-0.5 rounded-full">
                  {categoryLabel}
                </span>
              )}
              {isNew && (
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-primary/90 backdrop-blur-md text-white px-2 py-0.5 rounded-full">
                  <Sparkles size={9} />
                  New
                </span>
              )}
            </div>

            {/* Bottom-right: Rating pill on image */}
            {hasRating && (
              <div className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full">
                <Star size={10} className="fill-amber-400 text-amber-400" />
                <span className="text-[11px] font-bold text-white">
                  {Number(rating).toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* ── Info Section ── */}
          <div className="pt-2.5 px-0.5 flex flex-col gap-0.5">
            {/* Title */}
            <h3 className="font-bold text-[13.5px] leading-snug text-gray-900 dark:text-gray-100 line-clamp-1">
              {data?.title}
            </h3>

            {/* Location */}
            <div className="flex items-center gap-1">
              <MapPin size={11} className="text-gray-400 shrink-0" />
              <p className="text-[12px] text-gray-500 dark:text-gray-400 line-clamp-1">
                {data?.region}, {data?.country}
              </p>
            </div>

            {/* Reservation date OR available units indicator */}
            {reservationDate ? (
              <p className="text-[12px] text-gray-500 dark:text-gray-400 line-clamp-1">
                {reservationDate}
              </p>
            ) : hasRooms ? (
              <div className="flex items-center gap-1 mt-0.5">
                <DoorOpen size={11} className={availableRooms > 0 ? "text-emerald-500 shrink-0" : "text-gray-400 shrink-0"} />
                <span className={`text-[12px] font-semibold ${availableRooms > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`}>
                  {availableRooms > 0
                    ? `${availableRooms} of ${totalRooms} available`
                    : "Fully occupied"}
                </span>
              </div>
            ) : null}

            {/* Price */}
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-black text-[15px] text-primary">
                ₱{formatPrice(price)}
              </span>
              {!reservation && (
                <span className="text-gray-400 dark:text-gray-500 text-[12px] font-normal">
                  / month
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    </div>
  );
};

export default ListingCard;

export function ListingSkeleton() {
  return (
    <div className="col-span-1">
      <div className="flex flex-col gap-0 w-full">
        {/* Image skeleton */}
        <div
          className="aspect-[4/3] rounded-2xl shimmer"
          style={{ minHeight: 160 }}
        />
        {/* Info skeleton */}
        <div className="flex flex-col gap-2 pt-2.5 px-0.5">
          <div className="h-3.5 w-3/4 rounded shimmer" />
          <div className="h-3 w-1/2 rounded shimmer" />
          <div className="h-3 w-1/3 rounded shimmer" />
          <div className="h-4 w-24 rounded shimmer mt-1" />
        </div>
      </div>
    </div>
  );
}

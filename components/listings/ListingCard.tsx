"use client";

import React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Listing } from "@prisma/client";

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

  return (
    <div className="relative group">
      <div className="absolute top-0 left-0 p-3 md:p-4 flex items-center justify-between w-full z-10">
        <div className="z-5">
          <ListingMenu id={reservation?.id || data.id} />
        </div>
        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-glass border border-white/20 dark:border-white/10 shadow-soft text-current">
          <HeartButton
            listingId={data.id}
            key={data.id}
            hasFavorited={hasFavorited}
          />
        </div>
      </div>

      <Link href={`/listings/${data.id}`} className="col-span-1 cursor-pointer group/card block">
        <motion.div
          className="flex flex-col gap-2.5 w-full rounded-card overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/40 dark:border-white/10 shadow-soft hover:shadow-hover dark:shadow-glass-dark transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover/card:ring-2 group-hover/card:ring-primary/20 dark:group-hover/card:ring-primary/30"
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <div className="overflow-hidden rounded-t-card">
            <div className="aspect-[1/0.95] relative bg-gray-100 dark:bg-slate-800 overflow-hidden">
              <Image
                imageSrc={data.imageSrc}
                fill
                alt={data.title}
                effect="zoom"
                className="object-cover group-hover/card:scale-105 transition-transform duration-500 ease-out"
                sizes="100vw"
              />
            </div>
          </div>
          <div className="px-2 pb-2.5 pt-0.5">
            <span className="font-semibold text-[15px] text-text-primary dark:text-gray-100 line-clamp-1">
              {data?.region}, {data?.country}
            </span>
            <span className="font-normal text-text-secondary dark:text-gray-400 text-sm line-clamp-1">
              {reservationDate || data.category}
            </span>
            <div className="flex flex-row items-baseline gap-1 mt-1.5">
              <span className="font-bold text-primary dark:text-accent text-[15px]">
                ₱{formatPrice(price)}
              </span>
              {!reservation && (
                <span className="font-normal text-text-secondary dark:text-gray-400 text-xs">
                  / night
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
      <div className="flex flex-col gap-2.5 w-full">
        <div
          className="aspect-[1/0.95] rounded-card shimmer"
          style={{ minHeight: 180 }}
        />
        <div className="flex flex-col gap-2 px-1">
          <div className="h-4 w-3/4 rounded shimmer" />
          <div className="h-3 w-1/2 rounded shimmer" />
          <div className="h-4 w-20 rounded shimmer mt-1" />
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { Suspense } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/utils/motion";
import ListingCard from "@/components/listings/ListingCard";
import LoadMore from "@/components/listings/LoadMore";
import { Listing } from "@prisma/client";

interface ListingsGridProps {
  listings: Listing[];
  nextCursor: string | undefined;
  favorites: string[];
  searchParamsObj: { [key: string]: string | undefined };
}

export default function ListingsGrid({
  listings,
  nextCursor,
  favorites,
  searchParamsObj,
}: ListingsGridProps) {
  return (
    <motion.section
      className="main-container pt-14 md:pt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-6 xl:gap-5"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {listings.map((listing) => {
        const hasFavorited = favorites.includes(listing.id);
        return (
          <motion.div key={listing.id} variants={staggerItem}>
            <ListingCard data={listing} hasFavorited={hasFavorited} />
          </motion.div>
        );
      })}
      {nextCursor ? (
        <div className="contents">
          <Suspense fallback={null}>
            <LoadMore
              nextCursor={nextCursor}
              fnArgs={searchParamsObj}
              queryKey={["listings", searchParamsObj]}
              favorites={favorites}
            />
          </Suspense>
        </div>
      ) : null}
    </motion.section>
  );
}

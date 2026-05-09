"use client";

import React, { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/utils/motion";
import ListingCard from "@/components/listings/ListingCard";
import LoadMore from "@/components/listings/LoadMore";
import { Listing } from "@prisma/client";
import { getAIEnrichmentAction } from "@/app/actions/ai-enrichment";

interface ListingsGridProps {
  listings: Listing[];
  nextCursor: string | undefined;
  favorites: string[];
  searchParamsObj: { [key: string]: string | undefined };
}

export default function ListingsGrid({
  listings: initialListings,
  nextCursor,
  favorites,
  searchParamsObj,
}: ListingsGridProps) {
  const [currentListings, setCurrentListings] = useState(initialListings);
  const [isEnriching, setIsEnriching] = useState(false);

  // HI-2 FIX: Async AI Enrichment
  // We show initial results immediately, then trigger AI reasoning in the background
  useEffect(() => {
    // Only enrich if we have results and no existing AI highlights
    // and if we actually have search filters active
    const needsEnrichment = 
      initialListings.length > 0 && 
      Object.keys(searchParamsObj).length > 0 &&
      !initialListings.some(l => (l as any).aiHighlight);

    if (needsEnrichment && !isEnriching) {
      const enrich = async () => {
        setIsEnriching(true);
        try {
          const result = await getAIEnrichmentAction(initialListings, searchParamsObj as any);
          if (result.success && result.data) {
            setCurrentListings(result.data);
          }
        } catch (err) {
          console.error("Failed to enrich listings:", err);
        } finally {
          setIsEnriching(false);
        }
      };

      enrich();
    }
  }, [initialListings, searchParamsObj]);

  // Sync state if initialListings changes (e.g. new search)
  useEffect(() => {
    setCurrentListings(initialListings);
  }, [initialListings]);

  return (
    <motion.section
      className="main-container pt-14 md:pt-16 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 lg:gap-8 xl:gap-6"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {currentListings.map((listing) => {
        const hasFavorited = favorites.includes(listing.id);
        return (
          <motion.div key={listing.id} variants={staggerItem}>
          <ListingCard
              data={listing}
              hasFavorited={hasFavorited}
              aiHighlight={(listing as any).aiHighlight ?? undefined}
            />
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


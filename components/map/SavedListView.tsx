"use client";

import React, { useEffect, useState, useMemo } from "react";
import ListingCard from "@/components/listings/ListingCard";
import { Listing } from "@prisma/client";
import { useSession } from "next-auth/react";
import { getFavorites } from "@/services/user/favorites/favorite";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Button from "@/components/common/Button";

interface SavedListViewProps {
  onListingSelect: (listing: any) => void;
  listings: Listing[];
}

export default function SavedListView({ onListingSelect, listings }: SavedListViewProps) {
  const { data: session, status } = useSession();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (status === "authenticated") {
        setIsLoading(true);
        try {
          const ids = await getFavorites();
          setFavoriteIds(ids);
        } catch (error) {
          console.error("Failed to fetch favorites:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchFavorites();
  }, [status]);

  const savedListings = useMemo(() => {
    return listings.filter((listing) => favoriteIds.includes(listing.id));
  }, [listings, favoriteIds]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-800 p-8 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-gray-500">Loading your saved places...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Saved Places</h2>
        <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
          {savedListings.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {savedListings.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Image src="/images/empty-favorites.svg" alt="Empty favorites" width={60} height={60} className="opacity-50" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">No saved places yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[200px]">
              Tap the heart icon on any listing to save it here for later.
            </p>
          </div>
        ) : (
          savedListings.map((listing) => (
            <div key={listing.id}>
              <ListingCard 
                data={listing} 
                hasFavorited={true} 
                onClickOverride={(e) => {
                  if ((e.target as Element).closest('button')) return;
                  onListingSelect(listing);
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

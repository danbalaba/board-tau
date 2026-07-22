"use client";

import React, { useMemo } from "react";
import CompactListingCard from "@/components/listings/CompactListingCard";
import { Listing } from "@prisma/client";
import { useRecentStore } from "@/hooks/use-recent-store";
import Image from "next/image";
import { Clock } from "lucide-react";

interface RecentsListViewProps {
  onListingSelect: (listing: any) => void;
  listings: Listing[];
}

export default function RecentsListView({ onListingSelect, listings }: RecentsListViewProps) {
  const { recentListings, clearRecents } = useRecentStore();

  const displayListings = useMemo(() => {
    // We map the recent items to full listing objects from the map's listings array
    const fullListings = recentListings
      .map(recent => listings.find(l => l.id === recent.id))
      .filter((l): l is Listing => !!l);
    return fullListings;
  }, [recentListings, listings]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Places</h2>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <Clock size={12} /> Last 20 places viewed
          </p>
        </div>
        {displayListings.length > 0 && (
          <button 
            onClick={clearRecents}
            className="text-xs text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayListings.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <HistoryIcon />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">No history yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[200px]">
              Properties you view on the map will appear here.
            </p>
          </div>
        ) : (
          displayListings.map((listing) => (
            <div key={listing.id}>
              <CompactListingCard 
                data={listing} 
                hasFavorited={false}
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

function HistoryIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-300 dark:text-gray-600">
      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

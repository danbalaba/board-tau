"use client";

import React, { useMemo } from "react";
import CompactListingCard from "@/components/listings/CompactListingCard";
import { Listing } from "@prisma/client";

interface SidebarListViewProps {
  selectedLandmark: any;
  onListingSelect: (listing: any) => void;
  listings: Listing[];
}

export default function SidebarListView({ selectedLandmark, onListingSelect, listings }: SidebarListViewProps) {
  // Helper function to calculate distance in km using Haversine formula
  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const displayListings = useMemo(() => {
    if (!selectedLandmark) return listings;
    
    // Filter by 1km radius if a landmark is selected
    return listings.filter(listing => {
      if (!listing.latitude || !listing.longitude || !selectedLandmark.coords) return false;
      const dist = getDistanceFromLatLonInKm(
        selectedLandmark.coords[0], 
        selectedLandmark.coords[1], 
        Number(listing.latitude), 
        Number(listing.longitude)
      );
      return dist <= 1; // within 1km
    });
  }, [selectedLandmark, listings]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {selectedLandmark 
            ? `Listings near ${selectedLandmark.name}` 
            : `${listings.length} Boarding Houses`}
        </h2>
        {selectedLandmark && (
          <p className="text-sm text-gray-500 mt-1">Within 1km walking distance</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayListings.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No listings found in this area.</p>
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

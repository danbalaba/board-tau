import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Listing } from '@prisma/client';

export interface RecentListing {
  id: string;
  title: string;
  imageSrc: string;
  price: number;
  rating: number | null;
  region: string | null;
  viewedAt: number;
}

interface RecentStore {
  recentListings: RecentListing[];
  addRecentListing: (listing: Listing) => void;
  clearRecents: () => void;
}

export const useRecentStore = create<RecentStore>()(
  persist(
    (set) => ({
      recentListings: [],
      addRecentListing: (listing) => set((state) => {
        // Create the new recent item
        const newItem: RecentListing = {
          id: listing.id,
          title: listing.title,
          imageSrc: listing.imageSrc,
          price: listing.price,
          rating: listing.rating,
          region: listing.region,
          viewedAt: Date.now(),
        };

        // Remove if it already exists to avoid duplicates
        const filteredList = state.recentListings.filter((item) => item.id !== listing.id);

        // Add to the front of the list, keep only the last 20
        return {
          recentListings: [newItem, ...filteredList].slice(0, 20),
        };
      }),
      clearRecents: () => set({ recentListings: [] }),
    }),
    {
      name: 'recent-listings-storage', // name of the item in the storage (must be unique)
    }
  )
);

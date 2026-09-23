import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CompareStore {
  selectedListingIds: string[];
  cachedListingsData: Record<string, any>;
  addListing: (id: string) => boolean;
  removeListing: (id: string) => void;
  clearListings: () => void;
  setCachedListings: (listings: any[]) => void;
  getCachedListings: (ids: string[]) => any[] | null;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      selectedListingIds: [],
      cachedListingsData: {},
      addListing: (id) => {
        const { selectedListingIds } = get();
        if (!selectedListingIds.includes(id)) {
          if (selectedListingIds.length >= 3) {
            // Strict Cap: Do not auto-replace oldest item; block 4th item selection
            return false;
          }
          set({ selectedListingIds: [...selectedListingIds, id] });
          return true;
        }
        return false;
      },
      removeListing: (id) => {
        set((state) => ({
          selectedListingIds: state.selectedListingIds.filter(
            (itemId) => itemId !== id
          ),
        }));
      },
      clearListings: () => set({ selectedListingIds: [] }),
      setCachedListings: (listings) => {
        set((state) => {
          const nextCache = { ...state.cachedListingsData };
          listings.forEach((listing) => {
            if (listing && listing.id) {
              nextCache[listing.id] = listing;
            }
          });

          // Memory Guard: Prune cache if it exceeds 20 items to prevent RAM bloat
          const keys = Object.keys(nextCache);
          if (keys.length > 20) {
            const keysToRemove = keys.slice(0, keys.length - 20);
            keysToRemove.forEach((key) => delete nextCache[key]);
          }

          return { cachedListingsData: nextCache };
        });
      },
      getCachedListings: (ids) => {
        const { cachedListingsData } = get();
        if (!ids || ids.length === 0) return [];
        const cached = ids.map((id) => cachedListingsData[id]).filter(Boolean);
        if (cached.length === ids.length) {
          return cached;
        }
        return null;
      },
    }),
    {
      name: "compare-storage",
      // CRITICAL: Only persist selectedListingIds to localStorage (keeps storage under 100 bytes)
      partialize: (state) => ({
        selectedListingIds: state.selectedListingIds,
      }),
    }
  )
);


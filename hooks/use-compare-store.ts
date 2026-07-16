import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CompareStore {
  selectedListingIds: string[];
  addListing: (id: string) => void;
  removeListing: (id: string) => void;
  clearListings: () => void;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      selectedListingIds: [],
      addListing: (id) => {
        const { selectedListingIds } = get();
        if (selectedListingIds.length < 3 && !selectedListingIds.includes(id)) {
          set({ selectedListingIds: [...selectedListingIds, id] });
        }
      },
      removeListing: (id) => {
        set((state) => ({
          selectedListingIds: state.selectedListingIds.filter(
            (itemId) => itemId !== id
          ),
        }));
      },
      clearListings: () => set({ selectedListingIds: [] }),
    }),
    {
      name: "compare-storage",
    }
  )
);

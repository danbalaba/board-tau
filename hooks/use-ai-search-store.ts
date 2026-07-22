import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AISearchQuery {
  id: string;
  query: string;
  searchedAt: number;
}

interface AISearchStore {
  recentQueries: AISearchQuery[];
  addQuery: (query: string) => void;
  clearQueries: () => void;
}

export const useAISearchStore = create<AISearchStore>()(
  persist(
    (set) => ({
      recentQueries: [],
      addQuery: (query) => set((state) => {
        const newQuery: AISearchQuery = {
          id: Date.now().toString(),
          query: query.trim(),
          searchedAt: Date.now(),
        };

        const filtered = state.recentQueries.filter((q) => q.query.toLowerCase() !== query.toLowerCase());

        return {
          recentQueries: [newQuery, ...filtered].slice(0, 10), // keep last 10
        };
      }),
      clearQueries: () => set({ recentQueries: [] }),
    }),
    {
      name: 'ai-search-history',
    }
  )
);

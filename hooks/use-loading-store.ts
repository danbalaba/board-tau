import { create } from "zustand";

interface LoadingStore {
  isLoading: boolean;
  isLoggingOut: boolean;
  setIsLoading: (isLoading: boolean) => void;
  setIsLoggingOut: (isLoggingOut: boolean) => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  isLoading: false,
  isLoggingOut: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsLoggingOut: (isLoggingOut) => set({ isLoggingOut }),
}));

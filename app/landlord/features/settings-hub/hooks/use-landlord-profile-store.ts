'use client';

import { create } from 'zustand';

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  latlng?: number[] | null;
  bio?: string;
}

interface LandlordProfileStore {
  user: UserProfile | null;
  isInitialized: boolean;
  setUser: (user: UserProfile) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  setInitialized: (val: boolean) => void;
}

export const useLandlordProfileStore = create<LandlordProfileStore>((set) => ({
  user: null,
  isInitialized: false,
  setUser: (user) => set({ user, isInitialized: true }),
  updateUser: (updates) => 
    set((state) => ({ 
      user: state.user ? { ...state.user, ...updates } : null 
    })),
  setInitialized: (val) => set({ isInitialized: val }),
}));

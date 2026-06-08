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

type SettingsTab = 'profile' | 'notifications' | 'payment' | 'security';

interface LandlordProfileStore {
  user: UserProfile | null;
  isInitialized: boolean;
  // Settings UI State
  isSettingsOpen: boolean;
  activeTab: SettingsTab;
  
  setUser: (user: UserProfile) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  setInitialized: (val: boolean) => void;
  
  // Settings Actions
  openSettings: (tab?: SettingsTab) => void;
  closeSettings: () => void;
}

export const useLandlordProfileStore = create<LandlordProfileStore>((set) => ({
  user: null,
  isInitialized: false,
  isSettingsOpen: false,
  activeTab: 'profile',
  
  setUser: (user) => set({ user, isInitialized: true }),
  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null
    })),
  setInitialized: (val) => set({ isInitialized: val }),
  
  openSettings: (tab = 'profile') => set({ isSettingsOpen: true, activeTab: tab }),
  closeSettings: () => set({ isSettingsOpen: false }),
}));

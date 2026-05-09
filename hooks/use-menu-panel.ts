import { create } from 'zustand';

interface MenuPanelStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useMenuPanel = create<MenuPanelStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

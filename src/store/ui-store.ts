import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { APP_UI_STORAGE_KEY } from '@/config/app';

interface UIState {
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  presentationMode: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setPresentationMode: (enabled: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      presentationMode: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setPresentationMode: (enabled) => set({ presentationMode: enabled }),
    }),
    {
      name: APP_UI_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

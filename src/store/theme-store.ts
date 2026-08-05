import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { APP_THEME_STORAGE_KEY } from '@/config/app';
import type { ThemeMode } from '@/config/theme';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: APP_THEME_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

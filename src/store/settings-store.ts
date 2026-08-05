import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { APP_SETTINGS_STORAGE_KEY } from '@/config/app';
import { defaultSettingsValues, type SettingsValues } from '@/features/settings/settings-schema';

interface SettingsState extends SettingsValues {
  updateSettings: (patch: Partial<SettingsValues>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettingsValues,
      updateSettings: (patch) => set((state) => ({ ...state, ...patch })),
      resetSettings: () => set({ ...defaultSettingsValues }),
    }),
    {
      name: APP_SETTINGS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

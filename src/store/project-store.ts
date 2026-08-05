import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { APP_PROJECT_STORAGE_KEY } from '@/config/app';

interface ProjectState {
  activeProjectId: string | null;
  recentProjectIds: string[];
  setActiveProjectId: (projectId: string | null) => void;
  pushRecentProjectId: (projectId: string) => void;
  clearRecentProjects: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      activeProjectId: null,
      recentProjectIds: [],
      setActiveProjectId: (projectId) => set({ activeProjectId: projectId }),
      pushRecentProjectId: (projectId) =>
        set((state) => {
          const recentProjectIds = [
            projectId,
            ...state.recentProjectIds.filter((id) => id !== projectId),
          ].slice(0, 10);

          return { recentProjectIds, activeProjectId: projectId };
        }),
      clearRecentProjects: () => set({ recentProjectIds: [], activeProjectId: null }),
    }),
    {
      name: APP_PROJECT_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

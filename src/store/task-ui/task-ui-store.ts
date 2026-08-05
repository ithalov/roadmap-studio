import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TaskSearchFilters } from '@/database/repositories/TaskRepository';

type TaskFilters = Omit<TaskSearchFilters, 'phaseId'>;
interface TaskUiState {
  selectedTaskId: string | null;
  panelOpen: boolean;
  compact: boolean;
  filters: TaskFilters;
  setSelectedTask: (id: string | null) => void;
  setPanelOpen: (open: boolean) => void;
  setCompact: (compact: boolean) => void;
  setFilters: (filters: TaskFilters) => void;
  clearFilters: () => void;
}
export const useTaskUiStore = create<TaskUiState>()(persist((set) => ({
  selectedTaskId: null, panelOpen: false, compact: false, filters: { sort: 'position' },
  setSelectedTask: (selectedTaskId) => set({ selectedTaskId, panelOpen: Boolean(selectedTaskId) }),
  setPanelOpen: (panelOpen) => set({ panelOpen }), setCompact: (compact) => set({ compact }),
  setFilters: (filters) => set({ filters }), clearFilters: () => set({ filters: { sort: 'position' } }),
}), { name: 'roadmap-studio-task-ui', storage: createJSONStorage(() => localStorage), partialize: (state) => ({ compact: state.compact }) }));

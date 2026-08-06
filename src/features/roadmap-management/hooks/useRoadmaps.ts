import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roadmapService } from '@/features/roadmap-management/services/RoadmapService';
import type { RoadmapFilters } from '@/features/roadmap-management/types/roadmap-management';
import type { RoadmapFormValues } from '@/features/roadmap-management/schemas/roadmap-form';

const key = ['roadmaps'] as const;
export function useRoadmaps(filters: RoadmapFilters = {}, enabled = true) { return useQuery({ queryKey: [...key, 'active', filters], queryFn: () => roadmapService.getActive(filters), enabled }); }
export function useArchivedRoadmaps(filters: RoadmapFilters = {}) { return useQuery({ queryKey: [...key, 'archived', filters], queryFn: () => roadmapService.getArchived(filters) }); }
export function useDeletedRoadmaps(filters: RoadmapFilters = {}) { return useQuery({ queryKey: [...key, 'deleted', filters], queryFn: () => roadmapService.getDeleted(filters) }); }
export function useRoadmap(id: string) { return useQuery({ queryKey: [...key, id], queryFn: () => roadmapService.getById(id), enabled: Boolean(id) }); }
export function useDashboardData() { return useQuery({ queryKey: [...key, 'dashboard'], queryFn: async () => ({ stats: await roadmapService.getStats(), recent: await roadmapService.getRecent(6) }) }); }
export function useRoadmapActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: key });
  return {
    create: useMutation({ mutationFn: (values: RoadmapFormValues) => roadmapService.create(values), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, values }: { id: string; values: RoadmapFormValues }) => roadmapService.update(id, values), onSuccess: invalidate }),
    duplicate: useMutation({ mutationFn: (id: string) => roadmapService.duplicate(id), onSuccess: invalidate }),
    archive: useMutation({ mutationFn: (id: string) => roadmapService.archive(id), onSuccess: invalidate }),
    restoreArchived: useMutation({ mutationFn: (id: string) => roadmapService.restoreArchived(id), onSuccess: invalidate }),
    favorite: useMutation({ mutationFn: (id: string) => roadmapService.toggleFavorite(id), onSuccess: invalidate }),
    softDelete: useMutation({ mutationFn: (id: string) => roadmapService.softDelete(id), onSuccess: invalidate }),
    restoreDeleted: useMutation({ mutationFn: (id: string) => roadmapService.restoreDeleted(id), onSuccess: invalidate }),
    permanentDelete: useMutation({ mutationFn: (id: string) => roadmapService.permanentDelete(id), onSuccess: invalidate }),
  };
}

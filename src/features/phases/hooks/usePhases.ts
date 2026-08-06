import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { phaseService } from '@/features/phases/services/PhaseService';
import type { PhaseFormValues } from '@/features/phases/schemas/phase-form';
const key = ['phases'] as const;
export function usePhases(roadmapId: string) {
  return useQuery({
    queryKey: [...key, roadmapId],
    queryFn: () => phaseService.list(roadmapId),
    enabled: Boolean(roadmapId),
  });
}
export function useDeletedPhases(roadmapId: string) { return useQuery({ queryKey: [...key, roadmapId, 'deleted'], queryFn: () => phaseService.listDeleted(roadmapId), enabled: Boolean(roadmapId) }); }
export function usePhaseHistory(id: string) { return useQuery({ queryKey: [...key, id, 'history'], queryFn: () => phaseService.history(id), enabled: Boolean(id) }); }
export function usePhaseActions(roadmapId: string) {
  const client = useQueryClient();
  const refresh = () => {
    client.invalidateQueries({ queryKey: [...key, roadmapId] });
    client.invalidateQueries({ queryKey: ['roadmaps'] });
  };
  return {
    create: useMutation({
      mutationFn: (v: PhaseFormValues) => phaseService.create(roadmapId, v),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, values }: { id: string; values: PhaseFormValues }) =>
        phaseService.update(id, values),
      onSuccess: refresh,
    }),
    reorder: useMutation({
      mutationFn: (ids: string[]) => phaseService.reorder(roadmapId, ids),
      onSuccess: refresh,
    }),
    remove: useMutation({ mutationFn: phaseService.remove, onSuccess: refresh }),
    restore: useMutation({ mutationFn: phaseService.restore, onSuccess: refresh }),
    permanentDelete: useMutation({ mutationFn: phaseService.permanentDelete, onSuccess: refresh }),
  };
}

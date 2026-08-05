import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  roadmapImportService,
  type RoadmapImportResult,
} from '@/features/roadmap-management/services/RoadmapImportService';

export function useRoadmapImport() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (content: unknown): Promise<RoadmapImportResult> =>
      roadmapImportService.import(content),
    onSuccess: () => client.invalidateQueries({ queryKey: ['roadmaps'] }),
  });
}

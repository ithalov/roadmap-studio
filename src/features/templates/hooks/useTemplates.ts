import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { templateService } from '@/features/templates/services/TemplateService';
import type {
  TemplateCreateValues,
  TemplateProjectValues,
} from '@/features/templates/schemas/template';
import type { TemplateFilters } from '@/features/templates/types/template';

const key = ['templates'] as const;
export function useTemplates(filters: TemplateFilters = {}) {
  return useQuery({ queryKey: [...key, filters], queryFn: () => templateService.list(filters) });
}
export function useTemplate(id: string) {
  return useQuery({
    queryKey: [...key, id],
    queryFn: () => templateService.get(id),
    enabled: Boolean(id),
  });
}
export function useTemplateActions() {
  const client = useQueryClient();
  const invalidate = () => client.invalidateQueries({ queryKey: key });
  return {
    createFromRoadmap: useMutation({
      mutationFn: ({ roadmapId, values }: { roadmapId: string; values: TemplateCreateValues }) =>
        templateService.createFromRoadmap(roadmapId, values),
      onSuccess: invalidate,
    }),
    use: useMutation({
      mutationFn: ({ id, values }: { id: string; values: TemplateProjectValues }) =>
        templateService.use(id, values),
      onSuccess: invalidate,
    }),
    favorite: useMutation({
      mutationFn: templateService.favorite.bind(templateService),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: templateService.remove.bind(templateService),
      onSuccess: invalidate,
    }),
    import: useMutation({
      mutationFn: templateService.import.bind(templateService),
      onSuccess: invalidate,
    }),
  };
}

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectDraftSchema, type ProjectDraftValues } from '@/features/projects/project-schema';
import { emptyProjectDraft } from '@/features/projects/project-utils';

export function useProjectForm(initialValues?: Partial<ProjectDraftValues>) {
  const defaultValues = useMemo<ProjectDraftValues>(
    () => ({
      ...emptyProjectDraft,
      ...initialValues,
    }),
    [initialValues],
  );

  return useForm<ProjectDraftValues>({
    defaultValues,
    resolver: zodResolver(projectDraftSchema),
    mode: 'onSubmit',
  });
}

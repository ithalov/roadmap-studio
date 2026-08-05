import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/features/settings/services/SettingsService';
import type { SettingsFormValues } from '@/features/settings/schemas/settings-form';

const key = ['settings'] as const;

export function useSettings() {
  return useQuery({ queryKey: key, queryFn: () => settingsService.get() });
}

export function useSaveSettings() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (values: SettingsFormValues) => settingsService.save(values),
    onSuccess: (settings) => client.setQueryData(key, settings),
  });
}

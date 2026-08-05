import { z } from 'zod';

export const settingsFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.enum(['pt-BR', 'en-US']),
  accentColor: z.string().trim().min(1).max(32),
  autosave: z.boolean(),
  backupInterval: z.coerce.number().int().positive().max(525600),
  workspace: z.string().trim().max(500),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export const defaultSettingsFormValues: SettingsFormValues = {
  theme: 'system',
  language: 'pt-BR',
  accentColor: '#2563EB',
  autosave: true,
  backupInterval: 1440,
  workspace: '',
};

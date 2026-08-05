import { z } from 'zod';
import { themeModes } from '@/config/theme';

export const languageSchema = z.enum(['pt-BR', 'en-US']);
export const themeModeSchema = z.enum(themeModes);

export const settingsSchema = z.object({
  language: languageSchema,
  theme: themeModeSchema,
  accentColor: z.string().min(1),
  backupDirectory: z.string().min(1),
  autoSaveEnabled: z.boolean(),
  autoSaveIntervalMinutes: z.number().int().min(1).max(120),
  updateChannel: z.enum(['stable', 'beta']),
});

export type SettingsValues = z.infer<typeof settingsSchema>;

export const defaultSettingsValues: SettingsValues = {
  language: 'pt-BR',
  theme: 'system',
  accentColor: '222 89% 55%',
  backupDirectory: '',
  autoSaveEnabled: true,
  autoSaveIntervalMinutes: 5,
  updateChannel: 'stable',
};

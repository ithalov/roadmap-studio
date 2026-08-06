import { z } from 'zod';
import { wallpaperStyles, wallpaperIntensityValues } from '@/features/settings/types/wallpaper';

export const settingsFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.enum(['pt-BR', 'en-US']),
  accentColor: z.string().trim().min(1).max(32),
  wallpaper: z.enum(wallpaperStyles),
  wallpaperIntensity: z
    .number()
    .int()
    .min(wallpaperIntensityValues[0])
    .max(wallpaperIntensityValues[wallpaperIntensityValues.length - 1]),
  badgesShowIcons: z.boolean(),
  badgesShowBorder: z.boolean(),
  badgesShowShadow: z.boolean(),
  badgesColored: z.boolean(),
  badgesMinimal: z.boolean(),
  badgesShowTooltips: z.boolean(),
  autosave: z.boolean(),
  backupInterval: z.coerce.number().int().positive().max(525600),
  workspace: z.string().trim().max(500),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export const defaultSettingsFormValues: SettingsFormValues = {
  theme: 'system',
  language: 'pt-BR',
  accentColor: '#2563EB',
  wallpaper: 'none',
  wallpaperIntensity: 2,
  badgesShowIcons: true,
  badgesShowBorder: true,
  badgesShowShadow: false,
  badgesColored: true,
  badgesMinimal: false,
  badgesShowTooltips: true,
  autosave: true,
  backupInterval: 1440,
  workspace: '',
};

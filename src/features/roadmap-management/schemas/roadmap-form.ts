import { z } from 'zod';
import { roadmapStatuses } from '@/features/roadmap-management/types/roadmap-management';

export const roadmapFormSchema = z.object({
  title: z.string().trim().min(2, 'Informe ao menos 2 caracteres.').max(80),
  description: z.string().trim().max(500).default(''),
  version: z.string().trim().regex(/^\d+\.\d+\.\d+$/, 'Use o formato 0.1.0.').default('0.1.0'),
  category: z.string().trim().max(40).default(''),
  status: z.enum(roadmapStatuses).default('draft'),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Use uma cor hexadecimal.').default('#2563EB'),
  progressMode: z.enum(['automatic', 'manual']).default('automatic'),
});
export type RoadmapFormValues = z.infer<typeof roadmapFormSchema>;

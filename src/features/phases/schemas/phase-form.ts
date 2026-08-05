import { z } from 'zod';
import { phasePriorities, phaseStatuses } from '@/features/phases/types/phase';

export const phaseFormSchema = z
  .object({
    title: z.string().trim().min(2).max(100),
    description: z.string().trim().max(2000).default(''),
    status: z.enum(phaseStatuses).default('planned'),
    priority: z.enum(phasePriorities).default('medium'),
    progress: z.number().int().min(0).max(100).default(0),
    progressMode: z.enum(['automatic', 'manual']).default('manual'),
    startDate: z.string().date().nullable().default(null),
    targetDate: z.string().date().nullable().default(null),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .nullable()
      .default(null),
    icon: z.enum(['flag', 'milestone', 'rocket', 'target']).nullable().default(null),
  })
  .refine((value) => !value.startDate || !value.targetDate || value.targetDate >= value.startDate, {
    message: 'A data final não pode ser anterior à inicial.',
    path: ['targetDate'],
  });
export type PhaseFormValues = z.infer<typeof phaseFormSchema>;

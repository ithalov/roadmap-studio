import { z } from 'zod';
import { syncStatuses } from '@/types/entity';

export const entityMetaInputSchema = z.object({
  id: z.string().uuid().optional(),
  deviceId: z.string().min(1).optional(),
});
const text = (maximum: number) => z.string().trim().max(maximum);
const optionalDate = z.string().date().nullable().optional();

export const roadmapInputSchema = entityMetaInputSchema.extend({
  title: text(160).min(1),
  description: text(4000).default(''),
  version: text(40).default('1.0.0'),
  category: text(80).default(''),
  status: text(40).default('draft'),
  accentColor: z.string().trim().min(1).max(32).default('#2563EB'),
  progressMode: text(40).default('automatic'),
});
export const phaseInputSchema = entityMetaInputSchema.extend({
  roadmapId: z.string().uuid(),
  title: text(160).min(1),
  description: text(4000).default(''),
  position: z.number().int().nonnegative(),
  status: text(40).default('not_started'),
  priority: text(40).default('medium'),
  progress: z.number().int().min(0).max(100).default(0),
  startDate: optionalDate,
  targetDate: optionalDate,
});
export const taskInputSchema = entityMetaInputSchema.extend({
  phaseId: z.string().uuid(),
  title: text(160).min(1),
  description: text(4000).default(''),
  position: z.number().int().nonnegative(),
  status: z.enum(['backlog', 'planned', 'not_started', 'in_progress', 'blocked', 'in_review', 'completed', 'cancelled']).default('not_started'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  completed: z.boolean().default(false),
  startDate: optionalDate,
  estimatedMinutes: z.number().int().nonnegative().nullable().optional(),
  spentMinutes: z.number().int().nonnegative().default(0),
  dueDate: optionalDate,
  assignee: z.string().trim().max(100).nullable().optional(),
}).refine((value) => !value.startDate || !value.dueDate || value.dueDate >= value.startDate, {
  message: 'O prazo nao pode ser anterior a data inicial.',
  path: ['dueDate'],
});
export const subtaskInputSchema = entityMetaInputSchema.extend({
  taskId: z.string().uuid(),
  title: text(160).min(2),
  completed: z.boolean().default(false),
  position: z.number().int().nonnegative(),
});
export const tagInputSchema = entityMetaInputSchema.extend({
  name: text(30).min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#64748B'),
});
export const settingsInputSchema = entityMetaInputSchema.extend({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.enum(['pt-BR', 'en-US']).default('pt-BR'),
  accentColor: z.string().trim().min(1).max(32).default('#2563EB'),
  autosave: z.boolean().default(true),
  backupInterval: z.number().int().positive().default(1440),
  workspace: text(500).default(''),
});
export const syncStatusSchema = z.enum(syncStatuses);
export type RoadmapInput = z.input<typeof roadmapInputSchema>;
export type PhaseInput = z.input<typeof phaseInputSchema>;
export type TaskInput = z.input<typeof taskInputSchema>;
export type SubtaskInput = z.input<typeof subtaskInputSchema>;
export type TagInput = z.input<typeof tagInputSchema>;
export type SettingsInput = z.input<typeof settingsInputSchema>;

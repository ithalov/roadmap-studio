import { z } from 'zod';
import { taskPriorities, taskStatuses } from '@/features/tasks/types/task';
const statusSchema = z.enum(taskStatuses);
export const kanbanSettingsSchema = z.object({ visibleColumns: z.array(statusSchema).min(1), columnOrder: z.array(statusSchema).length(taskStatuses.length), wipLimits: z.record(z.string(),z.number().int().positive().nullable()).default({}), compactMode: z.boolean().default(false) });
export const kanbanMoveSchema = z.object({ taskId: z.string().uuid(), targetStatus: statusSchema, targetPosition: z.number().int().nonnegative() });
export const kanbanFiltersSchema = z.object({ phaseId: z.string().uuid().optional(), query: z.string().trim().max(160).optional(), priority: z.enum(taskPriorities).optional(), status: statusSchema.optional(), overdue: z.boolean().optional(), blocked: z.boolean().optional(), completed: z.boolean().optional(), sort: z.enum(['kanban','priority','due_date','updated_at','created_at','title','phase']).optional() });

import { z } from 'zod';
import { taskPriorities, taskStatuses } from '@/features/tasks/types/task';

const optionalDate = z.string().date().nullable();
export const taskFormSchema = z.object({
  title: z.string().trim().min(2, 'Informe ao menos 2 caracteres.').max(160),
  description: z.string().trim().max(5000).default(''),
  status: z.enum(taskStatuses).default('not_started'),
  priority: z.enum(taskPriorities).default('medium'),
  startDate: optionalDate.default(null),
  dueDate: optionalDate.default(null),
  estimatedMinutes: z.number().int().nonnegative().nullable().default(null),
  spentMinutes: z.number().int().nonnegative().default(0),
  assignee: z.string().trim().max(100).nullable().default(null),
}).refine((value) => !value.startDate || !value.dueDate || value.dueDate >= value.startDate, { path: ['dueDate'], message: 'O prazo nao pode ser anterior a data inicial.' });
export type TaskFormValues = z.infer<typeof taskFormSchema>;

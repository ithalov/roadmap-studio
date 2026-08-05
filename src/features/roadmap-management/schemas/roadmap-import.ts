import { z } from 'zod';

const optionalDate = z.string().date().nullable().optional();

const importedTagSchema = z.object({
  name: z.string().trim().min(1).max(30),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

const importedSubtaskSchema = z.object({
  title: z.string().trim().min(2).max(160),
  completed: z.boolean().optional(),
  position: z.number().int().nonnegative().optional(),
});

const importedTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().max(4000).optional(),
    position: z.number().int().nonnegative().optional(),
    status: z
      .enum([
        'backlog',
        'planned',
        'not_started',
        'in_progress',
        'blocked',
        'in_review',
        'completed',
        'cancelled',
      ])
      .optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    completed: z.boolean().optional(),
    startDate: optionalDate,
    estimatedMinutes: z.number().int().nonnegative().nullable().optional(),
    spentMinutes: z.number().int().nonnegative().optional(),
    dueDate: optionalDate,
    assignee: z.string().trim().max(100).nullable().optional(),
    subtasks: z.array(importedSubtaskSchema).default([]),
    tags: z.array(importedTagSchema).default([]),
  })
  .refine((task) => !task.startDate || !task.dueDate || task.dueDate >= task.startDate, {
    message: 'O prazo nao pode ser anterior a data inicial.',
    path: ['dueDate'],
  });

const importedPhaseSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(4000).optional(),
  position: z.number().int().nonnegative().optional(),
  status: z.string().trim().min(1).max(40).optional(),
  priority: z.string().trim().min(1).max(40).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  startDate: optionalDate,
  targetDate: optionalDate,
  tasks: z.array(importedTaskSchema).default([]),
});

export const roadmapImportSchema = z.object({
  version: z.literal(1),
  roadmap: z.object({
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().max(4000).optional(),
    version: z.string().trim().max(40).optional(),
    category: z.string().trim().max(80).optional(),
    status: z.string().trim().min(1).max(40).optional(),
    accentColor: z.string().trim().min(1).max(32).optional(),
    progressMode: z.string().trim().min(1).max(40).optional(),
  }),
  phases: z.array(importedPhaseSchema).min(1).max(500),
});

export type RoadmapImport = z.infer<typeof roadmapImportSchema>;

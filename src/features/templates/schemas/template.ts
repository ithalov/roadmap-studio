import { z } from 'zod';

const tags = z.array(z.string().trim().min(1).max(32)).max(12).default([]);

export const templateCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(800).default(''),
  category: z.string().trim().min(1).max(48).default('Other'),
  tags,
  coverImage: z.string().trim().max(2048).nullable().default(null),
  icon: z.string().trim().max(32).nullable().default(null),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .default('#2563EB'),
  author: z.string().trim().max(80).default(''),
  version: z.string().trim().min(1).max(32).default('1.0.0'),
});

export const templateProjectSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1200),
  category: z.string().trim().max(60),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export const templateImportSchema = templateCreateSchema.extend({
  format: z.literal('roadmap-studio-template'),
  formatVersion: z.literal(1),
  snapshot: z.object({
    formatVersion: z.literal(1),
    roadmap: z.object({
      title: z.string(),
      description: z.string(),
      version: z.string(),
      category: z.string(),
      status: z.string(),
      accentColor: z.string(),
      progressMode: z.string(),
    }),
    phases: z.array(
      z.object({
        sourceId: z.string(),
        title: z.string(),
        description: z.string(),
        position: z.number(),
        status: z.string(),
        priority: z.string(),
        progress: z.number(),
        startDate: z.string().nullable(),
        targetDate: z.string().nullable(),
      }),
    ),
    tasks: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        position: z.number(),
        status: z.string(),
        priority: z.string(),
        completed: z.boolean(),
        startDate: z.string().nullable(),
        estimatedMinutes: z.number().nullable(),
        spentMinutes: z.number(),
        dueDate: z.string().nullable(),
        assignee: z.string().nullable(),
        sourcePhaseId: z.string(),
      }),
    ),
  }),
});

export type TemplateCreateValues = z.infer<typeof templateCreateSchema>;
export type TemplateProjectValues = z.infer<typeof templateProjectSchema>;

import { z } from 'zod';
import { idSchema, isoDateTimeSchema, nullableIsoDateTimeSchema } from '@/schemas/common';

export const projectBaseSchema = z.object({
  id: idSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
  deletedAt: nullableIsoDateTimeSchema,
  syncStatus: z.enum(['local', 'pending', 'synced', 'conflict', 'deleted', 'error']),
  localVersion: z.number().int().nonnegative(),
  serverVersion: z.number().int().nonnegative(),
  deviceId: z.string().min(1),
});

export const projectDraftSchema = projectBaseSchema
  .extend({
    name: z.string().min(1).max(120),
    description: z.string().max(500),
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    syncStatus: true,
    localVersion: true,
    serverVersion: true,
    deviceId: true,
  });

export type ProjectDraftValues = z.infer<typeof projectDraftSchema>;

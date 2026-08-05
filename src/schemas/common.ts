import { z } from 'zod';

export const idSchema = z.string().min(1);
export const isoDateTimeSchema = z.iso.datetime({ offset: true });
export const nullableIsoDateTimeSchema = isoDateTimeSchema.nullable();

import { initialSchemaMigration } from '@/database/migrations/001-initial-schema';
import { roadmapFavoritesMigration } from '@/database/migrations/002-roadmap-favorites';
import { phaseEditorMigration } from '@/database/migrations/003-phase-editor';
import { taskManagementMigration } from '@/database/migrations/004-task-management';
import { kanbanFoundationMigration } from '@/database/migrations/005-kanban-foundation';
import type { MigrationDefinition } from '@/database/migrations/migration-types';

export const migrations: MigrationDefinition[] = [initialSchemaMigration, roadmapFavoritesMigration, phaseEditorMigration, taskManagementMigration, kanbanFoundationMigration];
export type { MigrationDefinition } from '@/database/migrations/migration-types';

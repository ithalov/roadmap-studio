import type { MigrationDefinition } from '@/database/migrations/migration-types';
import type { QueryResultRow } from '@/types/database';

interface ColumnRow extends QueryResultRow {
  name: string;
}

const settingsColumns = [
  "wallpaper TEXT NOT NULL DEFAULT 'none'",
  'wallpaper_intensity INTEGER NOT NULL DEFAULT 2',
  'badges_show_icons INTEGER NOT NULL DEFAULT 1',
  'badges_show_border INTEGER NOT NULL DEFAULT 1',
  'badges_show_shadow INTEGER NOT NULL DEFAULT 0',
  'badges_colored INTEGER NOT NULL DEFAULT 1',
  'badges_minimal INTEGER NOT NULL DEFAULT 0',
  'badges_show_tooltips INTEGER NOT NULL DEFAULT 1',
] as const;

export const repairSettingsPreferencesMigration: MigrationDefinition = {
  version: 8,
  description: 'Repair missing settings preference columns',
  async up(database) {
    const existing = new Set(
      (await database.select<ColumnRow>('PRAGMA table_info(settings)')).map((column) => column.name),
    );
    for (const definition of settingsColumns) {
      const name = definition.split(' ')[0];
      if (!existing.has(name)) await database.execute(`ALTER TABLE settings ADD COLUMN ${definition}`);
    }
  },
};

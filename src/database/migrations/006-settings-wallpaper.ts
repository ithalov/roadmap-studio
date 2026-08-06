import type { MigrationDefinition } from '@/database/migrations/migration-types';
import type { QueryResultRow } from '@/types/database';

interface ColumnRow extends QueryResultRow { name: string; }

export const settingsWallpaperMigration: MigrationDefinition = {
  version: 6,
  description: 'Add premium wallpaper preferences to settings',
  async up(database) {
    const columns = new Set((await database.select<ColumnRow>('PRAGMA table_info(settings)')).map((column) => column.name));
    if (!columns.has('wallpaper')) await database.execute("ALTER TABLE settings ADD COLUMN wallpaper TEXT NOT NULL DEFAULT 'none'");
    if (!columns.has('wallpaper_intensity')) await database.execute('ALTER TABLE settings ADD COLUMN wallpaper_intensity INTEGER NOT NULL DEFAULT 2');
  },
};

import type { MigrationDefinition } from '@/database/migrations/migration-types';

export const settingsWallpaperMigration: MigrationDefinition = {
  version: 6,
  description: 'Add premium wallpaper preferences to settings',
  async up(database) {
    await database.execute("ALTER TABLE settings ADD COLUMN wallpaper TEXT NOT NULL DEFAULT 'none'");
    await database.execute(
      'ALTER TABLE settings ADD COLUMN wallpaper_intensity INTEGER NOT NULL DEFAULT 2',
    );
  },
};

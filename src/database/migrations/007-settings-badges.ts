import type { MigrationDefinition } from '@/database/migrations/migration-types';

export const settingsBadgesMigration: MigrationDefinition = {
  version: 7,
  description: 'Add badge display preferences to settings',
  async up(database) {
    const columns = [
      "badges_show_icons INTEGER NOT NULL DEFAULT 1",
      "badges_show_border INTEGER NOT NULL DEFAULT 1",
      "badges_show_shadow INTEGER NOT NULL DEFAULT 0",
      "badges_colored INTEGER NOT NULL DEFAULT 1",
      "badges_minimal INTEGER NOT NULL DEFAULT 0",
      "badges_show_tooltips INTEGER NOT NULL DEFAULT 1",
    ];
    for (const column of columns) await database.execute(`ALTER TABLE settings ADD COLUMN ${column}`);
  },
};

import type { MigrationDefinition } from '@/database/migrations/migration-types';

export const roadmapFavoritesMigration: MigrationDefinition = {
  version: 2,
  description: 'Add roadmap favorites',
  async up(database) {
    await database.execute('ALTER TABLE roadmaps ADD COLUMN is_favorite INTEGER NOT NULL DEFAULT 0');
    await database.execute('CREATE INDEX IF NOT EXISTS idx_roadmaps_favorite_updated ON roadmaps(is_favorite, updated_at DESC)');
  },
  async down(database) {
    await database.execute('DROP INDEX IF EXISTS idx_roadmaps_favorite_updated');
  },
};

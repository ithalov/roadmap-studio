import type { MigrationDefinition } from '@/database/migrations/migration-types';

export const templateLibraryMigration: MigrationDefinition = {
  version: 9,
  description: 'Add roadmap template library',
  async up(database) {
    await database.execute(`CREATE TABLE IF NOT EXISTS roadmap_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'Other',
      tags_json TEXT NOT NULL DEFAULT '[]',
      cover_image TEXT,
      icon TEXT,
      color TEXT NOT NULL DEFAULT '#2563EB',
      author TEXT NOT NULL DEFAULT '',
      version TEXT NOT NULL DEFAULT '1.0.0',
      snapshot_json TEXT NOT NULL,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      usage_count INTEGER NOT NULL DEFAULT 0,
      last_used_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      sync_status TEXT NOT NULL DEFAULT 'pending',
      local_version INTEGER NOT NULL DEFAULT 1,
      server_version INTEGER NOT NULL DEFAULT 0,
      device_id TEXT NOT NULL
    )`);
    await database.execute(
      'CREATE INDEX IF NOT EXISTS idx_templates_updated_at ON roadmap_templates(updated_at DESC)',
    );
    await database.execute(
      'CREATE INDEX IF NOT EXISTS idx_templates_category ON roadmap_templates(category)',
    );
  },
  async down(database) {
    await database.execute('DROP TABLE IF EXISTS roadmap_templates');
  },
};

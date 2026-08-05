import type { MigrationDefinition } from '@/database/migrations/migration-types';

export const phaseEditorMigration: MigrationDefinition = {
  version: 3,
  description: 'Add phase editor fields and indexes',
  async up(database) {
    await database.execute("ALTER TABLE phases ADD COLUMN progress_mode TEXT NOT NULL DEFAULT 'manual'");
    await database.execute('ALTER TABLE phases ADD COLUMN completed_at TEXT');
    await database.execute('ALTER TABLE phases ADD COLUMN color TEXT');
    await database.execute('ALTER TABLE phases ADD COLUMN icon TEXT');
    await database.execute('ALTER TABLE phases ADD COLUMN is_collapsed INTEGER NOT NULL DEFAULT 0');
    await database.execute('CREATE INDEX IF NOT EXISTS idx_phases_roadmap_status ON phases(roadmap_id, status)');
    await database.execute('CREATE INDEX IF NOT EXISTS idx_phases_target_date ON phases(target_date)');
    await database.execute('CREATE INDEX IF NOT EXISTS idx_phases_deleted_at ON phases(deleted_at)');
  },
  async down(database) {
    await database.execute('DROP INDEX IF EXISTS idx_phases_roadmap_status');
    await database.execute('DROP INDEX IF EXISTS idx_phases_target_date');
    await database.execute('DROP INDEX IF EXISTS idx_phases_deleted_at');
  },
};

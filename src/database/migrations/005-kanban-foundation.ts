import type { MigrationDefinition } from '@/database/migrations/migration-types';

export const kanbanFoundationMigration: MigrationDefinition = {
  version: 5,
  description: 'Add Kanban positions and board settings',
  async up(database) {
    await database.execute('ALTER TABLE tasks ADD COLUMN kanban_position INTEGER NOT NULL DEFAULT 0');
    await database.execute('CREATE INDEX IF NOT EXISTS idx_tasks_phase_status_kanban_position ON tasks(phase_id, status, kanban_position)');
    await database.execute(`CREATE TABLE IF NOT EXISTS kanban_settings (
      id TEXT PRIMARY KEY, roadmap_id TEXT NOT NULL, visible_columns TEXT NOT NULL, column_order TEXT NOT NULL,
      wip_limits TEXT NOT NULL, compact_mode INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL, deleted_at TEXT, sync_status TEXT NOT NULL DEFAULT 'pending',
      local_version INTEGER NOT NULL DEFAULT 1, server_version INTEGER NOT NULL DEFAULT 0, device_id TEXT NOT NULL,
      FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id), UNIQUE(roadmap_id)
    )`);
    await database.execute('CREATE INDEX IF NOT EXISTS idx_kanban_settings_roadmap ON kanban_settings(roadmap_id)');
  },
};

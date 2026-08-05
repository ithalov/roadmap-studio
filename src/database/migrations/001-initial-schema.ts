import type { MigrationDefinition } from '@/database/migrations/migration-types';

const schema = `
CREATE TABLE IF NOT EXISTS roadmaps (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', version TEXT NOT NULL DEFAULT '1.0.0',
  category TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'draft', accent_color TEXT NOT NULL DEFAULT '#2563EB', progress_mode TEXT NOT NULL DEFAULT 'automatic',
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT, sync_status TEXT NOT NULL DEFAULT 'pending', local_version INTEGER NOT NULL DEFAULT 1, server_version INTEGER NOT NULL DEFAULT 0, device_id TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS phases (
  id TEXT PRIMARY KEY, roadmap_id TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', position INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'not_started', priority TEXT NOT NULL DEFAULT 'medium', progress INTEGER NOT NULL DEFAULT 0, start_date TEXT, target_date TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT, sync_status TEXT NOT NULL DEFAULT 'pending', local_version INTEGER NOT NULL DEFAULT 1, server_version INTEGER NOT NULL DEFAULT 0, device_id TEXT NOT NULL,
  FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id)
);
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY, phase_id TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', position INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'not_started', priority TEXT NOT NULL DEFAULT 'medium', completed INTEGER NOT NULL DEFAULT 0, estimated_minutes INTEGER, spent_minutes INTEGER NOT NULL DEFAULT 0, due_date TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT, sync_status TEXT NOT NULL DEFAULT 'pending', local_version INTEGER NOT NULL DEFAULT 1, server_version INTEGER NOT NULL DEFAULT 0, device_id TEXT NOT NULL,
  FOREIGN KEY (phase_id) REFERENCES phases(id)
);
CREATE TABLE IF NOT EXISTS subtasks (
  id TEXT PRIMARY KEY, task_id TEXT NOT NULL, title TEXT NOT NULL, completed INTEGER NOT NULL DEFAULT 0, position INTEGER NOT NULL,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT, sync_status TEXT NOT NULL DEFAULT 'pending', local_version INTEGER NOT NULL DEFAULT 1, server_version INTEGER NOT NULL DEFAULT 0, device_id TEXT NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id)
);
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, color TEXT NOT NULL DEFAULT '#64748B',
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT, sync_status TEXT NOT NULL DEFAULT 'pending', local_version INTEGER NOT NULL DEFAULT 1, server_version INTEGER NOT NULL DEFAULT 0, device_id TEXT NOT NULL,
  UNIQUE(name)
);
CREATE TABLE IF NOT EXISTS task_tags (id TEXT PRIMARY KEY, task_id TEXT NOT NULL, tag_id TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT, sync_status TEXT NOT NULL DEFAULT 'pending', local_version INTEGER NOT NULL DEFAULT 1, server_version INTEGER NOT NULL DEFAULT 0, device_id TEXT NOT NULL, FOREIGN KEY (task_id) REFERENCES tasks(id), FOREIGN KEY (tag_id) REFERENCES tags(id), UNIQUE(task_id, tag_id));
CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, roadmap_id TEXT, task_id TEXT, content TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT, sync_status TEXT NOT NULL DEFAULT 'pending', local_version INTEGER NOT NULL DEFAULT 1, server_version INTEGER NOT NULL DEFAULT 0, device_id TEXT NOT NULL, FOREIGN KEY (roadmap_id) REFERENCES roadmaps(id), FOREIGN KEY (task_id) REFERENCES tasks(id));
CREATE TABLE IF NOT EXISTS attachments (id TEXT PRIMARY KEY, task_id TEXT, file_name TEXT NOT NULL, file_path TEXT NOT NULL, mime_type TEXT, size_bytes INTEGER, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT, sync_status TEXT NOT NULL DEFAULT 'pending', local_version INTEGER NOT NULL DEFAULT 1, server_version INTEGER NOT NULL DEFAULT 0, device_id TEXT NOT NULL, FOREIGN KEY (task_id) REFERENCES tasks(id));
CREATE TABLE IF NOT EXISTS dependencies (id TEXT PRIMARY KEY, task_id TEXT NOT NULL, depends_on_task_id TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT, sync_status TEXT NOT NULL DEFAULT 'pending', local_version INTEGER NOT NULL DEFAULT 1, server_version INTEGER NOT NULL DEFAULT 0, device_id TEXT NOT NULL, FOREIGN KEY (task_id) REFERENCES tasks(id), FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id), UNIQUE(task_id, depends_on_task_id));
CREATE TABLE IF NOT EXISTS history (id TEXT PRIMARY KEY, action_type TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, payload_json TEXT NOT NULL DEFAULT '{}', occurred_at TEXT NOT NULL, user_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT, sync_status TEXT NOT NULL DEFAULT 'pending', local_version INTEGER NOT NULL DEFAULT 1, server_version INTEGER NOT NULL DEFAULT 0, device_id TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS settings (id TEXT PRIMARY KEY, theme TEXT NOT NULL, language TEXT NOT NULL, accent_color TEXT NOT NULL, autosave INTEGER NOT NULL DEFAULT 1, backup_interval INTEGER NOT NULL DEFAULT 1440, workspace TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT, sync_status TEXT NOT NULL DEFAULT 'pending', local_version INTEGER NOT NULL DEFAULT 1, server_version INTEGER NOT NULL DEFAULT 0, device_id TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sync_queue (id TEXT PRIMARY KEY, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, operation TEXT NOT NULL, payload_json TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, last_error TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT, sync_status TEXT NOT NULL DEFAULT 'pending', local_version INTEGER NOT NULL DEFAULT 1, server_version INTEGER NOT NULL DEFAULT 0, device_id TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS backups (id TEXT PRIMARY KEY, file_path TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT, sync_status TEXT NOT NULL DEFAULT 'pending', local_version INTEGER NOT NULL DEFAULT 1, server_version INTEGER NOT NULL DEFAULT 0, device_id TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_phases_roadmap_position ON phases(roadmap_id, position);
CREATE INDEX IF NOT EXISTS idx_tasks_phase_position ON tasks(phase_id, position);
CREATE INDEX IF NOT EXISTS idx_history_entity ON history(entity_type, entity_id);
`;

const tables = [
  'backups',
  'sync_queue',
  'settings',
  'history',
  'dependencies',
  'attachments',
  'notes',
  'task_tags',
  'tags',
  'subtasks',
  'tasks',
  'phases',
  'roadmaps',
];

export const initialSchemaMigration: MigrationDefinition = {
  version: 1,
  description: 'Initial Roadmap Studio schema',
  async up(database) {
    await database.execute('PRAGMA foreign_keys = ON');
    for (const statement of schema
      .split(';')
      .map((item) => item.trim())
      .filter(Boolean))
      await database.execute(statement);
  },
  async down(database) {
    for (const table of tables) await database.execute(`DROP TABLE IF EXISTS ${table}`);
  },
};

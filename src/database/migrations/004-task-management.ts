import type { MigrationDefinition } from '@/database/migrations/migration-types';

const statements = [
  'ALTER TABLE tasks ADD COLUMN completed_at TEXT',
  'ALTER TABLE tasks ADD COLUMN start_date TEXT',
  'ALTER TABLE tasks ADD COLUMN assignee TEXT',
  'CREATE INDEX IF NOT EXISTS idx_tasks_phase_id ON tasks(phase_id)',
  'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)',
  'CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority)',
  'CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)',
  'CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed)',
  'CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON tasks(deleted_at)',
  'CREATE INDEX IF NOT EXISTS idx_subtasks_task_position ON subtasks(task_id, position)',
];

export const taskManagementMigration: MigrationDefinition = {
  version: 4,
  description: 'Add task management fields and indexes',
  async up(database) {
    for (const statement of statements) await database.execute(statement);
  },
};

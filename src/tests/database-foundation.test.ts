import { MigrationManager } from '@/database/migrations/MigrationManager';
import { describe, expect, it } from 'vitest';
import { initialSchemaMigration } from '@/database/migrations/001-initial-schema';
import { RoadmapRepository } from '@/database/repositories/RoadmapRepository';
import { PhaseRepository } from '@/database/repositories/PhaseRepository';
import { SettingsRepository } from '@/database/repositories/SettingsRepository';
import { TaskRepository } from '@/database/repositories/TaskRepository';
import { SeedService } from '@/database/seed/SeedService';
import { roadmapInputSchema } from '@/schemas/database';
import type {
  QueryResultRow,
  SqlBindValue,
  SqlExecutionResult,
  SqlExecutor,
} from '@/types/database';

class RecordingDatabase implements SqlExecutor {
  public readonly commands: string[] = [];
  public readonly parameters: SqlBindValue[][] = [];
  public rows: QueryResultRow[] = [];
  public async execute(sql: string, values: SqlBindValue[] = []): Promise<SqlExecutionResult> {
    this.commands.push(sql);
    this.parameters.push(values);
    return { rowsAffected: 1 };
  }
  public async select<T extends QueryResultRow>(sql: string): Promise<T[]> {
    this.commands.push(sql);
    if (sql.includes('MAX(version)')) return [{ version: 0 } as unknown as T];
    if (sql.includes('COUNT(*)')) return [{ total: 0 } as unknown as T];
    return this.rows as T[];
  }
}

const roadmapId = 'c0a8012e-0000-4000-8000-000000000001';
describe('database foundation', () => {
  it('creates and records migration 001', async () => {
    const database = new RecordingDatabase();
    await new MigrationManager(database).migrate([initialSchemaMigration]);
    expect(
      database.commands.some((sql) => sql.includes('CREATE TABLE IF NOT EXISTS roadmaps')),
    ).toBe(true);
    expect(
      database.commands.some((sql) => sql.includes('CREATE TABLE IF NOT EXISTS sync_queue')),
    ).toBe(true);
    expect(database.commands.some((sql) => sql.includes('INSERT INTO schema_migrations'))).toBe(
      true,
    );
  });

  it('validates and creates a roadmap with pending sync state', async () => {
    const database = new RecordingDatabase();
    const roadmap = await new RoadmapRepository(database).create({
      id: roadmapId,
      deviceId: 'test-device',
      title: '  Produto  ',
    });
    expect(roadmap.title).toBe('Produto');
    expect(roadmap.syncStatus).toBe('pending');
    expect(database.commands[0]).toContain('INSERT INTO roadmaps');
  });

  it('rejects invalid roadmap input before persistence', async () => {
    expect(() => roadmapInputSchema.parse({ title: '' })).toThrow();
  });

  it('updates a roadmap and marks it pending', async () => {
    const database = new RecordingDatabase();
    database.rows = [
      {
        id: roadmapId,
        title: 'Anterior',
        description: '',
        version: '1.0.0',
        category: '',
        status: 'draft',
        accent_color: '#2563EB',
        progress_mode: 'automatic',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
        deleted_at: null,
        sync_status: 'synced',
        local_version: 1,
        server_version: 1,
        device_id: 'test-device',
      },
    ];
    await new RoadmapRepository(database).update(roadmapId, { title: 'Atualizado' });
    expect(database.commands.some((sql) => sql.includes("sync_status='pending'"))).toBe(true);
  });

  it('uses a logical deletion query', async () => {
    const database = new RecordingDatabase();
    await new RoadmapRepository(database).delete(roadmapId);
    expect(database.commands[0]).toContain('deleted_at = ?');
    expect(database.commands[0]).not.toContain('DELETE FROM');
  });

  it('queries active rows only', async () => {
    const database = new RecordingDatabase();
    await new RoadmapRepository(database).findAll();
    expect(database.commands[0]).toContain('deleted_at IS NULL');
  });

  it('seeds the initial settings, roadmap, phases and tasks', async () => {
    const database = new RecordingDatabase();
    const seeded = await new SeedService(
      new RoadmapRepository(database),
      new PhaseRepository(database),
      new TaskRepository(database),
      new SettingsRepository(database),
    ).seedIfEmpty('test-device');
    expect(seeded).toBe(true);
    expect(database.commands.filter((sql) => sql.startsWith('INSERT INTO')).length).toBe(13);
    expect(database.parameters.filter((values) => values[1] === 'task_created')).toHaveLength(3);
  });
});

import { describe, expect, it } from 'vitest';
import { RoadmapRepository } from '@/database/repositories/RoadmapRepository';
import type {
  QueryResultRow,
  SqlBindValue,
  SqlExecutionResult,
  SqlExecutor,
} from '@/types/database';

class RecordingDatabase implements SqlExecutor {
  public readonly commands: string[] = [];

  public async execute(sql: string, _values: SqlBindValue[] = []): Promise<SqlExecutionResult> {
    this.commands.push(sql);
    return { rowsAffected: 1 };
  }

  public async select<T extends QueryResultRow>(
    _sql: string,
    _values: SqlBindValue[] = [],
  ): Promise<T[]> {
    return [];
  }
}

describe('RoadmapRepository', () => {
  it('permanently deletes a trashed roadmap without opening a SQLite transaction lock', async () => {
    const database = new RecordingDatabase();

    await new RoadmapRepository(database).permanentDelete('roadmap-1');

    expect(database.commands).not.toContain('BEGIN');
    expect(database.commands).not.toContain('COMMIT');
    expect(database.commands.some((sql) => sql.startsWith('DELETE FROM task_tags'))).toBe(true);
    expect(database.commands.some((sql) => sql.startsWith('DELETE FROM tasks'))).toBe(true);
    expect(database.commands.some((sql) => sql.startsWith('DELETE FROM roadmaps'))).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { RoadmapImportService } from '@/features/roadmap-management/services/RoadmapImportService';
import type {
  QueryResultRow,
  SqlBindValue,
  SqlExecutionResult,
  SqlExecutor,
} from '@/types/database';

class RecordingDatabase implements SqlExecutor {
  public readonly commands: string[] = [];

  public async execute(sql: string, values: SqlBindValue[] = []): Promise<SqlExecutionResult> {
    void values;
    this.commands.push(sql);
    return { rowsAffected: 1 };
  }

  public async select<T extends QueryResultRow>(sql: string, values: SqlBindValue[] = []): Promise<T[]> {
    void sql;
    void values;
    return [];
  }
}

describe('roadmap JSON import', () => {
  it('validates the document before executing SQL', async () => {
    const database = new RecordingDatabase();

    await expect(new RoadmapImportService(database).import({ version: 1, roadmap: {}, phases: [] })).rejects.toThrow();

    expect(database.commands).toHaveLength(0);
  });

  it('creates a roadmap hierarchy in one transaction', async () => {
    const database = new RecordingDatabase();
    const result = await new RoadmapImportService(database).import({
      version: 1,
      roadmap: { title: 'Aplicativo mobile', category: 'Produto' },
      phases: [
        {
          title: 'Planejamento',
          tasks: [
            {
              title: 'Definir escopo',
              tags: [{ name: 'Produto', color: '#2563EB' }],
              subtasks: [{ title: 'Validar com clientes' }],
            },
          ],
        },
      ],
    });

    expect(result.phases).toBe(1);
    expect(result.tasks).toBe(1);
    expect(result.subtasks).toBe(1);
    expect(result.tags).toBe(1);
    expect(database.commands[0]).toBe('BEGIN');
    expect(database.commands.at(-1)).toBe('COMMIT');
    expect(database.commands.some((sql) => sql.startsWith('INSERT INTO roadmaps'))).toBe(true);
    expect(database.commands.some((sql) => sql.startsWith('INSERT INTO phases'))).toBe(true);
    expect(database.commands.some((sql) => sql.startsWith('INSERT INTO tasks'))).toBe(true);
    expect(database.commands.some((sql) => sql.startsWith('INSERT INTO subtasks'))).toBe(true);
    expect(database.commands.some((sql) => sql.startsWith('INSERT INTO tags'))).toBe(true);
    expect(database.commands.some((sql) => sql.startsWith('INSERT OR IGNORE INTO task_tags'))).toBe(true);
  });
});

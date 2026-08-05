import { describe, expect, it } from 'vitest';
import { PhaseRepository } from '@/database/repositories/PhaseRepository';
import type { QueryResultRow, SqlBindValue, SqlExecutionResult, SqlExecutor } from '@/types/database';

class Database implements SqlExecutor {
  public readonly commands: string[] = [];
  public readonly parameters: SqlBindValue[][] = [];
  public rows: QueryResultRow[] = [];

  async execute(sql: string, values: SqlBindValue[] = []): Promise<SqlExecutionResult> {
    this.commands.push(sql);
    this.parameters.push(values);
    return { rowsAffected: 1 };
  }

  async select<T extends QueryResultRow>(sql: string): Promise<T[]> {
    this.commands.push(sql);
    return this.rows as T[];
  }
}

describe('PhaseRepository', () => {
  it('uses soft deletion instead of DELETE', async () => {
    const database = new Database();
    await new PhaseRepository(database).softDelete('phase-1');
    expect(database.commands[0]).toContain('UPDATE phases SET deleted_at');
    expect(database.commands.some((sql) => sql.startsWith('INSERT INTO history'))).toBe(true);
    expect(database.parameters.some((values) => values[1] === 'phase_soft_deleted')).toBe(true);
  });

  it('restores a deleted phase and records history', async () => {
    const database = new Database();
    database.rows = [
      {
        id: 'phase-1',
        roadmap_id: 'roadmap-1',
        deleted_at: '2026-08-01T00:00:00.000Z',
      },
      { total: 2 },
    ];

    await new PhaseRepository(database).restore('phase-1');

    expect(database.commands[0]).toContain('SELECT * FROM phases WHERE id=?');
    expect(database.commands.some((sql) => sql.includes('deleted_at=NULL'))).toBe(true);
    expect(database.commands.some((sql) => sql.startsWith('INSERT INTO history'))).toBe(true);
    expect(database.parameters.some((values) => values[1] === 'phase_restored')).toBe(true);
  });

  it('loads phase history by entity id', async () => {
    const database = new Database();
    await new PhaseRepository(database).findHistory('phase-1');
    expect(database.commands[0]).toContain(
      'SELECT action_type, payload_json, occurred_at FROM history WHERE entity_type=? AND entity_id=? ORDER BY occurred_at DESC',
    );
  });

  it('reorders phases inside a transaction', async () => {
    const database = new Database();
    await new PhaseRepository(database).reorder('roadmap-1', ['a', 'b']);
    expect(database.commands[0]).toBe('BEGIN');
    expect(database.commands).toContain('COMMIT');
    expect(database.commands.filter((sql) => sql.startsWith('UPDATE phases SET position')).length).toBe(2);
  });
});

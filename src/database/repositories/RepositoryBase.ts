import type { EntityMeta } from '@/types/entity';
import type { QueryResultRow, SqlBindValue, SqlExecutor } from '@/types/database';

export abstract class RepositoryBase<TEntity extends EntityMeta> {
  protected constructor(
    protected readonly database: SqlExecutor,
    protected readonly tableName: string,
  ) {}
  protected abstract mapRow(row: QueryResultRow): TEntity;
  protected async queryMany(sql: string, values: SqlBindValue[] = []): Promise<TEntity[]> {
    return (await this.database.select<QueryResultRow>(sql, values)).map((row) => this.mapRow(row));
  }
  protected async queryOne(sql: string, values: SqlBindValue[] = []): Promise<TEntity | null> {
    return (await this.queryMany(sql, values))[0] ?? null;
  }
  public async findById(id: string): Promise<TEntity | null> {
    return this.queryOne(`SELECT * FROM ${this.tableName} WHERE id = ? AND deleted_at IS NULL`, [
      id,
    ]);
  }
  public async findAll(): Promise<TEntity[]> {
    return this.queryMany(
      `SELECT * FROM ${this.tableName} WHERE deleted_at IS NULL ORDER BY created_at DESC`,
    );
  }
  public async exists(id: string): Promise<boolean> {
    return (
      (
        await this.database.select<QueryResultRow>(
          `SELECT 1 FROM ${this.tableName} WHERE id = ? AND deleted_at IS NULL LIMIT 1`,
          [id],
        )
      ).length > 0
    );
  }
  public async count(): Promise<number> {
    const rows = await this.database.select<QueryResultRow>(
      'SELECT COUNT(*) AS total FROM ' + this.tableName + ' WHERE deleted_at IS NULL',
    );
    return Number(rows[0]?.total ?? 0);
  }
  public async delete(id: string): Promise<void> {
    const now = new Date().toISOString();
    await this.database.execute(
      `UPDATE ${this.tableName} SET deleted_at = ?, updated_at = ?, sync_status = 'pending', local_version = local_version + 1 WHERE id = ? AND deleted_at IS NULL`,
      [now, now, id],
    );
  }
}

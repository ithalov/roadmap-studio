import Database from '@tauri-apps/plugin-sql';
import { APP_DB_NAME } from '@/config/app';
import { DatabaseError } from '@/database/connection/DatabaseError';
import type {
  QueryResultRow,
  SqlBindValue,
  SqlExecutionResult,
  SqlExecutor,
} from '@/types/database';
import { logger, type Logger } from '@/services/database/Logger';

export class ConnectionManager implements SqlExecutor {
  private connection: Database | null = null;

  constructor(
    private readonly databaseUrl = `sqlite:${APP_DB_NAME}`,
    private readonly appLogger: Logger = logger,
  ) {}

  public async open(): Promise<Database> {
    if (this.connection) return this.connection;
    try {
      this.connection = await Database.load(this.databaseUrl);
      this.appLogger.log('INFO', 'SQLite connection opened', { databaseUrl: this.databaseUrl });
      return this.connection;
    } catch (error) {
      this.appLogger.log('ERROR', 'Unable to open SQLite connection', { error });
      throw new DatabaseError('Unable to open SQLite connection.', error);
    }
  }

  public async execute(sql: string, values: SqlBindValue[] = []): Promise<SqlExecutionResult> {
    const startedAt = performance.now();
    try {
      const result = await (await this.open()).execute(sql, values);
      this.appLogger.log('DEBUG', 'SQL query executed', {
        durationMs: performance.now() - startedAt,
      });
      return result;
    } catch (error) {
      this.appLogger.log('ERROR', 'SQL query failed', { error });
      throw new DatabaseError('SQLite query execution failed.', error);
    }
  }

  public async select<T extends QueryResultRow>(
    sql: string,
    values: SqlBindValue[] = [],
  ): Promise<T[]> {
    const startedAt = performance.now();
    try {
      const rows = await (await this.open()).select<T[]>(sql, values);
      this.appLogger.log('DEBUG', 'SQL query selected rows', {
        durationMs: performance.now() - startedAt,
        rowCount: rows.length,
      });
      return rows;
    } catch (error) {
      this.appLogger.log('ERROR', 'SQL select failed', { error });
      throw new DatabaseError('SQLite select query failed.', error);
    }
  }

  public async close(): Promise<void> {
    if (!this.connection) return;
    await this.connection.close();
    this.connection = null;
    this.appLogger.log('INFO', 'SQLite connection closed');
  }
}

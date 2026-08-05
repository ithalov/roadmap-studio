import type { MigrationDefinition } from '@/database/migrations/migration-types';
import type { QueryResultRow, SqlExecutor } from '@/types/database';
import { logger, type Logger } from '@/services/database/Logger';

interface VersionRow extends QueryResultRow {
  version: number;
}

export class MigrationManager {
  constructor(
    private readonly database: SqlExecutor,
    private readonly appLogger: Logger = logger,
  ) {}

  public async migrate(migrations: readonly MigrationDefinition[]): Promise<void> {
    await this.database.execute(
      'CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, description TEXT NOT NULL, applied_at TEXT NOT NULL)',
    );
    const applied = new Set(
      (await this.database.select<VersionRow>('SELECT version FROM schema_migrations')).map(
        (item) => item.version,
      ),
    );
    for (const migration of [...migrations].sort((left, right) => left.version - right.version)) {
      if (applied.has(migration.version)) continue;
      const startedAt = performance.now();
      this.appLogger.log('INFO', 'Applying migration', {
        version: migration.version,
        description: migration.description,
      });
      await this.database.execute('BEGIN');
      try {
        await migration.up(this.database);
        await this.database.execute(
          'INSERT INTO schema_migrations (version, description, applied_at) VALUES (?, ?, ?)',
          [migration.version, migration.description, new Date().toISOString()],
        );
        await this.database.execute('COMMIT');
        this.appLogger.log('INFO', 'Migration applied', {
          version: migration.version,
          durationMs: performance.now() - startedAt,
        });
      } catch (error) {
        await this.database.execute('ROLLBACK');
        this.appLogger.log('ERROR', 'Migration failed', { version: migration.version, error });
        throw error;
      }
    }
  }

  public async getCurrentVersion(): Promise<number> {
    const result = await this.database.select<VersionRow>(
      'SELECT COALESCE(MAX(version), 0) AS version FROM schema_migrations',
    );
    return result[0]?.version ?? 0;
  }
}

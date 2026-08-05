export type SqlBindValue = string | number | boolean | null;

export interface QueryResultRow {
  [key: string]: unknown;
}

export interface SqlExecutionResult {
  lastInsertId?: number;
  rowsAffected: number;
}

export interface SqlExecutor {
  execute(sql: string, values?: SqlBindValue[]): Promise<SqlExecutionResult>;
  select<T extends QueryResultRow>(sql: string, values?: SqlBindValue[]): Promise<T[]>;
}

export interface MigrationRecord {
  version: number;
  description: string;
  appliedAt: string;
}

import type { SqlExecutor } from '@/types/database';

export interface MigrationDefinition {
  version: number;
  description: string;
  up(database: SqlExecutor): Promise<void>;
  down?(database: SqlExecutor): Promise<void>;
}

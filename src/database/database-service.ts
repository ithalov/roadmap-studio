import { ConnectionManager } from '@/database/connection/ConnectionManager';

export class DatabaseService extends ConnectionManager {}

export const databaseService = new DatabaseService();
export type { SqlBindValue } from '@/types/database';

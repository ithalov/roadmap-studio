import type { EntityMeta, SyncStatus } from '@/types/entity';
import type { QueryResultRow } from '@/types/database';

const string = (row: QueryResultRow, key: string): string => String(row[key] ?? '');
const nullableString = (row: QueryResultRow, key: string): string | null =>
  row[key] === null || row[key] === undefined ? null : String(row[key]);
const number = (row: QueryResultRow, key: string): number => Number(row[key] ?? 0);

export const rowValue = {
  string,
  nullableString,
  number,
  boolean: (row: QueryResultRow, key: string): boolean => {
    const value = row[key];
    if (value === true || value === 1 || value === '1' || value === 'true') return true;
    return false;
  },
};

export function mapMeta(row: QueryResultRow): EntityMeta {
  return {
    id: string(row, 'id'),
    createdAt: string(row, 'created_at'),
    updatedAt: string(row, 'updated_at'),
    deletedAt: nullableString(row, 'deleted_at'),
    syncStatus: string(row, 'sync_status') as SyncStatus,
    localVersion: number(row, 'local_version'),
    serverVersion: number(row, 'server_version'),
    deviceId: string(row, 'device_id'),
  };
}

export function newMeta(id: string | undefined, deviceId: string | undefined): EntityMeta {
  const now = new Date().toISOString();
  return {
    id: id ?? crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    syncStatus: 'pending',
    localVersion: 1,
    serverVersion: 0,
    deviceId: deviceId ?? 'local-device',
  };
}

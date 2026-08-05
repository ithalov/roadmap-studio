export const syncStatuses = ['local', 'pending', 'synced', 'conflict', 'deleted', 'error'] as const;

export type SyncStatus = (typeof syncStatuses)[number];

export interface EntityMeta {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  syncStatus: SyncStatus;
  localVersion: number;
  serverVersion: number;
  deviceId: string;
}

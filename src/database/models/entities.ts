import type { EntityMeta } from '@/types/entity';
import type { WallpaperStyle } from '@/features/settings/types/wallpaper';
import type { BadgePreferences } from '@/features/badges/types/badge';

export interface Roadmap extends EntityMeta {
  title: string;
  description: string;
  version: string;
  category: string;
  status: string;
  accentColor: string;
  progressMode: string;
  progress: number;
  isFavorite: boolean;
}
export interface Phase extends EntityMeta {
  roadmapId: string;
  title: string;
  description: string;
  position: number;
  status: string;
  priority: string;
  progress: number;
  startDate: string | null;
  targetDate: string | null;
  progressMode: 'automatic' | 'manual';
  completedAt: string | null;
  color: string | null;
  icon: string | null;
  isCollapsed: boolean;
}
export interface Task extends EntityMeta {
  phaseId: string;
  title: string;
  description: string;
  position: number;
  status: string;
  priority: string;
  completed: boolean;
  completedAt: string | null;
  startDate: string | null;
  estimatedMinutes: number | null;
  spentMinutes: number;
  dueDate: string | null;
  assignee: string | null;
  kanbanPosition: number;
}
export interface Subtask extends EntityMeta {
  taskId: string;
  title: string;
  completed: boolean;
  position: number;
}

export interface TaskStats {
  total: number;
  notStarted: number;
  inProgress: number;
  blocked: number;
  inReview: number;
  completed: number;
  overdue: number;
  estimatedMinutes: number;
  spentMinutes: number;
}

export interface CompletionStats {
  total: number;
  completed: number;
}

export interface KanbanSettings extends EntityMeta {
  roadmapId: string;
  visibleColumns: string;
  columnOrder: string;
  wipLimits: string;
  compactMode: boolean;
}
export interface Tag extends EntityMeta {
  name: string;
  color: string;
}
export interface TaskTag extends EntityMeta {
  taskId: string;
  tagId: string;
}
export interface Note extends EntityMeta {
  roadmapId: string | null;
  taskId: string | null;
  content: string;
}
export interface Attachment extends EntityMeta {
  taskId: string | null;
  fileName: string;
  filePath: string;
  mimeType: string | null;
  sizeBytes: number | null;
}
export interface Dependency extends EntityMeta {
  taskId: string;
  dependsOnTaskId: string;
}
export interface HistoryEntry extends EntityMeta {
  actionType: string;
  entityType: string;
  entityId: string;
  payloadJson: string;
  occurredAt: string;
  userId: string | null;
}
export interface AppSettings extends EntityMeta, BadgePreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'pt-BR' | 'en-US';
  accentColor: string;
  wallpaper: WallpaperStyle;
  wallpaperIntensity: number;
  autosave: boolean;
  backupInterval: number;
  workspace: string;
}
export interface SyncQueueItem extends EntityMeta {
  entityType: string;
  entityId: string;
  operation: string;
  payloadJson: string;
  attempts: number;
  lastError: string | null;
}
export interface Backup extends EntityMeta {
  filePath: string;
  status: string;
}

export interface RoadmapTemplate extends EntityMeta {
  name: string;
  description: string;
  category: string;
  tags: string[];
  coverImage: string | null;
  icon: string | null;
  color: string;
  author: string;
  version: string;
  snapshotJson: string;
  isFavorite: boolean;
  usageCount: number;
  lastUsedAt: string | null;
}

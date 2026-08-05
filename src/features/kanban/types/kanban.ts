import type { Phase, Tag, Task } from '@/database/models';
import type { TaskPriority, TaskStatus } from '@/features/tasks/types/task';

export interface KanbanTask extends Task {
  phaseTitle: string;
  phaseColor: string | null;
  tags: Tag[];
  subtaskStats: { total: number; completed: number };
}
export interface KanbanColumnDefinition {
  status: TaskStatus;
  label: string;
  description: string;
  icon: 'inbox' | 'calendar' | 'circle' | 'play' | 'ban' | 'search' | 'check' | 'x';
  order: number;
  defaultVisible: boolean;
  allowsCreation: boolean;
  countsTowardWip: boolean;
}
export interface KanbanColumn { definition: KanbanColumnDefinition; tasks: KanbanTask[]; wipLimit: number | null; isWipExceeded: boolean; }
export interface KanbanFilters { phaseId?: string; query?: string; priority?: TaskPriority; status?: TaskStatus; overdue?: boolean; blocked?: boolean; completed?: boolean; sort?: 'kanban' | 'priority' | 'due_date' | 'updated_at' | 'created_at' | 'title' | 'phase'; }
export interface KanbanBoard { phases: Phase[]; columns: KanbanColumn[]; totalVisible: number; }
export interface KanbanStats { totalVisible: number; backlog: number; notStarted: number; inProgress: number; blocked: number; inReview: number; completed: number; overdue: number; wipExceededColumns: number; }
export interface KanbanSettingsValues { visibleColumns: TaskStatus[]; columnOrder: TaskStatus[]; wipLimits: Partial<Record<TaskStatus, number | null>>; compactMode: boolean; }
export interface KanbanMoveInput { taskId: string; targetStatus: TaskStatus; targetPosition: number; }

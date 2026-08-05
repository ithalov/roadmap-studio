export const roadmapStatuses = ['draft', 'planned', 'in_progress', 'paused', 'blocked', 'completed', 'cancelled', 'archived'] as const;
export type RoadmapStatus = (typeof roadmapStatuses)[number];
export type RoadmapSort = 'updated_desc' | 'updated_asc' | 'title_asc' | 'title_desc' | 'progress_desc' | 'progress_asc' | 'created_desc';
export type RoadmapView = 'grid' | 'list';
export interface RoadmapFilters { query?: string; status?: RoadmapStatus; category?: string; favorite?: boolean; sort?: RoadmapSort; }
export interface DashboardStats { totalRoadmaps: number; activeRoadmaps: number; completedRoadmaps: number; archivedRoadmaps: number; pendingTasks: number; overdueTasks: number; }
export const roadmapStatusLabels: Record<RoadmapStatus, string> = { draft: 'Rascunho', planned: 'Planejado', in_progress: 'Em andamento', paused: 'Pausado', blocked: 'Bloqueado', completed: 'Concluído', cancelled: 'Cancelado', archived: 'Arquivado' };

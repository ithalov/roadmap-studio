import type { Roadmap, Task } from '@/database/models';

export type DashboardPeriod = 'today' | 'week' | 'month' | 'year';
export type DashboardModule = 'stats' | 'progress' | 'activity' | 'recent' | 'favorites' | 'tasks' | 'productivity' | 'goals' | 'actions';

export interface DashboardActivity { id: string; actionType: string; entityType: string; entityId: string; occurredAt: string; title: string; roadmapId: string | null; roadmapTitle: string | null; }
export interface DashboardTask extends Task { roadmapId: string; roadmapTitle: string; phaseTitle: string; }
export interface ProductivityDay { date: string; count: number; }
export interface DashboardInsights {
  totalTasks: number;
  completedTasks: number;
  totalSubtasks: number;
  completedSubtasks: number;
  recent: Roadmap[];
  favorites: Roadmap[];
  tasks: DashboardTask[];
  activity: DashboardActivity[];
  productivity: ProductivityDay[];
}

export const dashboardModuleLabels: Record<DashboardModule, string> = {
  stats: 'Estatisticas', progress: 'Progresso geral', activity: 'Atividade recente', recent: 'Roadmaps recentes', favorites: 'Favoritos', tasks: 'Tarefas do dia', productivity: 'Grafico', goals: 'Metas', actions: 'Acoes rapidas',
};

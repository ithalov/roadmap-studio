import type { TaskStats } from '@/database/models';

export const taskStatuses = ['backlog', 'planned', 'not_started', 'in_progress', 'blocked', 'in_review', 'completed', 'cancelled'] as const;
export const taskPriorities = ['low', 'medium', 'high', 'critical'] as const;
export type TaskStatus = (typeof taskStatuses)[number];
export type TaskPriority = (typeof taskPriorities)[number];

export const taskStatusMeta: Record<TaskStatus, { label: string; description: string; variant: string }> = {
  backlog: { label: 'Backlog', description: 'Ainda sem planejamento', variant: 'bg-slate-100 text-slate-700' },
  planned: { label: 'Planejada', description: 'Pronta para iniciar', variant: 'bg-sky-100 text-sky-700' },
  not_started: { label: 'Nao iniciada', description: 'Ainda nao iniciada', variant: 'bg-zinc-100 text-zinc-700' },
  in_progress: { label: 'Em andamento', description: 'Em execucao', variant: 'bg-blue-100 text-blue-700' },
  blocked: { label: 'Bloqueada', description: 'Aguardando desbloqueio', variant: 'bg-red-100 text-red-700' },
  in_review: { label: 'Em revisao', description: 'Aguardando revisao', variant: 'bg-violet-100 text-violet-700' },
  completed: { label: 'Concluida', description: 'Finalizada', variant: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Cancelada', description: 'Nao sera executada', variant: 'bg-amber-100 text-amber-700' },
};
export const taskPriorityMeta: Record<TaskPriority, { label: string; description: string; weight: number; variant: string }> = {
  low: { label: 'Baixa', description: 'Pode aguardar', weight: 1, variant: 'text-slate-600' },
  medium: { label: 'Media', description: 'Prioridade normal', weight: 2, variant: 'text-blue-600' },
  high: { label: 'Alta', description: 'Requer atencao', weight: 3, variant: 'text-orange-600' },
  critical: { label: 'Critica', description: 'Requer acao imediata', weight: 4, variant: 'text-red-600' },
};
export type { TaskStats };

export const phaseStatuses = [
  'draft',
  'planned',
  'not_started',
  'in_progress',
  'paused',
  'blocked',
  'in_review',
  'completed',
  'cancelled',
] as const;
export const phasePriorities = ['low', 'medium', 'high', 'critical'] as const;
export type PhaseStatus = (typeof phaseStatuses)[number];
export type PhasePriority = (typeof phasePriorities)[number];
export interface PhaseStats {
  total: number;
  planned: number;
  inProgress: number;
  blocked: number;
  completed: number;
  overdue: number;
  averageProgress: number;
}
export const phaseStatusLabels: Record<PhaseStatus, string> = {
  draft: 'Rascunho',
  planned: 'Planejada',
  not_started: 'Não iniciada',
  in_progress: 'Em andamento',
  paused: 'Pausada',
  blocked: 'Bloqueada',
  in_review: 'Em revisão',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};
export const phasePriorityLabels: Record<PhasePriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica',
};

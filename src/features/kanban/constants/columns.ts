import type { KanbanColumnDefinition } from '@/features/kanban/types/kanban';
export const kanbanColumns: readonly KanbanColumnDefinition[] = [
  { status: 'backlog', label: 'Backlog', description: 'Ainda sem planejamento', icon: 'inbox', order: 0, defaultVisible: true, allowsCreation: true, countsTowardWip: false },
  { status: 'planned', label: 'Planejada', description: 'Pronta para iniciar', icon: 'calendar', order: 1, defaultVisible: false, allowsCreation: true, countsTowardWip: false },
  { status: 'not_started', label: 'Nao iniciada', description: 'Ainda nao iniciada', icon: 'circle', order: 2, defaultVisible: true, allowsCreation: true, countsTowardWip: false },
  { status: 'in_progress', label: 'Em andamento', description: 'Em execucao', icon: 'play', order: 3, defaultVisible: true, allowsCreation: true, countsTowardWip: true },
  { status: 'blocked', label: 'Bloqueada', description: 'Aguardando desbloqueio', icon: 'ban', order: 4, defaultVisible: true, allowsCreation: true, countsTowardWip: true },
  { status: 'in_review', label: 'Em revisao', description: 'Aguardando revisao', icon: 'search', order: 5, defaultVisible: true, allowsCreation: true, countsTowardWip: true },
  { status: 'completed', label: 'Concluida', description: 'Finalizada', icon: 'check', order: 6, defaultVisible: true, allowsCreation: true, countsTowardWip: false },
  { status: 'cancelled', label: 'Cancelada', description: 'Nao sera executada', icon: 'x', order: 7, defaultVisible: false, allowsCreation: false, countsTowardWip: false },
] as const;
export const defaultKanbanSettings = { visibleColumns: kanbanColumns.filter((column) => column.defaultVisible).map((column) => column.status), columnOrder: kanbanColumns.map((column) => column.status), wipLimits: {}, compactMode: false } as const;

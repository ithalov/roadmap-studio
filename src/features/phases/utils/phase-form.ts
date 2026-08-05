import type { Phase } from '@/database/models';
import type { PhaseFormValues } from '@/features/phases/schemas/phase-form';
export function toPhaseFormValues(phase: Phase): PhaseFormValues {
  return {
    title: phase.title,
    description: phase.description,
    status: phase.status as PhaseFormValues['status'],
    priority: phase.priority as PhaseFormValues['priority'],
    progress: phase.progress,
    progressMode: phase.progressMode,
    startDate: phase.startDate,
    targetDate: phase.targetDate,
    color: phase.color,
    icon: phase.icon as PhaseFormValues['icon'],
  };
}

import type { Phase, Task } from '@/database/models';
export class PhaseProgressService {
  public calculate(phase: Phase, tasks: Task[]): number {
    if (phase.progressMode === 'manual') return phase.progress;
    const active = tasks.filter((task) => !task.deletedAt && task.status !== 'cancelled');
    if (!active.length) return 0;
    return Math.round((active.filter((task) => task.completed).length / active.length) * 100);
  }
}
export const phaseProgressService = new PhaseProgressService();

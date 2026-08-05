import type { Phase } from '@/database/models';
export class RoadmapProgressService {
  public calculate(phases: Phase[]): number {
    const active = phases.filter((phase) => !phase.deletedAt && phase.status !== 'cancelled');
    return active.length
      ? Math.round(active.reduce((sum, phase) => sum + phase.progress, 0) / active.length)
      : 0;
  }
}
export const roadmapProgressService = new RoadmapProgressService();

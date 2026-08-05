import { databaseService } from '@/database/database-service';
import { PhaseRepository, TaskRepository } from '@/database/repositories';
import { phaseProgressService } from '@/features/phases/services/PhaseProgressService';
import { roadmapProgressService } from '@/features/phases/services/RoadmapProgressService';

export class ProgressRecalculationService {
  private readonly phases = new PhaseRepository(databaseService);
  private readonly tasks = new TaskRepository(databaseService);
  public async recalculatePhase(phaseId: string): Promise<void> {
    const phase = await this.phases.findById(phaseId); if (!phase || phase.progressMode !== 'automatic') return;
    await this.phases.updateProgress(phase.id, phaseProgressService.calculate(phase, await this.tasks.findActiveByPhaseId(phase.id)));
  }
  public async recalculateRoadmap(roadmapId: string): Promise<number> { return roadmapProgressService.calculate(await this.phases.findActiveByRoadmapId(roadmapId)); }
  public async recalculateForPhase(phaseId: string): Promise<void> { const phase = await this.phases.findById(phaseId); if (!phase) return; await this.recalculatePhase(phaseId); await this.recalculateRoadmap(phase.roadmapId); }
}
export const progressRecalculationService = new ProgressRecalculationService();

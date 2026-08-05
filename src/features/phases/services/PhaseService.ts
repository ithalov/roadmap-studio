import { databaseService } from '@/database/database-service';
import { PhaseRepository } from '@/database/repositories/PhaseRepository';
import { phaseFormSchema, type PhaseFormValues } from '@/features/phases/schemas/phase-form';
export class PhaseService {
  private readonly repo = new PhaseRepository(databaseService);
  list(roadmapId: string) {
    return this.repo.findActiveByRoadmapId(roadmapId);
  }
  listDeleted(roadmapId: string) { return this.repo.findDeletedByRoadmapId(roadmapId); }
  create(roadmapId: string, values: PhaseFormValues) {
    return this.repo.createEditor(roadmapId, phaseFormSchema.parse(values));
  }
  update(id: string, values: PhaseFormValues) {
    return this.repo.updateEditor(id, phaseFormSchema.parse(values));
  }
  reorder(roadmapId: string, ids: string[]) {
    return this.repo.reorder(roadmapId, ids);
  }
  remove(id: string) {
    return this.repo.softDelete(id);
  }
  restore(id: string) { return this.repo.restore(id); }
  permanentDelete(id: string) { return this.repo.permanentDelete(id); }
  history(id: string) { return this.repo.findHistory(id); }
}
export const phaseService = new PhaseService();

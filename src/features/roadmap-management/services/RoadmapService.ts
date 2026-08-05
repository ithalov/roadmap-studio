import { databaseService } from '@/database/database-service';
import { RoadmapRepository } from '@/database/repositories';
import type { Roadmap } from '@/database/models';
import type { DashboardStats, RoadmapFilters } from '@/features/roadmap-management/types/roadmap-management';
import { roadmapFormSchema, type RoadmapFormValues } from '@/features/roadmap-management/schemas/roadmap-form';

export class RoadmapService {
  private readonly repository = new RoadmapRepository(databaseService);
  public getActive(filters: RoadmapFilters = {}): Promise<Roadmap[]> { return this.repository.findActive(filters); }
  public getArchived(filters: RoadmapFilters = {}): Promise<Roadmap[]> { return this.repository.findArchived(filters); }
  public getDeleted(filters: RoadmapFilters = {}): Promise<Roadmap[]> { return this.repository.findDeleted(filters); }
  public getRecent(limit: number): Promise<Roadmap[]> { return this.repository.findRecent(limit); }
  public getById(id: string): Promise<Roadmap | null> { return this.repository.findById(id); }
  public getStats(): Promise<DashboardStats> { return this.repository.getDashboardStats(); }
  public async create(values: RoadmapFormValues): Promise<Roadmap> { const form = roadmapFormSchema.parse(values); return this.repository.create({ ...form, deviceId: 'local-device' }); }
  public async update(id: string, values: RoadmapFormValues): Promise<Roadmap | null> { return this.repository.update(id, roadmapFormSchema.parse(values)); }
  public duplicate(id: string): Promise<Roadmap | null> { return this.repository.duplicate(id); }
  public archive(id: string): Promise<void> { return this.repository.archive(id); }
  public restoreArchived(id: string): Promise<void> { return this.repository.restoreArchived(id); }
  public toggleFavorite(id: string): Promise<void> { return this.repository.toggleFavorite(id); }
  public softDelete(id: string): Promise<void> { return this.repository.softDelete(id); }
  public restoreDeleted(id: string): Promise<void> { return this.repository.restoreDeleted(id); }
  public permanentDelete(id: string): Promise<void> { return this.repository.permanentDelete(id); }
}
export const roadmapService = new RoadmapService();

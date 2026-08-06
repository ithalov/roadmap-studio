import { databaseService } from '@/database/database-service';
import { TemplateRepository } from '@/database/repositories';
import type { Roadmap, RoadmapTemplate } from '@/database/models';
import type {
  TemplateCreateValues,
  TemplateProjectValues,
} from '@/features/templates/schemas/template';
import type { TemplateFilters } from '@/features/templates/types/template';

export class TemplateService {
  private readonly repository = new TemplateRepository(databaseService);
  public list(filters: TemplateFilters = {}): Promise<RoadmapTemplate[]> {
    return this.repository.findLibrary(filters);
  }
  public get(id: string): Promise<RoadmapTemplate | null> {
    return this.repository.findById(id);
  }
  public createFromRoadmap(
    roadmapId: string,
    values: TemplateCreateValues,
  ): Promise<RoadmapTemplate> {
    return this.repository.createFromRoadmap(roadmapId, values);
  }
  public use(id: string, values: TemplateProjectValues): Promise<Roadmap> {
    return this.repository.useTemplate(id, values);
  }
  public favorite(id: string): Promise<void> {
    return this.repository.toggleFavorite(id);
  }
  public remove(id: string): Promise<void> {
    return this.repository.softDelete(id);
  }
  public export(id: string): Promise<Record<string, unknown> | null> {
    return this.repository.export(id);
  }
  public import(value: unknown): Promise<RoadmapTemplate> {
    return this.repository.import(value);
  }
}

export const templateService = new TemplateService();

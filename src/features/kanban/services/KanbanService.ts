import { databaseService } from '@/database/database-service';
import { KanbanSettingsRepository, PhaseRepository, TaskRepository } from '@/database/repositories';
import { defaultKanbanSettings, kanbanColumns } from '@/features/kanban/constants/columns';
import { kanbanFiltersSchema, kanbanSettingsSchema } from '@/features/kanban/schemas/kanban';
import type { KanbanBoard, KanbanFilters, KanbanSettingsValues } from '@/features/kanban/types/kanban';

export class KanbanService {
  private readonly tasks = new TaskRepository(databaseService); private readonly phases = new PhaseRepository(databaseService); private readonly settings = new KanbanSettingsRepository(databaseService);
  private parseSettings(value: { visibleColumns: string; columnOrder: string; wipLimits: string; compactMode: boolean } | null): KanbanSettingsValues { if (!value) return { ...defaultKanbanSettings, wipLimits: {} }; try { return kanbanSettingsSchema.parse({ visibleColumns:JSON.parse(value.visibleColumns),columnOrder:JSON.parse(value.columnOrder),wipLimits:JSON.parse(value.wipLimits),compactMode:value.compactMode }); } catch { return { ...defaultKanbanSettings,wipLimits:{} }; } }
  public async getSettings(roadmapId: string): Promise<KanbanSettingsValues> { return this.parseSettings(await this.settings.findByRoadmapId(roadmapId)); }
  public saveSettings(roadmapId: string, values: KanbanSettingsValues) { return this.settings.upsert(roadmapId,kanbanSettingsSchema.parse(values)); }
  public async getBoard(roadmapId: string, filters: KanbanFilters = {}): Promise<KanbanBoard> { const parsed=kanbanFiltersSchema.parse(filters); const [tasks,phases,settings] = await Promise.all([this.tasks.findKanbanByRoadmapId(roadmapId,parsed),this.phases.findActiveByRoadmapId(roadmapId),this.getSettings(roadmapId)]); const ordered = settings.columnOrder.map((status) => kanbanColumns.find((column) => column.status===status)).filter((column): column is (typeof kanbanColumns)[number] => Boolean(column)); const columns=ordered.filter((column) => settings.visibleColumns.includes(column.status)).map((definition) => { const items=tasks.filter((task) => task.status===definition.status); const limit=settings.wipLimits[definition.status] ?? null; return { definition,tasks:items,wipLimit:limit,isWipExceeded:Boolean(limit && definition.countsTowardWip && items.length>limit) }; }); return { phases,columns,totalVisible:tasks.length }; }
}
export const kanbanService = new KanbanService();

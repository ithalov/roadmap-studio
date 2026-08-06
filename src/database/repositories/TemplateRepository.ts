import type { RoadmapTemplate } from '@/database/models';
import { PhaseRepository } from '@/database/repositories/PhaseRepository';
import { RepositoryBase } from '@/database/repositories/RepositoryBase';
import { RoadmapRepository } from '@/database/repositories/RoadmapRepository';
import { TaskRepository } from '@/database/repositories/TaskRepository';
import { mapMeta, newMeta, rowValue } from '@/database/repositories/row-mapper';
import {
  templateCreateSchema,
  templateImportSchema,
  type TemplateCreateValues,
  type TemplateProjectValues,
} from '@/features/templates/schemas/template';
import type {
  TemplateFilters,
  TemplateSnapshot,
  TemplateSort,
} from '@/features/templates/types/template';
import type { QueryResultRow, SqlBindValue, SqlExecutor } from '@/types/database';

const orderBy: Record<TemplateSort, string> = {
  recent: 'updated_at DESC',
  used: 'usage_count DESC, updated_at DESC',
  name_asc: 'name COLLATE NOCASE ASC',
  name_desc: 'name COLLATE NOCASE DESC',
  updated: 'updated_at DESC',
  phases: 'updated_at DESC',
};

export class TemplateRepository extends RepositoryBase<RoadmapTemplate> {
  constructor(database: SqlExecutor) {
    super(database, 'roadmap_templates');
  }
  protected mapRow(row: QueryResultRow): RoadmapTemplate {
    let tags: string[] = [];
    try {
      tags = JSON.parse(rowValue.string(row, 'tags_json')) as string[];
    } catch {
      tags = [];
    }
    return {
      ...mapMeta(row),
      name: rowValue.string(row, 'name'),
      description: rowValue.string(row, 'description'),
      category: rowValue.string(row, 'category'),
      tags,
      coverImage: rowValue.nullableString(row, 'cover_image'),
      icon: rowValue.nullableString(row, 'icon'),
      color: rowValue.string(row, 'color'),
      author: rowValue.string(row, 'author'),
      version: rowValue.string(row, 'version'),
      snapshotJson: rowValue.string(row, 'snapshot_json'),
      isFavorite: rowValue.boolean(row, 'is_favorite'),
      usageCount: rowValue.number(row, 'usage_count'),
      lastUsedAt: rowValue.nullableString(row, 'last_used_at'),
    };
  }
  private where(filters: TemplateFilters): { sql: string; values: SqlBindValue[] } {
    const clauses = ['deleted_at IS NULL'];
    const values: SqlBindValue[] = [];
    if (filters.query?.trim()) {
      const query = `%${filters.query.trim()}%`;
      clauses.push(
        '(name LIKE ? COLLATE NOCASE OR description LIKE ? COLLATE NOCASE OR category LIKE ? COLLATE NOCASE OR tags_json LIKE ? COLLATE NOCASE)',
      );
      values.push(query, query, query, query);
    }
    if (filters.category) {
      clauses.push('category=?');
      values.push(filters.category);
    }
    if (filters.favorite) clauses.push('is_favorite=1');
    return { sql: clauses.join(' AND '), values };
  }
  public async findLibrary(filters: TemplateFilters = {}): Promise<RoadmapTemplate[]> {
    const built = this.where(filters);
    return this.queryMany(
      `SELECT * FROM roadmap_templates WHERE ${built.sql} ORDER BY ${orderBy[filters.sort ?? 'recent']}`,
      built.values,
    );
  }
  public async findById(id: string): Promise<RoadmapTemplate | null> {
    return this.queryOne('SELECT * FROM roadmap_templates WHERE id=? AND deleted_at IS NULL', [id]);
  }
  public async createFromRoadmap(
    roadmapId: string,
    values: TemplateCreateValues,
  ): Promise<RoadmapTemplate> {
    const input = templateCreateSchema.parse(values);
    const roadmaps = new RoadmapRepository(this.database);
    const roadmap = await roadmaps.findById(roadmapId);
    if (!roadmap) throw new Error('Roadmap not found.');
    const phases = await new PhaseRepository(this.database).findByRoadmapId(roadmapId);
    const tasks = new TaskRepository(this.database);
    const taskGroups = await Promise.all(
      phases.map(async (phase) => ({ phase, tasks: await tasks.findByPhaseId(phase.id) })),
    );
    const snapshot: TemplateSnapshot = {
      formatVersion: 1,
      roadmap: {
        title: roadmap.title,
        description: roadmap.description,
        version: roadmap.version,
        category: roadmap.category,
        status: roadmap.status,
        accentColor: roadmap.accentColor,
        progressMode: roadmap.progressMode,
      },
      phases: phases.map((phase) => ({
        sourceId: phase.id,
        title: phase.title,
        description: phase.description,
        position: phase.position,
        status: phase.status,
        priority: phase.priority,
        progress: phase.progress,
        startDate: phase.startDate,
        targetDate: phase.targetDate,
      })),
      tasks: taskGroups.flatMap(({ phase, tasks: phaseTasks }) =>
        phaseTasks.map((task) => ({
          sourcePhaseId: phase.id,
          title: task.title,
          description: task.description,
          position: task.position,
          status: task.status,
          priority: task.priority,
          completed: task.completed,
          startDate: task.startDate,
          estimatedMinutes: task.estimatedMinutes,
          spentMinutes: task.spentMinutes,
          dueDate: task.dueDate,
          assignee: task.assignee,
        })),
      ),
    };
    return this.insert(input, snapshot, roadmap.deviceId);
  }
  private async insert(
    input: TemplateCreateValues,
    snapshot: TemplateSnapshot,
    deviceId = 'local-device',
  ): Promise<RoadmapTemplate> {
    const meta = newMeta(undefined, deviceId);
    const item: RoadmapTemplate = {
      ...meta,
      ...input,
      snapshotJson: JSON.stringify(snapshot),
      isFavorite: false,
      usageCount: 0,
      lastUsedAt: null,
    };
    await this.database.execute(
      'INSERT INTO roadmap_templates (id,name,description,category,tags_json,cover_image,icon,color,author,version,snapshot_json,is_favorite,usage_count,last_used_at,created_at,updated_at,deleted_at,sync_status,local_version,server_version,device_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        item.id,
        item.name,
        item.description,
        item.category,
        JSON.stringify(item.tags),
        item.coverImage,
        item.icon,
        item.color,
        item.author,
        item.version,
        item.snapshotJson,
        0,
        0,
        null,
        item.createdAt,
        item.updatedAt,
        null,
        item.syncStatus,
        item.localVersion,
        item.serverVersion,
        item.deviceId,
      ],
    );
    return item;
  }
  public async import(value: unknown): Promise<RoadmapTemplate> {
    const input = templateImportSchema.parse(value);
    return this.insert(input, input.snapshot);
  }
  public async export(id: string): Promise<Record<string, unknown> | null> {
    const item = await this.findById(id);
    if (!item) return null;
    return {
      format: 'roadmap-studio-template',
      formatVersion: 1,
      name: item.name,
      description: item.description,
      category: item.category,
      tags: item.tags,
      coverImage: item.coverImage,
      icon: item.icon,
      color: item.color,
      author: item.author,
      version: item.version,
      snapshot: JSON.parse(item.snapshotJson) as TemplateSnapshot,
    };
  }
  public async toggleFavorite(id: string): Promise<void> {
    await this.database.execute(
      "UPDATE roadmap_templates SET is_favorite=CASE is_favorite WHEN 1 THEN 0 ELSE 1 END,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=?",
      [new Date().toISOString(), id],
    );
  }
  public async softDelete(id: string): Promise<void> {
    await this.delete(id);
  }
  public async useTemplate(id: string, values: TemplateProjectValues) {
    const item = await this.findById(id);
    if (!item) throw new Error('Template not found.');
    const snapshot = JSON.parse(item.snapshotJson) as TemplateSnapshot;
    const roadmap = await new RoadmapRepository(this.database).create({
      ...snapshot.roadmap,
      title: values.title,
      description: values.description,
      category: values.category,
      accentColor: values.accentColor,
      status: 'draft',
      deviceId: item.deviceId,
    });
    const phaseRepository = new PhaseRepository(this.database);
    const taskRepository = new TaskRepository(this.database);
    const phaseIds = new Map<string, string>();
    for (const source of snapshot.phases) {
      const phase = await phaseRepository.create({
        title: source.title,
        description: source.description,
        position: source.position,
        status: source.status as import('@/schemas/database').PhaseInput['status'],
        priority: source.priority as import('@/schemas/database').PhaseInput['priority'],
        progress: source.progress,
        startDate: source.startDate,
        targetDate: source.targetDate,
        roadmapId: roadmap.id,
        deviceId: item.deviceId,
      });
      phaseIds.set(source.sourceId, phase.id);
    }
    for (const source of snapshot.tasks) {
      const phaseId = phaseIds.get(source.sourcePhaseId);
      if (!phaseId) continue;
      await taskRepository.create({
        title: source.title,
        description: source.description,
        position: source.position,
        status: source.status as import('@/schemas/database').TaskInput['status'],
        priority: source.priority as import('@/schemas/database').TaskInput['priority'],
        completed: source.completed,
        startDate: source.startDate,
        estimatedMinutes: source.estimatedMinutes,
        spentMinutes: source.spentMinutes,
        dueDate: source.dueDate,
        assignee: source.assignee,
        phaseId,
        deviceId: item.deviceId,
      });
    }
    await this.database.execute(
      "UPDATE roadmap_templates SET usage_count=usage_count+1,last_used_at=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=?",
      [new Date().toISOString(), new Date().toISOString(), id],
    );
    return roadmap;
  }
}

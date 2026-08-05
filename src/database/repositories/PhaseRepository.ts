import type { Phase } from '@/database/models';
import { RepositoryBase } from '@/database/repositories/RepositoryBase';
import { mapMeta, newMeta, rowValue } from '@/database/repositories/row-mapper';
import { phaseInputSchema, type PhaseInput } from '@/schemas/database';
import type { QueryResultRow, SqlExecutor } from '@/types/database';
import type { PhaseFormValues } from '@/features/phases/schemas/phase-form';
import type { PhaseStats } from '@/features/phases/types/phase';

export class PhaseRepository extends RepositoryBase<Phase> {
  constructor(database: SqlExecutor) {
    super(database, 'phases');
  }
  protected mapRow(row: QueryResultRow): Phase {
    return {
      ...mapMeta(row),
      roadmapId: rowValue.string(row, 'roadmap_id'),
      title: rowValue.string(row, 'title'),
      description: rowValue.string(row, 'description'),
      position: rowValue.number(row, 'position'),
      status: rowValue.string(row, 'status'),
      priority: rowValue.string(row, 'priority'),
      progress: rowValue.number(row, 'progress'),
      startDate: rowValue.nullableString(row, 'start_date'),
      targetDate: rowValue.nullableString(row, 'target_date'),
      progressMode: rowValue.string(row, 'progress_mode') === 'automatic' ? 'automatic' : 'manual',
      completedAt: rowValue.nullableString(row, 'completed_at'),
      color: rowValue.nullableString(row, 'color'),
      icon: rowValue.nullableString(row, 'icon'),
      isCollapsed: rowValue.boolean(row, 'is_collapsed'),
    };
  }
  private async recordHistory(
    action: string,
    phaseId: string,
    payload: Record<string, unknown> = {},
  ): Promise<void> {
    const meta = newMeta(undefined, 'local-device');
    await this.database.execute(
      'INSERT INTO history (id,action_type,entity_type,entity_id,payload_json,occurred_at,created_at,updated_at,deleted_at,sync_status,local_version,server_version,device_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        meta.id,
        action,
        'phase',
        phaseId,
        JSON.stringify(payload),
        meta.createdAt,
        meta.createdAt,
        meta.updatedAt,
        null,
        'pending',
        1,
        0,
        meta.deviceId,
      ],
    );
  }
  public async create(value: PhaseInput): Promise<Phase> {
    const input = phaseInputSchema.parse(value);
    const item = {
      ...input,
      startDate: input.startDate ?? null,
      targetDate: input.targetDate ?? null,
      progressMode: 'manual' as const,
      completedAt: null,
      color: null,
      icon: null,
      isCollapsed: false,
      ...newMeta(input.id, input.deviceId),
    };
    await this.database.execute(
      'INSERT INTO phases (id,roadmap_id,title,description,position,status,priority,progress,start_date,target_date,created_at,updated_at,deleted_at,sync_status,local_version,server_version,device_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        item.id,
        item.roadmapId,
        item.title,
        item.description,
        item.position,
        item.status,
        item.priority,
        item.progress,
        item.startDate,
        item.targetDate,
        item.createdAt,
        item.updatedAt,
        item.deletedAt,
        item.syncStatus,
        item.localVersion,
        item.serverVersion,
        item.deviceId,
      ],
    );
    await this.recordHistory('phase_created', item.id, { title: item.title });
    return item;
  }
  public async update(id: string, value: Partial<PhaseInput>): Promise<Phase | null> {
    const current = await this.findById(id);
    if (!current) return null;
    const input = phaseInputSchema.parse({ ...current, ...value, id, deviceId: current.deviceId });
    const now = new Date().toISOString();
    await this.database.execute(
      "UPDATE phases SET title=?,description=?,position=?,status=?,priority=?,progress=?,start_date=?,target_date=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=?",
      [
        input.title,
        input.description,
        input.position,
        input.status,
        input.priority,
        input.progress,
        input.startDate ?? null,
        input.targetDate ?? null,
        now,
        id,
      ],
    );
    await this.recordHistory('phase_updated', id);
    return this.findById(id);
  }
  public async findByRoadmapId(roadmapId: string): Promise<Phase[]> {
    return this.queryMany(
      'SELECT * FROM phases WHERE roadmap_id = ? AND deleted_at IS NULL ORDER BY position',
      [roadmapId],
    );
  }
  public async findActiveByRoadmapId(roadmapId: string): Promise<Phase[]> {
    return this.findByRoadmapId(roadmapId);
  }
  public async findDeletedByRoadmapId(roadmapId: string): Promise<Phase[]> {
    return this.queryMany(
      'SELECT * FROM phases WHERE roadmap_id=? AND deleted_at IS NOT NULL ORDER BY deleted_at DESC',
      [roadmapId],
    );
  }
  public async createEditor(
    roadmapId: string,
    values: PhaseFormValues,
    deviceId = 'local-device',
  ): Promise<Phase> {
    const position = await this.countByRoadmapId(roadmapId);
    const item = await this.create({
      roadmapId,
      deviceId,
      title: values.title,
      description: values.description,
      position,
      status: values.status,
      priority: values.priority,
      progress: values.progress,
      startDate: values.startDate,
      targetDate: values.targetDate,
    });
    await this.database.execute('UPDATE phases SET progress_mode=?,color=?,icon=? WHERE id=?', [
      values.progressMode,
      values.color,
      values.icon,
      item.id,
    ]);
    return (await this.findById(item.id))!;
  }
  public async updateEditor(id: string, values: PhaseFormValues): Promise<Phase | null> {
    const completedAt = values.status === 'completed' ? new Date().toISOString() : null;
    await this.database.execute(
      "UPDATE phases SET title=?,description=?,status=?,priority=?,progress=?,progress_mode=?,start_date=?,target_date=?,color=?,icon=?,completed_at=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=?",
      [
        values.title,
        values.description,
        values.status,
        values.priority,
        values.status === 'completed' ? 100 : values.progress,
        values.progressMode,
        values.startDate,
        values.targetDate,
        values.color,
        values.icon,
        completedAt,
        new Date().toISOString(),
        id,
      ],
    );
    return this.findById(id);
  }
  public async softDelete(id: string): Promise<void> {
    await this.delete(id);
    await this.recordHistory('phase_soft_deleted', id);
  }
  public async restore(id: string): Promise<void> {
    const row = await this.queryOne('SELECT * FROM phases WHERE id=?', [id]);
    if (!row) return;
    const position = await this.countByRoadmapId(row.roadmapId);
    await this.database.execute(
      "UPDATE phases SET deleted_at=NULL,position=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=?",
      [position, new Date().toISOString(), id],
    );
    await this.recordHistory('phase_restored', id);
  }
  public async permanentDelete(id: string): Promise<void> {
    await this.database.execute('BEGIN');
    try {
      await this.database.execute('DELETE FROM tasks WHERE phase_id=?', [id]);
      await this.database.execute('DELETE FROM phases WHERE id=?', [id]);
      await this.database.execute('COMMIT');
    } catch (error) {
      await this.database.execute('ROLLBACK');
      throw error;
    }
  }
  public async reorder(roadmapId: string, orderedIds: string[]): Promise<void> {
    await this.database.execute('BEGIN');
    try {
      for (const [position, id] of orderedIds.entries())
        await this.database.execute(
          "UPDATE phases SET position=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=? AND roadmap_id=?",
          [position, new Date().toISOString(), id, roadmapId],
        );
      await this.database.execute('COMMIT');
      await this.recordHistory('phase_reordered', roadmapId, { phaseIds: orderedIds });
    } catch (error) {
      await this.database.execute('ROLLBACK');
      throw error;
    }
  }
  public async updateProgress(id: string, progress: number): Promise<void> {
    await this.database.execute(
      "UPDATE phases SET progress=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=?",
      [progress, new Date().toISOString(), id],
    );
    await this.recordHistory('phase_progress_changed', id, { progress });
  }
  public async updateStatus(id: string, status: string): Promise<void> {
    await this.database.execute(
      "UPDATE phases SET status=?,progress=CASE WHEN ?='completed' THEN 100 ELSE progress END,completed_at=CASE WHEN ?='completed' THEN ? ELSE NULL END,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=?",
      [status, status, status, new Date().toISOString(), new Date().toISOString(), id],
    );
    await this.recordHistory('phase_status_changed', id, { status });
  }
  public async toggleCollapsed(id: string): Promise<void> {
    await this.database.execute(
      "UPDATE phases SET is_collapsed=CASE is_collapsed WHEN 1 THEN 0 ELSE 1 END,updated_at=?,sync_status='pending' WHERE id=?",
      [new Date().toISOString(), id],
    );
  }
  public async countByRoadmapId(roadmapId: string): Promise<number> {
    const rows = await this.database.select<QueryResultRow>(
      'SELECT COUNT(*) AS total FROM phases WHERE roadmap_id=? AND deleted_at IS NULL',
      [roadmapId],
    );
    return rowValue.number(rows[0] ?? {}, 'total');
  }
  public async getPhaseStats(roadmapId: string): Promise<PhaseStats> {
    const rows = await this.database.select<QueryResultRow>(
      "SELECT COUNT(*) total,SUM(status='planned') planned,SUM(status='in_progress') inProgress,SUM(status='blocked') blocked,SUM(status='completed') completed,SUM(target_date < date('now') AND status NOT IN ('completed','cancelled')) overdue,AVG(CASE WHEN status!='cancelled' THEN progress END) averageProgress FROM phases WHERE roadmap_id=? AND deleted_at IS NULL",
      [roadmapId],
    );
    const row = rows[0] ?? {};
    return {
      total: rowValue.number(row, 'total'),
      planned: rowValue.number(row, 'planned'),
      inProgress: rowValue.number(row, 'inProgress'),
      blocked: rowValue.number(row, 'blocked'),
      completed: rowValue.number(row, 'completed'),
      overdue: rowValue.number(row, 'overdue'),
      averageProgress: rowValue.number(row, 'averageProgress'),
    };
  }
  public async findHistory(id: string): Promise<QueryResultRow[]> {
    return this.database.select<QueryResultRow>(
      'SELECT action_type, payload_json, occurred_at FROM history WHERE entity_type=? AND entity_id=? ORDER BY occurred_at DESC',
      ['phase', id],
    );
  }
}

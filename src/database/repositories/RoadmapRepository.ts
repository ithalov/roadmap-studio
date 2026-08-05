import type { Roadmap } from '@/database/models';
import { PhaseRepository } from '@/database/repositories/PhaseRepository';
import { RepositoryBase } from '@/database/repositories/RepositoryBase';
import { TaskRepository } from '@/database/repositories/TaskRepository';
import { mapMeta, newMeta, rowValue } from '@/database/repositories/row-mapper';
import type {
  DashboardStats,
  RoadmapFilters,
  RoadmapSort,
} from '@/features/roadmap-management/types/roadmap-management';
import { roadmapInputSchema, type RoadmapInput } from '@/schemas/database';
import type { QueryResultRow, SqlBindValue, SqlExecutor } from '@/types/database';

const orderBy: Record<RoadmapSort, string> = {
  updated_desc: 'is_favorite DESC, updated_at DESC',
  updated_asc: 'updated_at ASC',
  title_asc: 'title COLLATE NOCASE ASC',
  title_desc: 'title COLLATE NOCASE DESC',
  progress_desc: 'progress DESC',
  progress_asc: 'progress ASC',
  created_desc: 'created_at DESC',
};

export class RoadmapRepository extends RepositoryBase<Roadmap> {
  constructor(database: SqlExecutor) {
    super(database, 'roadmaps');
  }
  protected mapRow(row: QueryResultRow): Roadmap {
    return {
      ...mapMeta(row),
      title: rowValue.string(row, 'title'),
      description: rowValue.string(row, 'description'),
      version: rowValue.string(row, 'version'),
      category: rowValue.string(row, 'category'),
      status: rowValue.string(row, 'status'),
      accentColor: rowValue.string(row, 'accent_color'),
      progressMode: rowValue.string(row, 'progress_mode'),
      isFavorite: rowValue.boolean(row, 'is_favorite'),
    };
  }
  private filters(filters: RoadmapFilters, base: string): { sql: string; values: SqlBindValue[] } {
    const conditions: string[] = [base];
    const values: SqlBindValue[] = [];
    if (filters.query?.trim()) {
      conditions.push(
        '(title LIKE ? COLLATE NOCASE OR description LIKE ? COLLATE NOCASE OR category LIKE ? COLLATE NOCASE OR version LIKE ? COLLATE NOCASE)',
      );
      const query = `%${filters.query.trim()}%`;
      values.push(query, query, query, query);
    }
    if (filters.status) {
      conditions.push('status = ?');
      values.push(filters.status);
    }
    if (filters.category) {
      conditions.push('category = ?');
      values.push(filters.category);
    }
    if (filters.favorite) conditions.push('is_favorite = 1');
    return { sql: conditions.join(' AND '), values };
  }
  private async history(
    actionType: string,
    entityId: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const meta = newMeta(undefined, 'local-device');
    await this.database.execute(
      'INSERT INTO history (id,action_type,entity_type,entity_id,payload_json,occurred_at,created_at,updated_at,deleted_at,sync_status,local_version,server_version,device_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        meta.id,
        actionType,
        'roadmap',
        entityId,
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
  public async create(value: RoadmapInput): Promise<Roadmap> {
    const input = roadmapInputSchema.parse(value);
    const item: Roadmap = { ...input, ...newMeta(input.id, input.deviceId), isFavorite: false };
    await this.database.execute(
      'INSERT INTO roadmaps (id,title,description,version,category,status,accent_color,progress_mode,created_at,updated_at,deleted_at,sync_status,local_version,server_version,device_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        item.id,
        item.title,
        item.description,
        item.version,
        item.category,
        item.status,
        item.accentColor,
        item.progressMode,
        item.createdAt,
        item.updatedAt,
        item.deletedAt,
        item.syncStatus,
        item.localVersion,
        item.serverVersion,
        item.deviceId,
      ],
    );
    await this.history('roadmap_created', item.id, { title: item.title });
    return item;
  }
  public async update(id: string, value: Partial<RoadmapInput>): Promise<Roadmap | null> {
    const current = await this.findById(id);
    if (!current) return null;
    const input = roadmapInputSchema.parse({
      ...current,
      ...value,
      id,
      deviceId: current.deviceId,
    });
    const now = new Date().toISOString();
    await this.database.execute(
      "UPDATE roadmaps SET title=?,description=?,version=?,category=?,status=?,accent_color=?,progress_mode=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=?",
      [
        input.title,
        input.description,
        input.version,
        input.category,
        input.status,
        input.accentColor,
        input.progressMode,
        now,
        id,
      ],
    );
    await this.history('roadmap_updated', id, { title: input.title });
    return this.findById(id);
  }
  public async findRecent(limit: number): Promise<Roadmap[]> {
    return this.queryMany(
      'SELECT roadmaps.*, 0 AS progress FROM roadmaps WHERE deleted_at IS NULL AND status != ? ORDER BY is_favorite DESC, updated_at DESC LIMIT ?',
      ['archived', limit],
    );
  }
  public async findActive(filters: RoadmapFilters = {}): Promise<Roadmap[]> {
    const built = this.filters(filters, "deleted_at IS NULL AND status != 'archived'");
    return this.queryMany(
      `SELECT roadmaps.*, 0 AS progress FROM roadmaps WHERE ${built.sql} ORDER BY ${orderBy[filters.sort ?? 'updated_desc']}`,
      built.values,
    );
  }
  public async findArchived(filters: RoadmapFilters = {}): Promise<Roadmap[]> {
    const built = this.filters(filters, "deleted_at IS NULL AND status = 'archived'");
    return this.queryMany(
      `SELECT roadmaps.*, 0 AS progress FROM roadmaps WHERE ${built.sql} ORDER BY ${orderBy[filters.sort ?? 'updated_desc']}`,
      built.values,
    );
  }
  public async findDeleted(filters: RoadmapFilters = {}): Promise<Roadmap[]> {
    const built = this.filters(filters, 'deleted_at IS NOT NULL');
    return this.queryMany(
      `SELECT roadmaps.*, 0 AS progress FROM roadmaps WHERE ${built.sql} ORDER BY deleted_at DESC`,
      built.values,
    );
  }
  public async search(query: string, filters: RoadmapFilters = {}): Promise<Roadmap[]> {
    return this.findActive({ ...filters, query });
  }
  public async toggleFavorite(id: string): Promise<void> {
    await this.database.execute(
      "UPDATE roadmaps SET is_favorite = CASE is_favorite WHEN 1 THEN 0 ELSE 1 END, updated_at=?, sync_status='pending', local_version=local_version+1 WHERE id=?",
      [new Date().toISOString(), id],
    );
    const item = await this.findById(id);
    await this.history(item?.isFavorite ? 'roadmap_favorited' : 'roadmap_unfavorited', id, {});
  }
  public async archive(id: string): Promise<void> {
    await this.database.execute(
      "UPDATE roadmaps SET status='archived', updated_at=?, sync_status='pending', local_version=local_version+1 WHERE id=?",
      [new Date().toISOString(), id],
    );
    await this.history('roadmap_archived', id, {});
  }
  public async restoreArchived(id: string): Promise<void> {
    await this.database.execute(
      "UPDATE roadmaps SET status='draft', updated_at=?, sync_status='pending', local_version=local_version+1 WHERE id=?",
      [new Date().toISOString(), id],
    );
    await this.history('roadmap_restored', id, {});
  }
  public async softDelete(id: string): Promise<void> {
    await this.delete(id);
    await this.history('roadmap_soft_deleted', id, {});
  }
  public async restoreDeleted(id: string): Promise<void> {
    await this.database.execute(
      "UPDATE roadmaps SET deleted_at=NULL, updated_at=?, sync_status='pending', local_version=local_version+1 WHERE id=?",
      [new Date().toISOString(), id],
    );
    await this.history('roadmap_restored_from_trash', id, {});
  }
  public async permanentDelete(id: string): Promise<void> {
    // Repository calls can use separate SQLite connections in the Tauri SQL plugin.
    // Avoid an explicit transaction here or the cleanup can leave the database locked.
    await this.database.execute(
      'DELETE FROM task_tags WHERE task_id IN (SELECT t.id FROM tasks t JOIN phases p ON p.id=t.phase_id WHERE p.roadmap_id=?)',
      [id],
    );
    await this.database.execute(
      'DELETE FROM subtasks WHERE task_id IN (SELECT t.id FROM tasks t JOIN phases p ON p.id=t.phase_id WHERE p.roadmap_id=?)',
      [id],
    );
    await this.database.execute(
      'DELETE FROM attachments WHERE task_id IN (SELECT t.id FROM tasks t JOIN phases p ON p.id=t.phase_id WHERE p.roadmap_id=?)',
      [id],
    );
    await this.database.execute(
      'DELETE FROM dependencies WHERE task_id IN (SELECT t.id FROM tasks t JOIN phases p ON p.id=t.phase_id WHERE p.roadmap_id=?) OR depends_on_task_id IN (SELECT t.id FROM tasks t JOIN phases p ON p.id=t.phase_id WHERE p.roadmap_id=?)',
      [id, id],
    );
    await this.database.execute(
      'DELETE FROM notes WHERE roadmap_id=? OR task_id IN (SELECT t.id FROM tasks t JOIN phases p ON p.id=t.phase_id WHERE p.roadmap_id=?)',
      [id, id],
    );
    await this.database.execute(
      'DELETE FROM tasks WHERE phase_id IN (SELECT id FROM phases WHERE roadmap_id=?)',
      [id],
    );
    await this.database.execute('DELETE FROM phases WHERE roadmap_id=?', [id]);
    await this.database.execute('DELETE FROM kanban_settings WHERE roadmap_id=?', [id]);
    await this.database.execute('DELETE FROM history WHERE entity_type=? AND entity_id=?', [
      'roadmap',
      id,
    ]);
    await this.database.execute('DELETE FROM roadmaps WHERE id=?', [id]);
  }
  public async duplicate(id: string): Promise<Roadmap | null> {
    const source = await this.findById(id);
    if (!source) return null;
    await this.database.execute('BEGIN');
    try {
      const copy = await this.create({
        ...source,
        id: undefined,
        title: `${source.title} - Copia`,
        deviceId: source.deviceId,
      });
      const phases = await new PhaseRepository(this.database).findByRoadmapId(id);
      const taskRepository = new TaskRepository(this.database);
      for (const phase of phases) {
        const copiedPhase = await new PhaseRepository(this.database).create({
          ...phase,
          id: undefined,
          roadmapId: copy.id,
          deviceId: copy.deviceId,
        });
        for (const task of await taskRepository.findByPhaseId(phase.id))
          await taskRepository.create({
            ...task,
            id: undefined,
            phaseId: copiedPhase.id,
            status: task.status as import('@/schemas/database').TaskInput['status'],
            priority: task.priority as import('@/schemas/database').TaskInput['priority'],
            deviceId: copy.deviceId,
          });
      }
      await this.history('roadmap_duplicated', copy.id, { sourceId: id });
      await this.database.execute('COMMIT');
      return copy;
    } catch (error) {
      await this.database.execute('ROLLBACK');
      throw error;
    }
  }
  public async getDashboardStats(): Promise<DashboardStats> {
    const rows = await this.database.select<QueryResultRow>(
      "SELECT COUNT(*) AS totalRoadmaps, SUM(CASE WHEN status NOT IN ('archived','completed') THEN 1 ELSE 0 END) AS activeRoadmaps, SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completedRoadmaps, SUM(CASE WHEN status='archived' THEN 1 ELSE 0 END) AS archivedRoadmaps FROM roadmaps WHERE deleted_at IS NULL",
    );
    const tasks = await this.database.select<QueryResultRow>(
      "SELECT SUM(CASE WHEN completed=0 THEN 1 ELSE 0 END) AS pendingTasks, SUM(CASE WHEN completed=0 AND due_date < date('now') THEN 1 ELSE 0 END) AS overdueTasks FROM tasks WHERE deleted_at IS NULL",
    );
    return {
      totalRoadmaps: rowValue.number(rows[0] ?? {}, 'totalRoadmaps'),
      activeRoadmaps: rowValue.number(rows[0] ?? {}, 'activeRoadmaps'),
      completedRoadmaps: rowValue.number(rows[0] ?? {}, 'completedRoadmaps'),
      archivedRoadmaps: rowValue.number(rows[0] ?? {}, 'archivedRoadmaps'),
      pendingTasks: rowValue.number(tasks[0] ?? {}, 'pendingTasks'),
      overdueTasks: rowValue.number(tasks[0] ?? {}, 'overdueTasks'),
    };
  }
}

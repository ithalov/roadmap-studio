import type { Tag, Task, TaskStats } from '@/database/models';
import { RepositoryBase } from '@/database/repositories/RepositoryBase';
import { mapMeta, newMeta, rowValue } from '@/database/repositories/row-mapper';
import { taskInputSchema, type TaskInput } from '@/schemas/database';
import type { QueryResultRow, SqlBindValue, SqlExecutor } from '@/types/database';
import type { KanbanFilters, KanbanTask } from '@/features/kanban/types/kanban';

export interface TaskSearchFilters {
  phaseId: string;
  query?: string;
  status?: string;
  priority?: string;
  completed?: boolean;
  overdue?: boolean;
  withoutDueDate?: boolean;
  blocked?: boolean;
  withSubtasks?: boolean;
  tagId?: string;
  assignee?: string;
  sort?: 'position' | 'due_date' | 'priority' | 'status' | 'created_at' | 'updated_at' | 'title';
}

export class TaskRepository extends RepositoryBase<Task> {
  constructor(database: SqlExecutor) { super(database, 'tasks'); }

  protected mapRow(row: QueryResultRow): Task {
    return {
      ...mapMeta(row), phaseId: rowValue.string(row, 'phase_id'), title: rowValue.string(row, 'title'),
      description: rowValue.string(row, 'description'), position: rowValue.number(row, 'position'),
      status: rowValue.string(row, 'status'), priority: rowValue.string(row, 'priority'),
      completed: rowValue.boolean(row, 'completed'), completedAt: rowValue.nullableString(row, 'completed_at'),
      startDate: rowValue.nullableString(row, 'start_date'),
      estimatedMinutes: rowValue.nullableString(row, 'estimated_minutes') === null ? null : rowValue.number(row, 'estimated_minutes'),
      spentMinutes: rowValue.number(row, 'spent_minutes'), dueDate: rowValue.nullableString(row, 'due_date'),
      assignee: rowValue.nullableString(row, 'assignee'), kanbanPosition: rowValue.number(row, 'kanban_position'),
    };
  }

  private async history(action: string, taskId: string, payload: Record<string, unknown> = {}): Promise<void> {
    const meta = newMeta(undefined, 'local-device');
    await this.database.execute(
      'INSERT INTO history (id,action_type,entity_type,entity_id,payload_json,occurred_at,created_at,updated_at,deleted_at,sync_status,local_version,server_version,device_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [meta.id, action, 'task', taskId, JSON.stringify(payload), meta.createdAt, meta.createdAt, meta.updatedAt, null, 'pending', 1, 0, meta.deviceId],
    );
  }

  private async normalize(phaseId: string): Promise<void> {
    const rows = await this.database.select<QueryResultRow>('SELECT id FROM tasks WHERE phase_id=? AND deleted_at IS NULL ORDER BY position,id', [phaseId]);
    for (const [position, row] of rows.entries()) await this.database.execute('UPDATE tasks SET position=? WHERE id=?', [position, rowValue.string(row, 'id')]);
  }

  public async create(value: TaskInput): Promise<Task> {
    const input = taskInputSchema.parse(value);
    const item: Task = { ...newMeta(input.id, input.deviceId), ...input, description: input.description, startDate: input.startDate ?? null, dueDate: input.dueDate ?? null, assignee: input.assignee ?? null, estimatedMinutes: input.estimatedMinutes ?? null, completedAt: input.completed ? new Date().toISOString() : null, kanbanPosition: 0 };
    await this.database.execute(
      'INSERT INTO tasks (id,phase_id,title,description,position,kanban_position,status,priority,completed,completed_at,start_date,estimated_minutes,spent_minutes,due_date,assignee,created_at,updated_at,deleted_at,sync_status,local_version,server_version,device_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [item.id,item.phaseId,item.title,item.description,item.position,item.kanbanPosition,item.status,item.priority,item.completed,item.completedAt,item.startDate,item.estimatedMinutes,item.spentMinutes,item.dueDate,item.assignee,item.createdAt,item.updatedAt,item.deletedAt,item.syncStatus,item.localVersion,item.serverVersion,item.deviceId],
    );
    await this.history('task_created', item.id, { title: item.title, phaseId: item.phaseId });
    return item;
  }

  public async createAtEnd(phaseId: string, value: Omit<TaskInput, 'phaseId' | 'position'>): Promise<Task> {
    return this.create({ ...value, phaseId, position: await this.countByPhaseId(phaseId) });
  }

  public async update(id: string, value: Partial<TaskInput>): Promise<Task | null> {
    const current = await this.findById(id); if (!current) return null;
    const input = taskInputSchema.parse({ ...current, ...value, id, deviceId: current.deviceId }); const now = new Date().toISOString();
    await this.database.execute(
      "UPDATE tasks SET title=?,description=?,position=?,status=?,priority=?,completed=?,start_date=?,estimated_minutes=?,spent_minutes=?,due_date=?,assignee=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=?",
      [input.title,input.description,input.position,input.status,input.priority,input.completed,input.startDate ?? null,input.estimatedMinutes ?? null,input.spentMinutes,input.dueDate ?? null,input.assignee ?? null,now,id],
    );
    await this.history('task_updated', id, { fields: Object.keys(value) }); return this.findById(id);
  }

  public async findByPhaseId(phaseId: string): Promise<Task[]> { return this.queryMany('SELECT * FROM tasks WHERE phase_id=? ORDER BY position', [phaseId]); }
  public async findIncludingDeleted(id: string): Promise<Task | null> { return this.queryOne('SELECT * FROM tasks WHERE id=?', [id]); }
  public async findActiveByPhaseId(phaseId: string): Promise<Task[]> { return this.queryMany('SELECT * FROM tasks WHERE phase_id=? AND deleted_at IS NULL ORDER BY position', [phaseId]); }
  public async findDeletedByPhaseId(phaseId: string): Promise<Task[]> { return this.queryMany('SELECT * FROM tasks WHERE phase_id=? AND deleted_at IS NOT NULL ORDER BY deleted_at DESC', [phaseId]); }
  public async findHistory(id: string): Promise<QueryResultRow[]> { return this.database.select<QueryResultRow>('SELECT action_type,payload_json,occurred_at FROM history WHERE entity_type=? AND entity_id=? AND deleted_at IS NULL ORDER BY occurred_at DESC',['task',id]); }

  public async duplicate(id: string): Promise<Task | null> {
    const source = await this.findById(id); if (!source) return null;
    await this.database.execute('BEGIN');
    try {
      await this.database.execute("UPDATE tasks SET position=position+1 WHERE phase_id=? AND deleted_at IS NULL AND position>?", [source.phaseId, source.position]);
      const copy = await this.create({ ...source, id: undefined, title: `${source.title} - Copia`, position: source.position + 1, completed: false, status: (source.status === 'completed' ? 'not_started' : source.status) as TaskInput['status'], priority: source.priority as TaskInput['priority'], startDate: source.startDate, dueDate: source.dueDate, assignee: source.assignee, deviceId: source.deviceId });
      await this.database.execute('INSERT INTO subtasks (id,task_id,title,completed,position,created_at,updated_at,deleted_at,sync_status,local_version,server_version,device_id) SELECT lower(hex(randomblob(16))),?,title,0,position,?,?,?,?,?,?,? FROM subtasks WHERE task_id=? AND deleted_at IS NULL', [copy.id, copy.createdAt, copy.updatedAt, null, 'pending', 1, 0, copy.deviceId, source.id]);
      await this.database.execute('INSERT INTO task_tags (id,task_id,tag_id,created_at,updated_at,deleted_at,sync_status,local_version,server_version,device_id) SELECT lower(hex(randomblob(16))),?,tag_id,?,?,?,?,?,?,?,? FROM task_tags WHERE task_id=? AND deleted_at IS NULL', [copy.id, copy.createdAt, copy.updatedAt, null, 'pending', 1, 0, copy.deviceId, source.id]);
      await this.history('task_duplicated', copy.id, { sourceId: source.id }); await this.database.execute('COMMIT'); return copy;
    } catch (error) { await this.database.execute('ROLLBACK'); throw error; }
  }

  public async softDelete(id: string): Promise<void> { const task = await this.findById(id); if (!task) return; await this.delete(id); await this.normalize(task.phaseId); await this.history('task_soft_deleted', id); }
  public async restore(id: string): Promise<void> { const task = await this.queryOne('SELECT * FROM tasks WHERE id=?', [id]); if (!task) return; const position = await this.countByPhaseId(task.phaseId); await this.database.execute("UPDATE tasks SET deleted_at=NULL,position=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=?", [position,new Date().toISOString(),id]); await this.history('task_restored', id); }
  public async permanentDelete(id: string): Promise<void> { await this.database.execute('BEGIN'); try { await this.database.execute('DELETE FROM task_tags WHERE task_id=?', [id]); await this.database.execute('DELETE FROM subtasks WHERE task_id=?', [id]); await this.database.execute('DELETE FROM tasks WHERE id=?', [id]); await this.history('task_permanently_deleted', id); await this.database.execute('COMMIT'); } catch (error) { await this.database.execute('ROLLBACK'); throw error; } }
  public async reorder(phaseId: string, orderedTaskIds: string[]): Promise<void> { await this.database.execute('BEGIN'); try { for (const [position,id] of orderedTaskIds.entries()) await this.database.execute("UPDATE tasks SET position=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=? AND phase_id=?", [position,new Date().toISOString(),id,phaseId]); await this.history('task_reordered', phaseId, { taskIds: orderedTaskIds }); await this.database.execute('COMMIT'); } catch (error) { await this.database.execute('ROLLBACK'); throw error; } }
  public async moveToPhase(taskId: string, targetPhaseId: string, targetPosition?: number): Promise<void> { const task = await this.findById(taskId); if (!task) return; await this.database.execute('BEGIN'); try { const position = targetPosition ?? await this.countByPhaseId(targetPhaseId); await this.database.execute("UPDATE tasks SET phase_id=?,position=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=?", [targetPhaseId,position,new Date().toISOString(),taskId]); await this.normalize(task.phaseId); await this.normalize(targetPhaseId); await this.history('task_moved', taskId, { fromPhaseId: task.phaseId, targetPhaseId }); await this.database.execute('COMMIT'); } catch (error) { await this.database.execute('ROLLBACK'); throw error; } }
  public async updateStatus(id: string, status: string): Promise<void> { const completed = status === 'completed'; await this.database.execute("UPDATE tasks SET status=?,completed=?,completed_at=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=?", [status,completed,completed ? new Date().toISOString() : null,new Date().toISOString(),id]); await this.history('task_status_changed', id, { status }); }
  public async toggleCompleted(id: string): Promise<void> { const task = await this.findById(id); if (!task) return; const completed = !task.completed; const status = completed ? 'completed' : task.status === 'completed' ? 'not_started' : task.status; await this.database.execute("UPDATE tasks SET completed=?,status=?,completed_at=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=?", [completed,status,completed ? new Date().toISOString() : null,new Date().toISOString(),id]); await this.history(completed ? 'task_completed' : 'task_reopened', id); }
  public async updateTime(id: string, estimatedMinutes: number | null, spentMinutes: number): Promise<void> { await this.database.execute("UPDATE tasks SET estimated_minutes=?,spent_minutes=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=?", [estimatedMinutes,spentMinutes,new Date().toISOString(),id]); await this.history('task_updated', id, { estimatedMinutes, spentMinutes }); }
  public async countByPhaseId(phaseId: string): Promise<number> { const rows = await this.database.select<QueryResultRow>('SELECT COUNT(*) AS total FROM tasks WHERE phase_id=? AND deleted_at IS NULL', [phaseId]); return rowValue.number(rows[0] ?? {}, 'total'); }
  public async getTaskStats(phaseId: string): Promise<TaskStats> { const rows = await this.database.select<QueryResultRow>("SELECT COUNT(*) total,SUM(status='not_started') notStarted,SUM(status='in_progress') inProgress,SUM(status='blocked') blocked,SUM(status='in_review') inReview,SUM(completed=1) completed,SUM(CASE WHEN due_date < date('now') AND completed=0 AND status!='cancelled' THEN 1 ELSE 0 END) overdue,SUM(COALESCE(estimated_minutes,0)) estimatedMinutes,SUM(spent_minutes) spentMinutes FROM tasks WHERE phase_id=? AND deleted_at IS NULL", [phaseId]); const row = rows[0] ?? {}; return { total: rowValue.number(row,'total'),notStarted: rowValue.number(row,'notStarted'),inProgress: rowValue.number(row,'inProgress'),blocked: rowValue.number(row,'blocked'),inReview: rowValue.number(row,'inReview'),completed: rowValue.number(row,'completed'),overdue: rowValue.number(row,'overdue'),estimatedMinutes: rowValue.number(row,'estimatedMinutes'),spentMinutes: rowValue.number(row,'spentMinutes') }; }
  public async search(filters: TaskSearchFilters): Promise<Task[]> { const conditions = ['t.phase_id=?','t.deleted_at IS NULL']; const values: SqlBindValue[] = [filters.phaseId]; if (filters.query?.trim()) { conditions.push('(t.title LIKE ? COLLATE NOCASE OR t.description LIKE ? COLLATE NOCASE OR t.assignee LIKE ? COLLATE NOCASE OR EXISTS (SELECT 1 FROM task_tags tt JOIN tags tg ON tg.id=tt.tag_id WHERE tt.task_id=t.id AND tg.name LIKE ? COLLATE NOCASE))'); const q = `%${filters.query.trim()}%`; values.push(q,q,q,q); } if (filters.status) { conditions.push('t.status=?'); values.push(filters.status); } if (filters.priority) { conditions.push('t.priority=?'); values.push(filters.priority); } if (filters.completed !== undefined) { conditions.push('t.completed=?'); values.push(filters.completed); } if (filters.overdue) conditions.push("t.due_date < date('now') AND t.completed=0 AND t.status!='cancelled'"); if (filters.withoutDueDate) conditions.push('t.due_date IS NULL'); if (filters.blocked) conditions.push("t.status='blocked'"); if (filters.withSubtasks) conditions.push('EXISTS (SELECT 1 FROM subtasks s WHERE s.task_id=t.id AND s.deleted_at IS NULL)'); if (filters.tagId) { conditions.push('EXISTS (SELECT 1 FROM task_tags tt WHERE tt.task_id=t.id AND tt.tag_id=? AND tt.deleted_at IS NULL)'); values.push(filters.tagId); } if (filters.assignee) { conditions.push('t.assignee=?'); values.push(filters.assignee); } const orders: Record<NonNullable<TaskSearchFilters['sort']>, string> = { position: 't.position', due_date: 't.due_date IS NULL,t.due_date', priority: "CASE t.priority WHEN 'critical' THEN 4 WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END DESC", status: 't.status', created_at: 't.created_at DESC', updated_at: 't.updated_at DESC', title: 't.title COLLATE NOCASE' }; return this.queryMany(`SELECT t.* FROM tasks t WHERE ${conditions.join(' AND ')} ORDER BY ${orders[filters.sort ?? 'position']}`, values); }

  private mapKanban(row: QueryResultRow, tags: Tag[]): KanbanTask { return { ...this.mapRow(row), phaseTitle: rowValue.string(row, 'phase_title'), phaseColor: rowValue.nullableString(row, 'phase_color'), tags, subtaskStats: { total: rowValue.number(row, 'subtask_total'), completed: rowValue.number(row, 'subtask_completed') } }; }
  private async kanban(rowsSql: string, values: SqlBindValue[]): Promise<KanbanTask[]> { const rows = await this.database.select<QueryResultRow>(rowsSql, values); if (!rows.length) return []; const ids = rows.map((row) => rowValue.string(row, 'id')); const placeholders = ids.map(() => '?').join(','); const tagRows = await this.database.select<QueryResultRow>(`SELECT tt.task_id,t.* FROM task_tags tt JOIN tags t ON t.id=tt.tag_id WHERE tt.deleted_at IS NULL AND t.deleted_at IS NULL AND tt.task_id IN (${placeholders})`,ids); const tags = new Map<string,Tag[]>(); for (const row of tagRows) { const taskId = rowValue.string(row,'task_id'); const list = tags.get(taskId) ?? []; list.push({ ...mapMeta(row), name: rowValue.string(row,'name'), color: rowValue.string(row,'color') }); tags.set(taskId,list); } return rows.map((row) => this.mapKanban(row,tags.get(rowValue.string(row,'id')) ?? [])); }
  private kanbanConditions(filters: KanbanFilters, prefix: string): { conditions: string[]; values: SqlBindValue[] } { const conditions = [`t.deleted_at IS NULL`,prefix]; const values: SqlBindValue[] = []; if (filters.phaseId) { conditions.push('t.phase_id=?'); values.push(filters.phaseId); } if (filters.query?.trim()) { conditions.push('(t.title LIKE ? COLLATE NOCASE OR t.description LIKE ? COLLATE NOCASE OR t.assignee LIKE ? COLLATE NOCASE OR p.title LIKE ? COLLATE NOCASE OR EXISTS (SELECT 1 FROM task_tags tt JOIN tags tg ON tg.id=tt.tag_id WHERE tt.task_id=t.id AND tg.name LIKE ? COLLATE NOCASE))'); const query=`%${filters.query.trim()}%`; values.push(query,query,query,query,query); } if (filters.priority) { conditions.push('t.priority=?'); values.push(filters.priority); } if (filters.status) { conditions.push('t.status=?'); values.push(filters.status); } if (filters.overdue) conditions.push("t.due_date < date('now') AND t.completed=0 AND t.status!='cancelled'"); if (filters.blocked) conditions.push("t.status='blocked'"); if (filters.completed !== undefined) { conditions.push('t.completed=?'); values.push(filters.completed); } return { conditions,values }; }
  private kanbanOrder(sort: KanbanFilters['sort']): string { const orders = { kanban: 't.kanban_position,t.id', priority: "CASE t.priority WHEN 'critical' THEN 4 WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END DESC", due_date: 't.due_date IS NULL,t.due_date', updated_at: 't.updated_at DESC', created_at: 't.created_at DESC', title: 't.title COLLATE NOCASE', phase: 'p.position,t.kanban_position' }; return orders[sort ?? 'kanban']; }
  public async findKanbanByRoadmapId(roadmapId: string, filters: KanbanFilters = {}): Promise<KanbanTask[]> { const built=this.kanbanConditions(filters,'p.roadmap_id=? AND p.deleted_at IS NULL'); const sql=`SELECT t.*,p.title phase_title,p.color phase_color,COUNT(s.id) subtask_total,SUM(CASE WHEN s.completed=1 THEN 1 ELSE 0 END) subtask_completed FROM tasks t JOIN phases p ON p.id=t.phase_id LEFT JOIN subtasks s ON s.task_id=t.id AND s.deleted_at IS NULL WHERE ${built.conditions.join(' AND ')} GROUP BY t.id ORDER BY ${this.kanbanOrder(filters.sort)}`; return this.kanban(sql,[roadmapId,...built.values]); }
  public async findKanbanByPhaseId(phaseId: string, filters: KanbanFilters = {}): Promise<KanbanTask[]> { const built=this.kanbanConditions(filters,'t.phase_id=?'); const sql=`SELECT t.*,p.title phase_title,p.color phase_color,COUNT(s.id) subtask_total,SUM(CASE WHEN s.completed=1 THEN 1 ELSE 0 END) subtask_completed FROM tasks t JOIN phases p ON p.id=t.phase_id LEFT JOIN subtasks s ON s.task_id=t.id AND s.deleted_at IS NULL WHERE ${built.conditions.join(' AND ')} GROUP BY t.id ORDER BY ${this.kanbanOrder(filters.sort)}`; return this.kanban(sql,[phaseId,...built.values]); }
  private async normalizeKanban(phaseId: string, status: string): Promise<void> { const rows=await this.database.select<QueryResultRow>('SELECT id FROM tasks WHERE phase_id=? AND status=? AND deleted_at IS NULL ORDER BY kanban_position,id',[phaseId,status]); for (const [position,row] of rows.entries()) await this.database.execute('UPDATE tasks SET kanban_position=? WHERE id=?',[position,rowValue.string(row,'id')]); }
  private async kanbanTaskIds(phaseId: string, status: string): Promise<string[]> { const rows=await this.database.select<QueryResultRow>('SELECT id FROM tasks WHERE phase_id=? AND status=? AND deleted_at IS NULL ORDER BY kanban_position,id',[phaseId,status]); return rows.map((row) => rowValue.string(row,'id')); }
  private async reindexKanban(phaseId: string, status: string, orderedTaskIds: string[]): Promise<void> { const now=new Date().toISOString(); for (const [position,id] of orderedTaskIds.entries()) await this.database.execute("UPDATE tasks SET kanban_position=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=?",[position,now,id]); await this.normalizeKanban(phaseId,status); }
  public async moveToStatus(taskId: string, status: string, position: number): Promise<Task | null> {
    const task = await this.findById(taskId);
    if (!task) return null;

    const completed = status === 'completed';
    const now = new Date().toISOString();
    const targetPosition = Math.max(0, position);
    const sourceOrder = await this.kanbanTaskIds(task.phaseId, task.status);
    const sourceIndex = sourceOrder.indexOf(task.id);

    if (task.status === status) {
      const reordered = sourceOrder.filter((id) => id !== task.id);
      const insertAt =
        sourceIndex !== -1 && sourceIndex < targetPosition
          ? Math.max(0, targetPosition - 1)
          : targetPosition;

      reordered.splice(Math.min(insertAt, reordered.length), 0, task.id);
      await this.reindexKanban(task.phaseId, status, reordered);
    } else {
      const targetOrder = await this.kanbanTaskIds(task.phaseId, status);
      const insertAt = Math.min(targetPosition, targetOrder.length);

      await this.database.execute(
        "UPDATE tasks SET status=?,completed=?,completed_at=?,kanban_position=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=?",
        [status, completed, completed ? now : null, insertAt, now, taskId],
      );
      await this.reindexKanban(
        task.phaseId,
        task.status,
        sourceOrder.filter((id) => id !== task.id),
      );
      targetOrder.splice(insertAt, 0, task.id);
      await this.reindexKanban(task.phaseId, status, targetOrder);
    }

    await this.history('kanban_task_moved', taskId, {
      fromStatus: task.status,
      toStatus: status,
      position: targetPosition,
    });
    return this.findById(taskId);
  }
  public async bulkUpdateStatus(taskIds: string[], status: string): Promise<void> { if (!taskIds.length) return; const marks=taskIds.map(() => '?').join(','); const completed=status==='completed'; await this.database.execute('BEGIN'); try { await this.database.execute(`UPDATE tasks SET status=?,completed=?,completed_at=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id IN (${marks}) AND deleted_at IS NULL`,[status,completed,completed ? new Date().toISOString() : null,new Date().toISOString(),...taskIds]); for (const id of taskIds) await this.history('kanban_bulk_status_changed',id,{ status }); await this.database.execute('COMMIT'); } catch (error) { await this.database.execute('ROLLBACK'); throw error; } }
  public async bulkUpdatePriority(taskIds: string[], priority: string): Promise<void> { if (!taskIds.length) return; const marks=taskIds.map(() => '?').join(','); await this.database.execute('BEGIN'); try { await this.database.execute(`UPDATE tasks SET priority=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id IN (${marks}) AND deleted_at IS NULL`,[priority,new Date().toISOString(),...taskIds]); for (const id of taskIds) await this.history('kanban_bulk_priority_changed',id,{ priority }); await this.database.execute('COMMIT'); } catch (error) { await this.database.execute('ROLLBACK'); throw error; } }
  public async bulkMoveToPhase(taskIds: string[], phaseId: string): Promise<void> { if (!taskIds.length) return; const marks=taskIds.map(() => '?').join(','); await this.database.execute('BEGIN'); try { await this.database.execute(`UPDATE tasks SET phase_id=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id IN (${marks}) AND deleted_at IS NULL`,[phaseId,new Date().toISOString(),...taskIds]); for (const id of taskIds) await this.history('kanban_bulk_phase_changed',id,{ phaseId }); await this.normalize(phaseId); await this.database.execute('COMMIT'); } catch (error) { await this.database.execute('ROLLBACK'); throw error; } }
}

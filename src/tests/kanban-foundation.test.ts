import { describe, expect, it } from 'vitest';
import { kanbanFoundationMigration } from '@/database/migrations/005-kanban-foundation';
import { TaskRepository } from '@/database/repositories/TaskRepository';
import { kanbanSettingsSchema } from '@/features/kanban/schemas/kanban';
import type { QueryResultRow, SqlBindValue, SqlExecutionResult, SqlExecutor } from '@/types/database';

class Database implements SqlExecutor {
  public readonly commands: string[] = []; public readonly parameters: SqlBindValue[][] = []; public rows: QueryResultRow[] = [];
  async execute(sql: string, values: SqlBindValue[] = []): Promise<SqlExecutionResult> { this.commands.push(sql); this.parameters.push(values); return { rowsAffected: 1 }; }
  async select<T extends QueryResultRow>(sql: string, values: SqlBindValue[] = []): Promise<T[]> { this.commands.push(sql); this.parameters.push(values); return this.rows as T[]; }
}
const taskId='c0a8012e-0000-4000-8000-000000000001'; const phaseId='c0a8012e-0000-4000-8000-000000000002';
const taskRow: QueryResultRow = { id:taskId,phase_id:phaseId,title:'Tarefa',description:'',position:0,kanban_position:0,status:'not_started',priority:'medium',completed:0,completed_at:null,start_date:null,estimated_minutes:null,spent_minutes:0,due_date:null,assignee:null,created_at:'2026-08-01T00:00:00.000Z',updated_at:'2026-08-01T00:00:00.000Z',deleted_at:null,sync_status:'pending',local_version:1,server_version:0,device_id:'test' };
function taskFixture(id: string, kanbanPosition: number, title: string): QueryResultRow { return { ...taskRow, id, title, kanban_position:kanbanPosition, updated_at:'2026-08-01T00:00:00.000Z' }; }
class KanbanDatabase implements SqlExecutor {
  public readonly commands: string[] = []; public readonly parameters: SqlBindValue[][] = [];
  constructor(public readonly tasks: QueryResultRow[]) {}
  private mutateKanbanPosition(id: string, kanbanPosition: number): void { const task=this.tasks.find((row) => row.id===id); if (!task) return; task.kanban_position=kanbanPosition; task.updated_at='2026-08-02T00:00:00.000Z'; task.sync_status='pending'; task.local_version=Number(task.local_version ?? 0)+1; }
  private mutateMovedTask(id: string, status: string, completed: boolean, completedAt: string | null): void { const task=this.tasks.find((row) => row.id===id); if (!task) return; task.status=status; task.completed=completed ? 1 : 0; task.completed_at=completedAt; task.updated_at='2026-08-02T00:00:00.000Z'; task.sync_status='pending'; task.local_version=Number(task.local_version ?? 0)+1; }
  async execute(sql: string, values: SqlBindValue[] = []): Promise<SqlExecutionResult> {
    this.commands.push(sql); this.parameters.push(values);
    if (sql.startsWith('UPDATE tasks SET kanban_position=-1 WHERE id=?')) { this.mutateKanbanPosition(String(values[0]), -1); }
    else if (sql.startsWith("UPDATE tasks SET kanban_position=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=?")) { this.mutateKanbanPosition(String(values[2]), Number(values[0])); }
    else if (sql.startsWith("UPDATE tasks SET status=?,completed=?,completed_at=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=?")) { this.mutateMovedTask(String(values[4]), String(values[0]), Boolean(values[1]), values[2] === null ? null : String(values[2])); }
    return { rowsAffected: 1 };
  }
  async select<T extends QueryResultRow>(sql: string, values: SqlBindValue[] = []): Promise<T[]> {
    this.commands.push(sql); this.parameters.push(values);
    if (sql.includes('SELECT * FROM tasks WHERE id = ? AND deleted_at IS NULL')) { const id=String(values[0]); return this.tasks.filter((row) => row.id===id && row.deleted_at===null) as T[]; }
    if (sql.includes('SELECT id FROM tasks WHERE phase_id=? AND status=? AND deleted_at IS NULL ORDER BY kanban_position,id')) { const [phase,status]=values.map(String); return this.tasks.filter((row) => row.phase_id===phase && row.status===status && row.deleted_at===null).sort((a,b) => Number(a.kanban_position)-Number(b.kanban_position) || String(a.id).localeCompare(String(b.id))).map((row) => ({ id: row.id })) as unknown as T[]; }
    return [] as T[];
  }
}
describe('Kanban foundation', () => {
  it('creates the Kanban position and settings persistence migration', async () => { const database=new Database(); await kanbanFoundationMigration.up(database); expect(database.commands.some((sql) => sql.includes('kanban_position'))).toBe(true); expect(database.commands.some((sql) => sql.includes('CREATE TABLE IF NOT EXISTS kanban_settings'))).toBe(true); });
  it('moves a task between statuses and records history without relying on pooled SQL transactions', async () => { const database=new Database(); database.rows=[taskRow]; await new TaskRepository(database).moveToStatus(taskId,'completed',0); expect(database.commands).not.toContain('BEGIN'); expect(database.commands).not.toContain('COMMIT'); expect(database.commands.some((sql) => sql.includes('status=?,completed=?,completed_at=?,kanban_position=?'))).toBe(true); expect(database.parameters.some((values) => values[1]==='kanban_task_moved')).toBe(true); });
  it('reorders tasks inside the same Kanban status without dropping the moved task', async () => { const database=new KanbanDatabase([taskFixture('task-a',0,'A'), taskFixture('task-b',1,'B'), taskFixture('task-c',2,'C')]); await new TaskRepository(database).moveToStatus('task-a','not_started',2); const ordered=database.tasks.filter((row) => row.status==='not_started' && row.deleted_at===null).sort((a,b) => Number(a.kanban_position)-Number(b.kanban_position)).map((row) => row.id); expect(ordered).toEqual(['task-b','task-a','task-c']); expect(database.commands).not.toContain('BEGIN'); expect(database.commands).not.toContain('COMMIT'); });
  it('updates bulk status and priority in independent transactions', async () => { const database=new Database(); const repository=new TaskRepository(database); await repository.bulkUpdateStatus([taskId],'completed'); await repository.bulkUpdatePriority([taskId],'critical'); expect(database.commands.filter((sql) => sql==='BEGIN')).toHaveLength(2); expect(database.commands.filter((sql) => sql==='COMMIT')).toHaveLength(2); expect(database.commands.some((sql) => sql.includes('UPDATE tasks SET status=?,completed=?'))).toBe(true); expect(database.commands.some((sql) => sql.includes('UPDATE tasks SET priority=?'))).toBe(true); });
  it('requires at least one visible column in persisted settings', () => { expect(() => kanbanSettingsSchema.parse({ visibleColumns:[],columnOrder:['backlog','planned','not_started','in_progress','blocked','in_review','completed','cancelled'],wipLimits:{},compactMode:false })).toThrow(); });
});

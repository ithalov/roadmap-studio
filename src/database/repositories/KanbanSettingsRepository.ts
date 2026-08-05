import type { KanbanSettings } from '@/database/models';
import { RepositoryBase } from '@/database/repositories/RepositoryBase';
import { mapMeta, newMeta, rowValue } from '@/database/repositories/row-mapper';
import type { QueryResultRow, SqlExecutor } from '@/types/database';
import type { KanbanSettingsValues } from '@/features/kanban/types/kanban';

export class KanbanSettingsRepository extends RepositoryBase<KanbanSettings> {
  constructor(database: SqlExecutor) { super(database,'kanban_settings'); }
  protected mapRow(row: QueryResultRow): KanbanSettings { return { ...mapMeta(row), roadmapId:rowValue.string(row,'roadmap_id'), visibleColumns:rowValue.string(row,'visible_columns'), columnOrder:rowValue.string(row,'column_order'), wipLimits:rowValue.string(row,'wip_limits'), compactMode:rowValue.boolean(row,'compact_mode') }; }
  public async findByRoadmapId(roadmapId: string): Promise<KanbanSettings | null> { return this.queryOne('SELECT * FROM kanban_settings WHERE roadmap_id=? AND deleted_at IS NULL',[roadmapId]); }
  public async upsert(roadmapId: string, values: KanbanSettingsValues, deviceId = 'local-device'): Promise<KanbanSettings> { const current=await this.findByRoadmapId(roadmapId); const now=new Date().toISOString(); if (current) { await this.database.execute("UPDATE kanban_settings SET visible_columns=?,column_order=?,wip_limits=?,compact_mode=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=?",[JSON.stringify(values.visibleColumns),JSON.stringify(values.columnOrder),JSON.stringify(values.wipLimits),values.compactMode,now,current.id]); return (await this.findByRoadmapId(roadmapId))!; } const meta=newMeta(undefined,deviceId); await this.database.execute('INSERT INTO kanban_settings (id,roadmap_id,visible_columns,column_order,wip_limits,compact_mode,created_at,updated_at,deleted_at,sync_status,local_version,server_version,device_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',[meta.id,roadmapId,JSON.stringify(values.visibleColumns),JSON.stringify(values.columnOrder),JSON.stringify(values.wipLimits),values.compactMode,meta.createdAt,meta.updatedAt,null,'pending',1,0,meta.deviceId]); return (await this.findByRoadmapId(roadmapId))!; }
}

import type { Tag } from '@/database/models';
import { RepositoryBase } from '@/database/repositories/RepositoryBase';
import { mapMeta, newMeta, rowValue } from '@/database/repositories/row-mapper';
import { tagInputSchema } from '@/schemas/database';
import type { QueryResultRow, SqlExecutor } from '@/types/database';

export class TagRepository extends RepositoryBase<Tag> {
  constructor(database: SqlExecutor) { super(database,'tags'); }
  protected mapRow(row: QueryResultRow): Tag { return { ...mapMeta(row),name:rowValue.string(row,'name'),color:rowValue.string(row,'color') }; }
  public async findByTaskId(taskId: string): Promise<Tag[]> { return this.queryMany('SELECT t.* FROM tags t JOIN task_tags tt ON tt.tag_id=t.id WHERE tt.task_id=? AND tt.deleted_at IS NULL AND t.deleted_at IS NULL ORDER BY t.name COLLATE NOCASE',[taskId]); }
  public async create(name: string, color = '#64748B'): Promise<Tag> {
    const input = tagInputSchema.parse({ name, color });
    const existing = await this.database.select<QueryResultRow>('SELECT * FROM tags WHERE lower(name)=lower(?) ORDER BY deleted_at IS NULL DESC LIMIT 1', [input.name]);
    if (existing.length) {
      const tag = this.mapRow(existing[0]);
      if (!tag.deletedAt) throw new Error('Uma tag com este nome ja existe.');
      const now = new Date().toISOString();
      await this.database.execute("UPDATE tags SET name=?,color=?,deleted_at=NULL,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=?", [input.name, input.color, now, tag.id]);
      return { ...tag, name: input.name, color: input.color, deletedAt: null, updatedAt: now, syncStatus: 'pending', localVersion: tag.localVersion + 1 };
    }
    const item = { ...newMeta(undefined, 'local-device'), ...input };
    await this.database.execute('INSERT INTO tags (id,name,color,created_at,updated_at,deleted_at,sync_status,local_version,server_version,device_id) VALUES (?,?,?,?,?,?,?,?,?,?)', [item.id, item.name, item.color, item.createdAt, item.updatedAt, item.deletedAt, item.syncStatus, item.localVersion, item.serverVersion, item.deviceId]);
    return item;
  }
  public async attachToTask(taskId: string, tagId: string): Promise<void> { const meta = newMeta(undefined,'local-device'); await this.database.execute('INSERT OR IGNORE INTO task_tags (id,task_id,tag_id,created_at,updated_at,deleted_at,sync_status,local_version,server_version,device_id) VALUES (?,?,?,?,?,?,?,?,?,?)',[meta.id,taskId,tagId,meta.createdAt,meta.updatedAt,null,'pending',1,0,meta.deviceId]); }
  public async detachFromTask(taskId: string, tagId: string): Promise<void> { await this.database.execute("UPDATE task_tags SET deleted_at=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE task_id=? AND tag_id=? AND deleted_at IS NULL",[new Date().toISOString(),new Date().toISOString(),taskId,tagId]); }
  public async deleteUnused(): Promise<void> { await this.database.execute('DELETE FROM tags WHERE id NOT IN (SELECT tag_id FROM task_tags WHERE deleted_at IS NULL)'); }
  public async search(query: string): Promise<Tag[]> { return this.queryMany('SELECT * FROM tags WHERE deleted_at IS NULL AND name LIKE ? COLLATE NOCASE ORDER BY name COLLATE NOCASE',[`%${query.trim()}%`]); }
}

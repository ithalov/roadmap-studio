import type { AppSettings } from '@/database/models';
import { RepositoryBase } from '@/database/repositories/RepositoryBase';
import { mapMeta, newMeta, rowValue } from '@/database/repositories/row-mapper';
import { settingsInputSchema, type SettingsInput } from '@/schemas/database';
import type { QueryResultRow, SqlExecutor } from '@/types/database';

export class SettingsRepository extends RepositoryBase<AppSettings> {
  constructor(database: SqlExecutor) {
    super(database, 'settings');
  }
  protected mapRow(row: QueryResultRow): AppSettings {
    return {
      ...mapMeta(row),
      theme: rowValue.string(row, 'theme') as AppSettings['theme'],
      language: rowValue.string(row, 'language') as AppSettings['language'],
      accentColor: rowValue.string(row, 'accent_color'),
      autosave: rowValue.boolean(row, 'autosave'),
      backupInterval: rowValue.number(row, 'backup_interval'),
      workspace: rowValue.string(row, 'workspace'),
    };
  }
  public async create(value: SettingsInput): Promise<AppSettings> {
    const input = settingsInputSchema.parse(value);
    const item = { ...input, ...newMeta(input.id, input.deviceId) };
    await this.database.execute(
      'INSERT INTO settings (id,theme,language,accent_color,autosave,backup_interval,workspace,created_at,updated_at,deleted_at,sync_status,local_version,server_version,device_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        item.id,
        item.theme,
        item.language,
        item.accentColor,
        item.autosave,
        item.backupInterval,
        item.workspace,
        item.createdAt,
        item.updatedAt,
        item.deletedAt,
        item.syncStatus,
        item.localVersion,
        item.serverVersion,
        item.deviceId,
      ],
    );
    return item;
  }
  public async update(id: string, value: Partial<SettingsInput>): Promise<AppSettings | null> {
    const current = await this.findById(id);
    if (!current) return null;
    const input = settingsInputSchema.parse({
      ...current,
      ...value,
      id,
      deviceId: current.deviceId,
    });
    const now = new Date().toISOString();
    await this.database.execute(
      "UPDATE settings SET theme=?,language=?,accent_color=?,autosave=?,backup_interval=?,workspace=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=?",
      [
        input.theme,
        input.language,
        input.accentColor,
        input.autosave,
        input.backupInterval,
        input.workspace,
        now,
        id,
      ],
    );
    return this.findById(id);
  }
}

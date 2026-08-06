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
      wallpaper: rowValue.string(row, 'wallpaper') as AppSettings['wallpaper'],
      wallpaperIntensity: rowValue.number(row, 'wallpaper_intensity'),
      badgesShowIcons: rowValue.boolean(row, 'badges_show_icons'),
      badgesShowBorder: rowValue.boolean(row, 'badges_show_border'),
      badgesShowShadow: rowValue.boolean(row, 'badges_show_shadow'),
      badgesColored: rowValue.boolean(row, 'badges_colored'),
      badgesMinimal: rowValue.boolean(row, 'badges_minimal'),
      badgesShowTooltips: rowValue.boolean(row, 'badges_show_tooltips'),
      autosave: rowValue.boolean(row, 'autosave'),
      backupInterval: rowValue.number(row, 'backup_interval'),
      workspace: rowValue.string(row, 'workspace'),
    };
  }
  public async create(value: SettingsInput): Promise<AppSettings> {
    const input = settingsInputSchema.parse(value);
    const item = { ...input, ...newMeta(input.id, input.deviceId) };
    await this.database.execute(
      'INSERT INTO settings (id,theme,language,accent_color,wallpaper,wallpaper_intensity,badges_show_icons,badges_show_border,badges_show_shadow,badges_colored,badges_minimal,badges_show_tooltips,autosave,backup_interval,workspace,created_at,updated_at,deleted_at,sync_status,local_version,server_version,device_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        item.id,
        item.theme,
        item.language,
        item.accentColor,
        item.wallpaper,
        item.wallpaperIntensity,
        item.badgesShowIcons,
        item.badgesShowBorder,
        item.badgesShowShadow,
        item.badgesColored,
        item.badgesMinimal,
        item.badgesShowTooltips,
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
      "UPDATE settings SET theme=?,language=?,accent_color=?,wallpaper=?,wallpaper_intensity=?,badges_show_icons=?,badges_show_border=?,badges_show_shadow=?,badges_colored=?,badges_minimal=?,badges_show_tooltips=?,autosave=?,backup_interval=?,workspace=?,updated_at=?,sync_status='pending',local_version=local_version+1 WHERE id=?",
      [
        input.theme,
        input.language,
        input.accentColor,
        input.wallpaper,
        input.wallpaperIntensity,
        input.badgesShowIcons,
        input.badgesShowBorder,
        input.badgesShowShadow,
        input.badgesColored,
        input.badgesMinimal,
        input.badgesShowTooltips,
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

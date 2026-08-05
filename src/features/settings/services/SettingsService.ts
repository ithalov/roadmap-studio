import type { AppSettings } from '@/database/models';
import { databaseService } from '@/database/database-service';
import { SettingsRepository } from '@/database/repositories';
import {
  defaultSettingsFormValues,
  settingsFormSchema,
  type SettingsFormValues,
} from '@/features/settings/schemas/settings-form';
import type { SqlExecutor } from '@/types/database';

export class SettingsService {
  private readonly repository: SettingsRepository;

  constructor(database: SqlExecutor = databaseService) {
    this.repository = new SettingsRepository(database);
  }

  public async get(): Promise<AppSettings> {
    const settings = await this.repository.findAll();
    if (settings[0]) return settings[0];

    return this.repository.create({ ...defaultSettingsFormValues, deviceId: 'local-device' });
  }

  public async save(values: SettingsFormValues): Promise<AppSettings> {
    const input = settingsFormSchema.parse(values);
    const current = await this.repository.findAll();
    const saved = current[0]
      ? await this.repository.update(current[0].id, input)
      : await this.repository.create({ ...input, deviceId: 'local-device' });

    if (!saved) throw new Error('Nao foi possivel salvar as configuracoes.');
    return saved;
  }
}

export const settingsService = new SettingsService();

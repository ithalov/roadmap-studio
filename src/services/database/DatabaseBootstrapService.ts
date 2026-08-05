import { ConnectionManager } from '@/database/connection';
import { MigrationManager } from '@/database/migrations/MigrationManager';
import { migrations } from '@/database/migrations';
import {
  PhaseRepository,
  RoadmapRepository,
  SettingsRepository,
  TaskRepository,
} from '@/database/repositories';
import { SeedService } from '@/database/seed/SeedService';

export class DatabaseBootstrapService {
  constructor(private readonly connection: ConnectionManager) {}
  public async initialize(): Promise<void> {
    await this.connection.open();
    await new MigrationManager(this.connection).migrate(migrations);
    await new SeedService(
      new RoadmapRepository(this.connection),
      new PhaseRepository(this.connection),
      new TaskRepository(this.connection),
      new SettingsRepository(this.connection),
    ).seedIfEmpty();
  }
}

import {
  PhaseRepository,
  RoadmapRepository,
  SettingsRepository,
  TaskRepository,
} from '@/database/repositories';

export class SeedService {
  constructor(
    private readonly roadmaps: RoadmapRepository,
    private readonly phases: PhaseRepository,
    private readonly tasks: TaskRepository,
    private readonly settings: SettingsRepository,
  ) {}
  public async seedIfEmpty(deviceId = 'seed-device'): Promise<boolean> {
    if (await this.roadmaps.count()) return false;
    const settings = await this.settings.create({
      deviceId,
      theme: 'system',
      language: 'pt-BR',
      accentColor: '#2563EB',
      wallpaper: 'none',
      wallpaperIntensity: 2,
      badgesShowIcons: true,
      badgesShowBorder: true,
      badgesShowShadow: false,
      badgesColored: true,
      badgesMinimal: false,
      badgesShowTooltips: true,
      autosave: true,
      backupInterval: 1440,
      workspace: 'Roadmap Studio',
    });
    const roadmap = await this.roadmaps.create({
      deviceId,
      title: 'Roadmap de exemplo',
      description: 'Base para explorar o Roadmap Studio.',
      category: 'Produto',
      version: '1.0.0',
      status: 'active',
      accentColor: settings.accentColor,
      progressMode: 'automatic',
    });
    const foundation = await this.phases.create({
      deviceId,
      roadmapId: roadmap.id,
      title: 'Fundação',
      description: 'Estrutura inicial do produto.',
      position: 0,
      status: 'in_progress',
      priority: 'high',
      progress: 50,
    });
    const release = await this.phases.create({
      deviceId,
      roadmapId: roadmap.id,
      title: 'Primeiro lançamento',
      description: 'Preparação para a primeira versão.',
      position: 1,
      status: 'not_started',
      priority: 'medium',
      progress: 0,
    });
    await this.tasks.create({
      deviceId,
      phaseId: foundation.id,
      title: 'Revisar arquitetura',
      description: '',
      position: 0,
      status: 'in_progress',
      priority: 'high',
      completed: false,
      spentMinutes: 30,
    });
    await this.tasks.create({
      deviceId,
      phaseId: foundation.id,
      title: 'Validar banco de dados',
      description: '',
      position: 1,
      status: 'not_started',
      priority: 'medium',
      completed: false,
      spentMinutes: 0,
    });
    await this.tasks.create({
      deviceId,
      phaseId: release.id,
      title: 'Definir escopo do lançamento',
      description: '',
      position: 0,
      status: 'not_started',
      priority: 'medium',
      completed: false,
      spentMinutes: 0,
    });
    return true;
  }
}

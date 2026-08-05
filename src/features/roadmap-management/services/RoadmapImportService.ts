import { databaseService } from '@/database/database-service';
import {
  PhaseRepository,
  RoadmapRepository,
  SubtaskRepository,
  TagRepository,
  TaskRepository,
} from '@/database/repositories';
import {
  roadmapImportSchema,
  type RoadmapImport,
} from '@/features/roadmap-management/schemas/roadmap-import';
import type { SqlExecutor } from '@/types/database';

export interface RoadmapImportResult {
  roadmapId: string;
  phases: number;
  tasks: number;
  subtasks: number;
  tags: number;
}

export class RoadmapImportService {
  private readonly database: SqlExecutor;
  private readonly roadmaps: RoadmapRepository;
  private readonly phases: PhaseRepository;
  private readonly tasks: TaskRepository;
  private readonly subtasks: SubtaskRepository;
  private readonly tags: TagRepository;

  constructor(database: SqlExecutor = databaseService) {
    this.database = database;
    this.roadmaps = new RoadmapRepository(database);
    this.phases = new PhaseRepository(database);
    this.tasks = new TaskRepository(database);
    this.subtasks = new SubtaskRepository(database);
    this.tags = new TagRepository(database);
  }

  public async import(raw: unknown): Promise<RoadmapImportResult> {
    const input = roadmapImportSchema.parse(raw);
    return this.persist(input);
  }

  private async persist(input: RoadmapImport): Promise<RoadmapImportResult> {
    let taskCount = 0;
    let subtaskCount = 0;
    let tagCount = 0;
    await this.database.execute('BEGIN');
    try {
      const roadmap = await this.roadmaps.create({
        ...input.roadmap,
        deviceId: 'local-device',
      });

      for (const [phasePosition, sourcePhase] of input.phases.entries()) {
        const phase = await this.phases.create({
          roadmapId: roadmap.id,
          title: sourcePhase.title,
          description: sourcePhase.description ?? '',
          position: sourcePhase.position ?? phasePosition,
          status: sourcePhase.status ?? 'planned',
          priority: sourcePhase.priority ?? 'medium',
          progress: sourcePhase.progress ?? 0,
          startDate: sourcePhase.startDate,
          targetDate: sourcePhase.targetDate,
          deviceId: 'local-device',
        });

        for (const [taskPosition, sourceTask] of sourcePhase.tasks.entries()) {
          const completed = sourceTask.completed ?? sourceTask.status === 'completed';
          const task = await this.tasks.create({
            phaseId: phase.id,
            title: sourceTask.title,
            description: sourceTask.description ?? '',
            position: sourceTask.position ?? taskPosition,
            status: sourceTask.status ?? (completed ? 'completed' : 'not_started'),
            priority: sourceTask.priority ?? 'medium',
            completed,
            startDate: sourceTask.startDate,
            estimatedMinutes: sourceTask.estimatedMinutes,
            spentMinutes: sourceTask.spentMinutes ?? 0,
            dueDate: sourceTask.dueDate,
            assignee: sourceTask.assignee,
            deviceId: 'local-device',
          });
          taskCount += 1;

          for (const [subtaskPosition, sourceSubtask] of sourceTask.subtasks.entries()) {
            await this.subtasks.create({
              taskId: task.id,
              title: sourceSubtask.title,
              completed: sourceSubtask.completed ?? false,
              position: sourceSubtask.position ?? subtaskPosition,
              deviceId: 'local-device',
            });
            subtaskCount += 1;
          }

          for (const sourceTag of sourceTask.tags) {
            const existing = (await this.tags.search(sourceTag.name)).find(
              (tag) => tag.name.toLowerCase() === sourceTag.name.toLowerCase(),
            );
            const tag = existing ?? (await this.tags.create(sourceTag.name, sourceTag.color));
            if (!existing) tagCount += 1;
            await this.tags.attachToTask(task.id, tag.id);
          }
        }
      }

      await this.database.execute('COMMIT');
      return {
        roadmapId: roadmap.id,
        phases: input.phases.length,
        tasks: taskCount,
        subtasks: subtaskCount,
        tags: tagCount,
      };
    } catch (error) {
      await this.database.execute('ROLLBACK');
      throw error;
    }
  }
}

export const roadmapImportService = new RoadmapImportService();

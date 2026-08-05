import { databaseService } from '@/database/database-service';
import { SubtaskRepository, TagRepository, TaskRepository } from '@/database/repositories';
import { progressRecalculationService } from '@/features/tasks/services/ProgressRecalculationService';
import { taskFormSchema, type TaskFormValues } from '@/features/tasks/schemas/task-form';
import type { TaskSearchFilters } from '@/database/repositories/TaskRepository';

export class TaskService {
  private readonly tasks = new TaskRepository(databaseService); private readonly subtasks = new SubtaskRepository(databaseService); private readonly tags = new TagRepository(databaseService);
  public list(phaseId: string, filters: Omit<TaskSearchFilters, 'phaseId'> = {}) { return this.tasks.search({ phaseId, ...filters }); }
  public listDeleted(phaseId: string) { return this.tasks.findDeletedByPhaseId(phaseId); }
  public history(id: string) { return this.tasks.findHistory(id); }
  public async create(phaseId: string, values: TaskFormValues) { const task = await this.tasks.createAtEnd(phaseId, taskFormSchema.parse(values)); await progressRecalculationService.recalculateForPhase(phaseId); return task; }
  public async update(id: string, values: TaskFormValues) { const task = await this.tasks.update(id, taskFormSchema.parse(values)); if (task) await progressRecalculationService.recalculateForPhase(task.phaseId); return task; }
  public async duplicate(id: string) { const task = await this.tasks.duplicate(id); if (task) await progressRecalculationService.recalculateForPhase(task.phaseId); return task; }
  public async remove(id: string) { const task = await this.tasks.findById(id); await this.tasks.softDelete(id); if (task) await progressRecalculationService.recalculateForPhase(task.phaseId); }
  public async restore(id: string) { const task = await this.tasks.findIncludingDeleted(id); await this.tasks.restore(id); if (task) await progressRecalculationService.recalculateForPhase(task.phaseId); }
  public async permanentDelete(id: string) { await this.tasks.permanentDelete(id); }
  public async toggleCompleted(id: string) { const task = await this.tasks.findById(id); await this.tasks.toggleCompleted(id); if (task) await progressRecalculationService.recalculateForPhase(task.phaseId); }
  public async reorder(phaseId: string, ids: string[]) { await this.tasks.reorder(phaseId, ids); await progressRecalculationService.recalculateForPhase(phaseId); }
  public async move(taskId: string, targetPhaseId: string) { const task = await this.tasks.findById(taskId); await this.tasks.moveToPhase(taskId, targetPhaseId); await Promise.all([progressRecalculationService.recalculateForPhase(targetPhaseId), task ? progressRecalculationService.recalculateForPhase(task.phaseId) : Promise.resolve()]); }
  public stats(phaseId: string) { return this.tasks.getTaskStats(phaseId); }
  public subtasksFor(taskId: string) { return this.subtasks.findByTaskId(taskId); }
  public async createSubtask(taskId: string, title: string) { const item = await this.subtasks.createAtEnd(taskId, title); return item; }
  public toggleSubtask(id: string) { return this.subtasks.toggleCompleted(id); }
  public tagsFor(taskId: string) { return this.tags.findByTaskId(taskId); }
  public tagsSearch(query: string) { return this.tags.search(query); }
  public createTag(name: string, color: string) { return this.tags.create(name, color); }
  public attachTag(taskId: string, tagId: string) { return this.tags.attachToTask(taskId, tagId); }
  public detachTag(taskId: string, tagId: string) { return this.tags.detachFromTask(taskId, tagId); }
}
export const taskService = new TaskService();

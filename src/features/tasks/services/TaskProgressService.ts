import type { Subtask, Task } from '@/database/models';
export class TaskProgressService {
  public calculate(task: Task, subtasks: Subtask[]): number {
    if (task.completed) return 100;
    const active = subtasks.filter((subtask) => !subtask.deletedAt);
    if (!active.length) return 0;
    return Math.round((active.filter((subtask) => subtask.completed).length / active.length) * 100);
  }
}
export const taskProgressService = new TaskProgressService();

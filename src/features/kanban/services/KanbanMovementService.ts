import { databaseService } from '@/database/database-service';
import { TaskRepository } from '@/database/repositories';
import { progressRecalculationService } from '@/features/tasks/services/ProgressRecalculationService';
import { kanbanMoveSchema } from '@/features/kanban/schemas/kanban';
import { kanbanService } from '@/features/kanban/services/KanbanService';
import { kanbanColumns } from '@/features/kanban/constants/columns';
import type { KanbanMoveInput } from '@/features/kanban/types/kanban';
import { logger } from '@/services/database/Logger';

export interface KanbanMoveResult { taskId: string; warning: string | null; }
export class KanbanMovementService {
  private readonly tasks = new TaskRepository(databaseService);
  public async move(roadmapId: string, input: KanbanMoveInput): Promise<KanbanMoveResult> { const move=kanbanMoveSchema.parse(input); const task=await this.tasks.findById(move.taskId); if (!task) throw new Error('Tarefa nao encontrada.'); const settings=await kanbanService.getSettings(roadmapId); const definition=kanbanColumns.find((column) => column.status===move.targetStatus); const board=await kanbanService.getBoard(roadmapId,{ phaseId:task.phaseId }); const target=board.columns.find((column) => column.definition.status===move.targetStatus); const limit=settings.wipLimits[move.targetStatus] ?? null; const warning=limit && definition?.countsTowardWip && task.status!==move.targetStatus && (target?.tasks.length ?? 0)>=limit ? `Limite WIP de ${limit} excedido.` : null; await this.tasks.moveToStatus(move.taskId,move.targetStatus,move.targetPosition); try { await progressRecalculationService.recalculateForPhase(task.phaseId); } catch (error) { logger.log('WARN','Unable to recalculate phase progress after Kanban move',{ error, phaseId:task.phaseId, taskId:task.id }); } return { taskId:task.id,warning }; }
  public async bulkStatus(taskIds: string[], status: string): Promise<void> { await this.tasks.bulkUpdateStatus(taskIds,status); for (const id of taskIds) { const task=await this.tasks.findById(id); if (task) await progressRecalculationService.recalculateForPhase(task.phaseId); } }
  public bulkPriority(taskIds: string[], priority: string): Promise<void> { return this.tasks.bulkUpdatePriority(taskIds,priority); }
  public async bulkMove(taskIds: string[], phaseId: string): Promise<void> { await this.tasks.bulkMoveToPhase(taskIds,phaseId); await progressRecalculationService.recalculateForPhase(phaseId); }
  public async bulkDelete(taskIds: string[]): Promise<void> { for (const id of taskIds) { const task=await this.tasks.findById(id); await this.tasks.softDelete(id); if (task) await progressRecalculationService.recalculateForPhase(task.phaseId); } }
}
export const kanbanMovementService = new KanbanMovementService();

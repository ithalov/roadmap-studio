import { useQuery } from '@tanstack/react-query';
import { databaseService } from '@/database/database-service';
import { RoadmapRepository } from '@/database/repositories';
import { mapMeta, rowValue } from '@/database/repositories/row-mapper';
import type { QueryResultRow } from '@/types/database';
import type { DashboardInsights, DashboardPeriod, DashboardTask } from '@/features/dashboard/types/dashboard';

const periodDays: Record<DashboardPeriod, number> = { today: 1, week: 7, month: 30, year: 365 };

function mapTask(row: QueryResultRow): DashboardTask {
  return {
    ...mapMeta(row), phaseId: rowValue.string(row, 'phase_id'), title: rowValue.string(row, 'title'), description: rowValue.string(row, 'description'), position: rowValue.number(row, 'position'), status: rowValue.string(row, 'status'), priority: rowValue.string(row, 'priority'), completed: rowValue.boolean(row, 'completed'), completedAt: rowValue.nullableString(row, 'completed_at'), startDate: rowValue.nullableString(row, 'start_date'), estimatedMinutes: rowValue.nullableString(row, 'estimated_minutes') === null ? null : rowValue.number(row, 'estimated_minutes'), spentMinutes: rowValue.number(row, 'spent_minutes'), dueDate: rowValue.nullableString(row, 'due_date'), assignee: rowValue.nullableString(row, 'assignee'), kanbanPosition: rowValue.number(row, 'kanban_position'), roadmapId: rowValue.string(row, 'roadmap_id'), roadmapTitle: rowValue.string(row, 'roadmap_title'), phaseTitle: rowValue.string(row, 'phase_title'),
  };
}

export function useDashboardInsights(period: DashboardPeriod) {
  return useQuery({
    queryKey: ['dashboard', 'insights', period],
    queryFn: async (): Promise<DashboardInsights> => {
      const repository = new RoadmapRepository(databaseService);
      const [taskTotals, subtaskTotals, taskRows, activityRows, productivityRows, recent, favorites] = await Promise.all([
        databaseService.select<QueryResultRow>('SELECT COUNT(*) AS total, SUM(CASE WHEN completed=1 THEN 1 ELSE 0 END) AS completed FROM tasks WHERE deleted_at IS NULL'),
        databaseService.select<QueryResultRow>('SELECT COUNT(*) AS total, SUM(CASE WHEN completed=1 THEN 1 ELSE 0 END) AS completed FROM subtasks WHERE deleted_at IS NULL'),
        databaseService.select<QueryResultRow>("SELECT t.*, p.roadmap_id, p.title AS phase_title, r.title AS roadmap_title FROM tasks t JOIN phases p ON p.id=t.phase_id JOIN roadmaps r ON r.id=p.roadmap_id WHERE t.deleted_at IS NULL AND t.completed=0 AND r.deleted_at IS NULL AND r.status != 'archived' ORDER BY CASE t.priority WHEN 'critical' THEN 4 WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END DESC, t.due_date IS NULL, t.due_date ASC LIMIT 8"),
        databaseService.select<QueryResultRow>("SELECT h.id,h.action_type,h.entity_type,h.entity_id,h.occurred_at,COALESCE(r.title,p.title,t.title,'Atividade') AS title, r.id AS roadmap_id,r.title AS roadmap_title FROM history h LEFT JOIN roadmaps r ON h.entity_type='roadmap' AND r.id=h.entity_id LEFT JOIN phases p ON h.entity_type='phase' AND p.id=h.entity_id LEFT JOIN tasks t ON h.entity_type='task' AND t.id=h.entity_id ORDER BY h.occurred_at DESC LIMIT 10"),
        databaseService.select<QueryResultRow>("SELECT substr(occurred_at,1,10) AS date, COUNT(*) AS count FROM history WHERE occurred_at >= date('now', ?) GROUP BY substr(occurred_at,1,10)", [`-${periodDays[period]} days`]),
        repository.findRecent(5),
        repository.findActive({ favorite: true, sort: 'updated_desc' }),
      ]);
      const taskTotal = taskTotals[0] ?? {};
      const subtaskTotal = subtaskTotals[0] ?? {};
      return {
        totalTasks: rowValue.number(taskTotal, 'total'), completedTasks: rowValue.number(taskTotal, 'completed'), totalSubtasks: rowValue.number(subtaskTotal, 'total'), completedSubtasks: rowValue.number(subtaskTotal, 'completed'), recent, favorites: favorites.slice(0, 5), tasks: taskRows.map(mapTask),
        activity: activityRows.map((row) => ({ id: rowValue.string(row, 'id'), actionType: rowValue.string(row, 'action_type'), entityType: rowValue.string(row, 'entity_type'), entityId: rowValue.string(row, 'entity_id'), occurredAt: rowValue.string(row, 'occurred_at'), title: rowValue.string(row, 'title'), roadmapId: rowValue.nullableString(row, 'roadmap_id'), roadmapTitle: rowValue.nullableString(row, 'roadmap_title') })),
        productivity: productivityRows.map((row) => ({ date: rowValue.string(row, 'date'), count: rowValue.number(row, 'count') })),
      };
    },
  });
}

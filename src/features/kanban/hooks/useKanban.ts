import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { kanbanMovementService } from '@/features/kanban/services/KanbanMovementService';
import { kanbanService } from '@/features/kanban/services/KanbanService';
import type {
  KanbanBoard,
  KanbanFilters,
  KanbanMoveInput,
  KanbanSettingsValues,
} from '@/features/kanban/types/kanban';

const key = ['kanban'] as const;

function updateKanbanBoard(board: KanbanBoard, input: KanbanMoveInput): KanbanBoard {
  const sourceColumn = board.columns.find((column) =>
    column.tasks.some((task) => task.id === input.taskId),
  );
  const task = sourceColumn?.tasks.find((item) => item.id === input.taskId);
  const targetColumn = board.columns.find(
    (column) => column.definition.status === input.targetStatus,
  );

  if (!sourceColumn || !task || !targetColumn) {
    return board;
  }

  const sourceIndex = sourceColumn.tasks.findIndex((item) => item.id === task.id);
  const sameColumn = sourceColumn.definition.status === targetColumn.definition.status;
  const insertionIndex =
    sameColumn && sourceIndex !== -1 && sourceIndex < input.targetPosition
      ? Math.max(0, input.targetPosition - 1)
      : input.targetPosition;

  const nextColumns = board.columns.map((column) => {
    if (column.definition.status === sourceColumn.definition.status) {
      return {
        ...column,
        tasks: column.tasks.filter((item) => item.id !== task.id),
      };
    }

    return column;
  });

  return {
    ...board,
    columns: nextColumns.map((column) => {
      if (column.definition.status !== targetColumn.definition.status) {
        return column;
      }

      const tasks = [...column.tasks];
      const insertAt = Math.min(Math.max(insertionIndex, 0), tasks.length);
      tasks.splice(insertAt, 0, {
        ...task,
        status: input.targetStatus,
        completed: input.targetStatus === 'completed',
        completedAt: input.targetStatus === 'completed' ? new Date().toISOString() : null,
      });

      return {
        ...column,
        tasks,
      };
    }),
  };
}

export function useKanbanBoard(roadmapId: string, filters: KanbanFilters) {
  return useQuery({
    queryKey: [...key, roadmapId, filters],
    queryFn: () => kanbanService.getBoard(roadmapId, filters),
    enabled: Boolean(roadmapId),
  });
}

export function useKanbanSettings(roadmapId: string) {
  return useQuery({
    queryKey: [...key, roadmapId, 'settings'],
    queryFn: () => kanbanService.getSettings(roadmapId),
    enabled: Boolean(roadmapId),
  });
}

export function useKanbanActions(roadmapId: string, filters: KanbanFilters) {
  const client = useQueryClient();
  const boardKey = [...key, roadmapId, filters] as const;
  const refresh = () => client.invalidateQueries({ queryKey: [...key, roadmapId] });

  return {
    move: useMutation({
      mutationFn: (input: KanbanMoveInput) => kanbanMovementService.move(roadmapId, input),
      onMutate: async (input) => {
        await client.cancelQueries({ queryKey: boardKey });
        const previous = client.getQueryData<KanbanBoard>(boardKey);

        client.setQueryData<KanbanBoard>(boardKey, (board) => {
          if (!board) {
            return board;
          }

          return updateKanbanBoard(board, input);
        });

        return { previous };
      },
      onError: (error, _input, context) => {
        if (context?.previous) {
          client.setQueryData(boardKey, context.previous);
        }

        return error;
      },
      onSettled: refresh,
    }),
    saveSettings: useMutation({
      mutationFn: (settings: KanbanSettingsValues) => kanbanService.saveSettings(roadmapId, settings),
      onSuccess: refresh,
    }),
    bulkStatus: useMutation({
      mutationFn: ({ ids, status }: { ids: string[]; status: string }) =>
        kanbanMovementService.bulkStatus(ids, status),
      onSuccess: refresh,
    }),
    bulkPriority: useMutation({
      mutationFn: ({ ids, priority }: { ids: string[]; priority: string }) =>
        kanbanMovementService.bulkPriority(ids, priority),
      onSuccess: refresh,
    }),
    bulkMove: useMutation({
      mutationFn: ({ ids, phaseId }: { ids: string[]; phaseId: string }) =>
        kanbanMovementService.bulkMove(ids, phaseId),
      onSuccess: refresh,
    }),
    bulkDelete: useMutation({
      mutationFn: (ids: string[]) => kanbanMovementService.bulkDelete(ids),
      onSuccess: refresh,
    }),
  };
}

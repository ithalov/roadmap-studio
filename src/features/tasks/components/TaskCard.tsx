import { useEffect, useRef, useState } from 'react';
import { GripVertical, MoreHorizontal, Trash2 } from 'lucide-react';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { useSortable } from '@dnd-kit/sortable';
import type { Task } from '@/database/models';
import type { Tag } from '@/database/models';
import { Button } from '@/components/ui/Button';
import { dueLabel, formatMinutes } from '@/features/tasks/utils/task';
import { taskPriorityMeta, taskStatusMeta } from '@/features/tasks/types/task';
import type { TaskFormValues } from '@/features/tasks/schemas/task-form';

interface TaskCardProps { task: Task; tags: Tag[]; subtaskProgress: number; compact: boolean; dragAttributes: DraggableAttributes; dragListeners: ReturnType<typeof useSortable>['listeners']; onOpen: () => void; onToggle: () => void; onDelete: () => void; onQuickUpdate?: (values: Pick<TaskFormValues, 'title'>) => void; }
export function TaskCard({ task, tags, subtaskProgress, compact, dragAttributes, dragListeners, onOpen, onToggle, onDelete, onQuickUpdate }: TaskCardProps) {
  const [title,setTitle]=useState(task.title); const timer=useRef<number | null>(null);
  useEffect(() => { setTitle(task.title); },[task.title]);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); },[]);
  const saveTitle=(value:string) => { const normalized=value.trim(); if (normalized.length>=2 && normalized!==task.title) onQuickUpdate?.({ title:normalized }); };
  const changeTitle=(value:string) => { setTitle(value); if (timer.current) window.clearTimeout(timer.current); timer.current=window.setTimeout(() => saveTitle(value),500); };
  const due = dueLabel(task); const status = taskStatusMeta[task.status as keyof typeof taskStatusMeta] ?? taskStatusMeta.not_started; const priority = taskPriorityMeta[task.priority as keyof typeof taskPriorityMeta] ?? taskPriorityMeta.medium;
  return <article className="flex items-start gap-3 rounded-lg border bg-card p-3 shadow-sm">
    <button className="mt-1 cursor-grab text-muted-foreground" aria-label="Arrastar tarefa" {...dragAttributes} {...dragListeners}><GripVertical className="h-4 w-4" /></button>
    <input className="mt-1 h-4 w-4 accent-primary" aria-label={`Concluir ${task.title}`} type="checkbox" checked={task.completed} onChange={onToggle} />
    <div className="min-w-0 flex-1 text-left">
      <div className="flex flex-wrap items-center gap-2"><input aria-label={`Titulo de ${task.title}`} className={task.completed ? 'min-w-32 bg-transparent font-medium line-through text-muted-foreground outline-none' : 'min-w-32 bg-transparent font-medium outline-none focus:ring-1 focus:ring-ring'} value={title} onChange={(event) => changeTitle(event.target.value)} onBlur={() => saveTitle(title)} /><span className={`rounded px-2 py-0.5 text-xs ${status.variant}`}>{status.label}</span><span className={`text-xs font-medium ${priority.variant}`}>{priority.label}</span></div>
      <button className="mt-1 w-full text-left" onClick={onOpen}>
      {!compact && task.description ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{task.description}</p> : null}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {due ? <span className={due.startsWith('Atrasada') ? 'font-medium text-destructive' : ''}>{due}</span> : null}
        {!compact && task.assignee ? <span>{task.assignee}</span> : null}
        {!compact && task.estimatedMinutes !== null ? <span>{formatMinutes(task.estimatedMinutes)}</span> : null}
        <span>Subtarefas {subtaskProgress}%</span>
      </div>
      {!compact && tags.length ? <div className="mt-2 flex flex-wrap gap-1">{tags.map((tag) => <span key={tag.id} className="rounded px-2 py-0.5 text-xs text-white" style={{ backgroundColor: tag.color }}>{tag.name}</span>)}</div> : null}</button>
    </div>
    <div className="flex"><Button size="icon" variant="ghost" aria-label="Abrir tarefa" onClick={onOpen}><MoreHorizontal className="h-4 w-4" /></Button><Button size="icon" variant="ghost" aria-label="Excluir tarefa" onClick={onDelete}><Trash2 className="h-4 w-4" /></Button></div>
  </article>;
}

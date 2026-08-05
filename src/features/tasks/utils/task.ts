import type { Task } from '@/database/models';

export function formatMinutes(minutes: number | null): string {
  if (minutes === null || minutes === 0) return '0 min';
  const days = Math.floor(minutes / 480); const hours = Math.floor((minutes % 480) / 60); const remainder = minutes % 60;
  return [days ? `${days}d` : '', hours ? `${hours}h` : '', remainder ? `${remainder} min` : ''].filter(Boolean).join(' ');
}
export function dueLabel(task: Task, now = new Date()): string | null {
  if (!task.dueDate || task.completed || task.status === 'cancelled' || task.deletedAt) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); const due = new Date(`${task.dueDate}T00:00:00`); const days = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (days < 0) return `Atrasada ha ${Math.abs(days)} dia${Math.abs(days) === 1 ? '' : 's'}`;
  if (days === 0) return 'Vence hoje'; if (days === 1) return 'Vence amanha'; return `Vence em ${days} dias`;
}
export function isOverdue(task: Task, now = new Date()): boolean { return Boolean(task.dueDate && dueLabel(task, now)?.startsWith('Atrasada')); }

import { expect, it } from 'vitest';
import { phaseProgressService } from '@/features/phases/services/PhaseProgressService';
import { roadmapProgressService } from '@/features/phases/services/RoadmapProgressService';
import type { Phase, Task } from '@/database/models';
const meta = { id: '1', createdAt: '', updatedAt: '', deletedAt: null, syncStatus: 'pending' as const, localVersion: 1, serverVersion: 0, deviceId: 'test' };
const phase: Phase = { ...meta, roadmapId: 'r', title: 'Fase', description: '', position: 0, status: 'planned', priority: 'medium', progress: 20, startDate: null, targetDate: null, progressMode: 'automatic', completedAt: null, color: null, icon: null, isCollapsed: false };
it('calculates automatic phase progress from tasks', () => { const tasks: Task[] = [{ ...meta, id: 'a', phaseId: 'p', title: 'A', description: '', position: 0, kanbanPosition: 0, status: 'done', priority: 'medium', completed: true, completedAt: '', startDate: null, estimatedMinutes: null, spentMinutes: 0, dueDate: null, assignee: null }, { ...meta, id: 'b', phaseId: 'p', title: 'B', description: '', position: 1, kanbanPosition: 1, status: 'todo', priority: 'medium', completed: false, completedAt: null, startDate: null, estimatedMinutes: null, spentMinutes: 0, dueDate: null, assignee: null }]; expect(phaseProgressService.calculate(phase, tasks)).toBe(50); });
it('calculates roadmap progress ignoring cancelled phases', () => expect(roadmapProgressService.calculate([{ ...phase, progress: 50 }, { ...phase, id: '2', progress: 100, status: 'cancelled' }])).toBe(50));

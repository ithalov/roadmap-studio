import type { Phase, Roadmap, Task } from '@/database/models';

export const templateCategories = [
  'Development',
  'Minecraft',
  'Software',
  'Website',
  'Mobile',
  'Desktop',
  'Backend',
  'Frontend',
  'DevOps',
  'Database',
  'Game Development',
  'Discord Bots',
  'Architecture',
  'College',
  'Research',
  'Business',
  'Startup',
  'Marketing',
  'Productivity',
  'Other',
] as const;

export type TemplateCategory = (typeof templateCategories)[number];
export type TemplateSort = 'recent' | 'used' | 'name_asc' | 'name_desc' | 'updated' | 'phases';

export interface TemplateFilters {
  query?: string;
  category?: string;
  favorite?: boolean;
  sort?: TemplateSort;
}

export interface TemplateSnapshot {
  formatVersion: 1;
  roadmap: Pick<
    Roadmap,
    'title' | 'description' | 'version' | 'category' | 'status' | 'accentColor' | 'progressMode'
  >;
  phases: Array<
    Pick<
      Phase,
      | 'title'
      | 'description'
      | 'position'
      | 'status'
      | 'priority'
      | 'progress'
      | 'startDate'
      | 'targetDate'
    > & { sourceId: string }
  >;
  tasks: Array<
    Pick<
      Task,
      | 'title'
      | 'description'
      | 'position'
      | 'status'
      | 'priority'
      | 'completed'
      | 'startDate'
      | 'estimatedMinutes'
      | 'spentMinutes'
      | 'dueDate'
      | 'assignee'
    > & { sourcePhaseId: string }
  >;
}

export interface TemplateCounts {
  phases: number;
  tasks: number;
}

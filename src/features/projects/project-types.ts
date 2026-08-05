import type { EntityMeta } from '@/types/entity';

export interface Project extends EntityMeta {
  name: string;
  description: string;
}

export interface ProjectListItem extends Pick<Project, 'id' | 'name' | 'description'> {
  phaseCount: number;
  taskCount: number;
}

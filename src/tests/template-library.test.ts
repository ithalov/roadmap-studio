import { describe, expect, it } from 'vitest';
import { templateLibraryMigration } from '@/database/migrations/009-template-library';
import { templateCreateSchema, templateImportSchema } from '@/features/templates/schemas/template';

describe('template library foundation', () => {
  it('keeps the template library as migration 009', () => {
    expect(templateLibraryMigration.version).toBe(9);
    expect(templateLibraryMigration.description).toContain('template');
  });

  it('normalizes template metadata before persistence', () => {
    const template = templateCreateSchema.parse({
      name: '  Game launch  ',
      tags: ['Tauri', 'SQLite'],
    });
    expect(template.name).toBe('Game launch');
    expect(template.category).toBe('Other');
    expect(template.color).toBe('#2563EB');
  });

  it('accepts the portable rstemplate JSON contract', () => {
    const imported = templateImportSchema.parse({
      format: 'roadmap-studio-template',
      formatVersion: 1,
      name: 'Starter',
      description: '',
      category: 'Software',
      tags: [],
      coverImage: null,
      icon: null,
      color: '#2563EB',
      author: '',
      version: '1.0.0',
      snapshot: {
        formatVersion: 1,
        roadmap: {
          title: 'Starter',
          description: '',
          version: '1.0.0',
          category: 'Software',
          status: 'draft',
          accentColor: '#2563EB',
          progressMode: 'automatic',
        },
        phases: [
          {
            sourceId: 'phase-source',
            title: 'Build',
            description: '',
            position: 0,
            status: 'not_started',
            priority: 'medium',
            progress: 0,
            startDate: null,
            targetDate: null,
          },
        ],
        tasks: [
          {
            sourcePhaseId: 'phase-source',
            title: 'Task',
            description: '',
            position: 0,
            status: 'not_started',
            priority: 'medium',
            completed: false,
            startDate: null,
            estimatedMinutes: null,
            spentMinutes: 0,
            dueDate: null,
            assignee: null,
          },
        ],
      },
    });
    expect(imported.snapshot.phases).toHaveLength(1);
    expect(imported.snapshot.tasks[0]?.sourcePhaseId).toBe('phase-source');
  });
});

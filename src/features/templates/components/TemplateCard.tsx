import { Heart, Layers3, ListTodo } from 'lucide-react';
import type { RoadmapTemplate } from '@/database/models';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import type { TemplateSnapshot } from '@/features/templates/types/template';

function counts(item: RoadmapTemplate) {
  try {
    const snapshot = JSON.parse(item.snapshotJson) as TemplateSnapshot;
    return { phases: snapshot.phases.length, tasks: snapshot.tasks.length };
  } catch {
    return { phases: 0, tasks: 0 };
  }
}
export function TemplateCard({
  item,
  selected,
  onSelect,
}: {
  item: RoadmapTemplate;
  selected: boolean;
  onSelect(): void;
}) {
  const total = counts(item);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative flex min-h-48 flex-col rounded-lg border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-soft',
        selected && 'border-primary ring-1 ring-primary',
      )}
    >
      <span
        className="absolute left-0 top-4 h-10 w-1 rounded-r"
        style={{ backgroundColor: item.color }}
      />
      <div className="ml-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold">
            {item.icon ? `${item.icon} ` : ''}
            {item.name}
          </p>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {item.description || 'Template pronto para reutilizar.'}
          </p>
        </div>
        <Heart
          className={cn(
            'h-4 w-4 shrink-0',
            item.isFavorite ? 'fill-current text-destructive' : 'text-muted-foreground',
          )}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge variant="category" size="sm" label={item.category} color={item.color} />
        <Badge size="sm" label={`v${item.version}`} />
      </div>
      <div className="mt-auto flex items-center gap-3 pt-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Layers3 className="h-3.5 w-3.5" />
          {total.phases} fases
        </span>
        <span className="flex items-center gap-1">
          <ListTodo className="h-3.5 w-3.5" />
          {total.tasks} tarefas
        </span>
        <span className="ml-auto">{item.usageCount} usos</span>
      </div>
    </button>
  );
}

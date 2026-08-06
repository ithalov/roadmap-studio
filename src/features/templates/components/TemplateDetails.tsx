import { Download, Heart, Play, Trash2, X } from 'lucide-react';
import type { RoadmapTemplate } from '@/database/models';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { TemplateSnapshot } from '@/features/templates/types/template';

function snapshot(item: RoadmapTemplate): TemplateSnapshot | null {
  try {
    return JSON.parse(item.snapshotJson) as TemplateSnapshot;
  } catch {
    return null;
  }
}
export function TemplateDetails({
  item,
  onClose,
  onUse,
  onFavorite,
  onExport,
  onDelete,
}: {
  item: RoadmapTemplate;
  onClose(): void;
  onUse(): void;
  onFavorite(): void;
  onExport(): void;
  onDelete(): void;
}) {
  const content = snapshot(item);
  const estimated =
    content?.tasks.reduce((total, task) => total + (task.estimatedMinutes ?? 0), 0) ?? 0;
  return (
    <aside className="h-fit rounded-lg border bg-card p-5 lg:sticky lg:top-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Template
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            {item.icon ? `${item.icon} ` : ''}
            {item.name}
          </h2>
        </div>
        <Button size="icon" variant="ghost" aria-label="Fechar detalhes" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{item.description || 'Sem descrição.'}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge variant="category" label={item.category} color={item.color} />
        {item.tags.map((tag) => (
          <Badge key={tag} size="sm" label={tag} />
        ))}
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Fases</dt>
          <dd className="mt-1 font-semibold">{content?.phases.length ?? 0}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Tarefas</dt>
          <dd className="mt-1 font-semibold">{content?.tasks.length ?? 0}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Estimativa</dt>
          <dd className="mt-1 font-semibold">
            {estimated ? `${Math.round(estimated / 60)}h` : '-'}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Versão</dt>
          <dd className="mt-1 font-semibold">{item.version}</dd>
        </div>
      </dl>
      <p className="mt-5 text-xs text-muted-foreground">
        {item.author ? `Por ${item.author}` : 'Autor não informado'} · Atualizado{' '}
        {new Date(item.updatedAt).toLocaleDateString('pt-BR')}
      </p>
      <div className="mt-5 grid gap-2">
        <Button onClick={onUse}>
          <Play className="h-4 w-4" />
          Usar template
        </Button>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Favoritar template"
            onClick={onFavorite}
          >
            <Heart
              className={item.isFavorite ? 'h-4 w-4 fill-current text-destructive' : 'h-4 w-4'}
            />
          </Button>
          <Button variant="outline" size="icon" aria-label="Exportar template" onClick={onExport}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Excluir template" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
